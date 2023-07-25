//go:build unit
// +build unit

package utils

import (
	"testing"

	"github.com/AlekSi/pointer"
	"github.com/stretchr/testify/assert"

	v1 "github.com/dyrector-io/dyrectorio/golang/api/v1"
	"github.com/dyrector-io/dyrectorio/golang/internal/config"
	"github.com/dyrector-io/dyrectorio/golang/pkg/builder/container"
	dagentConfig "github.com/dyrector-io/dyrectorio/golang/pkg/dagent/config"
)

func TestGetTraefikLabelsNoEnv(t *testing.T) {
	instanceConfig := &v1.InstanceConfig{
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
	cfg := &dagentConfig.Configuration{}

	labels, err := GetTraefikLabels(instanceConfig, containerConfig, cfg)
	assert.ErrorAs(t, err, &ErrInsufficientRoutingRules)
	assert.Empty(t, labels)
}

func TestGetTraefikLabelsNoEnvWithDomain(t *testing.T) {
	instanceConfig := &v1.InstanceConfig{
		ContainerPreName: "pre",
	}
	containerConfig := &v1.ContainerConfig{
		Container: "name",
		Ports: []container.PortBinding{
			{ExposedPort: 8888, PortBinding: pointer.ToUint16(1)},
		},
		ExposeTLS:          true,
		IngressUploadLimit: "16k",
		IngressName:        "domain.test",
	}
	cfg := &dagentConfig.Configuration{}

	labels, err := GetTraefikLabels(instanceConfig, containerConfig, cfg)
	assert.ErrorAs(t, err, &ErrInsufficientRoutingRules)
	assert.Empty(t, labels)
}

func TestGetTraefikLabelsEnv(t *testing.T) {
	instanceConfig := &v1.InstanceConfig{
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
	cfg := &dagentConfig.Configuration{
		CommonConfiguration: config.CommonConfiguration{
			RootDomain: "root.domain",
		},
	}

	expected := map[string]string{
		"traefik.enable":                                               "true",
		"traefik.http.routers.pre-name.rule":                           "Host(`name.pre.root.domain`)",
		"traefik.http.routers.pre-name.entrypoints":                    "web",
		"traefik.http.routers.pre-name-secure.rule":                    "Host(`name.pre.root.domain`)",
		"traefik.http.routers.pre-name-secure.entrypoints":             "websecure",
		"traefik.http.routers.pre-name-secure.tls":                     "true",
		"traefik.http.routers.pre-name-secure.tls.certresolver":        "le",
		"traefik.http.middlewares.limit.buffering.maxRequestBodyBytes": "16k",
	}

	labels, err := GetTraefikLabels(instanceConfig, containerConfig, cfg)
	assert.Nil(t, err)
	assert.Equal(t, expected, labels)
}

func TestGetTraefikLabelsEnvWithDomain(t *testing.T) {
	instanceConfig := &v1.InstanceConfig{
		ContainerPreName: "pre",
	}
	containerConfig := &v1.ContainerConfig{
		Container: "name",
		Ports: []container.PortBinding{
			{ExposedPort: 8888, PortBinding: pointer.ToUint16(1)},
		},
		ExposeTLS:          true,
		IngressUploadLimit: "16k",
		IngressName:        "domain.test",
	}
	cfg := &dagentConfig.Configuration{
		CommonConfiguration: config.CommonConfiguration{
			RootDomain: "root.domain",
		},
	}

	expected := map[string]string{
		"traefik.enable":                                               "true",
		"traefik.http.routers.pre-name.rule":                           "Host(`domain.test.root.domain`)",
		"traefik.http.routers.pre-name.entrypoints":                    "web",
		"traefik.http.routers.pre-name-secure.rule":                    "Host(`domain.test.root.domain`)",
		"traefik.http.routers.pre-name-secure.entrypoints":             "websecure",
		"traefik.http.routers.pre-name-secure.tls":                     "true",
		"traefik.http.routers.pre-name-secure.tls.certresolver":        "le",
		"traefik.http.middlewares.limit.buffering.maxRequestBodyBytes": "16k",
	}

	labels, err := GetTraefikLabels(instanceConfig, containerConfig, cfg)
	assert.Nil(t, err)
	assert.Equal(t, expected, labels)
}

func TestGetTraefikLabelsRootDomainFromContainerConfig(t *testing.T) {
	instanceConfig := &v1.InstanceConfig{
		ContainerPreName: "pre",
	}
	containerConfig := &v1.ContainerConfig{
		Container: "name",
		Ports: []container.PortBinding{
			{ExposedPort: 8888, PortBinding: pointer.ToUint16(1)},
		},
		IngressName: "domain.test",
		IngressHost: "root.domain",
	}
	cfg := &dagentConfig.Configuration{}

	expected := map[string]string{
		"traefik.enable":                            "true",
		"traefik.http.routers.pre-name.rule":        "Host(`domain.test.root.domain`)",
		"traefik.http.routers.pre-name.entrypoints": "web",
	}

	labels, err := GetTraefikLabels(instanceConfig, containerConfig, cfg)
	assert.Nil(t, err)
	assert.Equal(t, expected, labels)
}

func TestTraefikStripping(t *testing.T) {
	instanceConfig := &v1.InstanceConfig{
		ContainerPreName: "pre",
	}
	containerConfig := &v1.ContainerConfig{
		Container: "name",
		Ports: []container.PortBinding{
			{ExposedPort: 8888, PortBinding: pointer.ToUint16(1)},
		},
		ExposeTLS:          true,
		IngressUploadLimit: "16k",
		IngressName:        "domain.test",
		IngressPath:        "/test",
		IngressStripPath:   true,
	}
	cfg := &dagentConfig.Configuration{
		CommonConfiguration: config.CommonConfiguration{
			RootDomain: "root.domain",
		},
	}

	expected := map[string]string{
		"traefik.enable":                                                  "true",
		"traefik.http.routers.pre-name.rule":                              "Host(`domain.test.root.domain`) && PathPrefix(`/test`)",
		"traefik.http.routers.pre-name.entrypoints":                       "web",
		"traefik.http.routers.pre-name.middlewares":                       "pre-name-stripper",
		"traefik.http.routers.pre-name-secure.rule":                       "Host(`domain.test.root.domain`) && PathPrefix(`/test`)",
		"traefik.http.middlewares.pre-name-stripper.stripprefix.prefixes": "/test",
		"traefik.http.routers.pre-name-secure.middlewares":                "pre-name-stripper",
		"traefik.http.routers.pre-name-secure.entrypoints":                "websecure",
		"traefik.http.routers.pre-name-secure.tls":                        "true",
		"traefik.http.routers.pre-name-secure.tls.certresolver":           "le",
		"traefik.http.middlewares.limit.buffering.maxRequestBodyBytes":    "16k",
	}

	labels, err := GetTraefikLabels(instanceConfig, containerConfig, cfg)
	assert.Nil(t, err)
	assert.Equal(t, expected, labels)
}

func TestLocalhost(t *testing.T) {
	instanceConfig := &v1.InstanceConfig{
		ContainerPreName: "pre",
	}
	containerConfig := &v1.ContainerConfig{
		Container: "name",
		Ports: []container.PortBinding{
			{ExposedPort: 8888, PortBinding: pointer.ToUint16(1)},
		},
		Expose:           true,
		IngressHost:      "localhost",
		IngressPath:      "/test",
		IngressStripPath: true,
	}
	cfg := &dagentConfig.Configuration{
		CommonConfiguration: config.CommonConfiguration{
			RootDomain: "root.domain",
		},
	}

	expected := map[string]string{
		"traefik.enable":                                                  "true",
		"traefik.http.routers.pre-name.rule":                              "Host(`localhost`) && PathPrefix(`/test`)",
		"traefik.http.routers.pre-name.entrypoints":                       "web",
		"traefik.http.routers.pre-name.middlewares":                       "pre-name-stripper",
		"traefik.http.middlewares.pre-name-stripper.stripprefix.prefixes": "/test",
	}

	labels, err := GetTraefikLabels(instanceConfig, containerConfig, cfg)
	assert.Nil(t, err)
	assert.Equal(t, expected, labels)
}
