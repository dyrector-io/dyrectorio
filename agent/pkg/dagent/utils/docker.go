package utils

import (
	"archive/tar"
	"bytes"
	"context"
	"encoding/base64"
	"encoding/binary"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"os"
	"path"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/dyrector-io/dyrectorio/agent/internal/dogger"
	"github.com/dyrector-io/dyrectorio/agent/internal/mapper"
	"github.com/dyrector-io/dyrectorio/agent/internal/util"
	v1 "github.com/dyrector-io/dyrectorio/agent/pkg/api/v1"
	"github.com/dyrector-io/dyrectorio/agent/pkg/dagent/caps"
	"github.com/dyrector-io/dyrectorio/agent/pkg/dagent/config"
	"github.com/dyrector-io/dyrectorio/protobuf/go/crux"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/filters"
	"github.com/docker/docker/api/types/mount"
	"github.com/docker/docker/client"
)

const DockerClientTimeoutSeconds = 30

var val time.Duration = (time.Duration(DockerClientTimeoutSeconds) * time.Second)
var containerTimeout *time.Duration = &val

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
		log.Println("Could not get server version ", err.Error())
	}

	return DockerVersion{ClientVersion: cli.ClientVersion(), ServerVersion: server.Version}, err
}

func ListContainers() ([]types.Container, error) {
	ctx := context.Background()
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		panic(err)
	}

	containers, err := cli.ContainerList(ctx, types.ContainerListOptions{All: true})

	checkDockerError(err)

	return containers, err
}

func GetContainersByName(name string) []types.Container {
	ctx := context.Background()
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())

	if err != nil {
		panic(err)
	}

	containers, err := cli.ContainerList(ctx, types.ContainerListOptions{
		All:     true,
		Filters: filters.NewArgs(filters.KeyValuePair{Key: "name", Value: name}),
	})

	checkDockerError(err)

	return containers
}

func GetContainersByNameCrux(name string) []*crux.ContainerStatusItem {
	containers := GetContainersByName(name)

	return mapper.MapContainerStatus(&containers)
}

func GetContainer(name string) []types.Container {
	containers := GetContainersByName(name)
	containers = FilterContainerByName(containers, name)

	return containers
}

func FilterContainerByName(containers []types.Container, name string) (ret []types.Container) {
	for i := range containers {
		for j := range containers[i].Names {
			if strings.ReplaceAll(containers[i].Names[j], "/", "") == name {
				ret = append(ret, containers[i])
			}
		}
	}
	return ret
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
		Tail:       strconv.FormatUint(uint64(tail), 10), //nolint:gomnd
	}

	logs, err := cli.ContainerLogs(ctx, name, options)
	checkDockerError(err)
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
	container, filename string, meta v1.UploadFileData, fileSize int64, data io.Reader) error {
	var buf bytes.Buffer
	tarWriter := tar.NewWriter(&buf)

	tarHeader := &tar.Header{
		Name:    filename,
		Mode:    0644,
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
	checkDockerError(err)

	return inspection
}

// ImagePullResponse is not explicit
type ImagePullResponse struct {
	ID             string `json:"id"`
	Status         string `json:"status"`
	ProgressDetail struct {
		Current int64 `json:"current"`
		Total   int64 `json:"total"`
	} `json:"progressDetail"`
	Progress string `json:"progress"`
}

// force pulls the given image name
func PullImage(dog *dogger.DeploymentLogger, fullyQualifiedImageName, authCreds string) error {
	ctx := context.Background()

	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	checkDockerError(err)

	dog.Write("Pulling image: " + fullyQualifiedImageName)
	reader, err := cli.ImagePull(ctx, fullyQualifiedImageName, types.ImagePullOptions{RegistryAuth: authCreds})
	if err != nil {
		return err
	}
	defer reader.Close()

	d := json.NewDecoder(reader)

	for {
		pullResult := ImagePullResponse{}
		err = d.Decode(&pullResult)
		if err == io.EOF {
			break
		} else if err != nil {
			log.Println("decode error: " + err.Error())
			break
		}

		if pullResult.ProgressDetail.Current != 0 && pullResult.ProgressDetail.Total != 0 {
			dog.Write(
				fmt.Sprintf("Image: %s %s  %0.2f%%",
					pullResult.ID,
					pullResult.Status,
					float64(pullResult.ProgressDetail.Current)/float64(pullResult.ProgressDetail.Total)*100)) //nolint:gomnd
		} else {
			dog.Write(fmt.Sprintf("Image: %s %s", pullResult.ID, pullResult.Status))
		}
		time.Sleep(time.Second)
	}

	return err
}

func logDeployInfo(dog *dogger.DeploymentLogger, deployImageRequest *v1.DeployImageRequest, image *util.ImageURI, containerName string) {
	reqID := deployImageRequest.RequestID

	if reqID != "" {
		log.Println("requestID: ", reqID)
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
}

func DeployImage(ctx context.Context,
	dog *dogger.DeploymentLogger,
	deployImageRequest *v1.DeployImageRequest,
	versionData *v1.VersionData,
	config *config.Configuration) error {
	containerName := getContainerName(deployImageRequest)

	image, _ := util.ImageURIFromString(
		util.JoinV("/",
			*deployImageRequest.Registry,
			util.JoinV(":", deployImageRequest.ImageName, deployImageRequest.Tag)))

	logDeployInfo(dog, deployImageRequest, image, containerName)
	labels, _ := GetImageLabels(image.String())

	caps.ParseLabelsIntoContainerConfig(labels, &deployImageRequest.ContainerConfig)

	envList := MergeStringMapToUniqueSlice(
		EnvPipeSeparatedToStringMap(&deployImageRequest.InstanceConfig.Environment),
		EnvPipeSeparatedToStringMap(&deployImageRequest.ContainerConfig.Environment),
	)

	mountList := mountStrToDocker(
		// volumes are mapped into the legacy format, until further support of different types is needed
		append(deployImageRequest.ContainerConfig.Mounts, volumesToMounts(deployImageRequest.ContainerConfig.Volumes)...),
		deployImageRequest.InstanceConfig.ContainerPreName,
		deployImageRequest.ContainerConfig.Container,
		config)
	// dotnet specific magic
	if containsConfig(mountList) {
		var err error
		mountList, err = createRuntimeConfigFileOnHost(
			mountList,
			deployImageRequest.ContainerConfig.Container,
			deployImageRequest.InstanceConfig.ContainerPreName,
			string(deployImageRequest.RuntimeConfig),
			config,
		)
		if err != nil {
			dog.Write("could not create config file\n", err.Error())
		}
	}

	state, _ := CheckContainer(deployImageRequest.RequestID, containerName)
	// err is ignored because it means no container is available
	// nothing to stop or remove then

	if err := checkContainerState(dog, containerName, state); err != nil {
		return err
	}

	dog.WriteContainerStatus(state)

	networkMode := deployImageRequest.ContainerConfig.NetworkMode

	if deployImageRequest.ContainerConfig.Expose {
		networkMode = "traefik"
	}
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	checkDockerError(err)

	builder := NewDockerBuilder(cli, config)

	builder.WithImage(image.String()).
		WithName(containerName).
		WithMountPoints(mountList).
		WithPortBindings(deployImageRequest.ContainerConfig.Ports).
		WithPortRanges(deployImageRequest.ContainerConfig.PortRanges).
		WithNetworkMode(networkMode).
		WithRegistryAuth(deployImageRequest.RegistryAuth).
		WithRestartPolicy(deployImageRequest.ContainerConfig.RestartPolicy).
		WithEnv(envList).
		WithLabels(GetTraefikLabels(&deployImageRequest.InstanceConfig, &deployImageRequest.ContainerConfig, config)).
		WithLogConfig(deployImageRequest.ContainerConfig.LogConfig).
		WithUser(deployImageRequest.ContainerConfig.User).
		WithEntrypoint(deployImageRequest.ContainerConfig.Command).
		WithCmd(deployImageRequest.ContainerConfig.Args).
		WithDogger(dog)

	if deployImageRequest.ContainerConfig.ImportContainer != nil {
		builder.WithImportContainer(*deployImageRequest.ContainerConfig.ImportContainer)
	}

	builder.Create(ctx)

	_, err = builder.Start()

	if err != nil {
		dog.Write(err.Error())
		dog.WriteContainerStatus(state, "Container start error: "+containerName)
		return err
	}

	dog.WriteContainerStatus(state, "Started container: "+containerName)

	if versionData != nil {
		DraftRelease(deployImageRequest.InstanceConfig.ContainerPreName, *versionData, v1.DeployVersionResponse{}, config)
	}

	return err
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

func checkContainerState(dog *dogger.DeploymentLogger, containerName, state string) error {
	switch state {
	case "exited", "created":
		if err := remoteLogsDecorator(dog, removeContainer, containerName); err != nil {
			return err
		}
	case "running", "restarting":
		if err := remoteLogsDecorator(dog, stopContainer, containerName); err != nil {
			return err
		}
		if err := remoteLogsDecorator(dog, removeContainer, containerName); err != nil {
			return err
		}
	}
	return nil
}

func mountStrToDocker(mountIn []string, containerPreName, containerName string, config *config.Configuration) []mount.Mount {
	// bind mounts created this way
	// volumes are also an option - not a bad one, host mount is not really
	var mountList []mount.Mount

	for i := 0; i < len(mountIn); i++ {
		mountStr := mountIn[i]
		if strings.ContainsRune(mountStr, '|') {
			mountSplit := strings.Split(mountStr, "|")
			if len(mountSplit[0]) > 0 && len(mountSplit[1]) > 0 {
				containerPath := path.Join(config.InternalMountPath, containerPreName, containerName, mountSplit[0])
				hostPath := path.Join(config.HostMountPath, containerPreName, containerName, mountSplit[0])
				_, err := os.Stat(containerPath)
				if os.IsNotExist(err) {
					if err := os.MkdirAll(containerPath, os.ModePerm); err != nil {
						panic(err)
					}
				}
				mountList = append(mountList, mount.Mount{Type: mount.TypeBind, Source: hostPath, Target: mountSplit[1]})
			} else {
				log.Println("Empty values in mountList")
			}
		}
	}

	return mountList
}

func createRuntimeConfigFileOnHost(mounts []mount.Mount, containerName, containerPreName,
	runtimeConfig string, config *config.Configuration) ([]mount.Mount, error) {
	if len(runtimeConfig) > 0 {
		configDir := path.Join(config.InternalMountPath, containerPreName, containerName, "config")
		_, err := os.Stat(configDir)
		if os.IsNotExist(err) {
			log.Println("creating diretory: ", configDir)
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

func checkDockerError(err error) {
	if err != nil {
		if client.IsErrConnectionFailed(err) {
			log.Println("Could not connect to docker socket/host.")
		}
	}
}

func CheckContainer(requestID, containerName string) (string, error) {
	containers := GetContainer(containerName)

	var container types.Container
	if len(containers) > 1 {
		// multiple containers
		return "", errors.New("multiple match")
	} else if len(containers) == 0 {
		// not found
		return "", errors.New("not found")
	} else {
		container = containers[0]
	}

	return container.State, nil
}

func DeleteContainer(containerName string) error {
	if err := stopContainer(containerName); err != nil {
		return err
	}

	if err := removeContainer(containerName); err != nil {
		return err
	}

	return nil
}

func remoteLogsDecorator(dog *dogger.DeploymentLogger, fn func(string) error, containerName string) error {
	dog.Write("Container request for: " + containerName)
	if err := fn(containerName); err != nil {
		return err
	}
	// not really an information
	// dog.Write("Request for container [" + containerName + "] is finished.")

	return nil
}

func stopContainer(containerName string) error {
	ctx := context.Background()

	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		panic(err)
	}

	if err := cli.ContainerStop(ctx, containerName, containerTimeout); err != nil {
		return err
	}

	return nil
}

func removeContainer(containerName string) error {
	ctx := context.Background()

	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		panic(err)
	}

	if err := cli.ContainerRemove(ctx, containerName, types.ContainerRemoveOptions{}); err != nil {
		return err
	}

	return nil
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

// todo(nandi): refactor this into unmarshalling
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

func RegistryAuthBase64(user, password string) string {
	if user == "" || password == "" {
		return ""
	}

	authConfig := types.AuthConfig{
		Username: user,
		Password: password,
	}
	encodedJSON, err := json.Marshal(authConfig)
	if err != nil {
		log.Println(err)
		return ""
	}
	return base64.URLEncoding.EncodeToString(encodedJSON)
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
	} else {
		return nil, errors.New("no labels")
	}
}
