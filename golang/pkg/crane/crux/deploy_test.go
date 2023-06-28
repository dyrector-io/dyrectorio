//go:build integration

package crux_test

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/dyrector-io/dyrectorio/golang/internal/grpc"
	"github.com/dyrector-io/dyrectorio/golang/pkg/crane/config"
	"github.com/dyrector-io/dyrectorio/golang/pkg/crane/crux"
)

func TestGetAllDeployments(t *testing.T) {
	ctx := grpc.WithGRPCConfig(context.Background(), &config.Configuration{
		CraneInCluster: false,
	})
	res, err := crux.WatchDeploymentsByPrefix(ctx, "")
	assert.NoError(t, err)
	assert.NotNil(t, res)
}
