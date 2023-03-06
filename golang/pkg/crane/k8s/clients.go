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
	appConfig            *config.Configuration
	InClusterConfig      func() (*rest.Config, error)
	BuildConfigFromFlags func(masterUrl, kubeconfigPath string) (*rest.Config, error)
}

func NewClient(cfg *config.Configuration) *Client {
	client := &Client{
		appConfig:            cfg,
		InClusterConfig:      rest.InClusterConfig,
		BuildConfigFromFlags: clientcmd.BuildConfigFromFlags,
	}
	return client
}

func (c *Client) GetRestConfig() (*rest.Config, error) {
	if c.appConfig.CraneInCluster {
		return rest.InClusterConfig()
	}
	return c.getLocalKubeConf()
}

func (c *Client) GetClientSet() (*kubernetes.Clientset, error) {
	if c.appConfig.CraneInCluster {
		return c.inClusterAuth()
	}
	return c.outClusterAuth()
}

func (c *Client) inClusterAuth() (*kubernetes.Clientset, error) {
	clusterConfig, err := c.InClusterConfig()
	if err != nil {
		log.Error().Err(err).Stack().Send()
		return nil, err
	}
	clusterConfig.Timeout = c.appConfig.DefaultKubeTimeout
	clientset, err := kubernetes.NewForConfig(clusterConfig)
	return clientset, err
}

func (c *Client) getLocalKubeConf() (*rest.Config, error) {
	var kubeconfig *string

	if configPathFromEnv := c.appConfig.KubeConfig; configPathFromEnv != "" {
		kubeconfig = &configPathFromEnv
	} else if home := homedir.HomeDir(); home != "" {
		cfgPath := filepath.Join(home, ".kube", "config")
		kubeconfig = &cfgPath
	}

	configFromFlags, err := c.BuildConfigFromFlags("", *kubeconfig)
	if configFromFlags != nil {
		configFromFlags.Timeout = c.appConfig.DefaultKubeTimeout
	}

	return configFromFlags, err
}

func (c *Client) outClusterAuth() (*kubernetes.Clientset, error) {
	localConfig, err := c.getLocalKubeConf()
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

func (c *Client) VerifyAPIResourceExists(targetGroup, targetKind string) bool {
	found := false
	clientSet, err := c.GetClientSet()
	if err != nil {
		log.Err(err)
	}

	_, apiResources, err := clientSet.ServerGroupsAndResources()
	if err != nil {
		log.Err(err).Send()
	}

	for _, res := range apiResources {
		if res.GroupVersion == targetGroup {
			for i := range res.APIResources {
				if res.APIResources[i].Kind == targetKind {
					return true
				}
			}
		}
	}

	return found
}
