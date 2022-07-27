package k8s

import (
	"context"
	"encoding/json"
	"strings"
	"time"

	"fmt"
	"log"

	coreV1 "k8s.io/api/core/v1"
	resource "k8s.io/apimachinery/pkg/api/resource"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/types"
	"k8s.io/apimachinery/pkg/util/intstr"

	"github.com/dyrector-io/dyrectorio/agent/internal/util"
	"github.com/dyrector-io/dyrectorio/agent/pkg/crane/config"

	typedv1 "k8s.io/client-go/kubernetes/typed/apps/v1"

	v1 "github.com/dyrector-io/dyrectorio/agent/pkg/api/v1"

	appsv1 "k8s.io/client-go/applyconfigurations/apps/v1"

	kappsv1 "k8s.io/api/apps/v1"

	corev1 "k8s.io/client-go/applyconfigurations/core/v1"
	metav1 "k8s.io/client-go/applyconfigurations/meta/v1"
)

const CraneUpdatedAnnotation = "crane.dyrector.io/restartedAt"

// facade object for deployment management
type deployment struct {
	ctx    context.Context
	status string
}

func newDeployment(ctx context.Context) *deployment {
	return &deployment{status: "", ctx: ctx}
}

type deploymentParams struct {
	namespace       string
	image           util.ImageURI
	containerConfig *v1.ContainerConfig
	configMapsEnv   []string
	volumes         map[string]v1.Volume
	portList        []v1.PortBinding
	command         []string
	args            []string
	issuer          string
}

func (d *deployment) deployDeployment(p *deploymentParams, cfg *config.Configuration) error {
	client := getDeploymentsClient(p.namespace, cfg)

	name := p.containerConfig.Container
	deployment := appsv1.Deployment(name, p.namespace).
		WithSpec(
			appsv1.DeploymentSpec().
				WithReplicas(1).
				WithSelector(metav1.LabelSelector().WithMatchLabels(map[string]string{
					"app": name,
				})).
				WithTemplate(corev1.PodTemplateSpec().WithLabels(map[string]string{
					"app": name,
				}).WithAnnotations(map[string]string{
					CraneUpdatedAnnotation: time.Now().Format(time.RFC3339),
					cfg.KeyIssuer:          p.issuer,
				}).WithSpec(
					corev1.PodSpec().WithContainers(buildContainer(p, cfg)).
						WithInitContainers(getInitContainers(p.containerConfig, cfg)...).
						WithVolumes(getVolumesFromMap(p.volumes, cfg)...),
				)),
		)
	result, err := client.Apply(d.ctx, deployment, metaV1.ApplyOptions{
		FieldManager: cfg.FieldManagerName,
		Force:        cfg.ForceOnConflicts,
	})

	if err != nil {
		log.Println("Deployment error: " + err.Error())
		return err
	}

	log.Println("Deployment succeeded: " + result.Name)

	return nil
}

func (d *deployment) deleteDeployment(namespace, name string, cfg *config.Configuration) error {
	client := getDeploymentsClient(namespace, cfg)

	return client.Delete(d.ctx, name, metaV1.DeleteOptions{})
}

//nolint:unused
func (d *deployment) restart(namespace, name string, cfg *config.Configuration) error {
	client := getDeploymentsClient(namespace, cfg)

	datePatch := map[string]interface{}{
		"spec": map[string]interface{}{
			"template": map[string]interface{}{
				"metadata": map[string]interface{}{
					"annotations": map[string]interface{}{
						CraneUpdatedAnnotation: time.Now().Format(time.RFC3339),
					},
				},
			}},
	}

	marshaled, err := json.Marshal(datePatch)

	if err != nil {
		return err
	}

	_, err = client.Patch(d.ctx, name, types.MergePatchType, marshaled,
		metaV1.PatchOptions{})

	if err != nil {
		return err
	}
	return nil
}

// builds the container using the builder interface, with healthchecks, volumes, configs, ports...
func buildContainer(p *deploymentParams, cfg *config.Configuration) *corev1.ContainerApplyConfiguration {
	healthCheckConfig := p.containerConfig.HealthCheckConfig
	var healthCheckDelay int32 = 30
	var healthCheckThreshold int32 = 1

	var livenessProbe *corev1.ProbeApplyConfiguration
	var readinessProbe *corev1.ProbeApplyConfiguration
	var startupProbe *corev1.ProbeApplyConfiguration

	// Check all Probes to represented in the deploymentParams or not
	if healthCheckConfig.LivenessProbe != nil {
		livenessProbe = corev1.Probe().
			WithHTTPGet(getProbes(healthCheckConfig.LivenessProbe.Path, healthCheckConfig.Port)).
			WithInitialDelaySeconds(healthCheckDelay).
			WithFailureThreshold(healthCheckThreshold)
	}

	if healthCheckConfig.ReadinessProbe != nil {
		readinessProbe = corev1.Probe().
			WithHTTPGet(getProbes(healthCheckConfig.ReadinessProbe.Path, healthCheckConfig.Port)).
			WithInitialDelaySeconds(healthCheckDelay).
			WithFailureThreshold(healthCheckThreshold)
	}

	if healthCheckConfig.StartupProbe != nil {
		startupProbe = corev1.Probe().
			WithHTTPGet(getProbes(healthCheckConfig.ReadinessProbe.Path, healthCheckConfig.Port)).
			WithInitialDelaySeconds(healthCheckDelay).
			WithFailureThreshold(healthCheckThreshold)
	}

	container := corev1.Container().
		WithName(p.containerConfig.Container).
		WithImage(p.image.String()).
		WithEnvFrom(getEnvConfigMaps(p.configMapsEnv)...).
		WithVolumeMounts(getVolumeMountsFromMap(p.volumes)...).
		WithPorts(getContainerPorts(p.portList)...).
		WithLivenessProbe(livenessProbe).
		WithReadinessProbe(readinessProbe).
		WithStartupProbe(startupProbe).
		WithResources(getResourceManagement(p.containerConfig.ResourceConfig, cfg)).
		WithTTY(p.containerConfig.TTY)

	if p.containerConfig.User != nil {
		container.WithSecurityContext(
			corev1.SecurityContext().
				WithRunAsUser(*p.containerConfig.User))
	}

	if p.containerConfig.Command != nil {
		container.WithCommand(p.containerConfig.Command...)
	}

	if p.containerConfig.Args != nil {
		container.WithArgs(p.containerConfig.Args...)
	}

	return container
}

func getResourceManagement(resourceConfig v1.ResourceConfig, cfg *config.Configuration) *corev1.ResourceRequirementsApplyConfiguration {
	var ResourceLimitsCPU, ResourceLimitsMemory, ResourceRequestsCPU, ResourceRequestsMemory resource.Quantity
	var err error

	// TODO(nandi): panic on invalid userinput!?!??!?!?!??!?!!?!??!?!?!
	// Resource Limits CPU
	if resourceConfig.Limits.CPU != "" {
		if ResourceLimitsCPU, err = resource.ParseQuantity(resourceConfig.Limits.CPU); err != nil {
			log.Panic(err)
		}
	} else {
		if ResourceLimitsCPU, err = resource.ParseQuantity(cfg.DefaultLimitsCPU); err != nil {
			log.Panic(err)
		}
	}

	// Resource Limits Memory
	if resourceConfig.Limits.Memory != "" {
		if ResourceLimitsMemory, err = resource.ParseQuantity(resourceConfig.Limits.Memory); err != nil {
			log.Panic(err)
		}
	} else {
		if ResourceLimitsMemory, err = resource.ParseQuantity(cfg.DefaultLimitsMemory); err != nil {
			log.Panic(err)
		}
	}

	// Resource Requests CPU
	if resourceConfig.Requests.CPU != "" {
		if ResourceRequestsCPU, err = resource.ParseQuantity(resourceConfig.Requests.CPU); err != nil {
			log.Panic(err)
		}
	} else {
		if ResourceRequestsCPU, err = resource.ParseQuantity(cfg.DefaultRequestsCPU); err != nil {
			log.Panic(err)
		}
	}

	// Resource Requests Memory
	if resourceConfig.Requests.Memory != "" {
		if ResourceRequestsMemory, err = resource.ParseQuantity(resourceConfig.Requests.Memory); err != nil {
			log.Panic(err)
		}
	} else {
		if ResourceRequestsMemory, err = resource.ParseQuantity(cfg.DefaultLimitsMemory); err != nil {
			log.Panic(err)
		}
	}

	return corev1.ResourceRequirements().WithLimits(
		coreV1.ResourceList{
			coreV1.ResourceCPU:    ResourceLimitsCPU,
			coreV1.ResourceMemory: ResourceLimitsMemory,
		}).WithRequests(
		coreV1.ResourceList{
			coreV1.ResourceCPU:    ResourceRequestsCPU,
			coreV1.ResourceMemory: ResourceRequestsMemory,
		},
	)
}

func getInitContainers(containerConfig *v1.ContainerConfig, cfg *config.Configuration) []*corev1.ContainerApplyConfiguration {
	// this is only the config container / could be general / wait for it / other init purposes
	initContainers := []*corev1.ContainerApplyConfiguration{}

	if containerConfig != nil {
		if containerConfig.ConfigContainer != nil {
			initContainers = append(initContainers,
				corev1.Container().
					WithName("config-loader").
					WithImage(containerConfig.ConfigContainer.Image).
					WithImagePullPolicy(coreV1.PullAlways).
					WithCommand([]string{
						"sh",
						"-c",
						fmt.Sprintf("rsync --delete -a %s /targetconfig", containerConfig.ConfigContainer.Path)}...).
					WithVolumeMounts(getVolumeMountsFromMap(map[string]v1.Volume{
						util.JoinV("-", containerConfig.Container, containerConfig.ConfigContainer.Volume): {
							Name: util.JoinV("-", containerConfig.Container, containerConfig.ConfigContainer.Volume),
							Path: "/targetconfig",
						},
					})...),
			)
		}

		if containerConfig.ImportContainer != nil {
			importContainerVolumeName := util.JoinV("-", containerConfig.Container, containerConfig.ImportContainer.Volume)

			initContainers = append(initContainers,
				corev1.Container().
					WithName("import").
					WithImage(cfg.ImportContainerImage).
					WithImagePullPolicy(coreV1.PullAlways).
					WithEnv(getEnvs(containerConfig.ImportContainer.Environments)...).
					WithArgs(
						strings.Split(containerConfig.ImportContainer.Command, " ")...).
					WithVolumeMounts(getVolumeMountsFromMap(map[string]v1.Volume{
						importContainerVolumeName: {
							Name: importContainerVolumeName,
							Path: "/data/output",
						},
					})...),
			)
		}
	}

	return initContainers
}

// GetEnvs maps key-value map into apply configuration, no configmap or else, just direct mapping
func getEnvs(environments map[string]string) []*corev1.EnvVarApplyConfiguration {
	apply := []*corev1.EnvVarApplyConfiguration{}

	for name, value := range environments {
		apply = append(apply, corev1.EnvVar().WithName(name).WithValue(value))
	}

	return apply
}

func getEnvConfigMaps(configs []string) []*corev1.EnvFromSourceApplyConfiguration {
	configmaps := []*corev1.EnvFromSourceApplyConfiguration{}

	for i := range configs {
		configmaps = append(configmaps,
			corev1.EnvFromSource().WithConfigMapRef(corev1.ConfigMapEnvSource().WithName(configs[i])),
		)
	}

	return configmaps
}

func getProbes(path string, port uint16) *corev1.HTTPGetActionApplyConfiguration {
	return corev1.HTTPGetAction().
		WithPath(path).
		WithPort(intstr.FromInt(int(port))) // exposed port
}

func getContainerPorts(portList []v1.PortBinding) []*corev1.ContainerPortApplyConfiguration {
	ports := []*corev1.ContainerPortApplyConfiguration{}

	for i := range portList {
		ports = append(ports,
			corev1.ContainerPort().
				WithProtocol(coreV1.ProtocolTCP).
				WithName(fmt.Sprintf("port-%v", portList[i].ExposedPort)).
				WithContainerPort(int32(portList[i].ExposedPort)))
	}
	return ports
}

func getDeploymentsClient(namespace string, cfg *config.Configuration) typedv1.DeploymentInterface {
	client, err := GetClientSet(cfg)
	if err != nil {
		panic(err)
	}

	return client.AppsV1().Deployments(namespace)
}

func getVolumesFromMap(volumes map[string]v1.Volume, cfg *config.Configuration) []*corev1.VolumeApplyConfiguration {
	volumeList := []*corev1.VolumeApplyConfiguration{}

	for name, volume := range volumes {
		var tmpStorageSize resource.Quantity
		var err error

		if volume.Size != "" {
			tmpStorageSize, err = resource.ParseQuantity(volume.Size)
			if err != nil {
				log.Println("Warning: input volume size is invalid using defaults: ", cfg.DefaultVolumeSize)
				tmpStorageSize = resource.MustParse(cfg.DefaultVolumeSize)
			}
		} else {
			tmpStorageSize = resource.MustParse(cfg.DefaultVolumeSize)
		}
		if volume.Type == string(v1.EmptyDirVolumeType) {
			volumeList = append(volumeList,
				corev1.Volume().
					WithName(volume.Name).
					WithEmptyDir(
						corev1.EmptyDirVolumeSource().
							WithMedium(coreV1.StorageMediumDefault).
							WithSizeLimit(tmpStorageSize)))
		} else if volume.Type == string(v1.MemoryVolumeType) {
			volumeList = append(volumeList,
				corev1.Volume().
					WithName(volume.Name).
					WithEmptyDir(corev1.EmptyDirVolumeSource().
						WithMedium(coreV1.StorageMediumMemory).
						WithSizeLimit(tmpStorageSize)))
		} else {
			volumeList = append(volumeList,
				corev1.Volume().
					WithName(volume.Name).
					WithPersistentVolumeClaim(
						corev1.PersistentVolumeClaimVolumeSource().
							WithClaimName(name)))
		}
	}

	return volumeList
}

func getVolumeMountsFromMap(mounts map[string]v1.Volume) []*corev1.VolumeMountApplyConfiguration {
	volumes := []*corev1.VolumeMountApplyConfiguration{}
	for _, volume := range mounts {
		volumes = append(volumes,
			corev1.VolumeMount().
				WithName(volume.Name).
				WithMountPath(volume.Path))
	}

	return volumes
}

func GetDeployments(namespace string, cfg *config.Configuration) (*kappsv1.DeploymentList, error) {
	clientset, err := GetClientSet(cfg)

	if err != nil {
		return nil, err
	}

	deploymentsClient := clientset.AppsV1().Deployments(util.Fallback(namespace, coreV1.NamespaceDefault))

	list, err := deploymentsClient.List(context.TODO(), metaV1.ListOptions{})
	if err != nil {
		panic(err)
	}
	return list, nil
}

//nolint
func getReplicaSetClient(namespace string, cfg *config.Configuration) typedv1.ReplicaSetInterface {
	client, err := GetClientSet(cfg)
	if err != nil {
		panic(err)
	}
	return client.AppsV1().ReplicaSets(namespace)
}
