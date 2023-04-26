// Package container implements a fluent interface for creating and starting
// docker containers.
package container

import (
	"context"
	"errors"
	"fmt"
	"io"
	"strings"

	"github.com/docker/distribution/reference"
	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/filters"
	"github.com/docker/docker/api/types/mount"
	"github.com/docker/docker/api/types/network"
	"github.com/docker/docker/client"
	"github.com/docker/go-connections/nat"
	"github.com/rs/zerolog/log"

	dockerHelper "github.com/dyrector-io/dyrectorio/golang/internal/helper/docker"
	imageHelper "github.com/dyrector-io/dyrectorio/golang/internal/helper/image"
	"github.com/dyrector-io/dyrectorio/golang/internal/logdefer"
)

// A Builder handles the process of creating and starting containers,
// it can be configured using 'With...' methods.
// A Builder can be created using the NewDockerBuilder method.
type Builder interface {
	WithClient(client client.APIClient) Builder
	WithImage(imageWithTag string) Builder
	WithEnv(env []string) Builder
	WithPortBindings(portList []PortBinding) Builder
	WithPortRanges(portRanges []PortRangeBinding) Builder
	WithMountPoints(mounts []mount.Mount) Builder
	WithName(name string) Builder
	WithNetworkAliases(aliases ...string) Builder
	WithNetworkMode(networkMode string) Builder
	WithNetworks(networks []string) Builder
	WithLabels(labels map[string]string) Builder
	WithLogConfig(config *container.LogConfig) Builder
	WithRegistryAuth(auth *imageHelper.RegistryAuth) Builder
	WithAutoRemove(remove bool) Builder
	WithRestartPolicy(policy RestartPolicyName) Builder
	WithEntrypoint(cmd []string) Builder
	WithCmd(cmd []string) Builder
	WithShell(shell []string) Builder
	WithUser(uid *int64) Builder
	WithLogWriter(logger io.StringWriter) Builder
	WithoutConflict() Builder
	WithForcePullImage() Builder
	WithExtraHosts(hosts []string) Builder
	WithPreCreateHooks(hooks ...LifecycleFunc) Builder
	WithPostCreateHooks(hooks ...LifecycleFunc) Builder
	WithPreStartHooks(hooks ...LifecycleFunc) Builder
	WithPostStartHooks(hooks ...LifecycleFunc) Builder
	Create() (Container, error)
	CreateAndStart() (Container, error)
	CreateAndStartWaitUntilExit() (Container, *WaitResult, error)
}

type DockerContainerBuilder struct {
	ctx             context.Context
	client          client.APIClient
	containerID     *string
	networkIDs      []string
	networkAliases  []string
	containerName   string
	imageWithTag    string
	envList         []string
	labels          map[string]string
	logConfig       *container.LogConfig
	portList        []PortBinding
	portRanges      []PortRangeBinding
	mountList       []mount.Mount
	networkMode     string
	networks        []string
	registryAuth    string
	remove          bool
	withoutConflict bool
	restartPolicy   RestartPolicyName
	entrypoint      []string
	cmd             []string
	shell           []string
	tty             bool
	user            *int64
	forcePull       bool
	logger          io.StringWriter
	extraHosts      []string
	hooksPreCreate  []LifecycleFunc
	hooksPostCreate []LifecycleFunc
	hooksPreStart   []LifecycleFunc
	hooksPostStart  []LifecycleFunc
}

// A shorthand function for creating a new DockerContainerBuilder and calling WithClient.
// Creates a default Docker client which can be overwritten using 'WithClient'.
// Creates a default logger which logs using the 'fmt' package.
func NewDockerBuilder(ctx context.Context) Builder {
	var logger io.StringWriter = defaultLogger{}
	b := DockerContainerBuilder{
		ctx:    ctx,
		logger: logger,
	}

	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		panic(err)
	}

	return b.WithClient(cli).WithExtraHosts([]string{"host.docker.internal:host-gateway"})
}

// Sets the Docker client of the ContainerBuilder. By default NewDockerBuilder creates a client.
func (dc *DockerContainerBuilder) WithClient(cli client.APIClient) Builder {
	dc.client = cli
	return dc
}

// Sets the name of the target container.
func (dc *DockerContainerBuilder) WithName(name string) Builder {
	dc.containerName = name
	return dc
}

// Sets the network aliases used when connecting the container to the network.
// Applied only if the NetworkMode is not none/host.
// It is a must for Podman, without this the DNS resolution won't work.
func (dc *DockerContainerBuilder) WithNetworkAliases(aliases ...string) Builder {
	dc.networkAliases = aliases
	return dc
}

// Sets the port bindings of a container. Expose internal container ports to the host.
func (dc *DockerContainerBuilder) WithPortBindings(portList []PortBinding) Builder {
	dc.portList = portList
	return dc
}

// Sets port ranges of a container.
func (dc *DockerContainerBuilder) WithPortRanges(portRanges []PortRangeBinding) Builder {
	dc.portRanges = portRanges
	return dc
}

// Sets the environment variables of a container. Values are in a "KEY=VALUE" format.
func (dc *DockerContainerBuilder) WithEnv(envList []string) Builder {
	dc.envList = envList
	return dc
}

// Sets the labels of a container.
func (dc *DockerContainerBuilder) WithLabels(labels map[string]string) Builder {
	dc.labels = labels
	return dc
}

// Sets the log config of the container.
func (dc *DockerContainerBuilder) WithLogConfig(logConfig *container.LogConfig) Builder {
	if logConfig != nil {
		dc.logConfig = logConfig
	}
	return dc
}

// Sets the image of a container in a "image:tag" format where image can be a fully qualified name.
func (dc *DockerContainerBuilder) WithImage(imageWithTag string) Builder {
	dc.imageWithTag = imageWithTag
	return dc
}

// Sets mount points of a container.
func (dc *DockerContainerBuilder) WithMountPoints(mountList []mount.Mount) Builder {
	dc.mountList = mountList
	return dc
}

// Sets the network mode of a container.
func (dc *DockerContainerBuilder) WithNetworkMode(networkMode string) Builder {
	dc.networkMode = networkMode
	return dc
}

// Sets the extra networks.
func (dc *DockerContainerBuilder) WithNetworks(networks []string) Builder {
	dc.networks = networks
	return dc
}

// Sets the registry and authentication for the given image.
func (dc *DockerContainerBuilder) WithRegistryAuth(auth *imageHelper.RegistryAuth) Builder {
	if auth != nil {
		dc.registryAuth = registryAuthBase64(auth.User, auth.Password)
	}
	return dc
}

// Sets the restart policy of the container.
func (dc *DockerContainerBuilder) WithRestartPolicy(policy RestartPolicyName) Builder {
	dc.restartPolicy = policy
	return dc
}

// Sets if the container should be removed after it exists.
func (dc *DockerContainerBuilder) WithAutoRemove(remove bool) Builder {
	dc.remove = remove
	return dc
}

// Sets the entrypoint of a container.
func (dc *DockerContainerBuilder) WithEntrypoint(entrypoint []string) Builder {
	dc.entrypoint = entrypoint
	return dc
}

// Sets the CMD of a container.
func (dc *DockerContainerBuilder) WithCmd(cmd []string) Builder {
	dc.cmd = cmd
	return dc
}

// Sets the SHELL of a container.
func (dc *DockerContainerBuilder) WithShell(shell []string) Builder {
	dc.shell = shell
	return dc
}

// Sets if standard streams should be attached to a tty.
func (dc *DockerContainerBuilder) WithTTY(tty bool) Builder {
	dc.tty = tty
	return dc
}

// Deletes the container with the given name if already exists.
func (dc *DockerContainerBuilder) WithoutConflict() Builder {
	dc.withoutConflict = true

	return dc
}

// Sets the UID.
func (dc *DockerContainerBuilder) WithUser(user *int64) Builder {
	dc.user = user
	return dc
}

// Sets the logger which logs messages releated to the builder (and not the container).
func (dc *DockerContainerBuilder) WithLogWriter(logger io.StringWriter) Builder {
	dc.logger = logger
	return dc
}

// Sets the builder to force pull the image before creating the container.
func (dc *DockerContainerBuilder) WithForcePullImage() Builder {
	dc.forcePull = true
	return dc
}

// Sets the builder to use extra hosts when creating the container.
// Hosts must be defined in a "HOSTNAME:IP" format.
func (dc *DockerContainerBuilder) WithExtraHosts(hosts []string) Builder {
	dc.extraHosts = hosts
	return dc
}

// Sets an array of hooks which runs before the container is created. ContainerID is nil in these hooks.
func (dc *DockerContainerBuilder) WithPreCreateHooks(hooks ...LifecycleFunc) Builder {
	dc.hooksPreCreate = hooks
	return dc
}

// Sets an array of hooks which runs after the container is created.
func (dc *DockerContainerBuilder) WithPostCreateHooks(hooks ...LifecycleFunc) Builder {
	dc.hooksPostCreate = hooks
	return dc
}

// Sets an array of hooks which runs before the container is started.
func (dc *DockerContainerBuilder) WithPreStartHooks(hooks ...LifecycleFunc) Builder {
	dc.hooksPreStart = hooks
	return dc
}

// Sets an array of hooks which runs after the container is started.
func (dc *DockerContainerBuilder) WithPostStartHooks(hooks ...LifecycleFunc) Builder {
	dc.hooksPostStart = hooks
	return dc
}

// Creates the container using the configuration given by 'With...' functions.
func (dc *DockerContainerBuilder) Create() (Container, error) {
	expandedImageName, err := imageHelper.ExpandImageName(dc.imageWithTag)
	if err != nil {
		dc.logWrite(fmt.Sprintf("Failed to parse image with tag ('%s'): %s", dc.imageWithTag, err.Error()))
		return nil, err
	}

	if err = prepareImage(dc, expandedImageName); err != nil {
		dc.logWrite(fmt.Sprintf("Failed to prepare image: %s", err.Error()))
		return nil, err
	}

	if dc.withoutConflict {
		err = dockerHelper.DeleteContainerByName(dc.ctx, dc.containerName)
		if err != nil {
			dc.logWrite(fmt.Sprintf("Failed to resolve conflict during creating the container: %v", err))
			return nil, err
		}
	}

	portListNat := portListToNatBinding(dc.portRanges, dc.portList)
	exposedPortSet := getPortSet(dc.portList)
	hostConfig := &container.HostConfig{
		Mounts:       dc.mountList,
		PortBindings: portListNat,
		AutoRemove:   dc.remove,
		ExtraHosts:   dc.extraHosts,
	}

	containerConfig := &container.Config{
		Image:        dc.imageWithTag,
		Tty:          dc.tty,
		Env:          dc.envList,
		Labels:       dc.labels,
		ExposedPorts: exposedPortSet,
		Entrypoint:   dc.entrypoint,
		Cmd:          dc.cmd,
		Shell:        dc.shell,
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

	dc.logWrite(fmt.Sprintf("Provided networkMode: %s", dc.networkMode))
	if nw := container.NetworkMode(dc.networkMode); !nw.IsPrivate() {
		hostConfig.NetworkMode = nw
	} else {
		networkIDs := createNetworks(dc)
		if networkIDs == nil {
			return nil, errors.New("failed to create networks")
		}

		dc.networkIDs = networkIDs
		dc.logWrite(fmt.Sprintln("Container network: ", dc.networkIDs))
	}

	var name string
	if dc.containerName != "" {
		name = dc.containerName
		containerConfig.Hostname = dc.containerName
	}

	if hookError := execHooks(dc, dc.hooksPreCreate); hookError != nil {
		dc.logWrite(fmt.Sprintln("Container pre-create hook error: ", hookError))
	}

	containerCreateResp, err := dc.client.ContainerCreate(dc.ctx, containerConfig, hostConfig, nil, nil, name)
	if err != nil {
		dc.logWrite(fmt.Sprintln("Container create failed: ", err))
	}
	containers, err := dc.client.ContainerList(dc.ctx, types.ContainerListOptions{
		All:     true,
		Filters: filters.NewArgs(filters.KeyValuePair{Key: "id", Value: containerCreateResp.ID}),
	})

	if hookError := execHooks(dc, dc.hooksPostCreate); hookError != nil {
		dc.logWrite(fmt.Sprintln("Container post-create hook error: ", err))
	}

	if err != nil {
		dc.logWrite(fmt.Sprintf("Container list failed: %s", err.Error()))
	}

	if len(containers) != 1 {
		dc.logWrite("Container was not created.")
		return nil, errors.New("container was not created")
	}

	dc.containerID = &containers[0].ID
	attachNetworks(dc)

	return NewDockerContainer(&containers[0], &dc.hooksPreStart, &dc.hooksPostStart, &dc.mountList), nil
}

func (dc *DockerContainerBuilder) CreateAndStart() (Container, error) {
	cont, err := dc.Create()
	if err != nil {
		return nil, err
	}
	err = cont.Start(dc.ctx, dc.client)

	return cont, err
}

func (dc *DockerContainerBuilder) CreateAndStartWaitUntilExit() (Container, *WaitResult, error) {
	cont, err := dc.Create()
	if err != nil {
		return nil, nil, err
	}
	res, err := cont.StartWaitUntilExit(dc.ctx, dc.client)
	if err != nil {
		return cont, res, err
	}

	if res.StatusCode == 0 {
		return cont, res, err
	}
	logReader, err := dc.client.ContainerLogs(dc.ctx, *cont.GetContainerID(), types.ContainerLogsOptions{ShowStdout: true, ShowStderr: true})
	if err != nil {
		return cont, res, err
	}

	defer logdefer.LogDeferredErr(logReader.Close, log.Debug(), "could not close log reader")

	logs, err := io.ReadAll(logReader)
	res.Logs = strings.Split(string(logs), "\n")

	return cont, res, err
}

func prepareImage(dc *DockerContainerBuilder, imageName string) error {
	pullRequired, err := needToPullImage(dc.ctx, dc.logger, imageName)
	if err != nil {
		return err
	}

	if pullRequired || dc.forcePull {
		err = imageHelper.Pull(dc.ctx, dc.logger, imageName, dc.registryAuth)
		if err != nil && err.Error() != "EOF" {
			return fmt.Errorf("image pull error: %s", err.Error())
		}
	}

	return nil
}

func createNetworks(dc *DockerContainerBuilder) []string {
	networkIDs := []string{}

	for _, networkName := range dc.networks {
		filter := filters.NewArgs()
		filter.Add("name", fmt.Sprintf("^%s$", networkName))
		networks, err := dc.client.NetworkList(dc.ctx, types.NetworkListOptions{Filters: filter})
		if err != nil {
			dc.logWrite(fmt.Sprintln("Failed to create network: ", err.Error()))
			return nil
		}

		if len(networks) == 1 {
			networkIDs = append(networkIDs, networks[0].ID)
			continue
		}

		networkOpts := types.NetworkCreate{
			CheckDuplicate: true,
		}

		networkResult, err := dc.client.NetworkCreate(dc.ctx, networkName, networkOpts)
		if err != nil {
			dc.logWrite(fmt.Sprintln("Failed to create network: ", err.Error()))
			return nil
		}

		networkIDs = append(networkIDs, networkResult.ID)
	}

	return networkIDs
}

func attachNetworks(dc *DockerContainerBuilder) {
	if dc.networkIDs != nil {
		for _, networkID := range dc.networkIDs {
			endpointSettings := &network.EndpointSettings{
				Aliases: dc.networkAliases,
			}

			err := dc.client.NetworkConnect(dc.ctx, networkID, *dc.containerID, endpointSettings)
			if err != nil {
				dc.logWrite(fmt.Sprintln("Container network attach error: ", err))
			}
		}
	}
}

func execHooks(dc *DockerContainerBuilder, hooks []LifecycleFunc) error {
	for _, hook := range hooks {
		if err := hook(dc.ctx, dc.client, dc.containerName, dc.containerID, dc.mountList, &dc.logger); err != nil {
			return err
		}
	}
	return nil
}

func needToPullImage(ctx context.Context, logger io.StringWriter, imageName string) (bool, error) {
	ref, err := reference.ParseNamed(imageName)
	if err != nil {
		return false, err
	}

	imageExists, err := imageHelper.Exists(ctx, logger, reference.FamiliarString(ref))
	if err != nil {
		return false, err
	}
	if imageExists {
		return false, nil
	}

	imageExists, err = imageHelper.Exists(ctx, logger, ref.String())
	if err != nil {
		return false, err
	}
	return !imageExists, nil
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
		var portBinding []nat.PortBinding
		if p.PortBinding != nil {
			portExternal, _ := nat.NewPort("tcp", fmt.Sprint(*p.PortBinding))
			portBinding = []nat.PortBinding{
				{
					HostIP:   "0.0.0.0",
					HostPort: portExternal.Port(),
				},
			}

			portMap[portInternal] = portBinding
		}
	}

	return portMap
}

func getPortSet(portList []PortBinding) nat.PortSet {
	portSet := make(nat.PortSet)

	for _, port := range portList {
		exposedPort, _ := nat.NewPort("tcp", fmt.Sprint(port.ExposedPort))
		portSet[exposedPort] = struct{}{}
	}
	return portSet
}

func (dc *DockerContainerBuilder) logWrite(message string) {
	if dc.logger != nil {
		_, err := dc.logger.WriteString(message)
		if err != nil {
			//nolint
			fmt.Printf("Failed to write log: %s", err.Error())
		}
	}
}
