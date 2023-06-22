//go:build integration
// +build integration

package update_test

import (
	"context"
	"testing"

	"github.com/dyrector-io/dyrectorio/golang/pkg/dagent/update"
	"github.com/dyrector-io/dyrectorio/golang/pkg/dagent/utils"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/client"
	"github.com/stretchr/testify/assert"
)

func TestUpdateContainarizedOnly(t *testing.T) {
	cli, err := client.NewClientWithOpts(client.WithAPIVersionNegotiation())
	if err != nil {
		t.Error(err)
	}

	err = update.ExecuteSelfUpdate(context.TODO(), cli, "anything", 30)
	assert.ErrorIs(t, err, &utils.UnknownContainerError{}, "Without containerized context update always fails")
}

func TestRewriteInvalid(t *testing.T) {
	cli, err := client.NewClientWithOpts(client.WithAPIVersionNegotiation())
	if err != nil {
		t.Error(err)
	}

	_, err = cli.ImagePull(context.TODO(), "nginx:totally-invalid-image", types.ImagePullOptions{})

	assert.ErrorIs(t, update.RewriteUpdateErrors(err), update.ErrUpdateImageNotFound)
}
