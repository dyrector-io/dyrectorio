//go:build integration

package k8s

import (
	"context"
	"testing"
	"time"

	"github.com/AlekSi/pointer"
	"github.com/ilyakaznacheev/cleanenv"

	"github.com/stretchr/testify/assert"

	v1 "github.com/dyrector-io/dyrectorio/golang/api/v1"
	"github.com/dyrector-io/dyrectorio/golang/internal/dogger"
	"github.com/dyrector-io/dyrectorio/golang/internal/grpc"
	"github.com/dyrector-io/dyrectorio/golang/pkg/crane/config"
)

func TestFetchPods(t *testing.T) {
	ctx := context.Background()

	cfg := config.Configuration{}
	err := cleanenv.ReadEnv(&cfg)

	ctx = grpc.WithGRPCConfig(ctx, &cfg)
	assert.Nil(t, err, "error for test deployment is unexpected")
	deploymentHandler := NewDeployment(ctx, &cfg)

	err = Deploy(ctx,
		dogger.NewDeploymentLogger(
			ctx,
			pointer.ToString("test"), nil,
			&cfg.CommonConfiguration),
		&v1.DeployImageRequest{
			RequestID: "test",
			ImageName: "nginx:latest",
			InstanceConfig: v1.InstanceConfig{
				ContainerPreName: "pods",
			}, ContainerConfig: v1.ContainerConfig{
				Container: "deployment-1",
			},
		},
		&v1.VersionData{})

	WaitForRunningDeployment(ctx, "pods", "deployment-1", 1, 30*time.Second, &cfg)

	assert.Nil(t, err, "error for test deployment is unexpected")
	t.Run("Test get pods", func(t *testing.T) {
		deployments, err := deploymentHandler.GetDeployments(ctx, "pods", &cfg)
		assert.NoError(t, err)
		assert.Len(t, deployments.Items, 1)

		pods, err := deploymentHandler.GetPods("pods", "deployment-1")
		assert.NoError(t, err)
		assert.Len(t, pods, 1)
	})

	t.Run("Test get single pod", func(t *testing.T) {
		deployments, err := deploymentHandler.GetDeployments(ctx, "pods", &cfg)
		assert.NoError(t, err)
		assert.Equal(t, 1, len(deployments.Items))

		pods, err := deploymentHandler.GetPods("pods", "deployment-1")
		assert.NoError(t, err)
		assert.Equal(t, 1, len(pods))

		pod, err := deploymentHandler.GetPod("pods", pods[0].Name)
		assert.NoError(t, err)
		assert.NotNil(t, pod)
	})

	err = deploymentHandler.deleteDeployment("pods", "deployment-1")
	assert.Nil(t, err, "error for deleting test deployment is unexpected")
}
