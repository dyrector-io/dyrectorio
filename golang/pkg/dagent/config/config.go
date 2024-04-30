package config

import (
	"github.com/dyrector-io/dyrectorio/golang/internal/config"
)

// Dagent(docker)-specific configuration options
type Configuration struct {
	WebhookToken       string `yaml:"webhookToken"         env:"WEBHOOK_TOKEN"          env-default:""`
	TraefikAcmeMail    string `yaml:"traefikAcmeMail"        env:"TRAEFIK_ACME_MAIL"      env-default:""`
	HostDockerSockPath string `yaml:"hostDockerSockPath"     env:"HOST_DOCKER_SOCK_PATH" env-default:"/var/run/docker.sock"`
	InternalMountPath  string `yaml:"internalMountPath"      env:"INTERNAL_MOUNT_PATH"   env-default:"/srv/dagent"`
	DataMountPath      string `yaml:"dataMountPath"          env:"DATA_MOUNT_PATH"       env-default:"/srv/dagent"`
	TraefikLogLevel    string `yaml:"traefikLogLevel"      env:"TRAEFIK_LOG_LEVEL"      env-default:"INFO"`
	config.CommonConfiguration
	LogDefaultSkip uint64 `yaml:"logDefaultSkip"         env:"LOG_DEFAULT_SKIP"      env-default:"0"`
	LogDefaultTake uint64 `yaml:"logDefaultTake"         env:"LOG_DEFAULT_TAKE"      env-default:"100"`
	TraefikPort    uint16 `yaml:"traefikPort"          env:"TRAEFIK_PORT"           env-default:"80"`
	TraefikTLSPort uint16 `yaml:"traefikTLSPort"       env:"TRAEFIK_TLS_PORT"       env-default:"443"`
	TraefikEnabled bool   `yaml:"traefikEnabled"         env:"TRAEFIK_ENABLED"        env-default:"false"`
	TraefikTLS     bool   `yaml:"traefikTLS"           env:"TRAEFIK_TLS"            env-default:"false"`
}

const filePermReadWriteOnlyByOwner = 0o600

func (c *Configuration) CheckPermissions() error {
	path := c.appendInternalMountPath(config.ConnectionTokenFileName)
	return checkFilePermissions(path)
}

func (c *Configuration) GetConnectionToken() (string, error) {
	path := c.appendInternalMountPath(config.ConnectionTokenFileName)
	return readStringFromFile(path)
}

func (c *Configuration) SaveConnectionToken(token string) error {
	path := c.appendInternalMountPath(config.ConnectionTokenFileName)
	return writeStringToFile(path, token)
}

func (c *Configuration) GetBlacklistedNonce() (string, error) {
	path := c.appendInternalMountPath(config.NonceBlacklistFileName)
	return readStringFromFile(path)
}

func (c *Configuration) BlacklistNonce(value string) error {
	path := c.appendInternalMountPath(config.NonceBlacklistFileName)
	return writeStringToFile(path, value)
}

func (c *Configuration) LoadPrivateKey() (string, error) {
	path := c.appendInternalMountPath(config.PrivateKeyFileName)
	return c.CheckOrGenerateKeys(path)
}
