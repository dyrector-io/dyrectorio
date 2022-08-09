//go:build unit
// +build unit

package v1_test

import (
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/dyrector-io/dyrectorio/agent/internal/config"
	v1 "github.com/dyrector-io/dyrectorio/agent/pkg/api/v1"
)

func TestSetDeploymentDefaults(t *testing.T) {
	req := v1.DeployImageRequest{}

	fakeRegistry := "index.obviouslyfake.com"
	defaultTag := "coleslaw"

	v1.SetDeploymentDefaults(&req, &config.CommonConfiguration{
		Registry:   fakeRegistry,
		DefaultTag: defaultTag,
	})

	assert.Equal(t, fakeRegistry, *req.Registry)
	assert.Equal(t, defaultTag, req.Tag)
	assert.Equal(t, "unless-stopped", string(req.ContainerConfig.RestartPolicy))
}
