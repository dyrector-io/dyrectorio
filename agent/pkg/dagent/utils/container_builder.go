package utils

import (
	"context"
	"fmt"
	"log"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/filters"
	"github.com/docker/docker/api/types/mount"
	"github.com/docker/docker/client"
	"github.com/docker/go-connections/nat"

	"github.com/dyrector-io/dyrectorio/agent/internal/dogger"
	"github.com/dyrector-io/dyrectorio/agent/internal/util"
	v1 "github.com/dyrector-io/dyrectorio/agent/pkg/api/v1"
	"github.com/dyrector-io/dyrectorio/agent/pkg/dagent/config"
)

type ContainerBuilder interface {
	WithClient(client *client.Client) ContainerBuilder
	WithImage(imageName string) ContainerBuilder
	WithEnv(env []string) ContainerBuilder
	WithPortBindings(portList []v1.PortBinding) ContainerBuilder
	WithPortRange(portRanges []v1.PortRange) ContainerBuilder
	WithMountPoints(mounts []mount.Mount) ContainerBuilder
	WithName(name string) ContainerBuilder
	WithNetworkMode(networkMode string) ContainerBuilder
	WithEnvironment(envList string) ContainerBuilder
	WithLabels(labels map[string]string) ContainerBuilder
	WithLogConfig(config v1.LogConfig)
	WithRegistryAuth(auth util.RegistryAuth) ContainerBuilder
	WithAutoRemove(remove bool) ContainerBuilder
	WithRestartPolicy(policy v1.RestartPolicyName) ContainerBuilder
	WithEntrypoint(cmd []string) ContainerBuilder
	WithCmd(cmd []string) ContainerBuilder
	WithUser(uid string) ContainerBuilder
	WithoutConflict() ContainerBuilder
	Create(context context.Context) ContainerBuilder
	Start() (bool, error)
}

type dockerContainerBuilder struct {
	ctx             context.Context
	client          *client.Client
	containerID     string
	containerName   string
	imageWithTag    string
	envList         []string
	labels          map[string]string
	logConfig       v1.LogConfig
	portList        []v1.PortBinding
	portRanges      []v1.PortRangeBinding
	mountList       []mount.Mount
	networkMode     string
	registryAuth    string
	remove          bool
	restartPolicy   v1.RestartPolicyName
	entrypoint      []string
	importContainer *v1.ImportContainer
	cmd             []string
	tty             bool
	user            *int64
	dogger          *dogger.DeploymentLogger
	config          *config.Configuration
}

func NewDockerBuilder(cli *client.Client, cfg *config.Configuration) *dockerContainerBuilder {
	b := dockerContainerBuilder{config: cfg}
	return b.WithClient(cli)
}

func (dc *dockerContainerBuilder) WithClient(cli *client.Client) *dockerContainerBuilder {
	dc.client = cli
	return dc
}

func (dc *dockerContainerBuilder) WithName(name string) *dockerContainerBuilder {
	dc.containerName = name
	return dc
}

func (dc *dockerContainerBuilder) WithPortBindings(portList []v1.PortBinding) *dockerContainerBuilder {
	dc.portList = portList
	return dc
}

func (dc *dockerContainerBuilder) WithPortRanges(portRanges []v1.PortRangeBinding) *dockerContainerBuilder {
	dc.portRanges = portRanges
	return dc
}

func (dc *dockerContainerBuilder) WithEnv(envList []string) *dockerContainerBuilder {
	dc.envList = envList
	return dc
}

func (dc *dockerContainerBuilder) WithLabels(labels map[string]string) *dockerContainerBuilder {
	dc.labels = labels
	return dc
}

func (dc *dockerContainerBuilder) WithLogConfig(logConfig *v1.LogConfig) *dockerContainerBuilder {
	if logConfig != nil {
		dc.logConfig = *logConfig
	}
	return dc
}

func (dc *dockerContainerBuilder) WithImage(imageWithTag string) *dockerContainerBuilder {
	dc.imageWithTag = imageWithTag
	return dc
}

func (dc *dockerContainerBuilder) WithMountPoints(mountList []mount.Mount) *dockerContainerBuilder {
	dc.mountList = mountList
	return dc
}

func (dc *dockerContainerBuilder) WithNetworkMode(networkMode string) *dockerContainerBuilder {
	dc.networkMode = networkMode
	return dc
}

func (dc *dockerContainerBuilder) WithRegistryAuth(auth *util.RegistryAuth) *dockerContainerBuilder {
	if auth != nil {
		dc.registryAuth = RegistryAuthBase64(auth.User, auth.Password)
	}
	return dc
}

func (dc *dockerContainerBuilder) WithRestartPolicy(policy v1.RestartPolicyName) *dockerContainerBuilder {
	dc.restartPolicy = policy
	return dc
}

func (dc *dockerContainerBuilder) WithAutoRemove(remove bool) *dockerContainerBuilder {
	dc.remove = remove
	return dc
}

func (dc *dockerContainerBuilder) WithEntrypoint(entrypoint []string) *dockerContainerBuilder {
	dc.entrypoint = entrypoint
	return dc
}

func (dc *dockerContainerBuilder) WithImportContainer(importContainer v1.ImportContainer) *dockerContainerBuilder {
	dc.importContainer = &importContainer
	return dc
}

func (dc *dockerContainerBuilder) WithCmd(cmd []string) *dockerContainerBuilder {
	dc.cmd = cmd
	return dc
}

func (dc *dockerContainerBuilder) WithTTY(tty bool) *dockerContainerBuilder {
	dc.tty = tty
	return dc
}

func (dc *dockerContainerBuilder) WithoutConflict() *dockerContainerBuilder {
	if err := DeleteContainer(dc.containerName); err != nil {
		log.Printf("builder could not stop/remove container (%s) to avoid conflicts: %s", dc.containerName, err.Error())
	}
	return dc
}

func (dc *dockerContainerBuilder) WithUser(user *int64) *dockerContainerBuilder {
	dc.user = user
	return dc
}

func (dc *dockerContainerBuilder) WithDogger(dog *dogger.DeploymentLogger) *dockerContainerBuilder {
	dc.dogger = dog
	return dc
}

// todo: container builders create method could be eliminated mostly
//		setting invidual params at their function to their final location
//		managing hostConfig/containerConfig on the builder
//		only create is done here
func (dc *dockerContainerBuilder) Create(ctx context.Context) *dockerContainerBuilder {
	dc.ctx = ctx
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		panic(err)
	}

	dog := dc.dogger
	if dog == nil {
		dog = dogger.NewDeploymentLogger(nil, nil, ctx, &dc.config.CommonConfiguration)
	}

	var containerCreated types.Container

	// todo: fetch remote sha hash of image if not matching -> pull
	if err = PullImage(dog, dc.imageWithTag, dc.registryAuth); err != nil {
		if err != nil && err.Error() != "EOF" {
			dog.Write(fmt.Sprintf("Image pull error: %s", err.Error()))
		}
	}

	portListNat := portListToNatBinding(dc.portRanges, dc.portList)
	exposedPortSet := getPortSet(portListNat)
	hostConfig := &container.HostConfig{
		Mounts:       dc.mountList,
		PortBindings: portListNat,
		AutoRemove:   dc.remove,
	}

	containerConfig := &container.Config{
		Image:        dc.imageWithTag,
		Tty:          dc.tty,
		Env:          dc.envList,
		Labels:       dc.labels,
		ExposedPorts: exposedPortSet,
		Entrypoint:   dc.entrypoint,
		Cmd:          dc.cmd,
	}

	if dc.user != nil {
		containerConfig.User = fmt.Sprint(*dc.user)
	}

	if dc.logConfig.LogDriver != "" {
		hostConfig.LogConfig.Type = dc.logConfig.LogDriver
		hostConfig.LogConfig.Config = dc.logConfig.LogOpts
	}

	policy := container.RestartPolicy{}
	policy.Name = string(dc.restartPolicy)
	hostConfig.RestartPolicy = policy

	switch dc.networkMode {
	case "host":
		hostConfig.NetworkMode = container.NetworkMode(dc.networkMode)
	case "none":
		hostConfig.NetworkMode = container.NetworkMode(dc.networkMode)
	case "":
		// no-op use default, that is configured in the dokker daemon
	default:
		log.Println("Provided networkMode: ", dc.networkMode)
		hostConfig.NetworkMode = container.NetworkMode(dc.networkMode)
	}

	var name string
	if dc.containerName != "" {
		name = dc.containerName
		containerConfig.Hostname = dc.containerName
	}

	containerCreateResp, err := cli.ContainerCreate(ctx, containerConfig, hostConfig, nil, nil, name)

	if err != nil {
		dog.Write(fmt.Sprintln("Container create failed: ", err))
	}
	containers, err := cli.ContainerList(ctx, types.ContainerListOptions{
		All:     true,
		Filters: filters.NewArgs(filters.KeyValuePair{Key: "id", Value: containerCreateResp.ID}),
	})

	if err != nil {
		dog.Write(fmt.Sprintf("Container list failed: %s", err.Error()))
	}

	if len(containers) != 1 {
		dog.Write("Container was not created.")
	} else {
		containerCreated = containers[0]
		dc.containerID = containerCreated.ID
	}

	return dc
}

func (dc *dockerContainerBuilder) Start() (bool, error) {
	if dc.importContainer != nil {
		err := spawnInitContainer(dc.client, dc.ctx, dc.containerName, dc.mountList, dc.importContainer, dc.dogger, dc.config)
		if err != nil {
			log.Printf("Failed to spawn init container: %v", err)
			return false, err
		}
	}

	err := dc.client.ContainerStart(dc.ctx, dc.containerID, types.ContainerStartOptions{})

	if err != nil {
		log.Println(err)
		return false, err
	} else {
		log.Printf("Started container: %s", dc.containerID)
		return true, nil
	}
}

func portListToNatBinding(portRanges []v1.PortRangeBinding, portList []v1.PortBinding) map[nat.Port][]nat.PortBinding {
	portMap := make(map[nat.Port][]nat.PortBinding)

	for _, p := range portRanges {
		// example complete portSpec
		// portMappings, err := ParsePortSpec("0.0.0.0:1234-1235:3333-3334/tcp")
		// the latest go-connections pkg provides on more return value, not yet needed imported by docker-cli

		portMapping, _ := nat.ParsePortSpec(
			fmt.Sprintf("0.0.0.0:%v-%v:%v-%v/tcp",
				p.External.From,
				p.External.To,
				p.Internal.From,
				p.Internal.To))

		for _, port := range portMapping {
			portMap[port.Port] = []nat.PortBinding{port.Binding}
		}
	}

	for _, p := range portList {
		portInternal, _ := nat.NewPort("tcp", fmt.Sprint(p.ExposedPort))
		portExternal, _ := nat.NewPort("tcp", fmt.Sprint(p.PortBinding))

		portMap[portInternal] = []nat.PortBinding{
			{
				HostIP:   "0.0.0.0",
				HostPort: portExternal.Port(),
			},
		}
	}

	return portMap
}

func getPortSet(natPortBindings map[nat.Port][]nat.PortBinding) nat.PortSet {
	portSet := make(nat.PortSet)

	for port := range natPortBindings {
		portSet[port] = struct{}{}
	}
	return portSet
}
