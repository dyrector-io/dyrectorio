package mapper

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/AlekSi/pointer"
	"github.com/rs/zerolog/log"
	"google.golang.org/protobuf/types/known/timestamppb"

	v1 "github.com/dyrector-io/dyrectorio/golang/api/v1"
	"github.com/dyrector-io/dyrectorio/golang/internal/config"
	imageHelper "github.com/dyrector-io/dyrectorio/golang/internal/helper/image"
	"github.com/dyrector-io/dyrectorio/golang/internal/util"

	builder "github.com/dyrector-io/dyrectorio/golang/pkg/builder/container"
	"github.com/dyrector-io/dyrectorio/protobuf/go/agent"
	"github.com/dyrector-io/dyrectorio/protobuf/go/common"

	dockerTypes "github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/iancoleman/strcase"
	appsv1 "k8s.io/api/apps/v1"
	corev1 "k8s.io/api/core/v1"
)

var ErrNoTargetContainerOrPrefix = errors.New("no target container or prefix")

func MapDeployImage(prefix string, req *agent.DeployWorkloadRequest, appConfig *config.CommonConfiguration) *v1.DeployImageRequest {
	res := &v1.DeployImageRequest{
		RequestID: req.Id,
		InstanceConfig: v1.InstanceConfig{
			UseSharedEnvs:     false,
			Environment:       map[string]string{},
			SharedEnvironment: map[string]string{},
			ContainerPreName:  prefix,
		},
		ContainerConfig: mapContainerConfig(prefix, req),
		ImageName:       req.ImageName,
		Tag:             req.Tag,
		Registry:        req.Registry,
	}

	if req.RegistryAuth != nil {
		res.RegistryAuth = &imageHelper.RegistryAuth{
			Name:     req.RegistryAuth.Name,
			URL:      req.RegistryAuth.Url,
			User:     req.RegistryAuth.User,
			Password: req.RegistryAuth.Password,
		}
	}

	v1.SetDeploymentDefaults(res, appConfig)

	if req.Registry != nil {
		res.Registry = req.Registry
	}
	return res
}

func mapContainerConfig(prefix string, in *agent.DeployWorkloadRequest) v1.ContainerConfig {
	cc := in.Common

	containerConfig := v1.ContainerConfig{
		Container:        cc.Name,
		ContainerPreName: prefix,
		Ports:            MapPorts(cc.Ports),
		PortRanges:       mapPortRanges(cc.PortRanges),
		Volumes:          mapVolumes(cc.Volumes),
		User:             cc.User,
		Secrets:          cc.Secrets,
		InitContainers:   mapInitContainers(cc.InitContainers),
		ImportContainer:  mapImportContainer(in.Common.ImportContainer),
	}

	if cc.Environment != nil {
		containerConfig.Environment = cc.Environment
	}

	if cc.TTY != nil {
		containerConfig.TTY = *cc.TTY
	}

	if cc.WorkingDirectory != nil {
		containerConfig.WorkingDirectory = *cc.WorkingDirectory
	}

	if cc.Args != nil {
		containerConfig.Args = cc.Args
	}

	if cc.Commands != nil {
		containerConfig.Command = cc.Commands
	}

	if cc.Expose != nil {
		containerConfig.Expose = *cc.Expose >= common.ExposeStrategy_EXPOSE
		containerConfig.ExposeTLS = *cc.Expose == common.ExposeStrategy_EXPOSE_WITH_TLS
	}

	if cc.Routing != nil {
		if domain := pointer.GetString(cc.Routing.Domain); domain != "" {
			if splitDomain := strings.Split(domain, "."); len(splitDomain) > 1 {
				containerConfig.IngressName = splitDomain[0]
				containerConfig.IngressHost = util.JoinV(".", splitDomain[1:]...)
			} else {
				containerConfig.IngressHost = pointer.GetString(cc.Routing.Domain)
			}
		}

		containerConfig.IngressUploadLimit = pointer.GetString(cc.Routing.UploadLimit)
		containerConfig.IngressPath = pointer.GetString(cc.Routing.Path)
		containerConfig.IngressStripPath = pointer.GetBool(cc.Routing.StripPath)
		containerConfig.IngressPort = uint16(pointer.GetUint32(cc.Routing.Port)) //#nosec G115
	}

	if cc.ConfigContainer != nil {
		containerConfig.ConfigContainer = mapConfigContainer(cc.ConfigContainer)
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
		containerConfig.RestartPolicy = container.RestartPolicyMode(ProtoEnumToKebabCase(dagent.RestartPolicy.String()))
	}

	if dagent.LogConfig != nil {
		containerConfig.LogConfig = &container.LogConfig{
			Type:   ProtoEnumToKebabCase(strings.TrimPrefix(dagent.LogConfig.Driver.String(), "DRIVER_TYPE_")),
			Config: dagent.LogConfig.Options,
		}
	}

	if dagent.Labels != nil {
		containerConfig.DockerLabels = dagent.Labels
	}

	if dagent.ExpectedState != nil {
		containerConfig.ExpectedState = &v1.ExpectedState{
			State:    mapContainerState(dagent.ExpectedState.State),
			Timeout:  dagent.ExpectedState.Timeout,
			ExitCode: dagent.ExpectedState.ExitCode,
		}
	}
}

func ProtoEnumToKebabCase(in string) string {
	res := strings.ToLower(strings.ReplaceAll(in, "_", "-"))
	if strings.Contains(res, "unspecified") || strings.Contains(res, "undefined") {
		return ""
	}
	return res
}

func mapCraneConfig(crane *agent.CraneContainerConfig, containerConfig *v1.ContainerConfig) {
	containerConfig.DeploymentStrategy = strcase.ToCamel(crane.DeploymentStrategy.String())

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

	if crane.Labels != nil {
		containerConfig.Labels = v1.Markers{
			Deployment: crane.Labels.Deployment,
			Service:    crane.Labels.Service,
			Ingress:    crane.Labels.Ingress,
		}
	}

	if crane.Annotations != nil {
		containerConfig.Annotations = v1.Markers{
			Deployment: crane.Annotations.Deployment,
			Service:    crane.Annotations.Service,
			Ingress:    crane.Annotations.Ingress,
		}
	}

	if crane.Metrics != nil {
		containerConfig.Metrics = &v1.Metrics{
			Path: crane.Metrics.Path,
			Port: int(crane.Metrics.Port),
		}
	}
}

func mapContainerState(state common.ContainerState) v1.ContainerState {
	switch state {
	case common.ContainerState_CONTAINER_STATE_UNSPECIFIED:
		return v1.Running
	case common.ContainerState_RUNNING:
		return v1.Running
	case common.ContainerState_EXITED:
		return v1.Exited
	case common.ContainerState_WAITING:
		return v1.Waiting
	case common.ContainerState_REMOVED:
		return v1.Removed
	default:
		return v1.Running
	}
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
		mappedConfig.Port = uint16(*healthCheckConfig.Port) //#nosec G115
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
			if *in[i].Type == common.VolumeType_MEM || *in[i].Type == common.VolumeType_TMP || *in[i].Type == common.VolumeType_SECRET {
				volume.Type = v1.VolumeType(strings.ToLower(in[i].Type.String()))
			} else {
				volume.Type = v1.VolumeType(in[i].Type.String())
			}
		}

		volumes = append(volumes, volume)
	}

	return volumes
}

func mapPortRanges(in []*agent.PortRangeBinding) []builder.PortRangeBinding {
	portRanges := []builder.PortRangeBinding{}

	for i := range in {
		portRanges = append(portRanges, builder.PortRangeBinding{
			Internal: builder.PortRange{From: uint16(in[i].Internal.From), To: uint16(in[i].Internal.To)}, //#nosec G115
			External: builder.PortRange{From: uint16(in[i].External.From), To: uint16(in[i].External.To)}, //#nosec G115
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

func MapPorts(in []*agent.Port) []builder.PortBinding {
	ports := []builder.PortBinding{}

	for i := range in {
		ports = append(ports, builder.PortBinding{
			ExposedPort: uint16(in[i].Internal),                                     //#nosec G115
			PortBinding: pointer.ToUint16OrNil(uint16(pointer.Get(in[i].External))), //#nosec G115
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
		containers = append(containers, v1.InitContainer{
			Name:      ic.Name,
			Image:     ic.Image,
			Command:   ic.Command,
			Volumes:   mapVolumeLinks(ic.Volumes),
			Args:      ic.Args,
			UseParent: pointer.GetBool(ic.UseParentConfig),
			Envs:      ic.Environment,
		})
	}

	return containers
}

func mapImportContainer(in *agent.ImportContainer) *v1.ImportContainer {
	if in == nil {
		return nil
	}

	return &v1.ImportContainer{
		Volume:       in.Volume,
		Command:      in.Command,
		Environments: in.Environment,
	}
}

func mapVolumeLinks(in []*agent.VolumeLink) []v1.VolumeLink {
	volumeLinks := []v1.VolumeLink{}

	for _, vl := range in {
		volumeLinks = append(volumeLinks, v1.VolumeLink{Name: vl.Name, Path: vl.Path})
	}

	return volumeLinks
}

func MapContainerState(it *dockerTypes.Container, prefix string) *common.ContainerStateItem {
	if it == nil {
		return nil
	}
	name := ""
	if len(it.Names) > 0 {
		name = strings.TrimPrefix(it.Names[0], "/")
	}

	if prefix != "" {
		name = strings.TrimPrefix(name, prefix+"-")
	}

	imageName := strings.Split(it.Image, ":")

	var imageTag string

	if len(imageName) > 1 {
		imageTag = imageName[1]
	} else {
		imageTag = "latest"
	}

	return &common.ContainerStateItem{
		Id: &common.ContainerIdentifier{
			Prefix: prefix,
			Name:   name,
		},
		Command:   it.Command,
		CreatedAt: timestamppb.New(time.UnixMilli(it.Created * int64(time.Microsecond)).UTC()),
		State:     MapDockerStateToCruxContainerState(it.State),
		Reason:    it.State,
		Status:    it.Status,
		Ports:     mapContainerPorts(&it.Ports),
		ImageName: imageName[0],
		ImageTag:  imageTag,
		Labels:    it.Labels,
	}
}

func MapContainerStateList(in []dockerTypes.Container, prefix string) []*common.ContainerStateItem {
	list := []*common.ContainerStateItem{}

	for i := range in {
		item := MapContainerState(&in[i], prefix)
		list = append(list, item)
	}

	return list
}

func mapContainerPorts(in *[]dockerTypes.Port) []*common.ContainerStateItemPort {
	ports := []*common.ContainerStateItemPort{}

	for i := range *in {
		it := (*in)[i]

		ports = append(ports, &common.ContainerStateItemPort{
			Internal: int32(it.PrivatePort),
			External: int32(it.PublicPort),
		})
	}

	return ports
}

func MapDeploymentLatestPodToStateItem(
	deployment *appsv1.Deployment,
	pods []corev1.Pod,
	svc map[string]*corev1.Service,
) (*common.ContainerStateItem, *corev1.Pod) {
	if len(pods) == 0 {
		return &common.ContainerStateItem{
			Id: &common.ContainerIdentifier{
				Prefix: deployment.Namespace,
				Name:   deployment.Name,
			},
			Command: "",
			CreatedAt: timestamppb.New(
				time.UnixMilli(deployment.GetCreationTimestamp().Unix() * int64(time.Microsecond)).UTC(),
			),
			State:     common.ContainerState_EXITED,
			Reason:    "",
			Status:    "",
			Ports:     []*common.ContainerStateItemPort{},
			ImageName: "",
			ImageTag:  "",
		}, nil
	}

	stateItem := &common.ContainerStateItem{
		Id: &common.ContainerIdentifier{
			Prefix: deployment.Namespace,
			Name:   deployment.Name,
		},
		State: common.ContainerState_CONTAINER_STATE_UNSPECIFIED,
		CreatedAt: timestamppb.New(
			time.UnixMilli(deployment.GetCreationTimestamp().Unix() * int64(time.Microsecond)).UTC(),
		),
		Ports:  []*common.ContainerStateItemPort{},
		Labels: deployment.Labels,
	}

	if containers := deployment.Spec.Template.Spec.Containers; containers != nil {
		for i := 0; i < len(containers); i++ {
			if containers[i].Name != deployment.Name {
				// this move was suggested by golangci
				continue
			}
			stateItem.Command = util.JoinV(" ", containers[i].Command...)

			fullName, err := imageHelper.ExpandImageName(containers[i].Image)
			if err != nil {
				log.Error().Stack().Err(err).Msg("Failed to get k8s container image info (failed to parse image name)")
				continue
			}

			name, tag, err := imageHelper.SplitImageName(fullName)
			if err != nil {
				log.Error().Stack().Err(err).Msg("Failed to get k8s container image info")
				continue
			}

			stateItem.ImageName = name
			stateItem.ImageTag = tag
		}
	}

	stateItem.Ports = mapServicePorts(svc[deployment.Name])

	var latestPod *corev1.Pod
	for index := range pods {
		pod := &pods[index]
		if latestPod == nil || pod.CreationTimestamp.After(latestPod.CreationTimestamp.Time) {
			latestPod = pod
		}
	}

	if latestPod != nil && len(latestPod.Status.ContainerStatuses) > 0 {
		err := mapKubeStatusToCruxContainerState(stateItem, latestPod.Status.ContainerStatuses[0].State)
		if err != nil {
			log.Error().Stack().Err(err).Msg("Failed to map k8s pod info")
			return nil, nil
		}
	}

	return stateItem, latestPod
}

func MapKubeDeploymentListToCruxStateItems(
	deployments *appsv1.DeploymentList,
	podsByDeployment map[string][]corev1.Pod,
	svcMap map[string]map[string]*corev1.Service,
) []*common.ContainerStateItem {
	stateItems := []*common.ContainerStateItem{}

	for i := range deployments.Items {
		deployment := &deployments.Items[i]
		fullName := fmt.Sprintf("%s-%s", deployment.Namespace, deployment.Name)
		pods, podsFound := podsByDeployment[fullName]
		if podsFound && len(pods) > 1 {
			log.Warn().Str("deployment", deployment.Name).Int("numberOfPods", len(pods)).Msg("More than one pod found for deployment")
		}

		svc := svcMap[deployment.Namespace]

		stateItem, _ := MapDeploymentLatestPodToStateItem(deployment, pods, svc)
		if stateItem != nil && stateItem.State != common.ContainerState_CONTAINER_STATE_UNSPECIFIED {
			stateItems = append(stateItems, stateItem)
		}
	}

	return stateItems
}

func CreateServiceMap(svc *corev1.ServiceList) map[string]map[string]*corev1.Service {
	res := map[string]map[string]*corev1.Service{}

	for i := range svc.Items {
		if res[svc.Items[i].Namespace] == nil {
			res[svc.Items[i].Namespace] = map[string]*corev1.Service{}
		}
		res[svc.Items[i].Namespace][svc.Items[i].Annotations["app"]] = &svc.Items[i]
	}
	return res
}

func mapServicePorts(svc *corev1.Service) []*common.ContainerStateItemPort {
	res := []*common.ContainerStateItemPort{}

	if svc == nil {
		return res
	}

	for _, port := range svc.Spec.Ports {
		res = append(res, &common.ContainerStateItemPort{
			Internal: port.TargetPort.IntVal,
			External: port.Port,
		})
	}

	return res
}

func mapKubeStatusToCruxContainerState(stateItem *common.ContainerStateItem, kubeContainerState corev1.ContainerState) error {
	if kubeContainerState.Running != nil {
		stateItem.State = common.ContainerState_RUNNING
		stateItem.Reason = "Started"

		return nil
	}
	if kubeContainerState.Terminated != nil {
		stateItem.State = common.ContainerState_EXITED
		stateItem.Reason = kubeContainerState.Terminated.Reason

		return nil
	}
	if kubeContainerState.Waiting != nil {
		stateItem.State = common.ContainerState_WAITING
		stateItem.Reason = kubeContainerState.Waiting.Reason

		return nil
	}

	return fmt.Errorf("unknown pod container state: %s", kubeContainerState.String())
}

func MapDockerStateToCruxContainerState(state string) common.ContainerState {
	switch state {
	case "created":
		return common.ContainerState_WAITING
	case "restarting":
		return common.ContainerState_WAITING
	case "running":
		return common.ContainerState_RUNNING
	case "removing":
		return common.ContainerState_WAITING
	case "paused":
		return common.ContainerState_WAITING
	case "exited":
		return common.ContainerState_EXITED
	case "dead":
		return common.ContainerState_EXITED
	default:
		return common.ContainerState_CONTAINER_STATE_UNSPECIFIED
	}
}

func MapDockerContainerEventToContainerState(event string) common.ContainerState {
	switch event {
	case "create":
		return common.ContainerState_WAITING
	case "destroy":
		return common.ContainerState_REMOVED
	case "pause":
		return common.ContainerState_WAITING
	case "restart":
		return common.ContainerState_RUNNING
	case "start":
		return common.ContainerState_RUNNING
	case "stop":
		return common.ContainerState_EXITED
	case "die":
		return common.ContainerState_EXITED
	case "kill":
		return common.ContainerState_WAITING
	default:
		return common.ContainerState_CONTAINER_STATE_UNSPECIFIED
	}
}

func MapContainerOrPrefixToPrefixName(target *common.ContainerOrPrefix) (string, string, error) {
	if target == nil {
		return "", "", ErrNoTargetContainerOrPrefix
	}

	if target.GetContainer() != nil {
		return target.GetContainer().GetPrefix(), target.GetContainer().Name, nil
	}

	if target.GetPrefix() == "" {
		return "", "", ErrNoTargetContainerOrPrefix
	}

	return target.GetPrefix(), "", nil
}
