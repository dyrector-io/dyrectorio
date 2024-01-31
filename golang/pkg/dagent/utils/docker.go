package utils

import (
	"archive/tar"
	"bufio"
	"bytes"
	"context"
	"encoding/binary"
	"encoding/json"
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
	"github.com/dyrector-io/dyrectorio/golang/internal/domain"
	"github.com/dyrector-io/dyrectorio/golang/internal/grpc"
	dockerHelper "github.com/dyrector-io/dyrectorio/golang/internal/helper/docker"
	imageHelper "github.com/dyrector-io/dyrectorio/golang/internal/helper/image"
	"github.com/dyrector-io/dyrectorio/golang/internal/label"
	"github.com/dyrector-io/dyrectorio/golang/internal/logdefer"
	"github.com/dyrector-io/dyrectorio/golang/internal/mapper"
	"github.com/dyrector-io/dyrectorio/golang/internal/util"
	"github.com/dyrector-io/dyrectorio/golang/pkg/builder/container"
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

const (
	ContainerHealthyStatus    = "healthy"
	ContainerStateWaitSeconds = 120
	TypeContainer             = "container"
)

var ErrUnknownContainer = errors.New("unknown container")

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

	return container.ReadDockerLogsFromReadCloser(logs, int(skip), int(take))
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
	cont, filename string, meta v1.UploadFileData, fileSize int64, data io.Reader,
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

	err := cli.CopyToContainer(ctx, cont, meta.FilePath, reader, types.CopyToContainerOptions{})
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

	if deployImageRequest.Registry == nil || *deployImageRequest.Registry == "" {
		dog.WriteInfo(
			fmt.Sprintf("Deploying container: %s", containerName),
			fmt.Sprintf("Using image: %s:%s", deployImageRequest.ImageName, deployImageRequest.Tag),
		)
	} else {
		dog.WriteInfo(
			fmt.Sprintf("Deploying container: %s", containerName),
			fmt.Sprintf("Using image: %s", expandedImageName),
		)
	}

	if deployImageRequest.ContainerConfig.RestartPolicy != "" {
		dog.WriteInfo(fmt.Sprintf("Using restart policy: %v", deployImageRequest.ContainerConfig.RestartPolicy))
	}

	if deployImageRequest.ContainerConfig.User != nil {
		dog.WriteInfo(fmt.Sprintf("Using user: %v", *deployImageRequest.ContainerConfig.User))
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
			dog.WriteError("could not create config file\n", err.Error())
		}
	}

	return mountList
}

func writeDoggerError(dog *dogger.DeploymentLogger, msg string, err error) {
	dog.WriteContainerState(common.ContainerState_CONTAINER_STATE_UNSPECIFIED, err.Error(), dogger.Error, msg)
}

func getImageNameFromRequest(deployImageRequest *v1.DeployImageRequest) (string, error) {
	imageName := util.JoinV(":", deployImageRequest.ImageName, deployImageRequest.Tag)
	if deployImageRequest.Registry != nil && *deployImageRequest.Registry != "" {
		imageName = util.JoinV("/", *deployImageRequest.Registry, imageName)
	}

	return imageHelper.ExpandImageName(imageName)
}

func expectedStateToProto(state *v1.ExpectedState) common.ContainerState {
	if state == nil {
		return common.ContainerState_RUNNING
	}

	switch state.State {
	case v1.Running:
		return common.ContainerState_RUNNING
	case v1.Waiting:
		return common.ContainerState_WAITING
	case v1.Exited:
		return common.ContainerState_EXITED
	case v1.Removed:
		return common.ContainerState_REMOVED
	default:
		return common.ContainerState_RUNNING
	}
}

func checkContainerState(ctx context.Context, cli *client.Client, expected *v1.ExpectedState, containerID string) (bool, error) {
	matchedContainer, err := dockerHelper.GetContainerByID(ctx, containerID)
	if err != nil {
		return false, err
	}

	currentState := mapper.MapDockerStateToCruxContainerState(matchedContainer.State)
	expectedState := expectedStateToProto(expected)

	if expectedState == common.ContainerState_EXITED {
		if currentState != common.ContainerState_EXITED {
			return false, nil
		}

		inspect, err := cli.ContainerInspect(ctx, containerID)
		if err != nil {
			return false, err
		}

		expectedCode := 0
		if expected.ExitCode != nil {
			expectedCode = int(*expected.ExitCode)
		}

		if inspect.State.ExitCode != expectedCode {
			return false, fmt.Errorf("unexpected exit code, actual: %d, expected: %d", inspect.State.ExitCode, expectedCode)
		}

		return true, nil
	}

	return currentState == expectedState, nil
}

func waitForContainer(
	ctx context.Context,
	cli *client.Client,
	containerID string,
	expected *v1.ExpectedState,
) error {
	finished, err := checkContainerState(ctx, cli, expected, containerID)
	if err != nil || finished {
		return err
	}

	errorChannel := make(chan error)

	timeoutSeconds := ContainerStateWaitSeconds
	if expected.Timeout != nil {
		timeoutSeconds = int(*expected.Timeout)
	}

	go func() {
		timeoutCtx, cancel := context.WithTimeout(ctx, time.Duration(timeoutSeconds)*time.Second)
		defer cancel()

		chanMessages, chanErrors := cli.Events(timeoutCtx, types.EventsOptions{
			Filters: filters.NewArgs(
				filters.KeyValuePair{
					Key:   TypeContainer,
					Value: containerID,
				}),
		})

		for {
			select {
			case <-timeoutCtx.Done():
				errorChannel <- fmt.Errorf("timeout while waiting for expected container state")
				return
			case eventError := <-chanErrors:
				errorChannel <- eventError
				return
			case eventMessage := <-chanMessages:
				if eventMessage.Type != TypeContainer {
					continue
				}

				finished, err := checkContainerState(timeoutCtx, cli, expected, containerID)
				if err != nil || finished {
					errorChannel <- err
					return
				}
			}
		}
	}()

	return <-errorChannel
}

//nolint:funlen,gocyclo // TODO(@nandor-magyar): refactor this function into smaller parts
func DeployImage(ctx context.Context,
	dog *dogger.DeploymentLogger,
	deployImageRequest *v1.DeployImageRequest,
	versionData *v1.VersionData,
) error {
	containerName := getContainerName(deployImageRequest)
	prefix := getContainerPrefix(deployImageRequest)
	err := domain.IsCompliantDNS(prefix)
	if err != nil {
		return fmt.Errorf("deployment failed, invalid prefix: %w", err)
	}
	err = domain.IsCompliantDNS(containerName)
	if err != nil {
		return fmt.Errorf("deployment failed, invalid container name: %w", err)
	}
	cfg := grpc.GetConfigFromContext(ctx).(*config.Configuration)

	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return err
	}

	expandedImageName, err := getImageNameFromRequest(deployImageRequest)
	if err != nil {
		return fmt.Errorf("deployment failed, image name error: %w", err)
	}

	log.Debug().Str("name", deployImageRequest.ImageName).Str("full", expandedImageName).Msg("Image name parsed")
	logDeployInfo(dog, deployImageRequest, expandedImageName, containerName)

	if len(deployImageRequest.InstanceConfig.SharedEnvironment) > 0 {
		err = WriteSharedEnvironmentVariables(
			cfg.InternalMountPath,
			prefix,
			deployImageRequest.InstanceConfig.SharedEnvironment)
		if err != nil {
			dog.WriteError("could not write shared environment variables, aborting...", err.Error())
			return err
		}
	}

	var envMap map[string]string

	if deployImageRequest.InstanceConfig.UseSharedEnvs {
		envMap, err = ReadSharedEnvironmentVariables(cfg.InternalMountPath,
			prefix)
		if err != nil {
			dog.WriteError("could not load shared environment variables, while useSharedEnvs is on, aborting...", err.Error())
			return err
		}
	} else {
		envMap = MergeStringMapUnique(deployImageRequest.InstanceConfig.SharedEnvironment,
			deployImageRequest.InstanceConfig.Environment)
	}
	envMap = MergeStringMapUnique(envMap, deployImageRequest.ContainerConfig.Environment)

	secret, err := crypt.DecryptSecrets(deployImageRequest.ContainerConfig.Secrets, &cfg.CommonConfiguration)
	if err != nil {
		return fmt.Errorf("deployment failed, secret error: %w", err)
	}

	envMap = MergeStringMapUnique(envMap, mapper.ByteMapToStringMap(secret))
	mountList := buildMountList(cfg, dog, deployImageRequest)

	matchedContainer, err := dockerHelper.GetContainerByName(ctx, cli, containerName)
	if err != nil {
		writeDoggerError(dog, fmt.Sprintf("Failed to find container: %s", containerName), err)
		return err
	}

	if matchedContainer != nil {
		dog.WriteContainerState(mapper.MapDockerStateToCruxContainerState(matchedContainer.State), matchedContainer.State, dogger.Info)

		err = dockerHelper.DeleteContainerByID(ctx, dog, matchedContainer.ID)
		if err != nil {
			writeDoggerError(dog, fmt.Sprintf("Failed to delete container (%s): %s", containerName, err.Error()), err)
			return err
		}
	}

	builder := container.NewDockerBuilder(ctx)
	networkMode, networks := setNetwork(deployImageRequest)
	labels, err := setImageLabels(expandedImageName, deployImageRequest, cfg)
	if err != nil {
		return fmt.Errorf("error building labels: %w", err)
	}

	builder.WithImage(expandedImageName).
		WithClient(cli).
		WithName(containerName).
		WithMountPoints(mountList).
		WithPortBindings(deployImageRequest.ContainerConfig.Ports).
		WithPortRanges(deployImageRequest.ContainerConfig.PortRanges).
		WithNetworkMode(networkMode).
		WithNetworks(networks).
		WithNetworkAliases(containerName, deployImageRequest.ContainerConfig.Container).
		WithRegistryAuth(deployImageRequest.RegistryAuth).
		WithRestartPolicy(deployImageRequest.ContainerConfig.RestartPolicy).
		WithEnv(EnvMapToSlice(envMap)).
		WithLabels(labels).
		WithLogConfig(deployImageRequest.ContainerConfig.LogConfig).
		WithUser(deployImageRequest.ContainerConfig.User).
		WithEntrypoint(deployImageRequest.ContainerConfig.Command).
		WithCmd(deployImageRequest.ContainerConfig.Args).
		WithWorkingDirectory(deployImageRequest.ContainerConfig.WorkingDirectory).
		WithoutConflict().
		WithLogWriter(dog).
		WithPullDisplayFunc(dog.WriteDockerPull)

	if deployImageRequest.Registry == nil || *deployImageRequest.Registry == "" {
		builder.WithImagePriority(imageHelper.LocalOnly)
	}

	WithInitContainers(builder, &deployImageRequest.ContainerConfig, dog, envMap, cfg)

	cont, err := builder.CreateAndStart()
	if err != nil {
		writeDoggerError(dog, fmt.Sprintf("Failed to start container (%s): %s", containerName, err.Error()), err)
		return err
	}

	matchedContainer, err = dockerHelper.GetContainerByID(ctx, *cont.GetContainerID())
	if err != nil || matchedContainer == nil {
		writeDoggerError(dog, fmt.Sprintf("Failed to find container (%s): %s", containerName, err.Error()), err)
		return err
	}

	dog.WriteContainerState(mapper.MapDockerStateToCruxContainerState(matchedContainer.State),
		matchedContainer.State, dogger.Info, "Started container: "+containerName)

	err = waitForContainer(ctx, cli, matchedContainer.ID, deployImageRequest.ContainerConfig.ExpectedState)
	if err != nil {
		return fmt.Errorf("expected container state failed: %w", err)
	}

	if versionData != nil {
		DraftRelease(deployImageRequest.InstanceConfig.ContainerPreName, *versionData, v1.DeployVersionResponse{}, cfg)
	}

	dog.WriteInfo(fmt.Sprintf("Container deployed: %s", containerName))

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

func WithInitContainers(dc container.Builder, containerConfig *v1.ContainerConfig,
	dog *dogger.DeploymentLogger, envMap map[string]string, cfg *config.Configuration,
) {
	initFuncs := []container.LifecycleFunc{}
	if containerConfig.ImportContainer != nil {
		initFuncs = append(initFuncs,
			func(ctx context.Context, client client.APIClient,
				parentCont container.ParentContainer,
			) error {
				if initError := spawnImportContainer(ctx, client, parentCont.Name, parentCont.MountList,
					containerConfig.ImportContainer, dog, cfg); initError != nil {
					dog.WriteDeploymentStatus(common.DeploymentStatus_FAILED, "Failed to spawn import container: "+initError.Error())
					return initError
				}
				dog.WriteDeploymentStatus(common.DeploymentStatus_IN_PROGRESS, "Loading assets was successful.")
				return nil
			})
	}

	if len(containerConfig.InitContainers) > 0 {
		initFuncs = append(initFuncs, func(ctx context.Context, client client.APIClient,
			parentCont container.ParentContainer,
		) error {
			for i := range containerConfig.InitContainers {
				var initContConfig *InitContainerConfig
				if containerConfig.InitContainers[i].UseParent {
					initContConfig = &InitContainerConfig{
						ParentName: parentCont.Name,
						MountMap:   MountListToMap(parentCont.MountList),
						Networks:   containerConfig.Networks,
						EnvList:    envMap,
					}
				} else {
					initContConfig = &InitContainerConfig{
						ParentName: parentCont.Name,
					}
				}
				err := spawnInitContainer(ctx, client, initContConfig, &containerConfig.InitContainers[i], dog)
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
	return util.JoinV("-", getContainerPrefix(deployImageRequest), deployImageRequest.ContainerConfig.Container)
}

func getContainerPrefix(deployImageRequest *v1.DeployImageRequest) string {
	containerPrefix := ""

	if deployImageRequest.ContainerConfig.Container != "" {
		if deployImageRequest.InstanceConfig.MountPath != "" {
			containerPrefix = deployImageRequest.InstanceConfig.MountPath
		} else if deployImageRequest.InstanceConfig.ContainerPreName != "" {
			containerPrefix = deployImageRequest.InstanceConfig.ContainerPreName
		}
	}
	return containerPrefix
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
		traefikLabels, labelErr := GetTraefikLabels(&deployImageRequest.InstanceConfig,
			&deployImageRequest.ContainerConfig, cfg)
		if labelErr != nil {
			return nil, labelErr
		}
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

	cont := containers[0]

	if val, ok := GetOrganizationLabel(cont.Labels, label.SecretKeys); ok {
		return strings.Split(val, ","), nil
	}

	return []string{}, nil
}

func ContainerCommand(ctx context.Context, command *common.ContainerCommandRequest) error {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return err
	}

	operation := command.Operation

	prefix := command.Container.Prefix
	name := command.Container.Name

	cont, err := GetContainerByPrefixAndName(ctx, cli, prefix, name)
	if err != nil {
		return err
	}

	if operation == common.ContainerOperation_START_CONTAINER {
		err = cli.ContainerStart(ctx, cont.ID, types.ContainerStartOptions{})
	} else if operation == common.ContainerOperation_STOP_CONTAINER {
		err = cli.ContainerStop(ctx, cont.ID, dockerContainer.StopOptions{})
	} else if operation == common.ContainerOperation_RESTART_CONTAINER {
		err = cli.ContainerRestart(ctx, cont.ID, dockerContainer.StopOptions{})
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

	self, err := GetOwnContainer(ctx, cli)
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

	cont, err := GetContainerByPrefixAndName(ctx, cli, prefix, name)
	if err != nil {
		return nil, fmt.Errorf("container not found: %w", err)
	}

	containerID := cont.ID
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
		Reader: logReader,
		Echo:   enableEcho,
	}

	return logContext, nil
}

func ContainerInspect(ctx context.Context, request *agent.ContainerInspectRequest) (string, error) {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return "", err
	}

	prefix := request.Container.Prefix
	name := request.Container.Name

	cont, err := GetContainerByPrefixAndName(ctx, cli, prefix, name)
	if cont == nil {
		return "", ErrUnknownContainer
	}
	if err != nil {
		return "", err
	}

	containerInfo, err := cli.ContainerInspect(ctx, cont.ID)
	if err != nil {
		return "", err
	}

	inspectionJSON, err := json.Marshal(containerInfo)
	if err != nil {
		return "", err
	}
	inspection := string(inspectionJSON)

	return inspection, nil
}
