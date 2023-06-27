// These functions are dagent specific, yet it's more closely related to dockerHelper itself.
// Latter implementation is not straightforward at this moment as it would introduce circular dependencies

package utils

import (
	"context"
	"encoding/json"
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

func updateContainerList(ctx context.Context, prefix string, states []*common.ContainerStateItem, event events.Message) ([]*common.ContainerStateItem, *common.ContainerStateItem, error) {
	if event.Type != "container" {
		return states, nil, nil
	}

	dataeerer, _ := json.Marshal(event)
	fmt.Println(string(dataeerer))

	var eventPrefix string = ""
	if attributesPrefix, hasValue := event.Actor.Attributes[label.DyrectorioOrg+label.ContainerPrefix]; hasValue {
		eventPrefix = attributesPrefix
	}

	var eventName string = ""
	var eventFullName string = ""
	if attributesName, hasValue := event.Actor.Attributes["name"]; hasValue {
		eventFullName = attributesName
		if eventPrefix != "" && strings.HasPrefix(attributesName, eventPrefix) {
			eventName = attributesName[len(eventPrefix)+1:]
		} else {
			eventName = attributesName
		}
	} else {
		return nil, nil, errors.New("event has no container name")
	}

	if prefix != "" && eventPrefix != prefix {
		return states, nil, nil
	}

	eventContainerId := common.ContainerIdentifier{
		Prefix: eventPrefix,
		Name:   eventName,
	}

	var stateItem *common.ContainerStateItem = nil
	var stateIndex int = -1
	for index, item := range states {
		if (item.Id.Prefix != "" && item.Id.Name != eventContainerId.Name && item.Id.Prefix != eventContainerId.Prefix) || (item.Id.Prefix == "" && item.Id.Name != eventFullName) {
			continue
		}

		stateItem = item
		stateIndex = index
		break
	}

	if event.Action == "destroy" {
		if stateIndex == -1 {
			return states, nil, nil
		}

		destroy := &common.ContainerStateItem{
			Id: &common.ContainerIdentifier{
				Prefix: eventPrefix,
				Name:   eventName,
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
		return append(states[:stateIndex], states[stateIndex+1:]...), destroy, nil
	}

	if stateItem == nil {
		newContainer, err := dockerHelper.GetContainerByID(ctx, event.Actor.ID)
		if err != nil {
			return nil, nil, err
		}
		newState := mapper.MapContainerState(*newContainer, prefix)
		newState.State = mapper.MapDockerContainerEventToContainerState(event.Action)
		states := append(states, newState)
		return states, newState, nil
	} else {
		container, err := dockerHelper.GetContainerByID(ctx, event.Actor.ID)
		if err != nil {
			return nil, nil, err
		}
		fmt.Println(container.State)
		stateItem := mapper.MapContainerState(*container, prefix)
		stateItem.State = mapper.MapDockerContainerEventToContainerState(event.Action)
		states[stateIndex] = stateItem
		return states, stateItem, nil
	}
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

	go func(ctx context.Context, prefix string) {
		messages, errors := cli.Events(ctx, types.EventsOptions{})

		states := mapper.MapContainerStates(containers, prefix)
		eventChannel <- states

		for {
			select {
			case <-ctx.Done():
				return
			case eventError := <-errors:
				fmt.Printf("ERR %s", eventError.Error())
				break
			case eventMessage := <-messages:
				var changed *common.ContainerStateItem
				states, changed, err = updateContainerList(ctx, prefix, states, eventMessage)
				if err != nil {
					fmt.Printf("ERR2 %s", err.Error())
				} else if changed != nil {
					eventChannel <- []*common.ContainerStateItem{
						changed,
					}
				}
				break
			}
		}
	}(ctx, prefix)

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
