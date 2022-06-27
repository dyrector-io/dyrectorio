package k8s

import (
	v1 "k8s.io/client-go/kubernetes/typed/core/v1"
)

func getPodClient(namespace string) (v1.PodInterface, error) {
	clientset, err := GetClientSet()

	if err != nil {
		return nil, err
	}

	return clientset.CoreV1().Pods(namespace), nil
}
