//go:build integration
// +build integration

package update_test

import (
	"context"
	"testing"

	"github.com/dyrector-io/dyrectorio/golang/pkg/dagent/update"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/client"
	"github.com/stretchr/testify/assert"
)

// TODO (@nandor-magyar): this is to be fixed, integration test & agent running as a container or not are two separate concerns
// here we would need a running container env, splitting update into getting own image and update execution could be an approach
// note: disabling containerization is not a solution, the test is in vain that way
// func TestUpdateContainarizedOnly(t *testing.T) {
// 	cli, err := client.NewClientWithOpts(client.WithAPIVersionNegotiation())
// 	if err != nil {
// 		t.Error(err)
// 	}

// 	err = update.ExecuteSelfUpdate(context.TODO(), cli, &agent.AgentUpdateRequest{
// 		Tag:            "anything",
// 		TimeoutSeconds: 30,
// 		Token:          "token",
// 	}, grpc.UpdateOptions{
// 		UpdateAlways:  false,
// 		UseContainers: true,
// 	})
// 	assert.ErrorIs(t, err, &utils.UnknownContainerError{}, "Without containerized context update always fails")
// }

func TestRewriteInvalid(t *testing.T) {
	cli, err := client.NewClientWithOpts(client.WithAPIVersionNegotiation())
	if err != nil {
		t.Error(err)
	}

	_, err = cli.ImagePull(context.TODO(), "nginx:totally-invalid-image", types.ImagePullOptions{})

	assert.ErrorIs(t, update.RewriteUpdateErrors(err), update.ErrUpdateImageNotFound)
}
