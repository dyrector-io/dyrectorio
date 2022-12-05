package k8s

import (
	"path/filepath"

	"github.com/rs/zerolog/log"
	"k8s.io/client-go/kubernetes"

	// enable all authentication methods
	_ "k8s.io/client-go/plugin/pkg/client/auth"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
	"k8s.io/client-go/util/homedir"

	"github.com/dyrector-io/dyrectorio/golang/pkg/crane/config"
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

func (c *Client) GetRestConf(cfg *config.Configuration) (*rest.Config, error) {
	if cfg.CraneInCluster {
		return rest.InClusterConfig()
	}
	return getLocalKubeConf(cfg)
}

func (c *Client) GetClientSet(cfg *config.Configuration) (*kubernetes.Clientset, error) {
	if cfg.CraneInCluster {
		return c.inClusterAuth(cfg)
	}
	return c.outClusterAuth(cfg)
}

func (c *Client) inClusterAuth(cfg *config.Configuration) (*kubernetes.Clientset, error) {
	clusterConfig, err := c.InClusterConfig()
	if err != nil {
		log.Error().Err(err).Stack().Send()
		return nil, err
	}
	clusterConfig.Timeout = cfg.DefaultKubeTimeout
	clientset, err := kubernetes.NewForConfig(clusterConfig)
	return clientset, err
}

func getLocalKubeConf(cfg *config.Configuration) (*rest.Config, error) {
	var kubeconfig *string

	if configPathFromEnv := cfg.KubeConfig; configPathFromEnv != "" {
		kubeconfig = &configPathFromEnv
	} else if home := homedir.HomeDir(); home != "" {
		cfgPath := filepath.Join(home, ".kube", "config")
		kubeconfig = &cfgPath
	}

	configFromFlags, err := clientcmd.BuildConfigFromFlags("", *kubeconfig)
	if configFromFlags != nil {
		configFromFlags.Timeout = cfg.DefaultKubeTimeout
	}

	return configFromFlags, err
}

func (c *Client) outClusterAuth(cfg *config.Configuration) (*kubernetes.Clientset, error) {
	localConfig, err := getLocalKubeConf(cfg)
	if err != nil {
		return nil, err
	}
	// create the clientset
	clientset, err := kubernetes.NewForConfig(localConfig)
	if err != nil {
		log.Error().Err(err).Stack().Msg("Could not create client set")
	}

	return clientset, err
}
