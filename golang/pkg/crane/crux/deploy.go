package crux

import (
	"context"
	"errors"

	"k8s.io/client-go/dynamic"

	"github.com/dyrector-io/dyrectorio/golang/internal/grpc"
	"github.com/dyrector-io/dyrectorio/golang/pkg/crane/config"
	"github.com/dyrector-io/dyrectorio/golang/pkg/crane/k8s"
	"github.com/dyrector-io/dyrectorio/protobuf/go/common"
)

func WatchDeploymentsByPrefix(ctx context.Context, namespace string) (*grpc.ContainerWatchContext, error) {
	cfg := grpc.GetConfigFromContext(ctx).(*config.Configuration)
	client := k8s.NewClient(cfg)

	clientSet, err := client.GetClientSet()
	if err != nil {
		return nil, err
	}

	restConfig, err := client.GetRestConfig()
	if err != nil {
		return nil, err
	}

	clusterClient, err := dynamic.NewForConfig(restConfig)
	if err != nil {
		return nil, err
	}

	deploymentHandler := k8s.NewDeployment(ctx, cfg)
	svcHandler := k8s.NewService(ctx, client)

	eventChannel := make(chan []*common.ContainerStateItem)
	errorChannel := make(chan error)

	watchContext := &grpc.ContainerWatchContext{
		Events: eventChannel,
		Error:  errorChannel,
	}

	// For some unknown reason the watcher used by watchPods does not get any deployment delete events
	// so a separate watcher is required
	go watchDeployments(ctx, namespace, clusterClient, deploymentHandler, svcHandler, watchContext, cfg)
	go watchPods(ctx, namespace, clientSet, deploymentHandler, svcHandler, watchContext, cfg)

	return watchContext, nil
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
