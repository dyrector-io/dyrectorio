package crux

import (
	"log"

	"github.com/dyrector-io/dyrectorio/agent/internal/mapper"
	"github.com/dyrector-io/dyrectorio/agent/pkg/crane/k8s"
	"github.com/dyrector-io/dyrectorio/protobuf/go/crux"
)

func GetDeployments(namespace string) []*crux.ContainerStatusItem {
	list, err := k8s.GetDeployments(namespace)

	if err != nil {
		log.Println(err)
	}

	return mapper.MapKubeDeploymentListToCruxStatusItems(list)
}
