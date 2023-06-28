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
	"github.com/rs/zerolog/log"

	"github.com/dyrector-io/dyrectorio/golang/internal/grpc"
	dockerHelper "github.com/dyrector-io/dyrectorio/golang/internal/helper/docker"
	"github.com/dyrector-io/dyrectorio/golang/internal/label"
	"github.com/dyrector-io/dyrectorio/golang/internal/mapper"
	"github.com/dyrector-io/dyrectorio/golang/internal/util"
	"github.com/dyrector-io/dyrectorio/protobuf/go/common"
)

func getContainerIdentifierFromEvent(event events.Message) *common.ContainerIdentifier {
	prefix, hasValue := event.Actor.Attributes[label.DyrectorioOrg+label.ContainerPrefix]
	if !hasValue {
		prefix = ""
	}

	name, hasValue := event.Actor.Attributes["name"]
	if !hasValue {
		return nil
	} else {
		if prefix != "" && strings.HasPrefix(name, prefix) {
			name = name[len(prefix)+1:]
		}
	}

	containerId := common.ContainerIdentifier{
		Prefix: prefix,
		Name:   name,
	}

	return &containerId
}

func eventToMessage(ctx context.Context, prefix string, event events.Message) (*common.ContainerStateItem, error) {
	if event.Type != "container" {
		return nil, nil
	}

	containerId := getContainerIdentifierFromEvent(event)
	if containerId == nil {
		return nil, errors.New("event has no container name")
	}

	if prefix != "" && containerId.Prefix != prefix {
		return nil, nil
	}

	if event.Action == "destroy" {
		destroy := &common.ContainerStateItem{
			Id:        containerId,
			Command:   "",
			CreatedAt: nil,
			State:     common.ContainerState_REMOVED,
			Reason:    "",
			Status:    "",
			Ports:     []*common.ContainerStateItemPort{},
			ImageName: "",
			ImageTag:  "",
		}
		return destroy, nil
	}

	containerState := mapper.MapDockerContainerEventToContainerState(event.Action)
	if containerState == common.ContainerState_CONTAINER_STATE_UNSPECIFIED {
		return nil, nil
	}

	container, err := dockerHelper.GetContainerByID(ctx, event.Actor.ID)
	if err != nil {
		return nil, err
	}

	newState := mapper.MapContainerState(*container, prefix)
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

	messages, errors := cli.Events(ctx, types.EventsOptions{})

	go func(ctx context.Context, prefix string, messages <-chan events.Message, errors <-chan error) {
		eventChannel <- mapper.MapContainerStates(containers, prefix)

		for {
			select {
			case <-ctx.Done():
				return
			case eventError := <-errors:
				log.Error().Err(eventError).Msg("docker events error")
				break
			case eventMessage := <-messages:
				var changed *common.ContainerStateItem
				changed, err = eventToMessage(ctx, prefix, eventMessage)
				if err != nil {
					log.Error().Err(err).Msg("docker events message error")
				} else if changed != nil {
					eventChannel <- []*common.ContainerStateItem{
						changed,
					}
				}
				break
			}
		}
	}(ctx, prefix, messages, errors)

	return &grpc.ContainerWatchContext{
		Events: eventChannel,
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
