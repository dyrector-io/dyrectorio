package container

import (
	"context"
	"fmt"
	"strings"

	"github.com/AlekSi/pointer"
	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
)

// Container is the abstract result of the builder
type Container interface {
	GetName() string
	GetContainerID() *string
	GetNetworkIDs() []string
	Sync() error
	Start(context.Context, client.APIClient) error
	StartWaitUntilExit(context.Context, client.APIClient) (*WaitResult, error)
}

type DockerContainer struct {
	container *types.Container
}

func NewDockerContainer(cont *types.Container) DockerContainer {
	return DockerContainer{container: cont}
}

func (d DockerContainer) Sync() error {
	return nil
}

func (d DockerContainer) GetName() string {
	return strings.TrimPrefix(d.container.Names[0], "/")
}

func (d DockerContainer) GetContainerID() *string {
	return pointer.ToStringOrNil(d.container.ID)
}

func (d DockerContainer) GetNetworkIDs() []string {
	networks := []string{}
	for _, v := range d.container.NetworkSettings.Networks {
		networks = append(networks, v.NetworkID)
	}
	return networks
}

func (d DockerContainer) Start(ctx context.Context, cli client.APIClient) error {
	return cli.ContainerStart(ctx, d.container.ID, types.ContainerStartOptions{})
}

func (d DockerContainer) StartWaitUntilExit(ctx context.Context, cli client.APIClient) (*WaitResult, error) {
	containerID := *d.GetContainerID()
	waitC, errC := cli.ContainerWait(ctx, containerID, container.WaitConditionNextExit)
	err := d.Start(ctx, cli)
	if err != nil {
		return nil, fmt.Errorf("failed start-waiting container: %w", err)
	}

	select {
	case result := <-waitC:
		return &WaitResult{StatusCode: result.StatusCode}, nil

	case err = <-errC:
		return nil, fmt.Errorf("error container waiting: %w", err)
	}
}
