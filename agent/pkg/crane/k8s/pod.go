package k8s

import (
	"github.com/dyrector-io/dyrectorio/agent/pkg/crane/config"
	v1 "k8s.io/client-go/kubernetes/typed/core/v1"
)

func getPodClient(namespace string, config *config.Configuration) (v1.PodInterface, error) {
	clientset, err := GetClientSet(config)

	if err != nil {
		return nil, err
	}

	return clientset.CoreV1().Pods(namespace), nil
}
