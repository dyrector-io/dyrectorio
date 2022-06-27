package k8s

import (
	"context"
	"fmt"
	"log"

	"gitlab.com/dyrector_io/dyrector.io/go/internal/util"
	v1 "gitlab.com/dyrector_io/dyrector.io/go/pkg/api/v1"
	"gitlab.com/dyrector_io/dyrector.io/go/pkg/crane/config"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	corev1 "k8s.io/client-go/applyconfigurations/core/v1"
	typedv1 "k8s.io/client-go/kubernetes/typed/core/v1"
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

func (cm *configmap) loadSharedConfig(namespace string) error {
	client, err := getConfigMapClient(namespace)
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
func (cm *configmap) deployConfigMapData(namespace, name string, envList map[string]string) error {
	client, err := getConfigMapClient(namespace)
	if err != nil {
		return err
	}

	result, err := client.Apply(context.TODO(),
		corev1.ConfigMap(name, namespace).
			WithData(envList),
		metaV1.ApplyOptions{FieldManager: config.Cfg.FieldManagerName, Force: config.Cfg.ForceOnConflicts},
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
	client, err := getConfigMapClient(namespace)
	if err != nil {
		return err
	}

	return client.Delete(cm.ctx, name, metaV1.DeleteOptions{})
}

func getConfigMapClient(namespace string) (typedv1.ConfigMapInterface, error) {
	clientSet, err := GetClientSet()
	if err != nil {
		return nil, err
	}
	return clientSet.CoreV1().ConfigMaps(namespace), nil
}
