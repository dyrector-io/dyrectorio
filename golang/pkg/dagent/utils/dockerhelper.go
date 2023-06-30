// These functions are dagent specific, yet it's more closely related to dockerHelper itself.
// Latter implementation is not straightforward at this moment as it would introduce circular dependencies

package utils

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/events"
	"github.com/docker/docker/client"

	"github.com/dyrector-io/dyrectorio/golang/internal/grpc"
	dockerHelper "github.com/dyrector-io/dyrectorio/golang/internal/helper/docker"
	"github.com/dyrector-io/dyrectorio/golang/internal/label"
	"github.com/dyrector-io/dyrectorio/golang/internal/mapper"
	"github.com/dyrector-io/dyrectorio/golang/internal/util"
	"github.com/dyrector-io/dyrectorio/protobuf/go/common"
)

func getContainerIdentifierFromEvent(event *events.Message) *common.ContainerIdentifier {
	prefix, hasValue := event.Actor.Attributes[label.DyrectorioOrg+label.ContainerPrefix]
	if !hasValue {
		prefix = ""
	}

	name, hasValue := event.Actor.Attributes["name"]
	if !hasValue {
		return nil
	} else if len(prefix) > 0 {
		name = strings.TrimPrefix(name, prefix+"-")
	}

	containerID := common.ContainerIdentifier{
		Prefix: prefix,
		Name:   name,
	}

	return &containerID
}

func messageToStateItem(ctx context.Context, prefix string, event *events.Message) (*common.ContainerStateItem, error) {
	// Only check container events, ignored events include image, volume, network, daemons, etc.
	if event.Type != "container" {
		return nil, nil
	}

	containerID := getContainerIdentifierFromEvent(event)
	if containerID == nil {
		return nil, errors.New("event has no container name")
	}

	if prefix != "" && containerID.Prefix != prefix {
		return nil, nil
	}

	if event.Action == "destroy" {
		return &common.ContainerStateItem{
			Id:        containerID,
			Command:   "",
			CreatedAt: nil,
			State:     common.ContainerState_REMOVED,
			Reason:    "",
			Status:    "",
			Ports:     []*common.ContainerStateItemPort{},
			ImageName: "",
			ImageTag:  "",
		}, nil
	}

	containerState := mapper.MapDockerContainerEventToContainerState(event.Action)
	// Ingored events are mapped to unspecified, for example tty, exec, oom, etc.
	if containerState == common.ContainerState_CONTAINER_STATE_UNSPECIFIED {
		return nil, nil
	}

	container, err := dockerHelper.GetContainerByID(ctx, event.Actor.ID)
	if err != nil {
		return nil, err
	}

	newState := mapper.MapContainerState(container, prefix)
	newState.State = containerState
	return newState, nil
}

func WatchContainersByPrefix(ctx context.Context, prefix string) (*grpc.ContainerWatchContext, error) {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return nil, err
	}

	var containers []types.Container
	if prefix == "" {
		containers, err = dockerHelper.GetAllContainers(ctx)
	} else {
		containers, err = dockerHelper.GetAllContainersByLabel(ctx, label.GetPrefixLabelFilter(prefix))
	}
	if err != nil {
		return nil, err
	}

	eventChannel := make(chan []*common.ContainerStateItem)
	errorChannel := make(chan error)

	chanMessages, chanErrors := cli.Events(ctx, types.EventsOptions{})

	go func(ctx context.Context, prefix string, chanMessages <-chan events.Message, chanErrors <-chan error) {
		eventChannel <- mapper.MapContainerStateList(containers, prefix)

		for {
			select {
			case <-ctx.Done():
				return
			case eventError := <-chanErrors:
				errorChannel <- eventError
				return
			case eventMessage := <-chanMessages:
				var changed *common.ContainerStateItem
				changed, err = messageToStateItem(ctx, prefix, &eventMessage)
				if err != nil {
					errorChannel <- err
					return
				} else if changed != nil {
					eventChannel <- []*common.ContainerStateItem{
						changed,
					}
				}
				break
			}
		}
	}(ctx, prefix, chanMessages, chanErrors)

	return &grpc.ContainerWatchContext{
		Events: eventChannel,
		Error: errorChannel,
	}, nil
}

func GetContainerByPrefixAndName(ctx context.Context, cli client.APIClient, prefix, name string) (*types.Container, error) {
	if prefix == "" {
		return dockerHelper.GetContainerByName(ctx, cli, name)
	}

	containers, err := dockerHelper.GetAllContainersByLabel(ctx, label.GetPrefixLabelFilter(prefix))
	if err != nil {
		return nil, err
	}

	targetName := util.JoinV("-", "/"+prefix, name)
	for index := range containers {
		for _, name := range containers[index].Names {
			if name == targetName {
				return &containers[index], nil
			}
		}
	}

	return nil, fmt.Errorf("container not found by prefix(%s), name(%s)", prefix, name)
}

func DeleteContainerByPrefixAndName(ctx context.Context, prefix, name string) error {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return err
	}

	container, err := GetContainerByPrefixAndName(ctx, cli, prefix, name)
	if err != nil {
		return fmt.Errorf("could not get container (%s, %s) to delete: %s", prefix, name, err.Error())
	}

	if container == nil {
		return nil
	}

	return dockerHelper.DeleteContainer(ctx, container)
}
