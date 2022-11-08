// Package util contains deployment types, middlewares, constants,
package v1

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/go-playground/validator/v10"
	"github.com/pkg/errors"
	"github.com/rs/zerolog/log"
	"k8s.io/apimachinery/pkg/api/resource"

	"github.com/docker/docker/api/types/container"

	"github.com/dyrector-io/dyrectorio/golang/internal/config"
	"github.com/dyrector-io/dyrectorio/golang/internal/util"
	builder "github.com/dyrector-io/dyrectorio/golang/pkg/builder/container"
)

type DeployImageRequest struct {
	RequestID       string                `json:"RequestId" binding:"required"`
	RegistryAuth    *builder.RegistryAuth `json:"RegistryAuth,omitempty"`
	InstanceConfig  InstanceConfig        `json:"InstanceConfig" binding:"required"`
	ContainerConfig ContainerConfig       `json:"ContainerConfig" binding:"required"`
	RuntimeConfig   Base64JSONBytes       `json:"RuntimeConfig,omitempty"`
	Registry        *string               `json:"Registry,omitempty"`
	ImageName       string                `json:"ImageName" binding:"required"`
	Tag             string                `json:"Tag" binding:"required"`
	Issuer          string                `json:"Issuer"`
}
type VersionData struct {
	Version      string `json:"version" binding:"required"`
	ReleaseNotes string `json:"releaseNotes"`
}

func (d *DeployImageRequest) Strings(appConfig *config.CommonConfiguration) []string {
	var registry string
	if d.Registry != nil {
		registry = *d.Registry
	} else {
		registry = "default"
	}
	return []string{
		// TODO: env
		fmt.Sprintf("Deployment target: %v\n", appConfig.IngressRootDomain),
		fmt.Sprintf("Image: %v\n", util.JoinV(":", d.ImageName, d.Tag)),
		fmt.Sprintf("Registry: %v\n", registry),
		fmt.Sprintf("Container name: %v\n", util.JoinV("-", d.InstanceConfig.ContainerPreName, d.ContainerConfig.Container)),
		fmt.Sprintf("Exposed ports: %v\n", d.ContainerConfig.Ports),
	}
}

type DeployImageResponse struct {
	Started   bool     `json:"started"`
	Error     string   `json:"error"`
	RequestID *string  `json:"requestId"`
	ImageName *string  `json:"imageName"`
	Tag       string   `json:"tag"`
	Logs      []string `json:"logs"`
}

type DeployVersionResponse []DeployImageResponse

type Base64JSONBytes []byte

type InstanceConfig struct {
	// prefix of the container, identifies namespace
	ContainerPreName string `json:"containerPreName" binding:"required"`
	// not-in-use
	MountPath string `json:"mountPath"`
	// name of the instance eg. configmaps
	Name string `json:"name"`
	// variables for instance; configmaps: name-common, name must be defined
	Environment []string `json:"environment,omitempty"`
	// not-in-use/unimplemented; registry is taken from containerConfig
	Registry string `json:"registry"`
	// not-in-use/unimplemented; git repository prefix
	RepositoryPreName string `json:"repositoryPreName"`
	// namespace global envs
	SharedEnvironment []string `json:"sharedEnvironment,omitempty"`
	// use preexisting namespaced envs
	UseSharedEnvs bool `json:"useSharedEnvs" validate:"excluded_with=SharedEnvironment"`
}

func (i *InstanceConfig) Strings() []string {
	str := []string{}

	str = append(str, fmt.Sprintf("Prefix: %s", i.ContainerPreName))

	return str
}

type Probe struct {
	Path string `json:"path"`
}

type RuntimeConfigType string

const (
	DotnetAppSettingsJSON = "dotnet-appsettings"
)

type HealthCheckConfig struct {
	Port           uint16 `json:"Port"`
	LivenessProbe  *Probe `json:"livenessProbe"`
	ReadinessProbe *Probe `json:"readinessProbe"`
	StartupProbe   *Probe `json:"startupProbe"`
}

type Resources struct {
	CPU    string `json:"cpu"`
	Memory string `json:"memory"`
}
type ResourceConfig struct {
	Limits   Resources `json:"limits"`
	Requests Resources `json:"requests"`
}

// key-value pairs passed to workload
type Markers struct {
	// Deployment used in both cases
	Deployment map[string]string `json:"deployment"`
	// k8s-only, service annonations
	Service map[string]string `json:"service"`
	// k8s-only ingress annotations
	Ingress map[string]string `json:"ingress"`
}

type ContainerConfig struct {
	// ContainerPreName identifies namespace to be used
	ContainerPreName string `json:"containerPreName"`
	// name of the container used for service, configmap names, various component names
	Container string `json:"container" binding:"required"`
	// portbinding list contains external/interal ports
	Ports []builder.PortBinding `json:"port" binding:"dive"`
	// Port ranges to be exposed ! no native range support in k8s
	PortRanges []builder.PortRangeBinding `json:"portRanges" binding:"dive"`
	// mount list, if a name starts with @ it can be used by multiple components eg @data|/target/mount/path
	Mounts []string `json:"mount"`
	// volumes
	Volumes []Volume `json:"volumes,omitempty" binding:"dive"`
	// environment variables list
	Environment []string `json:"environment"`
	// labels is shared, both docker and k8s have labels
	Labels Markers `json:"labels"`
	// Secrets
	Secrets map[string]string `json:"secrets,omitempty"`
	// the type of the runtime text provided eg. dotnet-appsettings
	RuntimeConfigType RuntimeConfigType `json:"runtimeConfigType"`
	// create an ingress object or not
	Expose bool `json:"expose"`
	// use nginx tls configuration
	ExposeTLS bool `json:"exposeTls"`
	// ingress prefix before hostname, `containerName.containerPrefix.<ingress root>` by default, this replaces both before root
	IngressName string `json:"ingressName"`
	// ingress hostname, env value used by default, can be overridden here
	IngressHost string `json:"ingressHost"`
	// Set endpoint upload limit, default value is: 1m
	// for docker hosts, this is needs to be bytes: 1000000 ~1m
	IngressUploadLimit string `json:"ingressUploadLimit"`
	// if put together with another instances consume their shared configs eg. -common config map, generated from here
	Shared bool `json:"shared"`
	// config container is spawned as an initcontainer copying files to a shared volume
	ConfigContainer *ConfigContainer `json:"configContainer,omitempty"`
	// import container uses rclone to copy over files before container startup
	ImportContainer *ImportContainer `json:"importContainer,omitempty"`
	// standard initContainers
	InitContainers []InitContainer `json:"initContainers,omitempty" binding:"dive"`
	// container user id
	User *int64 `json:"user"`
	// the initial command of a container have mixed terms
	// docker --> k8s: entrypoint => command, cmd => args
	// we use the k8s term here
	// command is the active process of the container
	Command []string `json:"command"`
	// args are added to the command
	Args []string `json:"args"`
	// if we need to spawn a pseudo-terminal
	TTY bool `json:"tty"`

	// dagent only
	LogConfig     *container.LogConfig      `json:"logConfig"`
	RestartPolicy builder.RestartPolicyName `json:"restartPolicy"`
	// bridge(container, default) host, none or network name
	NetworkMode string `json:"networkMode"`
	// extra networks
	Networks []string `json:"networks"`

	// k8s-only-section
	// Deployments strategy, on deployment how to restart underlying pods
	// Values: Recreate (all-at-once), Rolling(one-by-one only if succeeds)
	DeploymentStrategy string `json:"deploymentStrategy"`
	// health check configuration
	HealthCheckConfig HealthCheckConfig `json:"healthCheck"`
	// custom header configuration
	CustomHeaders []string `json:"customHeaders,omitempty"`
	// resource management
	ResourceConfig ResourceConfig `json:"resourceConfig"`
	// add proxy and cors headers
	ProxyHeaders bool `json:"proxyHeaders"`
	// Expose service using external IP
	// also sets the externalTrafficPolcy to "local"
	UseLoadBalancer bool `json:"useLoadBalancer"`
	// ExtraLBAnnotations, this is legacy
	// Annotations.Service does the same, keeping it for compat
	// lots of cloud provider specific configs can be put into annotations
	// they vary enough to have it exposed like this
	ExtraLBAnnotations map[string]string `json:"extraLBAnnotations,omitempty"`
	// Annotations
	Annotations Markers `json:"annotations"`
}

func (c *ContainerConfig) Strings(appConfig *config.CommonConfiguration) []string {
	str := []string{}

	if c.Ports != nil {
		str = append(str, fmt.Sprintf("Ports: %v", c.Ports))
	}

	if c.PortRanges != nil {
		str = append(str, fmt.Sprintf("PortRanges: %v", c.PortRanges))
	}

	str = append(str, fmt.Sprintf("Exposed: %v", c.Expose))

	if c.Mounts != nil {
		str = append(str, fmt.Sprintf("Mounts: %v", c.Mounts))
	}

	if c.Volumes != nil {
		str = append(str, fmt.Sprintf("Volumes: %v", c.Volumes))
	}

	if len(c.InitContainers) > 0 {
		names := []string{}
		for _, ic := range c.InitContainers {
			names = append(names, ic.Name)
		}
		str = append(str, fmt.Sprintf("Init containers: %v", names))
	}

	str = append(str,
		fmt.Sprintf("Memory limit: %v, CPU limit: %v",
			util.Fallback(c.ResourceConfig.Limits.Memory, appConfig.DefaultLimitsMemory),
			util.Fallback(c.ResourceConfig.Limits.CPU, appConfig.DefaultLimitsCPU),
		),
	)

	if c.User != nil {
		str = append(str, fmt.Sprintf("User: %v", *c.User))
	}

	return str
}

// Import container builds on rclone container https://rclone.org/
// refer to docs
// Idea: shift this one level up, this should not be visible in container configs
// Reason: it is not user configured data
// Update: 2022-03-16, it can be, loading anything into a container before starting it can be useful
// Note:
//
// Use environment variables to set auth credentials
// Use command field to define instruction ~30 remote storage is supported
type ImportContainer struct {
	// environment used to pass down secrets to the container
	// for Azure refer to rclone docs: https://rclone.org/azureblob/
	// one way to go either RCLONE_AZUREBLOB_ACCOUNT with RCLONE_AZUREBLOB_KEY
	// or using RCLONE_AZUREBLOB_SAS_URL list, read privileges needed
	Environments map[string]string `json:"environments" binding:"required"`
	// target volume name, volume name that is present on the deployment
	Volume string `json:"volume" binding:"required"`
	// for azureblob storage use `sync :azuresync:<container>/<product-guid>/<version-guid>/<component>/<volume>`
	Command string `json:"command" binding:"required"`
}

// classic initContainer, also mimicked on docker
// todo(nandor-magyar): extend docs here
type InitContainer struct {
	// name of the init container, they must be unique within a pod
	Name string
	// image to use
	Image string
	// Reference(s) to already existing volume(s)
	Volumes []VolumeLink
	// command to run, expecting exit code 0
	Command []string
	// arguments added to the command
	Args []string
	// use env/secrets from the parent container
	UseParent bool
	// envs directly defined
	Envs map[string]string
}

type VolumeLink struct {
	Name string
	Path string
}

// Verbose volume definitions with support of size and type parameters
//
// Example JSON defining a temporal volume:
//
//	"volumes": [{
//		"name": "app-import",
//		"path": "/path/in/container",
//		"size": "10Gi",
//		"type": "tmp",
//		"class": ""
//		}]
//
// Note: dagent maps these back into the old "name|/some/path" format, ingoring type and size constraints
type Volume struct {
	// name of the volume, the prefix will be the pod using it
	Name string `json:"name"`

	// mount path of the given deployment
	Path string `json:"path" binding:"required"`

	// required size, not guaranteed that the provisioned size will match
	// some PVCs support dynamic expansion/shrink, others not
	Size string `json:"size" binding:"validSize"`

	// type of the volume: RO,RW,RWX,mem,tmp
	// RO: readonly
	// RW: readwrite once normal (default)
	// RWX: readwrite many, shared volume within the instance
	// mem: use inmemory tmpfs
	// tmp: use tmpfs, with disk
	Type string `json:"type"`

	// kubernetes only
	// storage classes depend on the cloud providers
	// `kubectl get storageclasses.storage.k8s.io`
	// usable values could be returned to the UI letting the user change
	Class string `json:"class"`
}

var ValidSize validator.Func = func(fl validator.FieldLevel) bool {
	size := fl.Field().String()
	_, err := resource.ParseQuantity(size)
	return err == nil
}

type VolumeType string

const (
	ReadOnlyVolumeType      VolumeType = "RO"
	ReadWriteOnceVolumeType VolumeType = "RWO" // same as empty string
	ReadWriteManyVolumeType VolumeType = "RWX"
	MemoryVolumeType        VolumeType = "mem"
	EmptyDirVolumeType      VolumeType = "tmp"
)

type ConfigContainer struct {
	Image     string `json:"image" binding:"required"`
	Volume    string `json:"volume" binding:"required"`
	Path      string `json:"path" binding:"required"`
	KeepFiles bool   `json:"keepFiles"`
}

type UploadFileData struct {
	// Path for file in the container, absolute, without trailing slash
	FilePath string `form:"filePath" binding:"required"`
	// UID for the file to be created
	UID int `form:"uid"`
	// GID for the file to be created
	GID int `form:"gid"`
}

// custom struct unmarshal JSON interface implementation
func (jsonConfig *Base64JSONBytes) UnmarshalJSON(b []byte) error {
	inStr := string(b)
	trimmed := strings.Trim(inStr, `"`)
	decoded, err := base64.StdEncoding.DecodeString(trimmed)
	if err != nil {
		log.Error().Err(err).Stack().Msg("Instance config decoding error")
		return err
	}

	cleaned := util.RemoveJSONComment(decoded)
	if err != nil {
		return err
	}

	*jsonConfig = Base64JSONBytes(cleaned)

	return err
}

func (vt *VolumeType) UnmarshalJSON(b []byte) error {
	var s string
	err := json.Unmarshal(b, &s)
	if err != nil {
		return err
	}
	volumeType := VolumeType(s)
	switch volumeType {
	case ReadOnlyVolumeType, ReadWriteOnceVolumeType, ReadWriteManyVolumeType, EmptyDirVolumeType, MemoryVolumeType:
		*vt = volumeType
		return nil
	}
	return errors.New("Invalid volume type")
}

// setting known defaults from constants
func SetDeploymentDefaults(
	deployImageRequest *DeployImageRequest,
	appConfig *config.CommonConfiguration,
) {
	if deployImageRequest.Registry == nil || *deployImageRequest.Registry == "" {
		deployImageRequest.Registry = func() *string {
			str := appConfig.Registry
			return &str
		}()
	}

	if deployImageRequest.Tag == "" {
		deployImageRequest.Tag = appConfig.DefaultTag
	}

	if deployImageRequest.ContainerConfig.RestartPolicy == "" {
		deployImageRequest.ContainerConfig.RestartPolicy = builder.RestartUnlessStoppedRestartPolicy
	}
}
