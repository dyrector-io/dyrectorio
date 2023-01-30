//go:build unit
// +build unit

package utils

import (
	"testing"

	"github.com/AlekSi/pointer"
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
			{ExposedPort: 8888, PortBinding: pointer.ToUint16(1)},
		},
		ExposeTLS:          true,
		IngressUploadLimit: "16k",
	}
	cfg := &config.Configuration{}

	expected := map[string]string{
		"traefik.enable":                                               "true",
		"traefik.http.routers.pre-name.rule":                           "Host(`name.pre.`)",
		"traefik.http.routers.pre-name.entrypoints":                    "web",
		"traefik.http.routers.pre-name-secure.rule":                    "Host(`name.pre.`)",
		"traefik.http.routers.pre-name-secure.entrypoints":             "websecure",
		"traefik.http.routers.pre-name-secure.tls":                     "true",
		"traefik.http.routers.pre-name-secure.tls.certresolver":        "le",
		"traefik.http.middlewares.limit.buffering.maxRequestBodyBytes": "16k",
	}

	labels := GetTraefikLabels(istanceConfig, containerConfig, cfg)
	assert.Equal(t, expected, labels)
}
