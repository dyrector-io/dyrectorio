package k8s

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/rs/zerolog/log"
	"golang.org/x/net/context"
	v1 "k8s.io/api/apps/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/fields"

	"github.com/dyrector-io/dyrectorio/golang/pkg/crane/config"
)

// utility method ensuring deployment is running
func WaitForRunningDeployment(ctx context.Context, namespace, name string, expectedReplicaCount int32,
	timeout time.Duration, cfg *config.Configuration,
) error {
	client := getDeploymentsClient(namespace, cfg)
	nameSelector := fields.OneTermEqualSelector("metadata.name", name)
	options := metav1.ListOptions{FieldSelector: nameSelector.String(), Watch: true, TypeMeta: metav1.TypeMeta{}}

	waitTimeOut := time.After(timeout)
	ctx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()

	w, err := client.Watch(ctx, options)
	if err != nil {
		return err
	}
	defer w.Stop()

	for {
		select {
		case event := <-w.ResultChan():
			m, _ := json.Marshal(event.Object)
			deployment := v1.Deployment{}

			err = json.Unmarshal(m, &deployment)
			if err != nil {
				log.Error().Err(err).Stack().Msg("Unmarshal error of deployment")
			}
			if deployment.Status.AvailableReplicas == expectedReplicaCount {
				return nil
			}

		case <-waitTimeOut:
			return fmt.Errorf("deployment active replicacount %v was not met in %v", expectedReplicaCount, timeout)
		}
	}
}
