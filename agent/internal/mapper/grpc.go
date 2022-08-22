package mapper

import (
	"fmt"

	"log"
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

func mapInstanceConfig(in *agent.DeployRequest_InstanceConfig) v1.InstanceConfig {
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
	cc := in.ContainerConfig

	containerConfig := v1.ContainerConfig{
		Container:        in.ContainerName,
		ContainerPreName: in.InstanceConfig.Prefix,
		Ports:            MapPorts(cc.Ports),
		PortRanges:       mapPortRanges(cc.PortRanges),
		Volumes:          mapVolumes(cc.Volumes),
		User:             cc.User,
		Secrets:          MapSecrets(cc.Secrets),
	}

	if cc.Environments != nil {
		containerConfig.Environment = cc.Environments
	}

	if cc.TTY != nil {
		containerConfig.TTY = *cc.TTY
	}

	if cc.Args != nil {
		containerConfig.Args = cc.Args
	}

	if cc.Command != nil {
		containerConfig.Command = cc.Command
	}

	if cc.Expose != nil {
		containerConfig.Expose = cc.Expose.Public
		containerConfig.ExposeTLS = cc.Expose.Tls
	}

	if cc.Ingress != nil {
		containerConfig.IngressName = cc.Ingress.Name
		containerConfig.IngressHost = cc.Ingress.Host

		if cc.Ingress.UploadLimit != nil {
			containerConfig.IngressUploadLimit = *cc.Ingress.UploadLimit
		}
	}

	if cc.ConfigContainer != nil {
		containerConfig.ConfigContainer = mapConfigContainer(cc.ConfigContainer)
	}

	if cc.Dagent != nil {
		mapDagentConfig(cc.Dagent, &containerConfig)
	}

	if cc.Crane != nil {
		mapCraneConfig(cc.Crane, &containerConfig)
	}

	return containerConfig
}

func mapDagentConfig(dagent *common.DagentContainerConfig, containerConfig *v1.ContainerConfig) {
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
		containerConfig.LogConfig = &container.LogConfig{Type: dagent.LogConfig.Driver, Config: dagent.LogConfig.Options}
	}
}

func mapCraneConfig(crane *common.CraneContainerConfig, containerConfig *v1.ContainerConfig) {
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

func mapVolumes(in []*common.Volume) []v1.Volume {
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

func mapPortRanges(in []*common.PortRangeBinding) []builder.PortRangeBinding {
	portRanges := []builder.PortRangeBinding{}

	for i := range in {
		portRanges = append(portRanges, builder.PortRangeBinding{
			Internal: builder.PortRange{From: uint16(in[i].Internal.From), To: uint16(in[i].Internal.To)},
			External: builder.PortRange{From: uint16(in[i].External.From), To: uint16(in[i].External.To)},
		})
	}

	return portRanges
}

func MapSecrets(in *common.KeyValueList) map[string]string {
	res := map[string]string{}

	for _, value := range in.GetData() {
		res[value.GetKey()] = value.GetValue()
	}

	log.Println("mapped secrets", res)
	return res
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

func mapConfigContainer(in *common.ConfigContainer) *v1.ConfigContainer {
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

		if len(imageName) > 1 {
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
			Ports:       mapContainerPorts(&it.Ports),
			ImageName:   imageName[0],
			ImageTag:    imageTag,
		})
	}

	return list
}

func mapContainerPorts(in *[]dockerTypes.Port) []*common.Port {
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
		deployment := deployments.Items[i]

		stateItem := &common.ContainerStateItem{
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
