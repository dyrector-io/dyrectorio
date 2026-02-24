package config

import (
	"os/exec"
	"time"

	"github.com/dyrector-io/dyrectorio/golang/internal/vault/bwcli"
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
	FallbackJwtToken         *ValidJWT
	JwtToken                 *ValidJWT
	DefaultRequestMemory     string `yaml:"defaultRequestMemory"     env:"DEFAULT_REQUESTS_MEMORY"     env-default:"64Mi"`
	DefaultRegistry          string `yaml:"registry"                 env:"DEFAULT_REGISTRY"            env-default:"index.docker.io"`
	DefaultLimitsCPU         string `yaml:"defaultLimitsCPU"         env:"DEFAULT_LIMITS_CPU"          env-default:"100m"`
	DefaultTag               string `yaml:"defaultTag"               env:"DEFAULT_TAG"                 env-default:"latest"`
	RootDomain               string `yaml:"rootDomain"               env:"ROOT_DOMAIN"                 env-default:""`
	DefaultRequestsCPU       string `yaml:"defaultRequestsCPU"       env:"DEFAULT_REQUESTS_CPU"        env-default:"50m"`
	GrpcToken                string `yaml:"grpcToken"                env:"GRPC_TOKEN"                  env-default:""`
	Name                     string `yaml:"name"                     env:"NAME"                        env-default:"dagent-go"`
	SecretPrivateKey         string
	DefaultLimitsMemory      string        `yaml:"defaultLimitsMemory"      env:"DEFAULT_LIMITS_MEMORY"       env-default:"128Mi"`
	DefaultVolumeSize        string        `yaml:"defaultVolumeSize"        env:"DEFAULT_VOLUME_SIZE"         env-default:"1G"`
	ImportContainerImage     string        `yaml:"importContainerImage"     env:"IMPORT_CONTAINER_IMAGE"      env-default:"rclone/rclone:1.57.0"` //nolint:lll
	SecretVault              Vault         `yaml:"vault" env-prefix:"VAULT_"`
	GrpcKeepalive            time.Duration `yaml:"grpcKeepalive"            env:"GRPC_KEEPALIVE"              env-default:"30s"`
	DefaultTimeout           time.Duration `yaml:"defaultTimeout"           env:"DEFAULT_TIMEOUT"             env-default:"5s"`
	ReadHeaderTimeout        time.Duration `yaml:"readHeaderTimeout"        env:"READ_HEADER_TIMEOUT"         env-default:"15s"`
	DebugUpdateUseContainers bool          `yaml:"debugUpdateUseContainers" env:"DEBUG_UPDATE_USE_CONTAINERS" env-default:"true"`
	DebugUpdateAlways        bool          `yaml:"debugUpdateAlways"        env:"DEBUG_UPDATE_ALWAYS"         env-default:"false"`
	Debug                    bool          `yaml:"debug"                    env:"DEBUG"                       env-default:"false"`
}

const (
	PrivateKeyFileName      = "secret.key"
	ConnectionTokenFileName = "token.jwt"
	NonceBlacklistFileName  = "token-nonce.blacklist"
)

// BinaryAvailability is a bool-like type that automatically checks whether
// the "bw" CLI binary is available on the system
type BinaryAvailability bool

func (b *BinaryAvailability) SetValue(_ string) error {
	_, err := exec.LookPath(bwcli.DefaultBwBinary)
	*b = err == nil
	return nil
}

type Vault struct {
	URL             string             `yaml:"url" env:"URL"`
	ClientID        string             `yaml:"clientID" env:"CLIENT_ID"`
	ClientSecret    string             `yaml:"clientSecret" env:"CLIENT_SECRET"`
	OrgID           string             `yaml:"orgID" env:"ORG_ID"`
	Password        string             `yaml:"password" env:"PASSWORD"`
	CollectionID    string             `yaml:"collectionID" env:"COLLECTION_ID"`
	BinaryAvailable BinaryAvailability `env:"BINARY_AVAILABLE" env-default:""`
}
