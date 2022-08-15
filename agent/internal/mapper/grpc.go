package mapper

import (
	"strings"
	"time"

	"google.golang.org/protobuf/types/known/timestamppb"

	"github.com/dyrector-io/dyrectorio/agent/internal/config"
	"github.com/dyrector-io/dyrectorio/agent/internal/dogger"
	v1 "github.com/dyrector-io/dyrectorio/agent/pkg/api/v1"
	builder "github.com/dyrector-io/dyrectorio/agent/pkg/builder/container"
	"github.com/dyrector-io/dyrectorio/protobuf/go/agent"
	"github.com/dyrector-io/dyrectorio/protobuf/go/crux"

	dockerTypes "github.com/docker/docker/api/types"
	appsv1 "k8s.io/api/apps/v1"
)

func MapInstanceConfig(in *agent.DeployRequest_InstanceConfig) v1.InstanceConfig {
	instanceConfig := v1.InstanceConfig{
		ContainerPreName: in.Prefix,
	}

	if in.RepositoryPrefix != nil {
		instanceConfig.RepositoryPreName = *in.RepositoryPrefix
	}

	if in.MountPath != nil {
		instanceConfig.MountPath = *in.MountPath
	}

	if in.Environment != nil {
		instanceConfig.Environment = in.Environment.Env
	}

	return instanceConfig
}

func MapDeployImage(req *agent.DeployRequest, appConfig *config.CommonConfiguration) *v1.DeployImageRequest {
	res := &v1.DeployImageRequest{
		RequestID:       req.Id,
		InstanceConfig:  MapInstanceConfig(req.InstanceConfig),
		ContainerConfig: MapContainerConfig(req.ContainerConfig),
		ImageName:       req.ImageName,
		Tag:             req.Tag,
		Registry:        req.Registry,
	}

	if req.RegistryAuth != nil {
		res.RegistryAuth = &builder.RegistryAuth{
			Name:     req.RegistryAuth.Name,
			URL:      req.RegistryAuth.Url,
			User:     req.RegistryAuth.User,
			Password: req.RegistryAuth.Password,
		}
	}

	v1.SetDeploymentDefaults(res, appConfig)

	if req.RuntimeConfig != nil {
		res.RuntimeConfig = v1.Base64JSONBytes(*req.RuntimeConfig)
	}

	if req.Registry != nil {
		res.Registry = req.Registry
	}
	return res
}

func MapContainerConfig(in *agent.DeployRequest_ContainerConfig) v1.ContainerConfig {
	containerConfig := v1.ContainerConfig{
		Container: in.Name,
		Ports:     MapPorts(in.Ports),
		User:      &in.User,
	}

	if in.Prefix != nil {
		containerConfig.ContainerPreName = *in.Prefix
	}

	if in.Mounts != nil {
		containerConfig.Mounts = in.Mounts
	}

	if in.Environments != nil {
		containerConfig.Environment = in.Environments
	}

	if in.Expose != nil {
		containerConfig.Expose = in.Expose.Public
		containerConfig.ExposeTLS = in.Expose.Tls
	}

	if in.ConfigContainer != nil {
		containerConfig.ConfigContainer = MapConfigContainer(in.ConfigContainer)
	}

	return containerConfig
}

func MapPorts(in []*agent.DeployRequest_ContainerConfig_Port) []builder.PortBinding {
	ports := []builder.PortBinding{}

	for i := range in {
		ports = append(ports, builder.PortBinding{
			ExposedPort: uint16(in[i].Internal),
			PortBinding: uint16(in[i].External),
		})
	}

	return ports
}

func MapConfigContainer(in *agent.DeployRequest_ContainerConfig_ConfigContainer) *v1.ConfigContainer {
	return &v1.ConfigContainer{
		Image:     in.Image,
		Volume:    in.Volume,
		Path:      in.Path,
		KeepFiles: in.KeepFiles,
	}
}

func MapContainerState(in *[]dockerTypes.Container) []*crux.ContainerStateItem {
	list := []*crux.ContainerStateItem{}

	for i := range *in {
		it := (*in)[i]

		name := ""
		if len(it.Names) > 0 {
			name = it.Names[0]
		}

		imageName := strings.Split(it.Image, ":")

		var imageTag string

		if len(imageName) > 0 {
			imageTag = imageName[1]
		} else {
			imageTag = "latest"
		}

		list = append(list, &crux.ContainerStateItem{
			ContainerId: it.ID,
			Name:        name,
			Command:     it.Command,
			CreatedAt:   timestamppb.New(time.UnixMilli(it.Created * int64(time.Microsecond)).UTC()),
			State:       dogger.MapContainerState(it.State),
			Status:      it.Status,
			Ports:       MapContainerPorts(&it.Ports),
			ImageName:   imageName[0],
			ImageTag:    imageTag,
		})
	}

	return list
}

func MapContainerPorts(in *[]dockerTypes.Port) []*crux.ContainerPort {
	ports := []*crux.ContainerPort{}

	for i := range *in {
		it := (*in)[i]

		ports = append(ports, &crux.ContainerPort{
			Internal: int32(it.PrivatePort),
			External: int32(it.PublicPort),
		})
	}

	return ports
}

func MapKubeDeploymentListToCruxStateItems(deployments *appsv1.DeploymentList) []*crux.ContainerStateItem {
	stateItems := []*crux.ContainerStateItem{}

	for i := range deployments.Items {
		stateItems = append(stateItems, &crux.ContainerStateItem{
			Name:  deployments.Items[i].Name,
			State: MapKubeStatusToCruxContainerState(deployments.Items[i].Status),
			CreatedAt: timestamppb.New(
				time.UnixMilli(deployments.Items[i].GetCreationTimestamp().Unix() * int64(time.Microsecond)).UTC(),
			),
		})
	}

	return stateItems
}

// do better mapping this is quick something
func MapKubeStatusToCruxContainerState(status appsv1.DeploymentStatus) crux.ContainerState {
	switch status.ReadyReplicas {
	case 1:
		return crux.ContainerState_RUNNING
	case 0:
		return crux.ContainerState_DEAD
	}
	return crux.ContainerState_UNKNOWN_CONTAINER_STATE
}
