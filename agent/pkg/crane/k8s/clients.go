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

type Client struct {
	InClusterConfig      func() (*rest.Config, error)
	BuildConfigFromFlags func(masterUrl, kubeconfigPath string) (*rest.Config, error)
}

func NewClient() *Client {
	client := &Client{
		InClusterConfig:      rest.InClusterConfig,
		BuildConfigFromFlags: clientcmd.BuildConfigFromFlags,
	}
	return client
}

func (c *Client) GetClientSet(cfg *config.Configuration) (*kubernetes.Clientset, error) {
	if cfg.CraneInCluster {
		return c.inClusterAuth(cfg)
	} else {
		return c.outClusterAuth(cfg)
	}
}

func (c *Client) inClusterAuth(cfg *config.Configuration) (*kubernetes.Clientset, error) {
	clusterConfig, err := c.InClusterConfig()
	if err != nil {
		log.Println(err.Error())
		return nil, err
	}
	clusterConfig.Timeout = cfg.DefaultKubeTimeout
	clientset, err := kubernetes.NewForConfig(clusterConfig)
	return clientset, err
}

func (c *Client) outClusterAuth(cfg *config.Configuration) (*kubernetes.Clientset, error) {
	var kubeconfig *string

	if configPathFromEnv := cfg.KubeConfig; configPathFromEnv != "" {
		kubeconfig = &configPathFromEnv
	} else if home := homedir.HomeDir(); home != "" {
		cfgPath := filepath.Join(home, ".kube", "config")
		kubeconfig = &cfgPath
	}

	configFromFlags, err := c.BuildConfigFromFlags("", *kubeconfig)
	if err != nil {
		log.Panicln("Could not load config file: " + err.Error())
	}
	configFromFlags.Timeout = cfg.DefaultKubeTimeout

	// create the clientset
	clientset, err := kubernetes.NewForConfig(configFromFlags)
	if err != nil {
		log.Println("Could not create client set: " + err.Error())
	}

	return clientset, err
}
