package k8s

import (
	"log"
	"path/filepath"

	"k8s.io/client-go/kubernetes"
	_ "k8s.io/client-go/plugin/pkg/client/auth"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
	"k8s.io/client-go/util/homedir"

	"github.com/dyrector-io/dyrectorio/agent/pkg/crane/config"
)

func GetClientSet(config *config.Configuration) (*kubernetes.Clientset, error) {
	if config.CraneInCluster {
		return inClusterAuth(config)
	} else {
		return outClusterAuth(config)
	}
}

func inClusterAuth(config *config.Configuration) (*kubernetes.Clientset, error) {
	clusterConfig, err := rest.InClusterConfig()
	if err != nil {
		log.Println(err.Error())
		return nil, err
	}
	clusterConfig.Timeout = config.DefaultKubeTimeout
	clientset, err := kubernetes.NewForConfig(clusterConfig)
	return clientset, err
}

func outClusterAuth(config *config.Configuration) (*kubernetes.Clientset, error) {
	var kubeconfig *string

	if configPathFromEnv := config.KubeConfig; configPathFromEnv != "" {
		kubeconfig = &configPathFromEnv
	} else if home := homedir.HomeDir(); home != "" {
		cfgPath := filepath.Join(home, ".kube", "config")
		kubeconfig = &cfgPath
	}

	configFromFlags, err := clientcmd.BuildConfigFromFlags("", *kubeconfig)
	if err != nil {
		log.Panicln("Could not load config file: " + err.Error())
	}
	configFromFlags.Timeout = config.DefaultKubeTimeout

	// create the clientset
	clientset, err := kubernetes.NewForConfig(configFromFlags)
	if err != nil {
		log.Println("Could not create client set: " + err.Error())
	}

	return clientset, err
}
