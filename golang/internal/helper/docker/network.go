package docker

import (
	"context"
	"fmt"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/filters"
	"github.com/docker/docker/client"
	"github.com/rs/zerolog/log"
)

func GetAllNetworks(ctx context.Context) ([]types.NetworkResource, error) {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		panic(err)
	}
	return cli.NetworkList(ctx, types.NetworkListOptions{})
}

func CreateNetwork(ctx context.Context, name, driver string) error {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		panic(err)
	}

	networks, err := cli.NetworkList(ctx, types.NetworkListOptions{
		Filters: filters.NewArgs(
			filters.KeyValuePair{
				Key:   "name",
				Value: name,
			}),
	})
	if err != nil {
		return fmt.Errorf("error list existing networks: %w", err)
	}

	if len(networks) > 0 {
		log.Debug().Str("name", name).Msg("Provided network name exists. Skip to create new network.")
		return nil
	}

	networkCreateOptions := types.NetworkCreate{
		CheckDuplicate: true,
		Driver:         driver,
	}

	_, err = cli.NetworkCreate(ctx, name, networkCreateOptions)
	if err != nil {
		return err
	}

	return nil
}

func DeleteNetworkByID(ctx context.Context, networkID string) error {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		panic(err)
	}

	return cli.NetworkRemove(ctx, networkID)
}
