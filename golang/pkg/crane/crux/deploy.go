package crux

import (
	"context"
	"errors"
	"fmt"

	"github.com/dyrector-io/dyrectorio/golang/internal/grpc"
	"github.com/dyrector-io/dyrectorio/golang/internal/mapper"
	"github.com/dyrector-io/dyrectorio/golang/internal/util"
	"github.com/dyrector-io/dyrectorio/golang/pkg/crane/config"
	"github.com/dyrector-io/dyrectorio/golang/pkg/crane/k8s"

	"github.com/AlekSi/pointer"

	kappsv1 "k8s.io/api/apps/v1"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"

	common "github.com/dyrector-io/dyrectorio/protobuf/go/common"
)

func getInitialStateList(ctx context.Context, deploymentHandler *k8s.Deployment, svcHandler *k8s.Service, namespace string, cfg *config.Configuration) ([]*common.ContainerStateItem, error) {
	deployments, err := deploymentHandler.GetDeployments(ctx, namespace, cfg)
	if err != nil {
		return nil, err
	}

	svc, err := svcHandler.GetServices(namespace)
	if err != nil {
		return nil, err
	}

	svcMap := mapper.CreateServiceMap(svc)

	podsByDeployment := make(map[string][]corev1.Pod)
	for deploymentIndex := range deployments.Items {
		deployment := deployments.Items[deploymentIndex]
		pods, err := deploymentHandler.GetPods(namespace, deployment.Name)
		if err != nil {
			return nil, err
		}
		podsByDeployment[deployment.Name] = pods
	}

	return mapper.MapKubeDeploymentListToCruxStateItems(deployments, podsByDeployment, svcMap), nil
}

func deploymentToStateItem(
	ctx context.Context,
	deploymentHandler *k8s.Deployment,
	svcHandler *k8s.Service,
	namespace,
	name string,
	cfg *config.Configuration,
) (*common.ContainerStateItem, error) {
	deployment, err := deploymentHandler.GetDeploymentByName(ctx, namespace, name, cfg)
	if err != nil {
		return nil, err
	}

	pods, err := deploymentHandler.GetPods(namespace, deployment.Name)
	if err != nil {
		return nil, err
	}

	svc, err := svcHandler.GetServices(namespace)
	if err != nil {
		return nil, err
	}

	svcMap := mapper.CreateServiceMap(svc)

	return mapper.MapKubeDeploymentToCruxStateItems(deployment, pods, svcMap[deployment.Namespace]), nil
}

func podToStateItem(
	ctx context.Context,
	deploymentHandler *k8s.Deployment,
	svcHandler *k8s.Service,
	namespace,
	podName string,
	cfg *config.Configuration,
) (*common.ContainerStateItem, error) {
	deployments, err := deploymentHandler.GetDeployments(ctx, namespace, cfg)
	if err != nil {
		return nil, err
	}

	var eventDeployment *kappsv1.Deployment = nil
	var eventPods *[]corev1.Pod = nil
loopDeployment:
	for deploymentIndex := range deployments.Items {
		deployment := deployments.Items[deploymentIndex]
		pods, err := deploymentHandler.GetPods(namespace, deployment.Name)
		if err != nil {
			return nil, err
		}

		for podIndex := range pods {
			pod := pods[podIndex]
			if pod.Name == podName {
				eventDeployment = &deployment
				eventPods = &pods
				break loopDeployment
			}
		}
	}

	if eventDeployment == nil {
		return nil, fmt.Errorf("pod not found in any of the deployments '%s'", podName)
	}

	svc, err := svcHandler.GetServices(namespace)
	if err != nil {
		return nil, err
	}

	svcMap := mapper.CreateServiceMap(svc)

	return mapper.MapKubeDeploymentToCruxStateItems(eventDeployment, *eventPods, svcMap[eventDeployment.Namespace]), nil
}

func WatchDeploymentsByPrefix(ctx context.Context, namespace string) (*grpc.ContainerWatchContext, error) {
	cfg := grpc.GetConfigFromContext(ctx).(*config.Configuration)
	client := k8s.NewClient(cfg)

	deploymentHandler := k8s.NewDeployment(ctx, cfg)
	svcHandler := k8s.NewService(ctx, client)

	eventChannel := make(chan []*common.ContainerStateItem)
	errorChannel := make(chan error)

	clientSet, err := client.GetClientSet()
	if err != nil {
		return nil, err
	}

	opts := metav1.ListOptions{
		Watch:             true,
		SendInitialEvents: pointer.ToBool(false),
		TimeoutSeconds:    pointer.ToInt64(60 * 60),
	}

	watcher, err := clientSet.CoreV1().Events(util.Fallback(namespace, corev1.NamespaceAll)).Watch(context.Background(), opts)
	if err != nil {
		return nil, err
	}

	defer func() {
		watcher.Stop()
	}()

	go func() {
		initialState, err := getInitialStateList(ctx, deploymentHandler, svcHandler, namespace, cfg)
		if err != nil {
			errorChannel <- err
			return
		}
		eventChannel <- initialState

		for {
			select {
			case <-ctx.Done():
				return
			case event, ok := <-watcher.ResultChan():
				if !ok {
					watcher, err = clientSet.CoreV1().Events(corev1.NamespaceAll).Watch(context.Background(), opts)
					if err != nil {
						errorChannel <- err
						return
					}
				}

				if event.Type != "" {
					event, isEvent := event.Object.(*corev1.Event)
					if isEvent {
						switch event.InvolvedObject.Kind {
						case "Deployment":
							stateItem, err := deploymentToStateItem(ctx, deploymentHandler, svcHandler, namespace, event.InvolvedObject.Name, cfg)
							if err != nil {
								errorChannel <- err
								return
							}

							eventChannel <- []*common.ContainerStateItem{
								stateItem,
							}
							break
						case "Pod":
							stateItem, err := podToStateItem(ctx, deploymentHandler, svcHandler, namespace, event.InvolvedObject.Name, cfg)
							if err != nil {
								errorChannel <- err
								return
							}

							eventChannel <- []*common.ContainerStateItem{
								stateItem,
							}
							break
						}
					}
				}
				break
			}
		}
	}()

	return &grpc.ContainerWatchContext{
		Events: eventChannel,
		Error:  errorChannel,
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
