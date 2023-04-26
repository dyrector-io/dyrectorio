package docker

import (
	"context"
	"errors"
	"fmt"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/filters"
	"github.com/docker/docker/client"
	"github.com/rs/zerolog/log"

	"github.com/dyrector-io/dyrectorio/golang/internal/dogger"
)

func DeleteContainerByName(ctx context.Context, nameFilter string) error {
	matchedContainer, err := GetContainerByName(ctx, nameFilter)
	if err != nil {
		return fmt.Errorf("builder could not get container (%s) to remove: %s", nameFilter, err.Error())
	}

	if matchedContainer == nil {
		return nil
	}

	return deleteContainerByIDAndState(ctx, nil, matchedContainer.ID, matchedContainer.State)
}

func DeleteContainer(ctx context.Context, cont *types.Container) error {
	return deleteContainerByIDAndState(ctx, nil, cont.ID, cont.State)
}

func deleteContainerByIDAndState(ctx context.Context, dog *dogger.DeploymentLogger, id, state string) error {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		log.Fatal().Err(err).Send()
	}

	switch state {
	case "running", "paused", "restarting":
		if dog != nil {
			dog.Write("Stopping container: " + id)
		}

		if err = cli.ContainerStop(ctx, id, container.StopOptions{}); err != nil {
			return fmt.Errorf("could not stop container (%s): %s", id, err.Error())
		}

		fallthrough
	case "exited", "dead", "created":
		if dog != nil {
			dog.WriteContainerState("removing", "Removing container: "+id)
		}

		if err = cli.ContainerRemove(ctx, id, types.ContainerRemoveOptions{}); err != nil {
			return fmt.Errorf("could not remove container (%s): %s", id, err.Error())
		}

		return nil
	default:
		return fmt.Errorf("builder could not determine the state (%s) of the container (%s) for deletion",
			state,
			id)
	}
}

func DeleteContainersByLabel(ctx context.Context, label string) error {
	containers, err := GetAllContainersByLabel(ctx, label)
	if err != nil {
		return fmt.Errorf("could not get containers by label (%s) to delete: %s", label, err.Error())
	}
	baseErr := fmt.Errorf("failed to delete containers")
	err = baseErr
	for i := range containers {
		containerDeleteErr := deleteContainerByIDAndState(ctx, nil, containers[i].ID, containers[i].State)

		if containerDeleteErr != nil {
			log.Error().Err(containerDeleteErr).Stack().Send()
			err = errors.Join(err, containerDeleteErr)
		}
	}

	if !errors.Is(err, baseErr) {
		return err
	}

	return nil
}

// Check the existence of containers, then return it
func GetAllContainersByName(ctx context.Context, nameFilter string) ([]types.Container, error) {
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

func GetAllContainers(ctx context.Context) ([]types.Container, error) {
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

func GetContainerByID(ctx context.Context, idFilter string) (*types.Container, error) {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		log.Fatal().Err(err).Send()
	}

	containers, err := cli.ContainerList(ctx, containerListOptionsfilter("id", idFilter))
	if err != nil {
		return nil, err
	}

	return checkOneContainer(containers)
}

func DeleteContainerByID(ctx context.Context, dog *dogger.DeploymentLogger, id string) error {
	cont, err := GetContainerByID(ctx, id)
	if err != nil {
		return fmt.Errorf("could not get container (%s) to delete: %s", id, err.Error())
	}

	if cont == nil {
		return nil
	}

	return deleteContainerByIDAndState(ctx, dog, id, cont.State)
}

func GetAllContainersByLabel(ctx context.Context, label string) ([]types.Container, error) {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		log.Fatal().Err(err).Send()
	}

	containers, err := cli.ContainerList(ctx, containerListOptionsfilter("label", label))
	if err != nil {
		return []types.Container{}, err
	}

	return containers, nil
}

// Using exact match!
func GetContainerByName(ctx context.Context, nameFilter string) (*types.Container, error) {
	containers, err := GetAllContainersByName(ctx, fmt.Sprintf("^%s$", nameFilter))
	if err != nil {
		return nil, err
	}

	return checkOneContainer(containers)
}

func DeleteImage(ctx context.Context, imageID string) error {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		log.Fatal().Err(err).Send()
	}

	_, err = cli.ImageRemove(ctx, imageID, types.ImageRemoveOptions{})
	return err
}

// Making sure there's only one, tops
func checkOneContainer(containers []types.Container) (*types.Container, error) {
	switch len(containers) {
	case 0:
		return nil, nil
	case 1:
		return &containers[0], nil
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
