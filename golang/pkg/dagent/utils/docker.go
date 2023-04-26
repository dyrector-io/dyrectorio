package utils

import (
	"archive/tar"
	"bufio"
	"bytes"
	"context"
	"encoding/binary"
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/rs/zerolog/log"
	"golang.org/x/exp/maps"

	v1 "github.com/dyrector-io/dyrectorio/golang/api/v1"
	"github.com/dyrector-io/dyrectorio/golang/internal/crypt"
	"github.com/dyrector-io/dyrectorio/golang/internal/dogger"
	"github.com/dyrector-io/dyrectorio/golang/internal/grpc"
	dockerHelper "github.com/dyrector-io/dyrectorio/golang/internal/helper/docker"
	imageHelper "github.com/dyrector-io/dyrectorio/golang/internal/helper/image"
	"github.com/dyrector-io/dyrectorio/golang/internal/label"
	"github.com/dyrector-io/dyrectorio/golang/internal/logdefer"
	"github.com/dyrector-io/dyrectorio/golang/internal/mapper"
	"github.com/dyrector-io/dyrectorio/golang/internal/util"
	containerbuilder "github.com/dyrector-io/dyrectorio/golang/pkg/builder/container"
	"github.com/dyrector-io/dyrectorio/golang/pkg/dagent/caps"
	"github.com/dyrector-io/dyrectorio/golang/pkg/dagent/config"
	"github.com/dyrector-io/dyrectorio/protobuf/go/agent"
	"github.com/dyrector-io/dyrectorio/protobuf/go/common"

	"github.com/docker/docker/api/types"
	dockerContainer "github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/filters"
	"github.com/docker/docker/api/types/mount"
	"github.com/docker/docker/client"
)

const DockerLogHeaderLength = 8

type DockerVersion struct {
	ServerVersion string
	ClientVersion string
}

func GetContainerLogs(name string, skip, take uint) []string {
	ctx := context.Background()

	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		panic(err)
	}

	const BASE = 10
	tail := skip + take

	options := types.ContainerLogsOptions{
		ShowStderr: true,
		ShowStdout: true,
		Tail:       strconv.FormatUint(uint64(tail), BASE),
	}

	logs, err := cli.ContainerLogs(ctx, name, options)
	if err != nil {
		log.Err(err).Stack().Send()
	}
	defer logdefer.LogDeferredErr(logs.Close, log.Warn(), "error closing container log reader")

	return ReadDockerLogsFromReadCloser(logs, int(skip), int(take))
}

func ReadDockerLogsFromReadCloser(logs io.ReadCloser, skip, take int) []string {
	output := make([]string, 0)
	eofReached := false

	// [8]byte{STREAM_TYPE, 0, 0, 0, SIZE1, SIZE2, SIZE3, SIZE4}[]byte{OUTPUT}
	//
	// STREAM_TYPE can be 1 for stdout and 2 for stderr
	//
	// SIZE1, SIZE2, SIZE3, and SIZE4 are four bytes of uint32 encoded as big endian.
	// This is the size of OUTPUT.
	//
	// for more info see: docker's Client.ContainerLogs()
	const headerSize = 8
	header := make([]byte, headerSize)
	for !eofReached {
		_, err := logs.Read(header)
		if err != nil {
			if err != io.EOF {
				panic(err)
			}

			break
		}

		count := binary.BigEndian.Uint32(header[4:])
		data := make([]byte, count)
		_, err = logs.Read(data)

		if err != nil {
			if err != io.EOF {
				panic(err)
			}

			eofReached = true
		}

		output = append(output, string(data))
	}

	length := len(output)

	skip = length - skip
	if skip < 0 {
		skip = 0
	}

	take = skip - take
	if take < 0 {
		take = 0
	}

	return output[take:skip]
}

func CopyToContainer(ctx context.Context, name string, meta v1.UploadFileData, fileHeader *multipart.FileHeader) error {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		panic(err)
	}

	f, err := fileHeader.Open()
	if err != nil {
		return err
	}
	defer f.Close()

	err = WriteContainerFile(ctx, cli, name, fileHeader.Filename, meta, fileHeader.Size, f)
	if err != nil {
		return err
	}

	return nil
}

func WriteContainerFile(ctx context.Context, cli *client.Client,
	container, filename string, meta v1.UploadFileData, fileSize int64, data io.Reader,
) error {
	var buf bytes.Buffer
	tarWriter := tar.NewWriter(&buf)

	tarHeader := &tar.Header{
		Name:    filename,
		Mode:    0o644,
		Size:    fileSize,
		Uid:     meta.UID,
		Gid:     meta.GID,
		ModTime: time.Now(),
	}
	if err := tarWriter.WriteHeader(tarHeader); err != nil {
		return err
	}
	if _, err := io.Copy(tarWriter, data); err != nil {
		return err
	}
	if err := tarWriter.Close(); err != nil {
		return err
	}

	log.Debug().Int64("bytes", tarHeader.Size).Str("path", filepath.Join(meta.FilePath, filename)).Msg("Writing file")
	reader := bytes.NewReader(buf.Bytes())

	err := cli.CopyToContainer(ctx, container, meta.FilePath, reader, types.CopyToContainerOptions{})
	return err
}

func InspectContainer(name string) types.ContainerJSON {
	ctx := context.Background()

	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		panic(err)
	}

	inspection, err := cli.ContainerInspect(ctx, name)
	if err != nil {
		log.Err(err).Stack().Send()
	}

	return inspection
}

func logDeployInfo(
	dog *dogger.DeploymentLogger,
	deployImageRequest *v1.DeployImageRequest,
	expandedImageName string,
	containerName string,
) {
	reqID := deployImageRequest.RequestID

	if reqID != "" {
		log.Info().Str("requestID", reqID).Send()
	}
	dog.Write(
		fmt.Sprintln("Starting container: ", containerName),
		fmt.Sprintln("Using image: ", expandedImageName),
	)

	labels, _ := GetImageLabels(expandedImageName)
	if len(labels) > 0 {
		labelsLog := []string{"Image labels:"}
		for key, label := range labels {
			labelsLog = append(labelsLog, fmt.Sprintf("%s: %s", key, label))
		}
		dog.Write(labelsLog...)
	}

	dog.Write("Start container request for: " + containerName)
	if deployImageRequest.ContainerConfig.RestartPolicy != "" {
		dog.Write(fmt.Sprintf("Using restart policy: %v", deployImageRequest.ContainerConfig.RestartPolicy))
	}

	if deployImageRequest.ContainerConfig.User != nil {
		dog.Write(fmt.Sprintf("User: %v", *deployImageRequest.ContainerConfig.User))
	}
}

func buildMountList(cfg *config.Configuration, dog *dogger.DeploymentLogger, deployImageRequest *v1.DeployImageRequest) []mount.Mount {
	mountList := mountStrToDocker(
		// volumes are mapped into the legacy format, until further support of different types is needed
		append(deployImageRequest.ContainerConfig.Mounts, volumesToMounts(deployImageRequest.ContainerConfig.Volumes)...),
		deployImageRequest.InstanceConfig.ContainerPreName,
		deployImageRequest.ContainerConfig.Container,
		cfg)
	// dotnet specific magic
	if containsConfig(mountList) {
		var err error
		mountList, err = createRuntimeConfigFileOnHost(
			mountList,
			deployImageRequest.ContainerConfig.Container,
			deployImageRequest.InstanceConfig.ContainerPreName,
			string(deployImageRequest.RuntimeConfig),
			cfg,
		)
		if err != nil {
			dog.Write("could not create config file\n", err.Error())
		}
	}

	return mountList
}

func DeployImage(ctx context.Context,
	dog *dogger.DeploymentLogger,
	deployImageRequest *v1.DeployImageRequest,
	versionData *v1.VersionData,
) error {
	containerName := getContainerName(deployImageRequest)
	cfg := grpc.GetConfigFromContext(ctx).(*config.Configuration)

	imageName := util.JoinV("/",
		*deployImageRequest.Registry,
		util.JoinV(":", deployImageRequest.ImageName, deployImageRequest.Tag))

	expandedImageName, err := imageHelper.ExpandImageName(imageName)
	if err != nil {
		return fmt.Errorf("deployment failed, image name error: %w", err)
	}

	log.Debug().Str("name", imageName).Str("full", expandedImageName).Msg("Image name parsed")

	logDeployInfo(dog, deployImageRequest, expandedImageName, containerName)

	envMap := MergeStringMapUnique(
		mapper.PipeSeparatedToStringMap(&deployImageRequest.InstanceConfig.Environment),
		mapper.PipeSeparatedToStringMap(&deployImageRequest.ContainerConfig.Environment))
	secret, err := crypt.DecryptSecrets(deployImageRequest.ContainerConfig.Secrets, &cfg.CommonConfiguration)
	if err != nil {
		return fmt.Errorf("deployment failed, secret error: %w", err)
	}

	envMap = MergeStringMapUnique(envMap, mapper.ByteMapToStringMap(secret))
	envList := EnvMapToSlice(envMap)
	mountList := buildMountList(cfg, dog, deployImageRequest)

	matchedContainer, err := dockerHelper.GetContainerByName(ctx, containerName)
	if err != nil {
		dog.WriteContainerState("", fmt.Sprintf("Failed to find container: %s", containerName))
		return err
	}

	if matchedContainer != nil {
		dog.WriteContainerState(matchedContainer.State)

		err = dockerHelper.DeleteContainerByID(ctx, dog, matchedContainer.ID)
		if err != nil {
			dog.WriteContainerState("", fmt.Sprintf("Failed to delete container (%s): %s", containerName, err.Error()))
			return err
		}
	}

	builder := containerbuilder.NewDockerBuilder(ctx)
	networkMode, networks := setNetwork(deployImageRequest)
	labels, err := setImageLabels(expandedImageName, deployImageRequest, cfg)
	if err != nil {
		return fmt.Errorf("error building lables: %w", err)
	}

	builder.WithImage(expandedImageName).
		WithName(containerName).
		WithMountPoints(mountList).
		WithPortBindings(deployImageRequest.ContainerConfig.Ports).
		WithPortRanges(deployImageRequest.ContainerConfig.PortRanges).
		WithNetworkMode(networkMode).
		WithNetworks(networks).
		WithNetworkAliases(containerName, deployImageRequest.ContainerConfig.Container).
		WithRegistryAuth(deployImageRequest.RegistryAuth).
		WithRestartPolicy(deployImageRequest.ContainerConfig.RestartPolicy).
		WithEnv(envList).
		WithLabels(labels).
		WithLogConfig(deployImageRequest.ContainerConfig.LogConfig).
		WithUser(deployImageRequest.ContainerConfig.User).
		WithEntrypoint(deployImageRequest.ContainerConfig.Command).
		WithCmd(deployImageRequest.ContainerConfig.Args).
		WithoutConflict().
		WithLogWriter(dog)

	WithInitContainers(builder, &deployImageRequest.ContainerConfig, dog, cfg)

	cont, err := builder.CreateAndStart()
	if err != nil {
		dog.WriteContainerState("", fmt.Sprintf("Failed to start container (%s): %s", containerName, err.Error()))
		return err
	}

	matchedContainer, err = dockerHelper.GetContainerByID(ctx, *cont.GetContainerID())
	if err != nil || matchedContainer == nil {
		dog.WriteContainerState("", fmt.Sprintf("Failed to find container (%s): %s", containerName, err.Error()))
		return err
	}

	dog.WriteContainerState(matchedContainer.State, "Started container: "+containerName)

	if versionData != nil {
		DraftRelease(deployImageRequest.InstanceConfig.ContainerPreName, *versionData, v1.DeployVersionResponse{}, cfg)
	}

	return err
}

func setNetwork(deployImageRequest *v1.DeployImageRequest) (networkMode string, networks []string) {
	if deployImageRequest.ContainerConfig.Expose {
		networkMode = "traefik"
	} else {
		networkMode = strings.ToLower(deployImageRequest.ContainerConfig.NetworkMode)
	}
	return networkMode, deployImageRequest.ContainerConfig.Networks
}

func WithInitContainers(dc containerbuilder.Builder, containerConfig *v1.ContainerConfig,
	dog *dogger.DeploymentLogger, cfg *config.Configuration,
) {
	initFuncs := []containerbuilder.LifecycleFunc{}
	if containerConfig.ImportContainer != nil {
		initFuncs = append(initFuncs,
			func(ctx context.Context, client client.APIClient,
				containerName string, containerId *string,
				mountList []mount.Mount, logger *io.StringWriter,
			) error {
				if initError := spawnImportContainer(ctx, client, containerName, mountList,
					containerConfig.ImportContainer, dog, cfg); initError != nil {
					dog.WriteDeploymentStatus(common.DeploymentStatus_FAILED, "Failed to spawn init container: "+initError.Error())
					return initError
				}
				dog.WriteDeploymentStatus(common.DeploymentStatus_IN_PROGRESS, "Loading assets was successful.")
				return nil
			})
	}

	if len(containerConfig.InitContainers) > 0 {
		initFuncs = append(initFuncs, func(ctx context.Context, client client.APIClient,
			containerName string, containerId *string,
			mountList []mount.Mount, logger *io.StringWriter,
		) error {
			for i := range containerConfig.InitContainers {
				err := spawnInitContainer(ctx, client, containerName, &containerConfig.InitContainers[i], MountListToMap(mountList), dog)
				if err != nil {
					return err
				}
			}
			dog.WriteDeploymentStatus(common.DeploymentStatus_IN_PROGRESS, "Init containers are started successfully.")
			return nil
		})
	}
	dc.WithPreStartHooks(initFuncs...)
}

func volumesToMounts(volumes []v1.Volume) []string {
	mounts := []string{}
	for i := range volumes {
		mounts = append(mounts, volumeToMount(&volumes[i]))
	}
	return mounts
}

func volumeToMount(vol *v1.Volume) string {
	mountStr := fmt.Sprintf("%s|%s", vol.Name, vol.Path)
	return mountStr
}

func getContainerName(deployImageRequest *v1.DeployImageRequest) string {
	containerName := ""

	if deployImageRequest.ContainerConfig.Container != "" {
		if deployImageRequest.InstanceConfig.MountPath != "" {
			containerName = util.JoinV("-", deployImageRequest.InstanceConfig.MountPath, deployImageRequest.ContainerConfig.Container)
		} else if deployImageRequest.InstanceConfig.ContainerPreName != "" {
			containerName = util.JoinV("-", deployImageRequest.InstanceConfig.ContainerPreName, deployImageRequest.ContainerConfig.Container)
		} else {
			containerName = deployImageRequest.ContainerConfig.Container
		}
	}
	return containerName
}

func containsConfig(mounts []mount.Mount) bool {
	for _, m := range mounts {
		if strings.Contains(m.Source, "config") {
			return true
		}
	}
	return false
}

func mountStrToDocker(mountIn []string, containerPreName, containerName string, cfg *config.Configuration) []mount.Mount {
	// bind mounts created this way
	// volumes are also an option - not a bad one, host mount is not really
	var mountList []mount.Mount

	for i := 0; i < len(mountIn); i++ {
		mountStr := mountIn[i]
		if strings.ContainsRune(mountStr, '|') {
			mountSplit := strings.Split(mountStr, "|")
			if len(mountSplit[0]) > 0 && len(mountSplit[1]) > 0 {
				containerPath := path.Join(cfg.InternalMountPath, containerPreName, containerName, mountSplit[0])
				hostPath := ""
				if strings.HasPrefix(mountSplit[0], "/") {
					hostPath = mountSplit[0]
				} else {
					hostPath = path.Join(cfg.DataMountPath, containerPreName, containerName, mountSplit[0])
				}
				_, err := os.Stat(containerPath)
				if os.IsNotExist(err) {
					if err := os.MkdirAll(containerPath, os.ModePerm); err != nil {
						panic(err)
					}
				}
				mountList = append(mountList, mount.Mount{Type: mount.TypeBind, Source: hostPath, Target: mountSplit[1]})
			} else {
				log.Warn().Msg("Empty values in mountList")
			}
		}
	}

	return mountList
}

func createRuntimeConfigFileOnHost(mounts []mount.Mount, containerName, containerPreName,
	runtimeConfig string, cfg *config.Configuration,
) ([]mount.Mount, error) {
	if len(runtimeConfig) > 0 {
		configDir := path.Join(cfg.InternalMountPath, containerPreName, containerName, "config")
		_, err := os.Stat(configDir)
		if os.IsNotExist(err) {
			log.Info().Str("configDir", configDir).Msg("Creating directory")
			if err := os.MkdirAll(configDir, os.ModePerm); err != nil {
				panic(err)
			}
		}
		if err := os.WriteFile(path.Join(configDir, "appsettings.json"), []byte(runtimeConfig), os.ModePerm); err != nil {
			return mounts, err
		}
	}

	return mounts, nil
}

// EnvMapToSlice converts key:value map into ["key=value"] array
func EnvMapToSlice(envs map[string]string) []string {
	arr := []string{}

	for key, value := range envs {
		arr = append(arr, util.JoinV("=", key, value))
	}

	return arr
}

// Merging map `a` to map `b`. Keys in map `b` has precedence, if key occurs in both.
func MergeStringMapToUniqueSlice(src, dest map[string]string) []string {
	var slice []string

	dest = MergeStringMapUnique(src, dest)

	for key, value := range dest {
		slice = append(slice, fmt.Sprintf("%s=%s", key, value))
	}
	return slice
}

func MergeStringMapUnique(src, dest map[string]string) map[string]string {
	if dest == nil {
		dest = make(map[string]string)
	}
	for key, value := range src {
		if _, ok := dest[key]; !ok {
			dest[key] = value
		}
	}
	return dest
}

func GetImageLabels(expandedImageName string) (map[string]string, error) {
	ctx := context.Background()
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		panic(err)
	}

	res, _, err := cli.ImageInspectWithRaw(ctx, expandedImageName)
	if res.Config != nil && res.Config.Labels != nil {
		return res.Config.Labels, err
	}
	return map[string]string{}, nil
}

func setImageLabels(expandedImageName string,
	deployImageRequest *v1.DeployImageRequest,
	cfg *config.Configuration,
) (map[string]string, error) {
	// parse image labels
	labels, err := GetImageLabels(expandedImageName)
	if err != nil {
		return nil, fmt.Errorf("error get image labels: %w", err)
	}

	caps.ParseLabelsIntoContainerConfig(labels, &deployImageRequest.ContainerConfig)

	// add traefik related labels to the container if expose true
	if deployImageRequest.ContainerConfig.Expose {
		traefikLabels := GetTraefikLabels(&deployImageRequest.InstanceConfig,
			&deployImageRequest.ContainerConfig, cfg)
		maps.Copy(labels, traefikLabels)
	}

	// set organization labels to the container
	organizationLabels, err := SetOrganizationLabel(label.ContainerPrefix, deployImageRequest.InstanceConfig.ContainerPreName)
	if err != nil {
		return nil, fmt.Errorf("setting organization prefix: %s", err.Error())
	}
	maps.Copy(labels, organizationLabels)

	// set secret keys list
	if len(deployImageRequest.ContainerConfig.Secrets) > 0 {
		secretKeys := []string{}
		for secretKey := range deployImageRequest.ContainerConfig.Secrets {
			secretKeys = append(secretKeys, secretKey)
		}

		secretKeysList, err := SetOrganizationLabel(label.SecretKeys, strings.Join(secretKeys, ","))
		if err != nil {
			return nil, fmt.Errorf("setting secret list: %s", err.Error())
		}
		maps.Copy(labels, secretKeysList)
	}

	maps.Copy(labels, deployImageRequest.ContainerConfig.DockerLabels)

	return labels, nil
}

func SecretList(ctx context.Context, prefix, name string) ([]string, error) {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return nil, err
	}

	containers, err := cli.ContainerList(ctx, types.ContainerListOptions{
		All:     true,
		Filters: filters.NewArgs(filters.KeyValuePair{Key: "name", Value: fmt.Sprintf("^/?%s-%s$", prefix, name)}),
	})
	if err != nil {
		return nil, err
	}

	if len(containers) != 1 {
		log.Info().Str("prefix", prefix).Str("name", name).Msgf("Container does not exist for prefix-name: '%s-%s'", prefix, name)
		return nil, nil
	}

	container := containers[0]

	if val, ok := GetOrganizationLabel(container.Labels, label.SecretKeys); ok {
		return strings.Split(val, ","), nil
	}

	return []string{}, nil
}

func ContainerCommand(ctx context.Context, command *common.ContainerCommandRequest) error {
	operation := command.Operation

	prefix := command.Container.Prefix
	name := command.Container.Name

	container, err := GetContainerByPrefixAndName(ctx, prefix, name)
	if err != nil {
		return err
	}

	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return err
	}

	if operation == common.ContainerOperation_START_CONTAINER {
		err = cli.ContainerStart(ctx, container.ID, types.ContainerStartOptions{})
	} else if operation == common.ContainerOperation_STOP_CONTAINER {
		err = cli.ContainerStop(ctx, container.ID, dockerContainer.StopOptions{})
	} else if operation == common.ContainerOperation_RESTART_CONTAINER {
		err = cli.ContainerRestart(ctx, container.ID, dockerContainer.StopOptions{})
	} else {
		log.Error().Str("operation", operation.String()).Str("prefix", prefix).Str("name", name).Msg("Unknown operation")
	}

	return err
}

func DeleteContainers(ctx context.Context, request *common.DeleteContainersRequest) error {
	var err error
	if request.GetContainer() != nil {
		err = DeleteContainerByPrefixAndName(ctx, request.GetContainer().Prefix, request.GetContainer().Name)
	} else if request.GetPrefix() != "" {
		err = dockerHelper.DeleteContainersByLabel(ctx, label.GetPrefixLabelFilter(request.GetPrefix()))
	} else {
		log.Error().Msg("Unknown DeleteContainers request")
	}

	return err
}

type DockerContainerLogReader struct {
	EventChannel chan grpc.ContainerLogEvent
	Reader       io.ReadCloser

	grpc.ContainerLogReader
}

func (dockerReader *DockerContainerLogReader) Next() <-chan grpc.ContainerLogEvent {
	return dockerReader.EventChannel
}

func (dockerReader *DockerContainerLogReader) Close() error {
	return dockerReader.Reader.Close()
}

func streamDockerLog(reader io.ReadCloser, eventChannel chan grpc.ContainerLogEvent) {
	header := make([]byte, DockerLogHeaderLength)

	bufferSize := 2048
	buffer := make([]byte, bufferSize)

	for {
		_, err := reader.Read(header)
		if err != nil {
			eventChannel <- grpc.ContainerLogEvent{
				Message: "",
				Error:   err,
			}
			break
		}

		payloadSize := int(binary.BigEndian.Uint32(header[4:]))
		if payloadSize > bufferSize {
			buffer = make([]byte, payloadSize)
			bufferSize = payloadSize
		}

		read := 0
		for read < payloadSize {
			count, err := reader.Read(buffer[read:payloadSize])
			read += count

			if err != nil {
				eventChannel <- grpc.ContainerLogEvent{
					Message: "",
					Error:   err,
				}
				break
			}
		}

		if read > 0 {
			eventChannel <- grpc.ContainerLogEvent{
				Message: string(buffer[0:read]),
				Error:   nil,
			}
		}
	}
}

func streamDockerLogTTY(reader io.ReadCloser, eventChannel chan grpc.ContainerLogEvent) {
	buffer := bufio.NewReader(reader)

	for {
		message, err := buffer.ReadString('\n')
		if err != nil {
			eventChannel <- grpc.ContainerLogEvent{
				Message: "",
				Error:   err,
			}
			break
		}

		eventChannel <- grpc.ContainerLogEvent{
			Message: message,
			Error:   nil,
		}
	}
}

func ContainerLog(ctx context.Context, request *agent.ContainerLogRequest) (*grpc.ContainerLogContext, error) {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return nil, err
	}

	self, err := GetOwnContainer(ctx)
	if err != nil {
		if !errors.Is(err, &UnknownContainerError{}) {
			return nil, err
		}

		cfg := grpc.GetConfigFromContext(ctx).(*config.Configuration)
		if !cfg.Debug {
			return nil, err
		}

		self = &types.Container{}
	}

	prefix := request.Container.Prefix
	name := request.Container.Name

	container, err := GetContainerByPrefixAndName(ctx, prefix, name)
	if err != nil {
		return nil, fmt.Errorf("container not found: %w", err)
	}

	containerID := container.ID
	enableEcho := containerID != self.ID

	log.Trace().Str("prefix", prefix).Str("name", name).Str("selfContainerId", self.ID).Msgf("Container log echo enabled: %t", enableEcho)

	inspect, err := cli.ContainerInspect(ctx, containerID)
	if err != nil {
		return nil, err
	}

	tty := inspect.Config.Tty

	streaming := request.GetStreaming()
	tail := fmt.Sprintf("%d", request.GetTail())

	eventChannel := make(chan grpc.ContainerLogEvent)

	reader, err := cli.ContainerLogs(ctx, containerID, types.ContainerLogsOptions{
		ShowStderr: true,
		ShowStdout: true,
		Follow:     streaming,
		Tail:       tail,
		Timestamps: true,
	})
	if err != nil {
		return nil, err
	}

	if tty {
		go streamDockerLogTTY(reader, eventChannel)
	} else {
		go streamDockerLog(reader, eventChannel)
	}

	logReader := &DockerContainerLogReader{
		EventChannel: eventChannel,
		Reader:       reader,
	}

	logContext := &grpc.ContainerLogContext{
		Reader:     logReader,
		EnableEcho: enableEcho,
	}

	return logContext, nil
}
