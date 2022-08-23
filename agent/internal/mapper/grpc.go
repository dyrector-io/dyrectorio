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
	"github.com/dyrector-io/dyrectorio/protobuf/go/common"

	dockerTypes "github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
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
		ContainerConfig: MapContainerConfig(req),
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

func MapContainerConfig(in *agent.DeployRequest) v1.ContainerConfig {
	containerConfig := v1.ContainerConfig{
		Container:        in.Name,
		ContainerPreName: in.InstanceConfig.Prefix,
		Ports:            MapPorts(in.ContainerConfig.Ports),
		PortRanges:       MapPortRanges(in.ContainerConfig.PortRanges),
		Volumes:          MapVolumes(in.ContainerConfig.Volumes),
		User:             in.ContainerConfig.User,
	}

	if in.ContainerConfig.TTY != nil {
		containerConfig.TTY = *in.ContainerConfig.TTY
	}

	if in.ContainerConfig.Args != nil {
		containerConfig.Args = in.ContainerConfig.Args
	}

	if in.ContainerConfig.Command != nil {
		containerConfig.Command = in.ContainerConfig.Command
	}

	if in.ContainerConfig.Expose != nil {
		containerConfig.Expose = in.ContainerConfig.Expose.Public
		containerConfig.ExposeTLS = in.ContainerConfig.Expose.Tls
	}

	if in.ContainerConfig.Ingress != nil {
		containerConfig.IngressName = in.ContainerConfig.Ingress.Name
		containerConfig.IngressHost = in.ContainerConfig.Ingress.Host
		containerConfig.IngressUploadLimit = *in.ContainerConfig.Ingress.UploadLimit
	}

	if in.ContainerConfig.ConfigContainer != nil {
		containerConfig.ConfigContainer = MapConfigContainer(in.ContainerConfig.ConfigContainer)
	}

	dagentConfig := in.ContainerConfig.Dagent

	if dagentConfig != nil {
		containerConfig.NetworkMode = dagentConfig.NetworkMode.String()
		containerConfig.RestartPolicy = MapRestartPolicy(dagentConfig.RestartPolicy.String())

		if dagentConfig.LogConfig != nil {
			containerConfig.LogConfig = &container.LogConfig{Type: dagentConfig.LogConfig.Driver, Config: dagentConfig.LogConfig.Options}
		}
	}

	craneConfig := in.ContainerConfig.Crane

	if craneConfig != nil {
		containerConfig.DeploymentStrategy = craneConfig.DeploymentStatregy.String()

		if craneConfig.ProxyHeaders != nil {
			containerConfig.ProxyHeaders = *craneConfig.ProxyHeaders
		}

		if craneConfig.UseLoadBalancer != nil {
			containerConfig.UseLoadBalancer = *craneConfig.UseLoadBalancer
		}

		if craneConfig.HealthCheckConfig != nil {
			containerConfig.HealthCheckConfig = MapHealthCheckConfig(craneConfig.HealthCheckConfig)
		}

		if craneConfig.ResourceConfig != nil {
			containerConfig.ResourceConfig = MapResourceConfig(craneConfig.ResourceConfig)
		}

		if craneConfig.ExtraLBAnnotations != nil {
			containerConfig.ExtraLBAnnotations = craneConfig.ExtraLBAnnotations
		}
	}

	return containerConfig
}

func MapRestartPolicy(policy string) builder.RestartPolicyName {
	lower := strings.ToLower(policy)

	return builder.RestartPolicyName(strings.Replace(lower, "_", "-", -1))
}

func MapResourceConfig(resourceConfig *common.ResourceConfig) v1.ResourceConfig {
	mappedConfig := v1.ResourceConfig{}

	if resourceConfig.Limits != nil {
		mappedConfig.Limits = v1.Resources{}

		if resourceConfig.Limits.Cpu != nil {
			mappedConfig.Limits.CPU = *resourceConfig.Limits.Cpu
		}

		if resourceConfig.Limits.Memory != nil {
			mappedConfig.Limits.Memory = *resourceConfig.Limits.Memory
		}
	}

	if resourceConfig.Requests != nil {
		mappedConfig.Requests = v1.Resources{}

		if resourceConfig.Requests.Cpu != nil {
			mappedConfig.Requests.CPU = *resourceConfig.Requests.Cpu
		}

		if resourceConfig.Requests.Memory != nil {
			mappedConfig.Requests.Memory = *resourceConfig.Requests.Memory
		}
	}

	return mappedConfig
}

func MapHealthCheckConfig(healthCheckConfig *common.HealthCheckConfig) v1.HealthCheckConfig {
	mappedConfig := v1.HealthCheckConfig{
		Port: uint16(healthCheckConfig.Port),
	}

	if healthCheckConfig.LivenessProbe != nil {
		mappedConfig.LivenessProbe = &v1.Probe{Path: *healthCheckConfig.LivenessProbe}
	}

	if healthCheckConfig.ReadinessProbe != nil {
		mappedConfig.ReadinessProbe = &v1.Probe{Path: *healthCheckConfig.ReadinessProbe}
	}

	if healthCheckConfig.StartupProbe != nil {
		mappedConfig.StartupProbe = &v1.Probe{Path: *healthCheckConfig.StartupProbe}
	}

	return mappedConfig
}

func MapVolumes(in []*common.Volume) []v1.Volume {
	volumes := []v1.Volume{}

	for i := range in {
		volume := v1.Volume{
			Name: in[i].Name,
			Path: in[i].Path,
		}

		if in[i].Class != nil {
			volume.Class = *in[i].Class
		}

		if in[i].Size != nil {
			volume.Size = *in[i].Size
		}

		if in[i].Type != nil {
			volume.Type = *in[i].Type
		}

		volumes = append(volumes, volume)
	}

	return volumes
}

func MapPortRanges(in []*common.PortRangeBinding) []builder.PortRangeBinding {
	portRanges := []builder.PortRangeBinding{}

	for i := range in {
		portRanges = append(portRanges, builder.PortRangeBinding{
			Internal: builder.PortRange{From: uint16(in[i].Internal.From), To: uint16(in[i].Internal.To)},
			External: builder.PortRange{From: uint16(in[i].External.From), To: uint16(in[i].External.To)},
		})
	}

	return portRanges
}

func MapPorts(in []*common.Port) []builder.PortBinding {
	ports := []builder.PortBinding{}

	for i := range in {
		ports = append(ports, builder.PortBinding{
			ExposedPort: uint16(in[i].Internal),
			PortBinding: uint16(in[i].External),
		})
	}

	return ports
}

func MapConfigContainer(in *common.ConfigContainer) *v1.ConfigContainer {
	return &v1.ConfigContainer{
		Image:     in.Image,
		Volume:    in.Volume,
		Path:      in.Path,
		KeepFiles: in.KeepFiles,
	}
}

func MapContainerState(in *[]dockerTypes.Container) []*common.ContainerStateItem {
	list := []*common.ContainerStateItem{}

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

		list = append(list, &common.ContainerStateItem{
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

func MapContainerPorts(in *[]dockerTypes.Port) []*common.Port {
	ports := []*common.Port{}

	for i := range *in {
		it := (*in)[i]

		ports = append(ports, &common.Port{
			Internal: int32(it.PrivatePort),
			External: int32(it.PublicPort),
		})
	}

	return ports
}

func MapKubeDeploymentListToCruxStateItems(deployments *appsv1.DeploymentList) []*common.ContainerStateItem {
	stateItems := []*common.ContainerStateItem{}

	for i := range deployments.Items {
		stateItems = append(stateItems, &common.ContainerStateItem{
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
func MapKubeStatusToCruxContainerState(status appsv1.DeploymentStatus) common.ContainerState {
	switch status.ReadyReplicas {
	case 1:
		return common.ContainerState_RUNNING
	case 0:
		return common.ContainerState_DEAD
	}
	return common.ContainerState_UNKNOWN_CONTAINER_STATE
}
