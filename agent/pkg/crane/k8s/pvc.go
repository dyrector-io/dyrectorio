package k8s

import (
	"context"
	"log"

	coreV1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/resource"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	corev1 "k8s.io/client-go/applyconfigurations/core/v1"
	typedv1 "k8s.io/client-go/kubernetes/typed/core/v1"

	"github.com/dyrector-io/dyrectorio/agent/internal/util"
	v1 "github.com/dyrector-io/dyrectorio/agent/pkg/api/v1"
	"github.com/dyrector-io/dyrectorio/agent/pkg/crane/config"
)

// facade object for pvc management
type pvc struct {
	ctx       context.Context
	status    string
	requested map[string]v1.Volume
	avail     map[string]v1.Volume
	appConfig *config.Configuration
}

func newPvc(ctx context.Context, cfg *config.Configuration) *pvc {
	return &pvc{ctx: ctx, status: "", avail: map[string]v1.Volume{}, requested: map[string]v1.Volume{}, appConfig: cfg}
}

func (p *pvc) deployPVC(namespace, name string, mountList []string, volumes []v1.Volume) error {
	client, err := getPVCClient(namespace, p.appConfig)
	if err != nil {
		return err
	}

	p.requested = mapShortNotationToVolumeMap(mountList)
	p.requested = safeMergeVolumeMaps(p.requested, volumeSliceToMap(volumes))

	for i := range p.requested {
		volume := p.requested[i]
		switch p.requested[i].Type {
		// VOLUME
		case string(v1.ReadOnlyVolumeType):
			if err := p.applyVolume(client, namespace,
				name, &volume,
				coreV1.ReadOnlyMany); err != nil {
				return err
			}

		case string(v1.ReadWriteOnceVolumeType), "":
			if err := p.applyVolume(client, namespace,
				name, &volume,
				coreV1.ReadWriteOnce); err != nil {
				return err
			}

		case string(v1.ReadWriteManyVolumeType):
			if err := p.applyVolume(client, namespace,
				name, &volume,
				coreV1.ReadWriteMany); err != nil {
				return err
			}

		// TMP - these cases wont need pvc, adhoc volume created on the deployment
		case string(v1.MemoryVolumeType):
			p.avail[name] = v1.Volume{
				Name: util.JoinV("-", name, p.requested[i].Name),
				Type: string(v1.MemoryVolumeType),
				Path: p.requested[i].Path,
				Size: p.requested[i].Size,
			}
		case string(v1.EmptyDirVolumeType):
			p.avail[name] = v1.Volume{
				Name: util.JoinV("-", name, p.requested[i].Name),
				Type: string(v1.EmptyDirVolumeType),
				Path: p.requested[i].Path,
				Size: p.requested[i].Size,
			}
		}
	}

	return nil
}

func (p *pvc) applyVolume(client typedv1.PersistentVolumeClaimInterface,
	namespace, name string, volume *v1.Volume, volumeType coreV1.PersistentVolumeAccessMode) error {
	fullVolumeName := util.JoinV("-", name, volume.Name)

	var size resource.Quantity

	if volume.Size == "" {
		sizeFromEnv := resource.MustParse(p.appConfig.DefaultVolumeSize)
		size = sizeFromEnv
	} else {
		size = resource.MustParse(volume.Size)
	}

	claimSpec := corev1.PersistentVolumeClaimSpec().
		WithAccessModes(volumeType).
		WithResources(corev1.ResourceRequirements().WithRequests(coreV1.ResourceList{
			coreV1.ResourceStorage: size,
		}))

	if volume.Class != "" {
		claimSpec.WithStorageClassName(volume.Class)
	}
	claim := corev1.PersistentVolumeClaim(fullVolumeName, namespace).
		WithSpec(claimSpec)

	result, err := client.Apply(p.ctx, claim, metaV1.ApplyOptions{
		FieldManager: p.appConfig.FieldManagerName,
		Force:        p.appConfig.ForceOnConflicts,
	})

	if err != nil {
		return err
	}

	if result != nil {
		log.Println("PVC deployed: " + result.Name)
		p.avail[fullVolumeName] = v1.Volume{
			Name: fullVolumeName,
			Type: volume.Type,
			Path: volume.Path,
			Size: volume.Size,
		}
	}

	return nil
}

func getPVCClient(namespace string, cfg *config.Configuration) (typedv1.PersistentVolumeClaimInterface, error) {
	clientSet, err := GetClientSet(cfg)
	if err != nil {
		return nil, err
	}
	return clientSet.CoreV1().PersistentVolumeClaims(namespace), nil
}
