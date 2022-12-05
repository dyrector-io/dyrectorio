package crux

import (
	"context"
	"errors"

	"github.com/rs/zerolog/log"

	"github.com/dyrector-io/dyrectorio/golang/internal/grpc"
	"github.com/dyrector-io/dyrectorio/golang/internal/mapper"
	"github.com/dyrector-io/dyrectorio/golang/pkg/crane/config"
	"github.com/dyrector-io/dyrectorio/golang/pkg/crane/k8s"
	common "github.com/dyrector-io/dyrectorio/protobuf/go/common"
)

func GetDeployments(ctx context.Context, namespace string) []*common.ContainerStateItem {
	cfg := grpc.GetConfigFromContext(ctx).(*config.Configuration)
	list, err := k8s.GetDeployments(ctx, namespace, cfg)
	if err != nil {
		log.Error().Err(err).Stack().Send()
	}

	return mapper.MapKubeDeploymentListToCruxStateItems(list)
}

func GetSecretsList(ctx context.Context, prefix, name string) ([]string, error) {
	cfg := grpc.GetConfigFromContext(ctx).(*config.Configuration)

	return k8s.ListSecrets(ctx, prefix, name, cfg)
}

func DeploymentCommand(ctx context.Context, command *common.ContainerCommandRequest) error {
	// TODO(@m8vago): implement container (deployment?) start, stop, restart for kube
	// operation := command.Operation
	// prefixName := command.GetPrefixName()
	return errors.New("deployment commands are not implemented")
}
