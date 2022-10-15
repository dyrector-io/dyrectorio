package mapper

import (
	"fmt"

	"strings"
	"time"

	"google.golang.org/protobuf/types/known/timestamppb"

	v1 "github.com/dyrector-io/dyrectorio/agent/api/v1"
	"github.com/dyrector-io/dyrectorio/agent/internal/config"
	"github.com/dyrector-io/dyrectorio/agent/internal/dogger"
	"github.com/dyrector-io/dyrectorio/agent/internal/util"

	builder "github.com/dyrector-io/dyrectorio/agent/pkg/builder/container"
	"github.com/dyrector-io/dyrectorio/protobuf/go/agent"
	"github.com/dyrector-io/dyrectorio/protobuf/go/common"

	dockerTypes "github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	appsv1 "k8s.io/api/apps/v1"
)

func mapInstanceConfig(in *agent.InstanceConfig) v1.InstanceConfig {
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
		InstanceConfig:  mapInstanceConfig(req.InstanceConfig),
		ContainerConfig: mapContainerConfig(req),
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

func mapContainerConfig(in *agent.DeployRequest) v1.ContainerConfig {
	common := in.Common

	containerConfig := v1.ContainerConfig{
		Container:        *common.Name,
		ContainerPreName: in.InstanceConfig.Prefix,
		Ports:            MapPorts(common.Ports),
		PortRanges:       mapPortRanges(common.PortRanges),
		Volumes:          mapVolumes(common.Volumes),
		User:             common.User,
		Secrets:          common.Secrets,
		InitContainers:   mapInitContainers(common.InitContainers),
	}

	if common.Environments != nil {
		containerConfig.Environment = common.Environments
	}

	if common.TTY != nil {
		containerConfig.TTY = *common.TTY
	}

	if common.Args != nil {
		containerConfig.Args = common.Args
	}

	if common.Commands != nil {
		containerConfig.Command = common.Commands
	}

	if common.Expose != nil {
		containerConfig.Expose = *common.Expose > 1
		containerConfig.ExposeTLS = *common.Expose > 2
	}

	if common.Ingress != nil {
		containerConfig.IngressName = common.Ingress.Name
		containerConfig.IngressHost = common.Ingress.Host

		if common.Ingress.UploadLimit != nil {
			containerConfig.IngressUploadLimit = *common.Ingress.UploadLimit
		}
	}

	if common.ConfigContainer != nil {
		containerConfig.ConfigContainer = mapConfigContainer(common.ConfigContainer)
	}

	if in.Dagent != nil {
		mapDagentConfig(in.Dagent, &containerConfig)
	}

	if in.Crane != nil {
		mapCraneConfig(in.Crane, &containerConfig)
	}

	return containerConfig
}

func mapDagentConfig(dagent *agent.DagentContainerConfig, containerConfig *v1.ContainerConfig) {
	if dagent.NetworkMode != nil {
		containerConfig.NetworkMode = dagent.NetworkMode.String()
	}

	if dagent.Networks != nil {
		containerConfig.Networks = dagent.Networks
	}

	if dagent.RestartPolicy != nil {
		containerConfig.RestartPolicy = mapRestartPolicy(dagent.RestartPolicy.String())
	}

	if dagent.LogConfig != nil {
		containerConfig.LogConfig = &container.LogConfig{Type: dagent.LogConfig.Driver.String(),
			Config: dagent.LogConfig.Options}
	}
}

func mapCraneConfig(crane *agent.CraneContainerConfig, containerConfig *v1.ContainerConfig) {
	containerConfig.DeploymentStrategy = crane.DeploymentStatregy.String()

	if crane.ProxyHeaders != nil {
		containerConfig.ProxyHeaders = *crane.ProxyHeaders
	}

	if crane.UseLoadBalancer != nil {
		containerConfig.UseLoadBalancer = *crane.UseLoadBalancer
	}

	if crane.HealthCheckConfig != nil {
		containerConfig.HealthCheckConfig = mapHealthCheckConfig(crane.HealthCheckConfig)
	}

	if crane.ResourceConfig != nil {
		containerConfig.ResourceConfig = mapResourceConfig(crane.ResourceConfig)
	}

	if crane.ExtraLBAnnotations != nil {
		containerConfig.ExtraLBAnnotations = crane.ExtraLBAnnotations
	}
}

func mapRestartPolicy(policy string) builder.RestartPolicyName {
	lower := strings.ToLower(policy)

	return builder.RestartPolicyName(strings.Replace(lower, "_", "-", -1))
}

func mapResourceConfig(resourceConfig *common.ResourceConfig) v1.ResourceConfig {
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

func mapHealthCheckConfig(healthCheckConfig *common.HealthCheckConfig) v1.HealthCheckConfig {
	mappedConfig := v1.HealthCheckConfig{}

	if healthCheckConfig.Port != nil {
		mappedConfig.Port = uint16(*healthCheckConfig.Port)
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

func mapVolumes(in []*agent.Volume) []v1.Volume {
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
			volume.Type = in[i].Type.String()
		}

		volumes = append(volumes, volume)
	}

	return volumes
}

func mapPortRanges(in []*agent.PortRangeBinding) []builder.PortRangeBinding {
	portRanges := []builder.PortRangeBinding{}

	for i := range in {
		portRanges = append(portRanges, builder.PortRangeBinding{
			Internal: builder.PortRange{From: uint16(in[i].Internal.From), To: uint16(in[i].Internal.To)},
			External: builder.PortRange{From: uint16(in[i].External.From), To: uint16(in[i].External.To)},
		})
	}

	return portRanges
}

func MapSecrets(in []*common.UniqueKey) map[string]string {
	res := map[string]string{}

	for _, value := range in {
		res[value.GetKey()] = value.Id
	}

	return res
}

func mapEnvironments(in []*common.KeyValue) []string {
	res := []string{}

	for _, value := range in {
		res = append(res, value.Value)
	}

	return res
}

func MapPorts(in []*agent.Port) []builder.PortBinding {
	ports := []builder.PortBinding{}

	for i := range in {
		ports = append(ports, builder.PortBinding{
			ExposedPort: uint16(in[i].Internal),
			PortBinding: uint16(in[i].External),
		})
	}

	return ports
}

func mapConfigContainer(in *common.ConfigContainer) *v1.ConfigContainer {
	return &v1.ConfigContainer{
		Image:     in.Image,
		Volume:    in.Volume,
		Path:      in.Path,
		KeepFiles: in.KeepFiles,
	}
}

func mapInitContainers(in []*agent.InitContainer) []v1.InitContainer {
	containers := []v1.InitContainer{}

	for _, ic := range in {
		useParentConfig := false
		if ic.UseParentConfig != nil {
			useParentConfig = *ic.UseParentConfig
		}
		containers = append(containers, v1.InitContainer{
			Name:      ic.Name,
			Image:     ic.Image,
			Command:   ic.Command,
			Volumes:   mapVolumeLinks(ic.Volumes),
			Args:      ic.Args,
			UseParent: useParentConfig,
			Envs:      ic.Environments,
		})
	}

	return containers
}

func mapVolumeLinks(in []*agent.VolumeLink) []v1.VolumeLink {
	volumeLinks := []v1.VolumeLink{}

	for _, vl := range in {
		volumeLinks = append(volumeLinks, v1.VolumeLink{Name: vl.Name, Path: vl.Path})
	}

	return volumeLinks
}

func MapContainerState(in *[]dockerTypes.Container) []*agent.ContainerStateItem {
	list := []*agent.ContainerStateItem{}

	for i := range *in {
		it := (*in)[i]

		name := ""
		if len(it.Names) > 0 {
			const PARTS = 2
			splitted := strings.SplitN(it.Names[0], "/", PARTS)

			if len(splitted) == PARTS {
				name = splitted[1]
			} else {
				name = it.Names[0]
			}
		}

		imageName := strings.Split(it.Image, ":")

		var imageTag string

		if len(imageName) > 1 {
			imageTag = imageName[1]
		} else {
			imageTag = "latest"
		}

		list = append(list, &agent.ContainerStateItem{
			ContainerId: it.ID,
			Name:        name,
			Command:     it.Command,
			CreatedAt:   timestamppb.New(time.UnixMilli(it.Created * int64(time.Microsecond)).UTC()),
			State:       dogger.MapContainerState(it.State),
			Status:      it.Status,
			Ports:       mapContainerPorts(&it.Ports),
			ImageName:   imageName[0],
			ImageTag:    imageTag,
		})
	}

	return list
}

func mapContainerPorts(in *[]dockerTypes.Port) []*agent.Port {
	ports := []*agent.Port{}

	for i := range *in {
		it := (*in)[i]

		ports = append(ports, &agent.Port{
			Internal: int32(it.PrivatePort),
			External: int32(it.PublicPort),
		})
	}

	return ports
}

func MapKubeDeploymentListToCruxStateItems(deployments *appsv1.DeploymentList) []*agent.ContainerStateItem {
	stateItems := []*agent.ContainerStateItem{}

	for i := range deployments.Items {
		deployment := deployments.Items[i]

		stateItem := &agent.ContainerStateItem{
			Name:  deployment.Name,
			State: mapKubeStatusToCruxContainerState(deployment.Status),
			CreatedAt: timestamppb.New(
				time.UnixMilli(deployment.GetCreationTimestamp().Unix() * int64(time.Microsecond)).UTC(),
			),
		}

		if containers := deployment.Spec.Template.Spec.Containers; containers != nil {
			for i := 0; i < len(containers); i++ {
				if containers[i].Name != deployment.Name {
					// this move was suggested by golangci
					continue
				}
				image, err := util.ImageURIFromString(containers[i].Image)
				if err == nil {
					stateItem.ImageName = image.StringNoTag()
					stateItem.ImageTag = image.Tag
				} else {
					fmt.Println("Failed to get k8s container image info: ", err)
				}
			}
		}

		stateItems = append(stateItems, stateItem)
	}

	return stateItems
}

// do better mapping this is quick something
func mapKubeStatusToCruxContainerState(status appsv1.DeploymentStatus) common.ContainerState {
	switch status.ReadyReplicas {
	case 1:
		return common.ContainerState_RUNNING
	case 0:
		return common.ContainerState_DEAD
	}
	return common.ContainerState_UNKNOWN_CONTAINER_STATE
}
