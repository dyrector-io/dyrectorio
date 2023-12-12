package crux

import (
	"context"
	"errors"
	"sync"
	"time"

	"github.com/AlekSi/pointer"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/dynamic/dynamicinformer"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/cache"

	"github.com/dyrector-io/dyrectorio/golang/internal/grpc"
	"github.com/dyrector-io/dyrectorio/golang/internal/mapper"
	"github.com/dyrector-io/dyrectorio/golang/internal/util"
	"github.com/dyrector-io/dyrectorio/golang/pkg/crane/config"
	"github.com/dyrector-io/dyrectorio/golang/pkg/crane/k8s"
	"github.com/dyrector-io/dyrectorio/protobuf/go/common"

	corev1 "k8s.io/api/core/v1"
	kerrors "k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	watch "k8s.io/apimachinery/pkg/watch"
)

const timeoutOneHour = 60 * 60

func getInitialStateList(
	ctx context.Context,
	deploymentHandler *k8s.Deployment,
	svcHandler *k8s.Service,
	namespace string,
	cfg *config.Configuration,
) ([]*common.ContainerStateItem, error) {
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
		pods, err := deploymentHandler.GetPods(deployment.Namespace, deployment.Name)
		if err != nil {
			return nil, err
		}
		fullName := k8s.DeploymentToFullName(&deployment)
		podsByDeployment[fullName] = pods
	}

	return mapper.MapKubeDeploymentListToCruxStateItems(deployments, podsByDeployment, svcMap), nil
}

func deploymentToStateItem(
	ctx context.Context,
	deploymentHandler *k8s.Deployment,
	svcHandler *k8s.Service,
	namespace,
	deploymentName string,
	cfg *config.Configuration,
) (*common.ContainerStateItem, *corev1.Pod, error) {
	deployment, err := deploymentHandler.GetDeploymentByName(ctx, namespace, deploymentName, cfg)
	if err != nil {
		if kerrors.IsNotFound(err) {
			return &common.ContainerStateItem{
				Id: &common.ContainerIdentifier{
					Prefix: namespace,
					Name:   deploymentName,
				},
				Command:   "",
				CreatedAt: nil,
				State:     common.ContainerState_REMOVED,
				Reason:    "",
				Status:    "",
				Ports:     []*common.ContainerStateItemPort{},
				ImageName: "",
				ImageTag:  "",
			}, nil, nil
		}
		return nil, nil, err
	}

	pods, err := deploymentHandler.GetPods(namespace, deploymentName)
	if err != nil {
		return nil, nil, err
	}

	svc, err := svcHandler.GetServices(namespace)
	if err != nil {
		return nil, nil, err
	}

	svcMap := mapper.CreateServiceMap(svc)

	state, pod := mapper.MapDeploymentLatestPodToStateItem(deployment, pods, svcMap[deployment.Namespace])
	return state, pod, nil
}

func sendDeploymentInformerEvent(
	ctx context.Context,
	obj interface{},
	filterNamespace string,
	deploymentHandler *k8s.Deployment,
	svcHandler *k8s.Service,
	watchContext *grpc.ContainerWatchContext,
	cfg *config.Configuration,
) {
	data, ok := obj.(*unstructured.Unstructured)
	if !ok {
		return
	}

	metaData := data.Object["metadata"].(map[string]interface{})
	namespace := metaData["namespace"].(string)
	if filterNamespace != "" && namespace != filterNamespace {
		return
	}

	name := metaData["name"].(string)

	stateItem, _, err := deploymentToStateItem(ctx, deploymentHandler, svcHandler, namespace, name, cfg)
	if err != nil {
		watchContext.Error <- err
		return
	}
	if stateItem == nil || stateItem.State == common.ContainerState_CONTAINER_STATE_UNSPECIFIED {
		return
	}

	watchContext.Events <- []*common.ContainerStateItem{
		stateItem,
	}
}

func watchDeployments(
	ctx context.Context,
	namespace string,
	clusterClient *dynamic.DynamicClient,
	deploymentHandler *k8s.Deployment,
	svcHandler *k8s.Service,
	watchContext *grpc.ContainerWatchContext,
	cfg *config.Configuration,
) {
	resource := schema.GroupVersionResource{Group: "apps", Version: "v1", Resource: "deployments"}
	factory := dynamicinformer.NewFilteredDynamicSharedInformerFactory(clusterClient, time.Minute, corev1.NamespaceAll, nil)
	informer := factory.ForResource(resource).Informer()

	mux := &sync.RWMutex{}
	_, err := informer.AddEventHandler(cache.ResourceEventHandlerFuncs{
		DeleteFunc: func(obj interface{}) {
			mux.RLock()
			defer mux.RUnlock()

			sendDeploymentInformerEvent(ctx, obj, namespace, deploymentHandler, svcHandler, watchContext, cfg)
		},
	})
	if err != nil {
		watchContext.Error <- err
		return
	}

	informer.Run(ctx.Done())
}

func mapEventReasonToState(eventReason string) common.ContainerState {
	switch eventReason {
	case "Scheduled":
	case "Pulling":
	case "Pulled":
	case "Created":
		return common.ContainerState_WAITING
	case "Started":
		return common.ContainerState_RUNNING
	case "Killing":
		return common.ContainerState_EXITED
	}
	return common.ContainerState_CONTAINER_STATE_UNSPECIFIED
}

func podToStateItem(
	ctx context.Context,
	deploymentHandler *k8s.Deployment,
	svcHandler *k8s.Service,
	namespace,
	podName,
	eventReason string,
	cfg *config.Configuration,
) (*common.ContainerStateItem, error) {
	deployment, err := deploymentHandler.GetPodDeployment(namespace, podName)
	if err != nil {
		if errors.Is(err, k8s.ErrPodHasNoOwner) {
			return nil, nil
		}
		return nil, err
	}

	stateItem, latestPod, err := deploymentToStateItem(ctx, deploymentHandler, svcHandler, namespace, deployment.Name, cfg)
	if err != nil {
		return nil, err
	}
	if stateItem == nil {
		return nil, nil
	}

	if latestPod != nil {
		eventState := mapEventReasonToState(eventReason)
		if latestPod.Name == podName && eventState != common.ContainerState_CONTAINER_STATE_UNSPECIFIED {
			stateItem.State = eventState
			stateItem.Reason = eventReason
		}
	}

	return stateItem, nil
}

func pushEvent(
	ctx context.Context,
	event watch.Event,
	watchContext *grpc.ContainerWatchContext,
	deploymentHandler *k8s.Deployment,
	svcHandler *k8s.Service,
	cfg *config.Configuration,
) {
	eventObj, isEvent := event.Object.(*corev1.Event)
	if !isEvent || eventObj.InvolvedObject.Kind != "Pod" {
		return
	}

	stateItem, err := podToStateItem(ctx,
		deploymentHandler,
		svcHandler,
		eventObj.InvolvedObject.Namespace,
		eventObj.InvolvedObject.Name,
		eventObj.Reason,
		cfg)
	if err != nil {
		if kerrors.IsNotFound(err) {
			return
		}
		watchContext.Error <- err
		return
	}
	if stateItem == nil || stateItem.State == common.ContainerState_CONTAINER_STATE_UNSPECIFIED {
		return
	}
	watchContext.Events <- []*common.ContainerStateItem{
		stateItem,
	}
}

func watchPods(
	ctx context.Context,
	namespace string,
	clientSet *kubernetes.Clientset,
	deploymentHandler *k8s.Deployment,
	svcHandler *k8s.Service,
	watchContext *grpc.ContainerWatchContext,
	cfg *config.Configuration,
) {
	initialState, err := getInitialStateList(ctx, deploymentHandler, svcHandler, namespace, cfg)
	if err != nil {
		watchContext.Error <- err
		return
	}
	watchContext.Events <- initialState

	list, err := clientSet.CoreV1().Events(util.Fallback(namespace, corev1.NamespaceAll)).List(ctx, metav1.ListOptions{})
	if err != nil {
		watchContext.Error <- err
		return
	}

	opts := metav1.ListOptions{
		Watch:           true,
		TimeoutSeconds:  pointer.ToInt64(timeoutOneHour),
		ResourceVersion: list.ResourceVersion,
	}

	watcher, err := clientSet.CoreV1().Events(util.Fallback(namespace, corev1.NamespaceAll)).Watch(ctx, opts)
	if err != nil {
		watchContext.Error <- err
		return
	}

	for {
		select {
		case <-ctx.Done():
			return
		case event, ok := <-watcher.ResultChan():
			if !ok {
				watcher, err = clientSet.CoreV1().Events(corev1.NamespaceAll).Watch(ctx, opts)
				if err != nil {
					watchContext.Error <- err
					return
				}
				continue
			}

			// Event type is empty when something goes wrong, in this case the watcher will be restarted
				if event.Type != "" {
					pushEvent(ctx, event, watchContext, deploymentHandler, svcHandler, cfg)
				}
			break
		}
	}
}
