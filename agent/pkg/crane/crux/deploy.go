package crux

import (
	"context"
	"log"

	"github.com/dyrector-io/dyrectorio/agent/internal/grpc"
	"github.com/dyrector-io/dyrectorio/agent/internal/mapper"
	"github.com/dyrector-io/dyrectorio/agent/pkg/crane/config"
	"github.com/dyrector-io/dyrectorio/agent/pkg/crane/k8s"
	"github.com/dyrector-io/dyrectorio/protobuf/go/crux"
)

func GetDeployments(ctx context.Context, namespace string) []*crux.ContainerStateItem {
	cfg := grpc.GetConfigFromContext(ctx).(*config.Configuration)
	list, err := k8s.GetDeployments(namespace, cfg)

	if err != nil {
		log.Println(err)
	}

	return mapper.MapKubeDeploymentListToCruxStateItems(list)
}
