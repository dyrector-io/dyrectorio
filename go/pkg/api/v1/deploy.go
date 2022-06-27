// Package util contains deployment types, middlewares, constants,
package v1

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"strings"

	"github.com/go-playground/validator/v10"
	"github.com/pkg/errors"
	"gitlab.com/dyrector_io/dyrector.io/go/internal/config"
	"gitlab.com/dyrector_io/dyrector.io/go/internal/util"
	"k8s.io/apimachinery/pkg/api/resource"
)

type Namespace struct {
	Name string `json:"name" binding:"required"`
}

type DeployImageRequest struct {
	RequestID       string             `json:"RequestId" binding:"required"`
	RegistryAuth    *util.RegistryAuth `json:"RegistryAuth,omitempty"`
	InstanceConfig  InstanceConfig     `json:"InstanceConfig" binding:"required"`
	ContainerConfig ContainerConfig    `json:"ContainerConfig" binding:"required"`
	RuntimeConfig   Base64JSONBytes    `json:"RuntimeConfig,omitempty"`
	Registry        *string            `json:"Registry,omitempty"`
	ImageName       string             `json:"ImageName" binding:"required"`
	Tag             string             `json:"Tag" binding:"required"`
	Issuer          string             `json:"Issuer"`
}

type BatchDeployImageRequest []DeployImageRequest

type VersionData struct {
	Version      string `json:"version" binding:"required"`
	ReleaseNotes string `json:"releaseNotes"`
}

type DeployVersionRequest struct {
	VersionData

	DeployImages []DeployImageRequest `json:"deployImageRequest" binding:"dive,min=1"`
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
		fmt.Sprintf("Deployment target: k8s ~ %v\n", appConfig.IngressRootDomain),
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

type BatchDeployImageResponse []DeployImageResponse

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

type ContainerConfig struct {
	// ContainerPreName identifies namespace to be used
	ContainerPreName string `json:"containerPreName"`
	// name of the container used for service, configmap names, various component names
	Container string `json:"container" binding:"required"`
	// portbinding list contains external/interal ports
	Ports []PortBinding `json:"port" binding:"dive"`
	// Port ranges to be exposed ! no native range support in k8s
	PortRanges []PortRangeBinding `json:"portRanges" binding:"dive"`
	// mount list, if a name starts with @ it can be used by multiple components eg @data|/target/mount/path
	Mounts []string `json:"mount"`
	// volumes
	Volumes []Volume `json:"volumes,omitempty" binding:"dive"`
	// environment variables list
	Environment []string `json:"environment"`
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
	// container user id
	User *int64 `json:"user"`
	// the initial command of a container have mixed terms
	// docker --> k8s: entrypoint => command, cmd => args
	// we use the k8s term here
	// command is the active process of the container
	Command []string `json:"command"`
	// args are added to the command
	Args []string `json:"args"`

	// dagent only
	LogConfig     *LogConfig        `json:"logConfig"`
	RestartPolicy RestartPolicyName `json:"restartPolicy,omitempty"`
	// bridge(container, defeault) host, none or network name
	NetworkMode string `json:"networkMode"`

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
	// ExtraLBAnnotations
	// lots of cloud provider specific configs can be put into annotations
	// they vary enough to have it exposed like this
	ExtraLBAnnotations map[string]string `json:"extraLBAnnotations,omitempty"`
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

// LogConfig is container level defined log-configuration `override`
type LogConfig struct {
	// https://docs.docker.com/config/containers/logging/configure/#supported-logging-drivers
	LogDriver string            `json:"logDriver" binding:"required"`
	LogOpts   map[string]string `json:"logOpts"`
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

// Verbose volume definitions with support of size and type parameters
//
//
// Example JSON defining a temporal volume:
//	"volumes": [{
//		"name": "app-import",
//		"path": "/path/in/container",
// 		"size": "10Gi",
//		"type": "tmp",
//		"class": ""
//		}]
//
// Note: dagent maps these back into the old "name|/some/path" format, ingoring type and size constraints
//
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

type PortRange struct {
	From uint16 `json:"from" binding:"required,gte=0,lte=65535"`
	To   uint16 `json:"to" binding:"required,gtefield=From,lte=65535"`
}

type PortRangeBinding struct {
	Internal PortRange `json:"internal" binding:"required"`
	External PortRange `json:"external" binding:"required"`
}

type IngressConfig struct {
	// name override, default set ingress route can be overwritten, default used otherwise
	BaseDomain string `json:"baseDomain"`
	// domain list, one is fine
	Domains []string `json:"domains"`
}
type ConfigContainer struct {
	Image     string `json:"image" binding:"required"`
	Volume    string `json:"volume" binding:"required"`
	Path      string `json:"path" binding:"required"`
	KeepFiles bool   `json:"keepFiles"`
}

type PortBinding struct {
	ExposedPort uint16 `json:"exposedPort" binding:"required,gte=0,lte=65535"`
	PortBinding uint16 `json:"portBinding" binding:"required,gte=0,lte=65535"`
}

const bracketsWarning = "Make sure to use brackets for arrays like eg.  \"environment\": [\"ASPNETCORE_ENVIRONMENT|Staging\"]"

// custom struct marshal JSON interface implementation with base64 encoding
//nolint
func (config InstanceConfig) MarshalJSON() ([]byte, error) {
	type localConfig InstanceConfig
	str, err := json.Marshal(localConfig(config))
	if err != nil {
		log.Println("InstanceConfig marshaling: " + err.Error())
	}
	enc := base64.StdEncoding.EncodeToString(str)
	return []byte("\"" + enc + "\""), nil
}

// custom struct unmarshal JSON interface implementation
func (instanceConfig *InstanceConfig) UnmarshalJSON(b []byte) error {
	type localConfig InstanceConfig
	inStr := string(b)
	trimmed := strings.Trim(inStr, `"`)
	cfg := new(localConfig)

	decoded, err := base64.StdEncoding.DecodeString(trimmed)

	if err != nil {
		log.Println("Instance config decoding error: ", err.Error(), bracketsWarning)
		return err
	}
	err = json.Unmarshal(decoded, &cfg)
	*instanceConfig = InstanceConfig(*cfg)
	return err
}

// custom struct marshal JSON interface implementation
// function header is needed as it is, therefore the lint error is false
//nolint
func (containerConfig ContainerConfig) MarshalJSON() ([]byte, error) {
	type localConfig ContainerConfig
	str, err := json.Marshal(localConfig(containerConfig))
	if err != nil {
		log.Println("ContainerConfig marshaling: " + err.Error())
	}
	enc := base64.StdEncoding.EncodeToString(str)
	return []byte("\"" + enc + "\""), nil
}

// custom struct unmarshal JSON interface implementation
func (containerConfig *ContainerConfig) UnmarshalJSON(b []byte) error {
	type localConfig ContainerConfig
	inStr := string(b)
	trimmed := strings.Trim(inStr, `"`)
	cfg := new(localConfig)

	decoded, err := base64.StdEncoding.DecodeString(trimmed)

	if err != nil {
		log.Println("Container config decoding error: ", err.Error())
		log.Println(bracketsWarning)
		return err
	}
	err = json.Unmarshal(decoded, &cfg)
	*containerConfig = ContainerConfig(*cfg)
	if err != nil {
		return err
	}
	return err
}

// custom struct unmarshal JSON interface implementation
func (jsonConfig *Base64JSONBytes) UnmarshalJSON(b []byte) error {
	inStr := string(b)
	trimmed := strings.Trim(inStr, `"`)
	decoded, err := base64.StdEncoding.DecodeString(trimmed)

	if err != nil {
		log.Println("Instance config decoding error: ", err.Error())
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

type RestartPolicyName string

const (
	EmptyRestartPolicy                RestartPolicyName = ""
	AlwaysRestartPolicy               RestartPolicyName = "always"
	RestartUnlessStoppedRestartPolicy RestartPolicyName = "unless-stopped"
	NoRestartPolicy                   RestartPolicyName = "no"
	OnFailureRestartPolicy            RestartPolicyName = "on-failure"
)

// RestartPolicyUnmarshalInvalidError represents custom error regarding restart policy
type ErrRestartPolicyUnmarshalInvalid struct{}

func (e *ErrRestartPolicyUnmarshalInvalid) Error() string {
	return "restart policy invalid value provided"
}

// PolicyToString static mapping enum type into the docker supported string values
var PolicyToString = map[RestartPolicyName]string{
	EmptyRestartPolicy:                "unless-stopped",
	RestartUnlessStoppedRestartPolicy: "unless-stopped",
	NoRestartPolicy:                   "no",
	AlwaysRestartPolicy:               "always",
	OnFailureRestartPolicy:            "on-failure",
}

// PolicyToID static mapping string values eg. from JSON into enums
var PolicyToID = map[string]RestartPolicyName{
	"":               RestartUnlessStoppedRestartPolicy,
	"unless-stopped": RestartUnlessStoppedRestartPolicy,
	"no":             NoRestartPolicy,
	"always":         AlwaysRestartPolicy,
	"on-failure":     OnFailureRestartPolicy,
}

// custom enum marshal JSON interface implementation
func (policy RestartPolicyName) MarshalJSON() ([]byte, error) {
	str, ok := PolicyToString[policy]
	if !ok {
		return nil, &ErrRestartPolicyUnmarshalInvalid{}
	}
	return []byte(fmt.Sprintf(`%q`, str)), nil
}

// custom enum unmarshal JSON interface implementation
func (policy *RestartPolicyName) UnmarshalJSON(b []byte) error {
	var j string
	err := json.Unmarshal(b, &j)
	if err != nil {
		return err
	}

	if _, ok := PolicyToID[j]; ok {
		*policy = PolicyToID[j]
	} else {
		*policy = RestartPolicyName("")
		err = &ErrRestartPolicyUnmarshalInvalid{}
	}
	return err
}

// setting known defaults from constants
func SetDeploymentDefaults(
	deployImageRequest *DeployImageRequest,
	containerConfig *ContainerConfig,
	appConfig *config.CommonConfiguration) {
	if deployImageRequest.Registry == nil || *deployImageRequest.Registry == "" {
		deployImageRequest.Registry = func() *string {
			str := appConfig.Registry
			return &str
		}()
	}

	if deployImageRequest.Tag == "" {
		deployImageRequest.Tag = appConfig.DefaultTag
	}

	if containerConfig.RestartPolicy == "" {
		containerConfig.RestartPolicy = RestartUnlessStoppedRestartPolicy
	}
}
