package config

import (
	"time"

	"github.com/dyrector-io/dyrectorio/agent/internal/config"
)

type Configuration struct {
	config.CommonConfiguration
	AgentContainerName string `yaml:"agentContainerName"     env:"AGENT_CONTAINER_NAME" env-default:"dagent"`
	DagentImage        string `yaml:"dagentImage" env:"DAGENT_IMAGE" env-default:"ghcr.io/dyrector-io/dyrectorio/dagent"`
	DagentName         string `yaml:"dagentName"             env:"DAGENT_NAME"           env-default:"dagent-go"`
	DagentTag          string `yaml:"dagentTag"              env:"DAGENT_TAG"            env-default:"latest"`
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
	// TODO(nandor-magyar): do we still need this?
	UpdaterContainerName string        `yaml:"updaterContainerName" env:"UPDATER_CONTAINER_NAME" env-default:"dagent-updater"`
	UpdateHostTimezone   bool          `yaml:"updateHostTimezone"   env:"UPDATE_HOST_TIMEZONE"   env-default:"true"`
	UpdateMethod         string        `yaml:"updateMethod"         env:"UPDATE_METHOD"          env-default:"off"`
	UpdatePollInterval   time.Duration `yaml:"updatePollInterval"   env:"UPDATE_POLL_INTERVAL"   env-default:"600s"`
	WebhookToken         string        `yaml:"webhookToken"         env:"WEBHOOK_TOKEN"          env-default:""`
}
