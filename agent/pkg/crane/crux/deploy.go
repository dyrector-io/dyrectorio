package crux

import (
	"context"
	"log"

	"github.com/dyrector-io/dyrectorio/agent/internal/grpc"
	"github.com/dyrector-io/dyrectorio/agent/internal/mapper"
	"github.com/dyrector-io/dyrectorio/agent/pkg/crane/config"
	"github.com/dyrector-io/dyrectorio/agent/pkg/crane/k8s"
	"github.com/dyrector-io/dyrectorio/protobuf/go/common"
)

func GetDeployments(ctx context.Context, namespace string) []*common.ContainerStateItem {
	cfg := grpc.GetConfigFromContext(ctx).(*config.Configuration)
	list, err := k8s.GetDeployments(ctx, namespace, cfg)

	if err != nil {
		log.Println(err)
	}

	return mapper.MapKubeDeploymentListToCruxStateItems(list)
}

func GetSecretsList(ctx context.Context, prefix string) ([]string, error) {
	// TODO(robot9706): implement secrets list
	log.Println("Secrets list not implemented!")
	return nil, nil
}
