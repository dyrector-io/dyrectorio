package config

import (
	"time"
)

// configuration defaults
// convention is we have ALL the options here, but where defaults should be
// different we handle it on application level, every time we need a parameter
// we call into a function in a package which calls here, then we populate the
// options which should be different if not defined otherwise
type CommonConfiguration struct {
	DefaultLimitsCPU     string        `yaml:"defaultLimitsCPU"      env:"DEFAULT_LIMITS_CPU"      env-default:"100m"`
	DefaultLimitsMemory  string        `yaml:"defaultLimitsMemory"   env:"DEFAULT_LIMITS_MEMORY"   env-default:"128Mi"`
	DefaultRequestsCPU   string        `yaml:"defaultRequestsCPU"    env:"DEFAULT_REQUESTS_CPU"    env-default:"50m"`
	DefaultRequestMemory string        `yaml:"defaultRequestMemory"  env:"DEFAULT_REQUESTS_MEMORY" env-default:"64Mi"`
	DefaultVolumeSize    string        `yaml:"defaultVolumeSize"     env:"DEFAULT_VOLUME_SIZE"     env-default:"1G"`
	DefaultTag           string        `yaml:"defaultTag"            env:"DEFAULT_TAG"             env-default:"latest"`
	DefaultTimeout       time.Duration `yaml:"defaultTimeout"        env:"DEFAULT_TIMEOUT"         env-default:"5s"`
	GrpcKeepalive        time.Duration `yaml:"grpcKeepalive"         env:"GRPC_KEEPALIVE"          env-default:"60s"`
	Debug                bool          `yaml:"debug"                 env:"DEBUG"                   env-default:"false"`
	ImportContainerImage string        `yaml:"importContainerImage"  env:"IMPORT_CONTAINER_IMAGE"  env-default:"rclone/rclone:1.57.0"`
	IngressRootDomain    string        `yaml:"ingressRootDomain"     env:"INGRESS_ROOT_DOMAIN"     env-default:""`
	ReadHeaderTimeout    time.Duration `yaml:"readHeaderTimeout"     env:"READ_HEADER_TIMEOUT"     env-default:"15s"`
	// DefaultRegistry container registry used for container name expansion
	DefaultRegistry string `yaml:"registry"             env:"DEFAULT_REGISTRY"                 env-default:"index.docker.io"`
	// GRPC token is set separately, because nested structures are not yet suppported in cleanenv
	GrpcToken *ValidJWT
	// injected from crane/dagent
	SecretPrivateKey string
}
