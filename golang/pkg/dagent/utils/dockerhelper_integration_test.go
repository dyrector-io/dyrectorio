//go:build integration
// +build integration

package utils

import (
	"context"
	"testing"

	"github.com/docker/docker/api/types/events"
	"github.com/stretchr/testify/assert"

	dockerHelper "github.com/dyrector-io/dyrectorio/golang/internal/helper/docker"
	containerbuilder "github.com/dyrector-io/dyrectorio/golang/pkg/builder/container"
	"github.com/dyrector-io/dyrectorio/protobuf/go/common"
)

func TestEventToMessageContainer(t *testing.T) {
	builder, err := containerbuilder.NewDockerBuilder(context.Background()).
		WithImage(nginxImage).
		WithName("test-event-to-message").
		WithRestartPolicy(containerbuilder.NoRestartPolicy).
		Create()

	assert.NoError(t, err)

	containerID := *builder.GetContainerID()

	event := events.Message{
		Type:   "container",
		Action: "create",
		Actor: events.Actor{
			ID: containerID,
			Attributes: map[string]string{
				"name": "prefix-name",
			},
		},
	}

	message, err := EventToMessage(context.Background(), "", &event)

	dockerHelper.DeleteContainerByID(context.Background(), nil, containerID)

	assert.Nil(t, err)
	assert.NotNil(t, message)
	assert.Equal(t, common.ContainerState_WAITING, message.State)
}
