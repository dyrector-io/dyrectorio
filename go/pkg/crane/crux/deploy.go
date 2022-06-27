package crux

import (
	"log"

	"gitlab.com/dyrector_io/dyrector.io/go/internal/mapper"
	"gitlab.com/dyrector_io/dyrector.io/go/pkg/crane/k8s"
	"gitlab.com/dyrector_io/dyrector.io/protobuf/go/crux"
)

func GetDeployments(namespace string) []*crux.ContainerStatusItem {
	list, err := k8s.GetDeployments(namespace)

	if err != nil {
		log.Println(err)
	}

	return mapper.MapKubeDeploymentListToCruxStatusItems(list)
}
