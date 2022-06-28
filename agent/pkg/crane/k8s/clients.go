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

func GetClientSet() (*kubernetes.Clientset, error) {
	if config.Cfg.CraneInCluster {
		return inClusterAuth()
	} else {
		return outClusterAuth()
	}
}

func inClusterAuth() (*kubernetes.Clientset, error) {
	clusterConfig, err := rest.InClusterConfig()
	if err != nil {
		log.Println(err.Error())
		return nil, err
	}
	clusterConfig.Timeout = config.Cfg.DefaultKubeTimeout
	clientset, err := kubernetes.NewForConfig(clusterConfig)
	return clientset, err
}

func outClusterAuth() (*kubernetes.Clientset, error) {
	var kubeconfig *string

	if configPathFromEnv := config.Cfg.KubeConfig; configPathFromEnv != "" {
		kubeconfig = &configPathFromEnv
	} else if home := homedir.HomeDir(); home != "" {
		cfgPath := filepath.Join(home, ".kube", "config")
		kubeconfig = &cfgPath
	}

	configFromFlags, err := clientcmd.BuildConfigFromFlags("", *kubeconfig)
	if err != nil {
		log.Panicln("Could not load config file: " + err.Error())
	}
	configFromFlags.Timeout = config.Cfg.DefaultKubeTimeout

	// create the clientset
	clientset, err := kubernetes.NewForConfig(configFromFlags)
	if err != nil {
		log.Println("Could not create client set: " + err.Error())
	}

	return clientset, err
}
