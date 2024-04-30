package config

import (
	"time"
)

// Configuration defaults
//
// Convention is we have all the options here, but where defaults should be
// different we handle it on application level, every time we need a parameter
// we call into a function in a package which calls here, then we populate the
// options which should be different if not defined otherwise.
//
// Using custom types allows to set the value from the environment variable
// you need to implement the Setter interface on the field level.
//
// Similar to JSON/YAML deserializing
// application startup -> load Configuration (read environment variables) -> unwrap variables (custom type)
// the last step is a public SetValue function defined on the custom type
//
// Example: ValidJWT
// Link: https://github.com/ilyakaznacheev/cleanenv#custom-value-setter
type CommonConfiguration struct {
	FallbackJwtToken     *ValidJWT
	JwtToken             *ValidJWT
	SecretPrivateKey     string
	DefaultRequestMemory string `yaml:"defaultRequestMemory"     env:"DEFAULT_REQUESTS_MEMORY"     env-default:"64Mi"`
	DefaultVolumeSize    string `yaml:"defaultVolumeSize"        env:"DEFAULT_VOLUME_SIZE"         env-default:"1G"`
	DefaultTag           string `yaml:"defaultTag"               env:"DEFAULT_TAG"                 env-default:"latest"`
	RootDomain           string `yaml:"rootDomain"               env:"ROOT_DOMAIN"                 env-default:""`
	DefaultRequestsCPU   string `yaml:"defaultRequestsCPU"       env:"DEFAULT_REQUESTS_CPU"        env-default:"50m"`
	GrpcToken            string `yaml:"grpcToken"                env:"GRPC_TOKEN"                  env-default:""`
	Name                 string `yaml:"name"                     env:"NAME"                        env-default:"dagent-go"`
	DefaultLimitsMemory  string `yaml:"defaultLimitsMemory"      env:"DEFAULT_LIMITS_MEMORY"       env-default:"128Mi"`
	DefaultRegistry      string `yaml:"registry"             env:"DEFAULT_REGISTRY"                 env-default:"index.docker.io"`
	DefaultLimitsCPU     string `yaml:"defaultLimitsCPU"         env:"DEFAULT_LIMITS_CPU"          env-default:"100m"`
	//nolint:lll
	ImportContainerImage     string        `yaml:"importContainerImage"     env:"IMPORT_CONTAINER_IMAGE"      env-default:"rclone/rclone:1.57.0"`
	ReadHeaderTimeout        time.Duration `yaml:"readHeaderTimeout"        env:"READ_HEADER_TIMEOUT"         env-default:"15s"`
	GrpcKeepalive            time.Duration `yaml:"grpcKeepalive"            env:"GRPC_KEEPALIVE"              env-default:"60s"`
	DefaultTimeout           time.Duration `yaml:"defaultTimeout"           env:"DEFAULT_TIMEOUT"             env-default:"5s"`
	DebugUpdateUseContainers bool          `yaml:"debugUpdateUseContainers" env:"DEBUG_UPDATE_USE_CONTAINERS" env-default:"true"`
	DebugUpdateAlways        bool          `yaml:"debugUpdateAlways"        env:"DEBUG_UPDATE_ALWAYS"         env-default:"false"`
	Debug                    bool          `yaml:"debug"                    env:"DEBUG"                       env-default:"false"`
}

const (
	PrivateKeyFileName      = "secret.key"
	ConnectionTokenFileName = "token.jwt"
	NonceBlacklistFileName  = "token-nonce.blacklist"
)
