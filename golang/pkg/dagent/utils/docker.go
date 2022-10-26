package utils

import (
	"archive/tar"
	"bytes"
	"context"
	"encoding/binary"
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
	"github.com/dyrector-io/dyrectorio/golang/internal/mapper"
	"github.com/dyrector-io/dyrectorio/golang/internal/util"
	containerbuilder "github.com/dyrector-io/dyrectorio/golang/pkg/builder/container"
	"github.com/dyrector-io/dyrectorio/golang/pkg/dagent/caps"
	"github.com/dyrector-io/dyrectorio/golang/pkg/dagent/config"
	"github.com/dyrector-io/dyrectorio/protobuf/go/common"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/filters"
	"github.com/docker/docker/api/types/mount"
	"github.com/docker/docker/client"
)

type DockerVersion struct {
	ServerVersion string
	ClientVersion string
}

func GetServerInformation() (DockerVersion, error) {
	ctx := context.Background()
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		panic(err)
	}

	server, err := cli.ServerVersion(ctx)
	if err != nil {
		log.Error().Stack().Err(err).Msg("Could not get server version")
	}

	return DockerVersion{ClientVersion: cli.ClientVersion(), ServerVersion: server.Version}, err
}

func GetContainerLogs(name string, skip, take uint) []string {
	ctx := context.Background()

	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		panic(err)
	}

	tail := skip + take

	options := types.ContainerLogsOptions{
		ShowStderr: true,
		ShowStdout: true,
		Tail:       strconv.FormatUint(uint64(tail), 10),
	}

	logs, err := cli.ContainerLogs(ctx, name, options)
	if err != nil {
		log.Err(err).Stack().Send()
	}
	defer logs.Close()

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

	log.Printf("Writing %d bytes to %s", tarHeader.Size, filepath.Join(meta.FilePath, filename))
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
	image *imageHelper.URI,
	containerName string,
) {
	reqID := deployImageRequest.RequestID

	if reqID != "" {
		log.Info().Str("requestID", reqID).Send()
	}
	dog.Write(
		fmt.Sprintln("Starting container: ", containerName),
		fmt.Sprintln("Using image: ", image.String()),
	)

	labels, _ := GetImageLabels(image.String())
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

	if len(deployImageRequest.ContainerConfig.InitContainers) > 0 {
		dog.Write("WARNING: missing implementation: initContainers!")
	}
}

func DeployImage(ctx context.Context,
	dog *dogger.DeploymentLogger,
	deployImageRequest *v1.DeployImageRequest,
	versionData *v1.VersionData,
) error {
	containerName := getContainerName(deployImageRequest)
	cfg := grpc.GetConfigFromContext(ctx).(*config.Configuration)

	image, _ := imageHelper.URIFromString(
		util.JoinV("/",
			*deployImageRequest.Registry,
			util.JoinV(":", deployImageRequest.ImageName, deployImageRequest.Tag)))
	logDeployInfo(dog, deployImageRequest, image, containerName)

	envMap := MergeStringMapUnique(
		EnvPipeSeparatedToStringMap(&deployImageRequest.InstanceConfig.Environment),
		EnvPipeSeparatedToStringMap(&deployImageRequest.ContainerConfig.Environment))
	secret, err := crypt.DecryptSecrets(deployImageRequest.ContainerConfig.Secrets, &cfg.CommonConfiguration)
	if err != nil {
		return fmt.Errorf("deployment failed, secret error: %w", err)
	}
	envMap = MergeStringMapUnique(envMap, mapper.ByteMapToStringMap(secret))
	envList := EnvMapToSlice(envMap)

	mountList := mountStrToDocker(
		// volumes are mapped into the legacy format, until further support of different types is needed
		append(deployImageRequest.ContainerConfig.Mounts, volumesToMounts(deployImageRequest.ContainerConfig.Volumes)...),
		deployImageRequest.InstanceConfig.ContainerPreName,
		deployImageRequest.ContainerConfig.Container,
		cfg)
	// dotnet specific magic
	if containsConfig(mountList) {
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

	matchedContainer, err := dockerHelper.GetContainerByName(ctx, dog, containerName)
	if err != nil {
		return err
	}
	err = dockerHelper.DeleteContainerByName(ctx, dog, containerName)
	if err != nil {
		return err
	}
	dog.WriteContainerState(matchedContainer.State)

	networkMode, networks := setNetwork(deployImageRequest)

	builder := containerbuilder.NewDockerBuilder(ctx)

	labels, err := setImageLabels(image.String(), deployImageRequest, cfg)
	if err != nil {
		return fmt.Errorf("error building lables: %w", err)
	}

	builder.WithImage(image.String()).
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

	WithImportContainer(builder, deployImageRequest.ContainerConfig.ImportContainer, dog, cfg)

	builder.Create()

	_, err = builder.Start()

	if err != nil {
		dog.Write(err.Error())
		dog.WriteContainerState(matchedContainer.State, "Container start error: "+containerName)
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

func WithImportContainer(dc *containerbuilder.DockerContainerBuilder, importConfig *v1.ImportContainer,
	dog *dogger.DeploymentLogger, cfg *config.Configuration,
) {
	if importConfig != nil {
		dc.WithPreStartHooks(func(ctx context.Context,
			client *client.Client,
			containerName string,
			containerId *string,
			mountList []mount.Mount,
			logger *io.StringWriter,
		) error {
			if initError := spawnInitContainer(ctx, client, containerName, mountList, importConfig, dog, cfg); initError != nil {
				dog.WriteDeploymentStatus(common.DeploymentStatus_FAILED, "Failed to spawn init container: "+initError.Error())
				return initError
			}
			dog.WriteDeploymentStatus(common.DeploymentStatus_IN_PROGRESS, "Loading assets was successful.")
			return nil
		})
	}
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
				hostPath := path.Join(cfg.DataMountPath, containerPreName, containerName, mountSplit[0])
				_, err := os.Stat(containerPath)
				if os.IsNotExist(err) {
					if err := os.MkdirAll(containerPath, os.ModePerm); err != nil {
						panic(err)
					}
				}
				mountList = append(mountList, mount.Mount{Type: mount.TypeBind, Source: hostPath, Target: mountSplit[1]})
			} else {
				log.Print("Empty values in mountList")
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
			log.Info().Str("configDir", configDir).Msg("creating directory")
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

// TODO(nandor-magyar): refactor this into unmarshalling
// `[]"VARIABLE|value"` pair mapped into a string keyed map, collision is ignored, the latter value is used
func EnvPipeSeparatedToStringMap(envIn *[]string) map[string]string {
	envList := make(map[string]string)

	if envIn != nil {
		for _, e := range *envIn {
			if strings.ContainsRune(e, '|') {
				eSplit := strings.Split(e, "|")
				envList[eSplit[0]] = eSplit[1]
			}
		}
	}

	return envList
}

func GetImageLabels(fullyQualifiedImageName string) (map[string]string, error) {
	ctx := context.Background()
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		panic(err)
	}

	res, _, err := cli.ImageInspectWithRaw(ctx, fullyQualifiedImageName)
	if res.Config != nil && res.Config.Labels != nil {
		return res.Config.Labels, err
	}
	return map[string]string{}, nil
}

func setImageLabels(image string, deployImageRequest *v1.DeployImageRequest, cfg *config.Configuration) (map[string]string, error) {
	// parse image labels
	labels, err := GetImageLabels(image)
	if err != nil {
		return nil, fmt.Errorf("error get image labels: %w", err)
	}

	caps.ParseLabelsIntoContainerConfig(labels, &deployImageRequest.ContainerConfig)

	// add traefik related labels to the container if expose true
	if deployImageRequest.ContainerConfig.Expose {
		maps.Copy(labels, GetTraefikLabels(&deployImageRequest.InstanceConfig, &deployImageRequest.ContainerConfig, cfg))
	}

	// set organization labels to the container
	organizationLabels, err := SetOrganizationLabel("container.prefix", deployImageRequest.InstanceConfig.ContainerPreName)
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

		secretKeysList, err := SetOrganizationLabel("secret.keys", strings.Join(secretKeys, ","))
		if err != nil {
			return nil, fmt.Errorf("setting secret list: %s", err.Error())
		}
		maps.Copy(labels, secretKeysList)
	}

	maps.Copy(labels, deployImageRequest.ContainerConfig.Labels.Deployment)

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
		log.Printf("Container does not exist for prefix-name: '%s-%s'", prefix, name)
		return nil, nil
	}

	container := containers[0]

	if val, ok := GetOrganizationLabel(container.Labels, "secret.keys"); ok {
		return strings.Split(val, ","), nil
	}

	return []string{}, nil
}
