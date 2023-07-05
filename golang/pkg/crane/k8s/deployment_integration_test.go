//go:build integration

package k8s_test

import (
	"context"
	"testing"

	"github.com/ilyakaznacheev/cleanenv"

	"github.com/stretchr/testify/assert"

	"github.com/dyrector-io/dyrectorio/golang/pkg/crane/config"
	"github.com/dyrector-io/dyrectorio/golang/pkg/crane/k8s"
)

func TestGetPods(t *testing.T) {
	ctx := context.Background()

	cfg := config.Configuration{}
	_ = cleanenv.ReadEnv(&cfg)

	deploymentHandler := k8s.NewDeployment(ctx, &cfg)

	deployments, err := deploymentHandler.GetDeployments(ctx, "default", &cfg)
	assert.NoError(t, err)
	assert.Equal(t, 2, len(deployments.Items))

	pods, err := deploymentHandler.GetPods("default", "deployment-1")
	assert.NoError(t, err)
	assert.Equal(t, 1, len(pods))
}

func TestGetPod(t *testing.T) {
	ctx := context.Background()

	cfg := config.Configuration{}
	_ = cleanenv.ReadEnv(&cfg)

	deploymentHandler := k8s.NewDeployment(ctx, &cfg)

	deployments, err := deploymentHandler.GetDeployments(ctx, "default", &cfg)
	assert.NoError(t, err)
	assert.Equal(t, 2, len(deployments.Items))

	pods, err := deploymentHandler.GetPods("default", "deployment-1")
	assert.NoError(t, err)
	assert.Equal(t, 1, len(pods))

	pod, err := deploymentHandler.GetPod("default", pods[0].Name)
	assert.NoError(t, err)
	assert.NotNil(t, pod)
}
