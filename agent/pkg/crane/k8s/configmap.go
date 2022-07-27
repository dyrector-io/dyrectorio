package k8s

import (
	"context"
	"fmt"
	"log"

	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	corev1 "k8s.io/client-go/applyconfigurations/core/v1"
	typedv1 "k8s.io/client-go/kubernetes/typed/core/v1"

	"github.com/dyrector-io/dyrectorio/agent/internal/util"
	v1 "github.com/dyrector-io/dyrectorio/agent/pkg/api/v1"
	"github.com/dyrector-io/dyrectorio/agent/pkg/crane/config"
)

// facade object for configmap management
type configmap struct {
	ctx    context.Context
	status string
	avail  []string
}

func newConfigmap(ctx context.Context) *configmap {
	return &configmap{ctx: ctx, status: "", avail: []string{}}
}

func (cm *configmap) loadSharedConfig(namespace string, config *config.Configuration) error {
	client, err := getConfigMapClient(namespace, config)
	if err != nil {
		return err
	}

	commonConfigMapName := util.JoinV("-", namespace, "shared")
	commonConfigMap, err := client.Get(context.TODO(), commonConfigMapName, metaV1.GetOptions{})
	if err != nil {
		log.Println("shared configmaps could not be loaded ns: ", namespace)
	}
	if commonConfigMap != nil {
		cm.avail = append(cm.avail, commonConfigMapName)
	}
	return nil
}

// deployConfigMapData creates the config map object and adds it to the avail list
// that is used by the deployment later on
func (cm *configmap) deployConfigMapData(namespace, name string, envList map[string]string, config *config.Configuration) error {
	client, err := getConfigMapClient(namespace, config)
	if err != nil {
		return err
	}

	result, err := client.Apply(context.TODO(),
		corev1.ConfigMap(name, namespace).
			WithData(envList),
		metaV1.ApplyOptions{FieldManager: config.FieldManagerName, Force: config.ForceOnConflicts},
	)

	if err != nil {
		return err
	}
	if result != nil {
		log.Println("ConfigMap updated: " + result.Name)
		if len(envList) > 0 {
			cm.avail = append(cm.avail, name)
		}
	}

	return nil
}

func (cm *configmap) deployConfigMapRuntime(runtimeType v1.RuntimeConfigType, namespace, containerName string, data *string, config *config.Configuration) error {
	if runtimeType == v1.DotnetAppSettingsJSON {
		envList, err := util.MapAppsettingsToEnv(data)
		if err != nil {
			return err
		}
		err = cm.deployConfigMapData(namespace, fmt.Sprintf("%v-%v", containerName, runtimeType), envList, config)

		if err != nil {
			return err
		}
	}

	return nil
}

// delete related configmaps. note: configmaps being in use are unaffected by this
func (cm *configmap) deleteConfigMaps(namespace, name string, config *config.Configuration) error {
	client, err := getConfigMapClient(namespace, config)
	if err != nil {
		return err
	}

	return client.Delete(cm.ctx, name, metaV1.DeleteOptions{})
}

func getConfigMapClient(namespace string, config *config.Configuration) (typedv1.ConfigMapInterface, error) {
	clientSet, err := GetClientSet(config)
	if err != nil {
		return nil, err
	}
	return clientSet.CoreV1().ConfigMaps(namespace), nil
}
