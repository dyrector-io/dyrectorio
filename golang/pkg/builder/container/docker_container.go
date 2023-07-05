package container

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/AlekSi/pointer"
	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/mount"
	"github.com/docker/docker/client"
)

// Container is the abstract result of the builder
type Container interface {
	GetName() string
	GetContainerID() *string
	GetNetworkIDs() []string
	Start(context.Context, client.APIClient) error
	StartWaitUntilExit(context.Context, client.APIClient) (*WaitResult, error)
}

type DockerContainer struct {
	container      *types.Container
	preStartHooks  *[]LifecycleFunc
	postStartHooks *[]LifecycleFunc
	// mountList is used by lifecycle functions
	mountList *[]mount.Mount
	// envList is used by lifecycle functions
	envList []string
}

func NewDockerContainer(cont *types.Container, preStartHooks,
	postStartHooks *[]LifecycleFunc, mountList *[]mount.Mount, envList []string,
) DockerContainer {
	return DockerContainer{
		container:      cont,
		preStartHooks:  preStartHooks,
		postStartHooks: postStartHooks,
		mountList:      mountList,
	}
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
	if d.container.ID == "" {
		return errors.New("container does not exist")
	}

	if hookError := execStartHooks(ctx, cli, d.GetName(), d.container, d.mountList, d.envList, d.preStartHooks); hookError != nil {
		return hookError
	}

	err := cli.ContainerStart(ctx, d.container.ID, types.ContainerStartOptions{})
	if err != nil {
		return err
	}
	if hookError := execStartHooks(ctx, cli, d.GetName(), d.container, d.mountList, d.envList, d.postStartHooks); hookError != nil {
		return hookError
	}
	return nil
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

func execStartHooks(ctx context.Context, cli client.APIClient, name string,
	cont *types.Container, mountList *[]mount.Mount, envList []string, hooks *[]LifecycleFunc,
) error {
	for _, hook := range *hooks {
		if err := hook(ctx, cli,
			ParentContainer{
				Name:        name,
				Container:   cont,
				MountList:   *mountList,
				Environment: envList,
				Logger:      nil,
			}); err != nil {
			return err
		}
	}
	return nil
}
