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
	imageHelper "github.com/dyrector-io/dyrectorio/golang/internal/helper/image"
	"github.com/dyrector-io/dyrectorio/golang/internal/util"
	builder "github.com/dyrector-io/dyrectorio/golang/pkg/builder/container"
)

type DeployImageRequest struct {
	RegistryAuth    *imageHelper.RegistryAuth `json:"RegistryAuth,omitempty"`
	Registry        *string                   `json:"Registry,omitempty"`
	RequestID       string                    `json:"RequestId" binding:"required"`
	ImageName       string                    `json:"ImageName" binding:"required"`
	Tag             string                    `json:"Tag" binding:"required"`
	Issuer          string                    `json:"Issuer"`
	InstanceConfig  InstanceConfig            `json:"InstanceConfig" binding:"required"`
	RuntimeConfig   Base64JSONBytes           `json:"RuntimeConfig,omitempty"`
	ContainerConfig ContainerConfig           `json:"ContainerConfig" binding:"required"`
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
		fmt.Sprintf("Deployment target: %v\n", appConfig.RootDomain),
		fmt.Sprintf("Image: %v\n", util.JoinV(":", d.ImageName, d.Tag)),
		fmt.Sprintf("Registry: %v\n", registry),
		fmt.Sprintf("Container name: %v\n", util.JoinV("-", d.InstanceConfig.ContainerPreName, d.ContainerConfig.Container)),
		fmt.Sprintf("Exposed ports: %v\n", d.ContainerConfig.Ports),
	}
}

type DeployImageResponse struct {
	RequestID *string  `json:"requestId"`
	ImageName *string  `json:"imageName"`
	Error     string   `json:"error"`
	Tag       string   `json:"tag"`
	Logs      []string `json:"logs"`
	Started   bool     `json:"started"`
}

type DeployVersionResponse []DeployImageResponse

type Base64JSONBytes []byte

type InstanceConfig struct {
	Environment       map[string]string `json:"environment,omitempty"`
	SharedEnvironment map[string]string `json:"sharedEnvironment,omitempty"`
	ContainerPreName  string            `json:"containerPreName" binding:"required"`
	MountPath         string            `json:"mountPath"`
	Name              string            `json:"name"`
	Registry          string            `json:"registry"`
	RepositoryPreName string            `json:"repositoryPreName"`
	UseSharedEnvs     bool              `json:"useSharedEnvs" validate:"excluded_with=SharedEnvironment"`
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
	LivenessProbe  *Probe `json:"livenessProbe"`
	ReadinessProbe *Probe `json:"readinessProbe"`
	StartupProbe   *Probe `json:"startupProbe"`
	Port           uint16 `json:"Port"`
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

type ContainerState string

const (
	Running ContainerState = "running"
	Exited  ContainerState = "exited"
	Waiting ContainerState = "waiting"
	Removed ContainerState = "removed"
)

type ExpectedState struct {
	Timeout  *int32         `json:"timeout"`
	ExitCode *int32         `json:"exitCode"`
	State    ContainerState `json:"state"`
}

type ContainerConfig struct {
	HealthCheckConfig  HealthCheckConfig           `json:"healthCheck"`
	Labels             Markers                     `json:"labels"`
	Annotations        Markers                     `json:"annotations"`
	ConfigContainer    *ConfigContainer            `json:"configContainer,omitempty"`
	ImportContainer    *ImportContainer            `json:"importContainer,omitempty"`
	ExpectedState      *ExpectedState              `json:"expectedState,omitempty"`
	Environment        map[string]string           `json:"environment"`
	Secrets            map[string]string           `json:"secrets,omitempty"`
	LogConfig          *container.LogConfig        `json:"logConfig"`
	ExtraLBAnnotations map[string]string           `json:"extraLBAnnotations,omitempty"`
	User               *int64                      `json:"user"`
	Metrics            *Metrics                    `json:"metrics,omitempty"`
	DockerLabels       map[string]string           `json:"dockerLabels"`
	ResourceConfig     ResourceConfig              `json:"resourceConfig"`
	IngressPath        string                      `json:"ingressPath"`
	Container          string                      `json:"container" binding:"required"`
	DeploymentStrategy string                      `json:"deploymentStrategy"`
	IngressUploadLimit string                      `json:"ingressUploadLimit"`
	IngressHost        string                      `json:"ingressHost"`
	WorkingDirectory   string                      `json:"workingDirectory"`
	IngressName        string                      `json:"ingressName"`
	ContainerPreName   string                      `json:"containerPreName"`
	NetworkMode        string                      `json:"networkMode"`
	RestartPolicy      container.RestartPolicyMode `json:"restartPolicy"`
	RuntimeConfigType  RuntimeConfigType           `json:"runtimeConfigType"`
	InitContainers     []InitContainer             `json:"initContainers,omitempty" binding:"dive"`
	Volumes            []Volume                    `json:"volumes,omitempty" binding:"dive"`
	Args               []string                    `json:"args"`
	Command            []string                    `json:"command"`
	Networks           []string                    `json:"networks"`
	Ports              []builder.PortBinding       `json:"port" binding:"dive"`
	PortRanges         []builder.PortRangeBinding  `json:"portRanges" binding:"dive"`
	CustomHeaders      []string                    `json:"customHeaders,omitempty"`
	Mounts             []string                    `json:"mount"`
	IngressPort        uint16                      `json:"ingressPort"`
	Shared             bool                        `json:"shared"`
	UseLoadBalancer    bool                        `json:"useLoadBalancer"`
	Expose             bool                        `json:"expose"`
	ProxyHeaders       bool                        `json:"proxyHeaders"`
	ExposeTLS          bool                        `json:"exposeTls"`
	IngressStripPath   bool                        `json:"ingressPathStrip"`
	TTY                bool                        `json:"tty"`
}

type Metrics struct {
	// Path the path to be scraped, if not defined /metrics is used
	Path string `json:"path"`
	// Port exposed port of the service where metrics are available
	Port int `json:"port"`
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
// TODO(nandor-magyar): extend docs here
type InitContainer struct {
	Envs      map[string]string `json:"envs"`
	Name      string            `json:"name"`
	Image     string            `json:"image"`
	Volumes   []VolumeLink      `json:"volumes"`
	Command   []string          `json:"command"`
	Args      []string          `json:"args"`
	UseParent bool              `json:"useParent"`
}

type VolumeLink struct {
	Name string `json:"name"`
	Path string `json:"path"`
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

	// type of the volume: RO,RWO,RWX,mem,tmp, secret
	// RO: readonly
	// RWO: readwrite once normal (default)
	// RWX: readwrite many, shared volume within the instance
	// mem: use in-memory tmpfs
	// tmp: use tmpfs, with disk
	// secret: use secret of the name, mounted its keys as files
	Type VolumeType `json:"type"`

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
	SecretVolumeType        VolumeType = "secret"
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
	case ReadOnlyVolumeType, ReadWriteOnceVolumeType, ReadWriteManyVolumeType, EmptyDirVolumeType, MemoryVolumeType, SecretVolumeType:
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
			str := appConfig.DefaultRegistry
			return &str
		}()
	}

	if deployImageRequest.Tag == "" {
		deployImageRequest.Tag = appConfig.DefaultTag
	}

	if deployImageRequest.ContainerConfig.RestartPolicy == "" {
		deployImageRequest.ContainerConfig.RestartPolicy = container.RestartPolicyUnlessStopped
	}
}
