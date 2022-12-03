package docker

import (
	"context"
	"fmt"
	"time"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/filters"
	"github.com/docker/docker/client"
	"github.com/rs/zerolog/log"

	"github.com/dyrector-io/dyrectorio/golang/internal/dogger"
)

const DockerClientTimeoutSeconds = 30

func DeleteContainerByName(ctx context.Context, dog *dogger.DeploymentLogger, nameFilter string, errorReport bool) error {
	matchedContainer, err := GetContainerByName(ctx, nil, nameFilter, errorReport)
	if err != nil {
		return fmt.Errorf("builder could not get container (%s) to remove: %s", nameFilter, err.Error())
	}
	if matchedContainer == nil {
		return nil
	}

	return deleteContainerByState(ctx, dog, nameFilter, matchedContainer.State, errorReport)
}

func DeleteContainerByID(ctx context.Context, dog *dogger.DeploymentLogger, idFilter string, errorReport bool) error {
	matchedContainer, err := GetContainerByID(ctx, nil, idFilter, errorReport)
	if err != nil {
		return fmt.Errorf("could not get container (%s) to remove: %s", idFilter, err.Error())
	}
	if matchedContainer == nil {
		return nil
	}

	return deleteContainerByState(ctx, dog, idFilter, matchedContainer.State, errorReport)
}

func DeletePrefix(ctx context.Context, prefix string) error {
	containers, err := GetAllContainersByName(ctx, nil, prefix)

	if err != nil {
		return fmt.Errorf("could not get containers for prefix (%s) to remove: %s", prefix, err.Error())
	}

	for _, container := range containers {
		containerDeleteErr := deleteContainerByState(ctx, nil, container.ID, container.State, false)
		if err == nil {
			err = containerDeleteErr
		}
	}

	return err
}

func deleteContainerByState(ctx context.Context, dog *dogger.DeploymentLogger, filter, state string, errorReport bool) error {
	switch state {
	case "running", "paused", "restarting":
		err := StopContainer(ctx, dog, filter)
		if err != nil {
			return fmt.Errorf("builder could not stop container (%s): %s", filter, err.Error())
		}
		fallthrough
	case "exited", "dead", "created":
		err := RemoveContainer(ctx, dog, filter)
		if err != nil {
			return fmt.Errorf("builder could not remove container (%s): %s", filter, err.Error())
		}
		return nil
	case "":
		if errorReport {
			return fmt.Errorf(
				"builder could not determine the state of the container (%s) for deletion, possible there's no container matching the search criteria",
				filter)
		}
		return nil
	default:
		return fmt.Errorf("builder could not determine the state (%s) of the container (%s) for deletion",
			state,
			filter)
	}
}

func StopContainer(ctx context.Context, dog *dogger.DeploymentLogger, nameFilter string) error {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		log.Fatal().Err(err).Send()
	}

	timeoutValue := (time.Duration(DockerClientTimeoutSeconds) * time.Second)
	if dog != nil {
		dog.Write("Container request for: " + nameFilter)
	}
	if err := cli.ContainerStop(ctx, nameFilter, &timeoutValue); err != nil {
		return err
	}

	return nil
}

// Matches one
func RemoveContainer(ctx context.Context, dog *dogger.DeploymentLogger, nameFilter string) error {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		log.Fatal().Err(err).Send()
	}

	if dog != nil {
		dog.Write("Container request for: " + nameFilter)
	}
	if err := cli.ContainerRemove(ctx, nameFilter, types.ContainerRemoveOptions{}); err != nil {
		return err
	}

	return nil
}

// Check the existence of containers, then return it
func GetAllContainersByName(ctx context.Context, dog *dogger.DeploymentLogger, nameFilter string) ([]*types.Container, error) {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		log.Fatal().Err(err).Send()
	}

	containerList, err := cli.ContainerList(ctx, containerListOptionsfilter("name", nameFilter))
	if err != nil {
		return []*types.Container{}, err
	}

	containers := make([]*types.Container, len(containerList))
	for i := 0; i < len(containerList); i++ {
		containers[i] = &containerList[i]
	}

	return containers, nil
}

func GetAllContainersByID(ctx context.Context, dog *dogger.DeploymentLogger, idFilter string) ([]*types.Container, error) {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		log.Fatal().Err(err).Send()
	}

	containerList, err := cli.ContainerList(ctx, containerListOptionsfilter("id", idFilter))
	if err != nil {
		return []*types.Container{}, err
	}

	containers := make([]*types.Container, len(containerList))
	for i := 0; i < len(containerList); i++ {
		containers[i] = &containerList[i]
	}

	return containers, nil
}

func GetAllContainers(ctx context.Context, dog *dogger.DeploymentLogger) ([]types.Container, error) {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		log.Fatal().Err(err).Send()
	}

	containers, err := cli.ContainerList(ctx, types.ContainerListOptions{All: true})
	if err != nil {
		return []types.Container{}, err
	}

	return containers, nil
}

// Using exact match!
func GetContainerByName(ctx context.Context, dog *dogger.DeploymentLogger, nameFilter string, errorReport bool) (*types.Container, error) {
	containers, err := GetAllContainersByName(ctx, nil, fmt.Sprintf("^%s$", nameFilter))
	if err != nil {
		return nil, err
	}

	return checkOneContainer(containers, errorReport)
}

func GetContainerByID(ctx context.Context, dog *dogger.DeploymentLogger, idFilter string, errorReport bool) (*types.Container, error) {
	containers, err := GetAllContainersByID(ctx, nil, idFilter)
	if err != nil {
		return nil, err
	}

	return checkOneContainer(containers, errorReport)
}

// Making sure there's only one, tops
func checkOneContainer(containers []*types.Container, errorReport bool) (*types.Container, error) {
	switch len(containers) {
	case 0:
		if errorReport {
			return nil, fmt.Errorf("there's no matching container")
		}
		return nil, nil
	case 1:
		return containers[0], nil
	default:
		return nil, fmt.Errorf("more than one matching container")
	}
}

func containerListOptionsfilter(filtertype, filter string) types.ContainerListOptions {
	return types.ContainerListOptions{
		All: true,
		Filters: filters.NewArgs(
			filters.KeyValuePair{
				Key:   filtertype,
				Value: filter,
			}),
	}
}
