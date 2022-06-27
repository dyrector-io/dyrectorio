package model

import (
	"regexp"

	_ "github.com/go-playground/validator/v10"
)

type TraefikDeployRequest struct {
	// LogLevel defaults to INFO
	LogLevel string `json:"logLevel"`
	// if services exposed with certs, default: false
	TLS bool `json:"TLS"`
	// the email address for expiry notifications, sent by acme
	AcmeMail string `json:"acmeMail" binding:"required_if=TLS true"`
}

type TraefikDeployResponse struct {
	Error string `json:"error,omitempty"`
}

type RegistryAuth struct {
	Name     string `json:"name" binding:"required"`
	URL      string `json:"url" binding:"required"`
	User     string `json:"user" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type Base64JSONBytes []byte

type LogConfig struct {
	// https://docs.docker.com/config/containers/logging/configure/#supported-logging-drivers
	LogDriver string            `json:"logDriver" binding:"required"`
	LogOpts   map[string]string `json:"logOpts"`
}

type ConfigContainer struct {
	Image     string `json:"image" binding:"required"`
	Volume    string `json:"volume" binding:"required"`
	Path      string `json:"path" binding:"required,dir"`
	KeepFiles bool   `json:"keepFiles"`
}

type PortBinding struct {
	ExposedPort uint16 `json:"exposedPort" binding:"required,gte=0,lte=65535"`
	PortBinding uint16 `json:"portBinding" binding:"required,gte=0,lte=65535"`
}

type PortRangeBinding struct {
	Internal PortRange `json:"internal" binding:"required"`
	External PortRange `json:"external" binding:"required"`
}

type PortRange struct {
	From uint16 `json:"from" binding:"required,gte=0,lte=65535"`
	To   uint16 `json:"to" binding:"required,gtefield=From,lte=65535"`
}

func RemoveJSONComment(strIn []byte) []byte {
	str := string(strIn)
	re1 := regexp.MustCompile(`(?im)^\s+//.*$`)
	str = re1.ReplaceAllString(str, "")
	re2 := regexp.MustCompile(`(?im)//[^"\[\]]+$`)
	str = re2.ReplaceAllString(str, "")

	return []byte(str)
}
