//go:build unit
// +build unit

package utils

import (
	"context"
	"testing"

	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/events"
	"github.com/stretchr/testify/assert"

	"github.com/dyrector-io/dyrectorio/golang/internal/label"

	dockerHelper "github.com/dyrector-io/dyrectorio/golang/internal/helper/docker"
	containerbuilder "github.com/dyrector-io/dyrectorio/golang/pkg/builder/container"
	"github.com/dyrector-io/dyrectorio/protobuf/go/common"
)

const nginxImage = "ghcr.io/dyrector-io/mirror/nginx:mainline-alpine"

func TestGetContainerIdentifierFromEventEmptyAttributes(t *testing.T) {
	event := events.Message{
		Actor: events.Actor{
			Attributes: map[string]string{},
		},
	}

	id := GetContainerIdentifierFromEvent(&event)
	assert.Nil(t, id)
}

func TestGetContainerIdentifierFromEventPrefix(t *testing.T) {
	event := events.Message{
		Actor: events.Actor{
			Attributes: map[string]string{
				label.DyrectorioOrg + label.ContainerPrefix: "prefix",
			},
		},
	}

	id := GetContainerIdentifierFromEvent(&event)
	assert.Nil(t, id)
}

func TestGetContainerIdentifierFromEventName(t *testing.T) {
	event := events.Message{
		Actor: events.Actor{
			Attributes: map[string]string{
				"name": "prefix-name",
			},
		},
	}

	id := GetContainerIdentifierFromEvent(&event)
	assert.NotNil(t, id)
	assert.Equal(t, "prefix-name", id.Name)
	assert.Equal(t, "", id.Prefix)
}

func TestGetContainerIdentifierFromEventBoth(t *testing.T) {
	event := events.Message{
		Actor: events.Actor{
			Attributes: map[string]string{
				label.DyrectorioOrg + label.ContainerPrefix: "prefix",
				"name": "prefix-name",
			},
		},
	}

	id := GetContainerIdentifierFromEvent(&event)
	assert.NotNil(t, id)
	assert.Equal(t, "name", id.Name)
	assert.Equal(t, "prefix", id.Prefix)
}

func TestEventToMessageNonContainer(t *testing.T) {
	event := events.Message{
		Type: "non-container",
	}

	message, err := EventToMessage(context.Background(), "", &event)
	assert.Nil(t, message)
	assert.Nil(t, err)
}

func TestEventToMessageNoName(t *testing.T) {
	event := events.Message{
		Type: "container",
		Actor: events.Actor{
			Attributes: map[string]string{},
		},
	}

	message, err := EventToMessage(context.Background(), "", &event)
	assert.Nil(t, message)
	assert.EqualError(t, err, "event has no container name")
}

func TestEventToMessageActionDestroy(t *testing.T) {
	event := events.Message{
		Type:   "container",
		Action: "destroy",
		Actor: events.Actor{
			Attributes: map[string]string{
				"name": "prefix-name",
			},
		},
	}

	message, err := EventToMessage(context.Background(), "", &event)
	assert.NoError(t, err)

	expected := &common.ContainerStateItem{
		Id: &common.ContainerIdentifier{
			Name:   "prefix-name",
			Prefix: "",
		},
		Command:   "",
		CreatedAt: nil,
		State:     common.ContainerState_REMOVED,
		Reason:    "",
		Status:    "",
		Ports:     []*common.ContainerStateItemPort{},
		ImageName: "",
		ImageTag:  "",
	}

	assert.Equal(t, expected, message)
}

func TestEventToMessageUnknownAction(t *testing.T) {
	event := events.Message{
		Type:   "container",
		Action: "unknown-action",
		Actor: events.Actor{
			Attributes: map[string]string{
				"name": "prefix-name",
			},
		},
	}

	message, err := EventToMessage(context.Background(), "", &event)
	assert.Nil(t, message)
	assert.Nil(t, err)
}

func TestEventToMessageNoContainer(t *testing.T) {
	event := events.Message{
		Type:   "container",
		Action: "unknown-action",
		Actor: events.Actor{
			ID: "container-id-does-not-exist",
			Attributes: map[string]string{
				"name": "prefix-name",
			},
		},
	}

	message, err := EventToMessage(context.Background(), "", &event)
	assert.Nil(t, message)
	assert.Nil(t, err)
}

func TestEventToMessageContainer(t *testing.T) {
	builder, err := containerbuilder.NewDockerBuilder(context.Background()).
		WithImage(nginxImage).
		WithName("test-event-to-message").
		WithRestartPolicy(container.RestartPolicyDisabled).
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
