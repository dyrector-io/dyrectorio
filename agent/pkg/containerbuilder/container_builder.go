package container_builder

import (
	"context"
	"fmt"
	"io"
	"log"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/filters"
	"github.com/docker/docker/api/types/mount"
	"github.com/docker/docker/client"
	"github.com/docker/go-connections/nat"
)

type ContainerBuilder interface {
	WithClient(client *client.Client) ContainerBuilder
	WithImage(imageName string) ContainerBuilder
	WithEnv(env []string) ContainerBuilder
	WithPortBindings(portList []PortBinding) ContainerBuilder
	WithPortRange(portRanges []PortRange) ContainerBuilder
	WithMountPoints(mounts []mount.Mount) ContainerBuilder
	WithName(name string) ContainerBuilder
	WithNetworkMode(networkMode string) ContainerBuilder
	WithEnvironment(envList string) ContainerBuilder
	WithLabels(labels map[string]string) ContainerBuilder
	WithLogConfig(config container.LogConfig)
	WithRegistryAuth(auth RegistryAuth) ContainerBuilder
	WithAutoRemove(remove bool) ContainerBuilder
	WithRestartPolicy(policy RestartPolicyName) ContainerBuilder
	WithEntrypoint(cmd []string) ContainerBuilder
	WithCmd(cmd []string) ContainerBuilder
	WithUser(uid string) ContainerBuilder
	WithLogger(logger io.StringWriter) ContainerBuilder
	WithoutConflict() ContainerBuilder
	WithPreCreateHooks(hooks []LifecycleFunc) ContainerBuilder
	WithPostCreateHooks(hooks []LifecycleFunc) ContainerBuilder
	WithPreStartHooks(hooks []LifecycleFunc) ContainerBuilder
	WithPostStartHooks(hooks []LifecycleFunc) ContainerBuilder
	GetContainerId() string
	Create(context context.Context) ContainerBuilder
	Start() (bool, error)
}

type DockerContainerBuilder struct {
	ctx             context.Context
	client          *client.Client
	containerID     string
	containerName   string
	imageWithTag    string
	envList         []string
	labels          map[string]string
	logConfig       *container.LogConfig
	portList        []PortBinding
	portRanges      []PortRangeBinding
	mountList       []mount.Mount
	networkMode     string
	registryAuth    string
	remove          bool
	restartPolicy   RestartPolicyName
	entrypoint      []string
	cmd             []string
	tty             bool
	user            *int64
	logger          *io.StringWriter
	hooksPreCreate  []LifecycleFunc
	hooksPostCreate []LifecycleFunc
	hooksPreStart   []LifecycleFunc
	hooksPostStart  []LifecycleFunc
}

func NewDockerBuilder(cli *client.Client) *DockerContainerBuilder {
	b := DockerContainerBuilder{}
	return b.WithClient(cli)
}

func (dc *DockerContainerBuilder) WithClient(cli *client.Client) *DockerContainerBuilder {
	dc.client = cli
	return dc
}

func (dc *DockerContainerBuilder) WithName(name string) *DockerContainerBuilder {
	dc.containerName = name
	return dc
}

func (dc *DockerContainerBuilder) WithPortBindings(portList []PortBinding) *DockerContainerBuilder {
	dc.portList = portList
	return dc
}

func (dc *DockerContainerBuilder) WithPortRanges(portRanges []PortRangeBinding) *DockerContainerBuilder {
	dc.portRanges = portRanges
	return dc
}

func (dc *DockerContainerBuilder) WithEnv(envList []string) *DockerContainerBuilder {
	dc.envList = envList
	return dc
}

func (dc *DockerContainerBuilder) WithLabels(labels map[string]string) *DockerContainerBuilder {
	dc.labels = labels
	return dc
}

func (dc *DockerContainerBuilder) WithLogConfig(logConfig *container.LogConfig) *DockerContainerBuilder {
	if logConfig != nil {
		dc.logConfig = logConfig
	}
	return dc
}

func (dc *DockerContainerBuilder) WithImage(imageWithTag string) *DockerContainerBuilder {
	dc.imageWithTag = imageWithTag
	return dc
}

func (dc *DockerContainerBuilder) WithMountPoints(mountList []mount.Mount) *DockerContainerBuilder {
	dc.mountList = mountList
	return dc
}

func (dc *DockerContainerBuilder) WithNetworkMode(networkMode string) *DockerContainerBuilder {
	dc.networkMode = networkMode
	return dc
}

func (dc *DockerContainerBuilder) WithRegistryAuth(auth *RegistryAuth) *DockerContainerBuilder {
	if auth != nil {
		dc.registryAuth = registryAuthBase64(auth.User, auth.Password)
	}
	return dc
}

func (dc *DockerContainerBuilder) WithRestartPolicy(policy RestartPolicyName) *DockerContainerBuilder {
	dc.restartPolicy = policy
	return dc
}

func (dc *DockerContainerBuilder) WithAutoRemove(remove bool) *DockerContainerBuilder {
	dc.remove = remove
	return dc
}

func (dc *DockerContainerBuilder) WithEntrypoint(entrypoint []string) *DockerContainerBuilder {
	dc.entrypoint = entrypoint
	return dc
}

func (dc *DockerContainerBuilder) WithCmd(cmd []string) *DockerContainerBuilder {
	dc.cmd = cmd
	return dc
}

func (dc *DockerContainerBuilder) WithTTY(tty bool) *DockerContainerBuilder {
	dc.tty = tty
	return dc
}

func (dc *DockerContainerBuilder) WithoutConflict() *DockerContainerBuilder {
	if err := DeleteContainer(dc.containerName); err != nil {
		log.Printf("builder could not stop/remove container (%s) to avoid conflicts: %s", dc.containerName, err.Error())
	}
	return dc
}

func (dc *DockerContainerBuilder) WithUser(user *int64) *DockerContainerBuilder {
	dc.user = user
	return dc
}

func (dc *DockerContainerBuilder) WithLogger(logger io.StringWriter) *DockerContainerBuilder {
	dc.logger = &logger
	return dc
}

func (dc *DockerContainerBuilder) WithPreCreateHooks(hooks []LifecycleFunc) *DockerContainerBuilder {
	dc.hooksPreCreate = hooks
	return dc
}

func (dc *DockerContainerBuilder) WithPostCreateHooks(hooks []LifecycleFunc) *DockerContainerBuilder {
	dc.hooksPostCreate = hooks
	return dc
}

func (dc *DockerContainerBuilder) WithPreStartHooks(hooks []LifecycleFunc) *DockerContainerBuilder {
	dc.hooksPreStart = hooks
	return dc
}

func (dc *DockerContainerBuilder) WithPostStartHooks(hooks []LifecycleFunc) *DockerContainerBuilder {
	dc.hooksPostStart = hooks
	return dc
}

func (dc *DockerContainerBuilder) GetContainerId() string {
	return dc.containerID
}

// todo: container builders create method could be eliminated mostly
//		setting invidual params at their function to their final location
//		managing hostConfig/containerConfig on the builder
//		only create is done here
func (dc *DockerContainerBuilder) Create(ctx context.Context) *DockerContainerBuilder {
	dc.ctx = ctx
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		panic(err)
	}

	var containerCreated types.Container

	// todo: fetch remote sha hash of image if not matching -> pull
	if err = pullImage(dc.logger, dc.imageWithTag, dc.registryAuth); err != nil {
		if err != nil && err.Error() != "EOF" {
			logWrite(dc, fmt.Sprintf("Image pull error: %s", err.Error()))
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

	if dc.logConfig != nil {
		hostConfig.LogConfig = *dc.logConfig
	}

	policy := container.RestartPolicy{}
	policy.Name = string(dc.restartPolicy)
	hostConfig.RestartPolicy = policy

	if dc.networkMode != "" {
		log.Println("Provided networkMode: ", dc.networkMode)
		hostConfig.NetworkMode = container.NetworkMode(dc.networkMode)
	}

	var name string
	if dc.containerName != "" {
		name = dc.containerName
		containerConfig.Hostname = dc.containerName
	}

	for _, hook := range dc.hooksPreCreate {
		err := hook(dc.ctx, dc.client, dc.containerName, nil, dc.mountList, dc.logger)
		if err != nil {
			logWrite(dc, fmt.Sprintln("Container pre-create hook error: ", err))
		}
	}

	containerCreateResp, err := cli.ContainerCreate(ctx, containerConfig, hostConfig, nil, nil, name)

	if err != nil {
		logWrite(dc, fmt.Sprintln("Container create failed: ", err))
	}
	containers, err := cli.ContainerList(ctx, types.ContainerListOptions{
		All:     true,
		Filters: filters.NewArgs(filters.KeyValuePair{Key: "id", Value: containerCreateResp.ID}),
	})

	for _, hook := range dc.hooksPostCreate {
		err := hook(dc.ctx, dc.client, dc.containerName, &containerCreateResp.ID, dc.mountList, dc.logger)
		if err != nil {
			logWrite(dc, fmt.Sprintln("Container post-create hook error: ", err))
		}
	}

	if err != nil {
		logWrite(dc, fmt.Sprintf("Container list failed: %s", err.Error()))
	}

	if len(containers) != 1 {
		logWrite(dc, "Container was not created.")
	} else {
		containerCreated = containers[0]
		dc.containerID = containerCreated.ID
	}

	return dc
}

func (dc *DockerContainerBuilder) Start() (bool, error) {
	for _, hook := range dc.hooksPreStart {
		err := hook(dc.ctx, dc.client, dc.containerName, &dc.containerID, dc.mountList, dc.logger)
		if err != nil {
			logWrite(dc, fmt.Sprintln("Container pre-start hook error: ", err))
		}
	}

	err := dc.client.ContainerStart(dc.ctx, dc.containerID, types.ContainerStartOptions{})

	for _, hook := range dc.hooksPostStart {
		err := hook(dc.ctx, dc.client, dc.containerName, &dc.containerID, dc.mountList, dc.logger)
		if err != nil {
			logWrite(dc, fmt.Sprintln("Container post-start hook error: ", err))
		}
	}

	if err != nil {
		log.Println(err)
		return false, err
	} else {
		log.Printf("Started container: %s", dc.containerID)
		return true, nil
	}
}

func portListToNatBinding(portRanges []PortRangeBinding, portList []PortBinding) map[nat.Port][]nat.PortBinding {
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

func logWrite(dc *DockerContainerBuilder, message string) {
	if dc.logger != nil {
		(*dc.logger).WriteString(message)
	}
}
