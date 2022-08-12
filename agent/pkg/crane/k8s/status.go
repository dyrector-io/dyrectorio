package k8s

import (
	"context"
	"fmt"

	appsv1 "k8s.io/api/apps/v1"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"

	"github.com/dyrector-io/dyrectorio/agent/internal/util"
	v1 "github.com/dyrector-io/dyrectorio/agent/pkg/api/v1"
	"github.com/dyrector-io/dyrectorio/agent/pkg/crane/config"
)

// DeploymentStatus get collective status of relevant k8s objects
func DeploymentStatus(ctx context.Context, namespace, name string, cfg *config.Configuration) (*v1.ContainerStatusResponse, error) {
	// what is up
	// ingress - svc - deployment - pod

	statusResp := &v1.ContainerStatusResponse{
		Repository: "",
		Tag:        "",
		State:      "",
		Status:     "status",
	}

	client := getDeploymentsClient(namespace, cfg)

	deployment, err := client.Get(ctx, name, metav1.GetOptions{})

	if err != nil {
		return nil, err
	}

	if containers := deployment.Spec.Template.Spec.Containers; containers != nil {
		for i := 0; i < len(containers); i++ {
			if containers[i].Name != name {
				// this move was suggested by golangci
				continue
			}
			image, errr := util.ImageURIFromString(containers[i].Image)
			if errr != nil {
				return nil, errr
			}
			statusResp.Repository = image.StringNoTag()
			statusResp.Tag = image.Tag
		}
	}

	statusResp.State = getReplicasStr(deployment)

	podClient, err := getPodClient(namespace, cfg)
	if err != nil {
		return nil, err
	}

	pods, err := podClient.List(ctx, metav1.ListOptions{LabelSelector: "app=" + name})

	if err != nil {
		return nil, err
	}
	// extracting most recent status
	statusResp.Status = getRecentPodPhaseWithReason(pods.Items)

	return statusResp, nil
}

// getReplicasStr replica count with formatted plural notes
func getReplicasStr(deployment *appsv1.Deployment) string {
	if deployment.Status.Replicas > 1 {
		return fmt.Sprintf("%v replicas", deployment.Status.Replicas)
	} else {
		return ""
	}
}

// getMostRecentPod the most recently started pod is selected
// no built-in filters for this unfortunately
func getMostRecentPod(pods []corev1.Pod) corev1.Pod {
	if len(pods) == 1 {
		return pods[0]
	}
	minIndex := 0
	for i := 1; i < len(pods); i++ {
		if pods[i].Status.StartTime != nil &&
			pods[i].Status.StartTime.Time.After(pods[minIndex].Status.StartTime.Time) {
			minIndex = i
		}
	}

	return pods[minIndex]
}

// getRecentPodPhaseWithReason reason extension in cases where it is needed
func getRecentPodPhaseWithReason(pods []corev1.Pod) string {
	pod := getMostRecentPod(pods)

	res := []string{}
	for i := 0; i < len(pod.Status.ContainerStatuses); i++ {
		statusStr := ""
		if pod.Status.ContainerStatuses[i].State.Running != nil {
			statusStr = "Running"
		} else if pod.Status.ContainerStatuses[i].State.Waiting != nil {
			statusStr = fmt.Sprintf("%v-%v",
				"Waiting",
				pod.Status.ContainerStatuses[i].State.Waiting.Reason)
		} else if pod.Status.ContainerStatuses[i].State.Terminated != nil {
			statusStr = fmt.Sprintf("%v-%v",
				"Terminated",
				pod.Status.ContainerStatuses[i].State.Terminated.Reason)
		}
		res = append(res, statusStr)
	}
	return util.JoinV(",", res...)
}
