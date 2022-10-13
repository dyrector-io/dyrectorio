//go:build unit
// +build unit

package caps

import (
	"encoding/json"
	v1 "github.com/dyrector-io/dyrectorio/agent/api/v1"
	"github.com/dyrector-io/dyrectorio/agent/pkg/builder/container"
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestParseLabelsIntoContainerConfig_UnrelatedValue(t *testing.T) {
	labels := map[string]string{
		"unrelated.label": "unrelated value",
	}
	config := &v1.ContainerConfig{}
	ParseLabelsIntoContainerConfig(labels, config)
	assert.Equal(t, []container.PortBinding(nil), config.Ports)
}

func TestParseLabelsIntoContainerConfig_InvalidJson(t *testing.T) {
	labels := map[string]string{
		"io.dyrector.cap.network.v1": "",
	}
	config := &v1.ContainerConfig{}
	ParseLabelsIntoContainerConfig(labels, config)
	assert.Equal(t, []container.PortBinding{}, config.Ports)
}

func TestParseLabelsIntoContainerConfig(t *testing.T) {
	networkLabel := NetworkLabel{
		Ports: []Port{
			{Exposed: true, Listening: 8080},
		},
	}
	marshaledNetworkLabels, _ := json.Marshal(networkLabel)
	labels := map[string]string{
		"io.dyrector.cap.network.v1": string(marshaledNetworkLabels),
	}
	config := &v1.ContainerConfig{
		Ports: []container.PortBinding{
			{ExposedPort: uint16(8888), PortBinding: 9999},
		},
	}
	ParseLabelsIntoContainerConfig(labels, config)
	assert.Equal(t, []container.PortBinding{
		{ExposedPort: uint16(8888), PortBinding: 9999},
		{ExposedPort: uint16(8080), PortBinding: 0},
	}, config.Ports)
}
