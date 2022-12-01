package config

import (
	"github.com/dyrector-io/dyrectorio/golang/internal/config"
)

// Dagent(docker)-specific configuration options
type Configuration struct {
	config.CommonConfiguration
	AgentContainerName string `yaml:"agentContainerName"     env:"AGENT_CONTAINER_NAME" env-default:"dagent"`
	DagentName         string `yaml:"dagentName"             env:"DAGENT_NAME"           env-default:"dagent-go"`
	DataMountPath      string `yaml:"dataMountPath"          env:"DATA_MOUNT_PATH"       env-default:"/srv/dagent"`
	HostDockerSockPath string `yaml:"hostDockerSockPath"     env:"HOST_DOCKER_SOCK_PATH" env-default:"/var/run/docker.sock"`
	HostMountPath      string `yaml:"hostMountPath"          env:"HOST_MOUNT_PATH"       env-default:"/srv/dagent"`
	InternalMountPath  string `yaml:"internalMountPath"      env:"INTERNAL_MOUNT_PATH"   env-default:"/srv/dagent"`
	LogDefaultSkip     uint64 `yaml:"logDefaultSkip"         env:"LOG_DEFAULT_SKIP"      env-default:"0"`
	LogDefaultTake     uint64 `yaml:"logDefaultTake"         env:"LOG_DEFAULT_TAKE"      env-default:"100"`
	// for debug use, also for podman ;))
	MinDockerServerVersion string `yaml:"minDockerVersion"     env:"MIN_DOCKER_VERSION"     env-default:"20.10"`
	TraefikAcmeMail        string `yaml:"traefikAcmeMail"      env:"TRAEFIK_ACME_MAIL"      env-default:""`
	TraefikEnabled         bool   `yaml:"traefikEnabled"       env:"TRAEFIK_ENABLED"        env-default:"false"`
	TraefikLogLevel        string `yaml:"traefikLogLevel"      env:"TRAEFIK_LOG_LEVEL"      env-default:""`
	TraefikTLS             bool   `yaml:"traefikTLS"           env:"TRAEFIK_TLS"            env-default:"false"`
	TraefikPort            uint16 `yaml:"traefikPort"          env:"TRAEFIK_PORT"           env-default:"80"`
	TraefikTLSPort         uint16 `yaml:"traefikTLSPort"       env:"TRAEFIK_TLS_PORT"       env-default:"443"`
	WebhookToken           string `yaml:"webhookToken"         env:"WEBHOOK_TOKEN"          env-default:""`
	// for injecting SecretPrivateKey,
	SecretPrivateKeyFile KeyFromFile `yaml:"secretPrivateKeyFile" env:"SECRET_PRIVATE_KEY_FILE"  env-default:"/srv/dagent/private.key"`
}
