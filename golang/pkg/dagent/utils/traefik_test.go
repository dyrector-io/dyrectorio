//go:build unit
// +build unit

package utils

import (
	"testing"

	v1 "github.com/dyrector-io/dyrectorio/golang/api/v1"
	"github.com/dyrector-io/dyrectorio/golang/pkg/builder/container"
	"github.com/dyrector-io/dyrectorio/golang/pkg/dagent/config"
	"github.com/stretchr/testify/assert"
)

func TestGetTraefikLabels(t *testing.T) {
	istanceConfig := &v1.InstanceConfig{
		ContainerPreName: "pre",
	}
	containerConfig := &v1.ContainerConfig{
		Container: "name",
		Ports: []container.PortBinding{
			{ExposedPort: 8888, PortBinding: 1},
		},
		ExposeTLS:          true,
		IngressUploadLimit: "16k",
	}
	cfg := &config.Configuration{}

	expected := map[string]string{
		"traefik.enable":                                               "true",
		"traefik.http.routers.pre-name.rule":                           "Host(`name.pre.`)",
		"traefik.http.services.pre-name.loadbalancer.server.port":      "8888",
		"traefik.http.middlewares.limit.buffering.maxRequestBodyBytes": "16k",
		"traefik.http.routers.pre-name.entrypoints":                    "websecure",
		"traefik.http.routers.pre-name.tls.certresolver":               "le",
	}

	labels, err := GetTraefikLabels(istanceConfig, containerConfig, cfg)
	assert.NoError(t, err)
	assert.Equal(t, expected, labels)
}

func TestGetTraefikGoTemplate(t *testing.T) {
	expected := `
log:
  level: {{ or .LogLevel "INFO"}}

accessLog: {}

providers:
  docker:
# if used with network based routing this is not needed
#    useBindPortIP: true
    exposedByDefault: false

entryPoints:
  web:
    address: ":80"

{{ if .TLS }}
  ## following is the http -> https redirect
    http:
      redirections:
        entryPoint:
         to: "websecure"
         scheme: "https"
         permanent: "true"

  websecure:
    address: ":443"

certificatesResolvers:
  le:
    acme:
      httpChallenge:
        entryPoint: "web"
      email: {{ .AcmeMail }}
      storage: "/letsencrypt/acme.json"
{{ end }}
`
	tmpl := GetTraefikGoTemplate()
	assert.Equal(t, expected, tmpl)
}
