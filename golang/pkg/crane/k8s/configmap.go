package k8s

import (
	"context"
	"fmt"

	"github.com/rs/zerolog/log"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	corev1 "k8s.io/client-go/applyconfigurations/core/v1"
	typedv1 "k8s.io/client-go/kubernetes/typed/core/v1"

	v1 "github.com/dyrector-io/dyrectorio/golang/api/v1"
	"github.com/dyrector-io/dyrectorio/golang/internal/util"
	"github.com/dyrector-io/dyrectorio/golang/pkg/crane/config"
)

// facade object for configmap management
type configmap struct {
	ctx       context.Context
	status    string
	avail     []string
	appConfig *config.Configuration
}

func newConfigmap(ctx context.Context, cfg *config.Configuration) *configmap {
	return &configmap{ctx: ctx, status: "", avail: []string{}, appConfig: cfg}
}

func (cm *configmap) loadSharedConfig(namespace string) error {
	client, err := getConfigMapClient(namespace, cm.appConfig)
	if err != nil {
		return err
	}

	commonConfigMapName := util.JoinV("-", namespace, "shared")
	commonConfigMap, err := client.Get(cm.ctx, commonConfigMapName, metaV1.GetOptions{})
	if err != nil {
		log.Info().Str("namespace", namespace).Msg("Shared configmaps could not be loaded")
	}
	if commonConfigMap != nil {
		cm.avail = append(cm.avail, commonConfigMapName)
	}
	return nil
}

// deployConfigMapData creates the config map object and adds it to the avail list
// that is used by the deployment later on
func (cm *configmap) deployConfigMapData(namespace, name string, envList map[string]string) error {
	client, err := getConfigMapClient(namespace, cm.appConfig)
	if err != nil {
		return err
	}

	result, err := client.Apply(cm.ctx,
		corev1.ConfigMap(name, namespace).
			WithData(envList),
		metaV1.ApplyOptions{FieldManager: cm.appConfig.FieldManagerName, Force: cm.appConfig.ForceOnConflicts},
	)
	if err != nil {
		return err
	}
	if result != nil {
		log.Info().Str("configMap", result.Name).Msg("ConfigMap updated")
		if len(envList) > 0 {
			cm.avail = append(cm.avail, name)
		}
	}

	return nil
}

func (cm *configmap) deployConfigMapRuntime(runtimeType v1.RuntimeConfigType, namespace, containerName string, data *string) error {
	if runtimeType == v1.DotnetAppSettingsJSON {
		envList, err := util.MapAppsettingsToEnv(data)
		if err != nil {
			return err
		}
		err = cm.deployConfigMapData(namespace, fmt.Sprintf("%v-%v", containerName, runtimeType), envList)

		if err != nil {
			return err
		}
	}

	return nil
}

// delete related configmaps. note: configmaps being in use are unaffected by this
func (cm *configmap) deleteConfigMaps(namespace, name string) error {
	client, err := getConfigMapClient(namespace, cm.appConfig)
	if err != nil {
		return err
	}

	return client.Delete(cm.ctx, name, metaV1.DeleteOptions{})
}

func getConfigMapClient(namespace string, cfg *config.Configuration) (typedv1.ConfigMapInterface, error) {
	clientSet, err := NewClient(cfg).GetClientSet()
	if err != nil {
		return nil, err
	}
	return clientSet.CoreV1().ConfigMaps(namespace), nil
}
