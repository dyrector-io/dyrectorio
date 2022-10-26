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

func DeleteContainerByName(ctx context.Context, dog *dogger.DeploymentLogger, nameFilter string) error {
	matchedContainer, err := GetContainerByName(ctx, nil, nameFilter)
	if err != nil {
		return fmt.Errorf("builder could not get container (%s) to remove: %s", nameFilter, err.Error())
	}

	return deleteContainerByState(ctx, dog, nameFilter, matchedContainer.State)
}

func DeleteContainerByID(ctx context.Context, dog *dogger.DeploymentLogger, nameFilter string) error {
	matchedContainer, err := GetContainerByID(ctx, nil, nameFilter)
	if err != nil {
		return fmt.Errorf("builder could not get container (%s) to remove: %s", nameFilter, err.Error())
	}

	return deleteContainerByState(ctx, dog, nameFilter, matchedContainer.State)
}

func deleteContainerByState(ctx context.Context, dog *dogger.DeploymentLogger, filter, state string) error {
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
		return fmt.Errorf(
			"builder could not determine the state of the container (%s) for deletion, possible theres no container matching the search criteria",
			filter)
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
func GetAllContainersByName(ctx context.Context, dog *dogger.DeploymentLogger, nameFilter string) ([]types.Container, error) {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		log.Fatal().Err(err).Send()
	}

	containers, err := cli.ContainerList(ctx, containerListOptionsfilter("name", nameFilter))
	if err != nil {
		return []types.Container{}, err
	}

	return containers, nil
}

func GetAllContainersByID(ctx context.Context, dog *dogger.DeploymentLogger, idFilter string) ([]types.Container, error) {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		log.Fatal().Err(err).Send()
	}

	containers, err := cli.ContainerList(ctx, containerListOptionsfilter("id", idFilter))
	if err != nil {
		return []types.Container{}, err
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
func GetContainerByName(ctx context.Context, dog *dogger.DeploymentLogger, nameFilter string) (types.Container, error) {
	containers, err := GetAllContainersByName(ctx, nil, fmt.Sprintf("^%s$", nameFilter))
	if err != nil {
		return types.Container{}, err
	}

	return CheckOneContainer(containers)
}

func GetContainerByID(ctx context.Context, dog *dogger.DeploymentLogger, nameFilter string) (types.Container, error) {
	containers, err := GetAllContainersByID(ctx, nil, nameFilter)
	if err != nil {
		return types.Container{}, err
	}

	return CheckOneContainer(containers)
}

// Making sure there's only one
func CheckOnlyOneContainer(containers []types.Container) (types.Container, error) {
	switch len(containers) {
	case 1:
		return containers[0], nil
	default:
		return types.Container{}, fmt.Errorf("more than one matching container")
	}
}

// Making sure there's only one, tops
func CheckOneContainer(containers []types.Container) (types.Container, error) {
	switch len(containers) {
	case 0:
		return types.Container{}, nil
	default:
		return CheckOnlyOneContainer(containers)
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
