package crux

import (
	"context"
	"errors"

	"github.com/rs/zerolog/log"

	"github.com/dyrector-io/dyrectorio/golang/internal/grpc"
	"github.com/dyrector-io/dyrectorio/golang/internal/mapper"
	"github.com/dyrector-io/dyrectorio/golang/pkg/crane/config"
	"github.com/dyrector-io/dyrectorio/golang/pkg/crane/k8s"

	corev1 "k8s.io/api/core/v1"

	common "github.com/dyrector-io/dyrectorio/protobuf/go/common"
)

func WatchDeploymentsByPrefix(ctx context.Context, namespace string) (*grpc.ContainerWatchContext, error) {
	cfg := grpc.GetConfigFromContext(ctx).(*config.Configuration)
	client := k8s.NewClient(cfg)

	deploymentHandler := k8s.NewDeployment(ctx, cfg)
	deployments, err := deploymentHandler.GetDeployments(ctx, namespace, cfg)
	if err != nil {
		log.Error().Err(err).Stack().Send()
		return nil, err
	}

	svcHandler := k8s.NewService(ctx, client)
	svc, err := svcHandler.GetServices(namespace)
	if err != nil {
		log.Error().Err(err).Stack().Send()
		return nil, err
	}

	podsByDeployment := make(map[string][]corev1.Pod)
	for i := 0; i < len(deployments.Items); i++ {
		deployment := deployments.Items[i]
		pods, err := deploymentHandler.GetPods(namespace, deployment.Name)
		if err != nil {
			log.Error().Err(err).Stack().Send()
			return nil, err
		}

		podsByDeployment[deployment.Name] = pods
	}

	eventChannel := make(chan []*common.ContainerStateItem)

	go func() {
		eventChannel <- mapper.MapKubeDeploymentListToCruxStateItems(deployments, podsByDeployment, svc)
	}()

	return &grpc.ContainerWatchContext{
		Events: eventChannel,
	}, nil
}

func GetSecretsList(ctx context.Context, prefix, name string) ([]string, error) {
	cfg := grpc.GetConfigFromContext(ctx).(*config.Configuration)
	secretHandler := k8s.NewSecret(ctx, k8s.NewClient(cfg))

	return secretHandler.ListSecrets(prefix, name)
}

func DeploymentCommand(ctx context.Context, command *common.ContainerCommandRequest) error {
	cfg := grpc.GetConfigFromContext(ctx).(*config.Configuration)
	id := command.GetContainer()

	deployment := k8s.NewDeployment(ctx, cfg)
	switch command.Operation {
	case common.ContainerOperation_START_CONTAINER:
		return deployment.Scale(id.Prefix, id.Name, 1)
	case common.ContainerOperation_RESTART_CONTAINER:
		return deployment.Restart(id.Prefix, id.Name)
	case common.ContainerOperation_STOP_CONTAINER:
		// do scale down
		return deployment.Scale(id.Prefix, id.Name, 0)
	case common.ContainerOperation_CONTAINER_OPERATION_UNSPECIFIED:
		return errors.New("unspecified deployment command")
	default:
		return errors.New("unknown deployment command")
	}
}
