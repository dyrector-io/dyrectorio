//go:build unit
// +build unit

package caps

import (
	"encoding/json"
	"testing"

	"github.com/AlekSi/pointer"
	"github.com/stretchr/testify/assert"

	v1 "github.com/dyrector-io/dyrectorio/golang/api/v1"
	"github.com/dyrector-io/dyrectorio/golang/pkg/builder/container"
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
			{ExposedPort: uint16(8888), PortBinding: pointer.ToUint16(9999)},
		},
	}
	ParseLabelsIntoContainerConfig(labels, config)
	assert.Equal(t, []container.PortBinding{
		{ExposedPort: uint16(8888), PortBinding: pointer.ToUint16(9999)},
		{ExposedPort: uint16(8080), PortBinding: pointer.ToUint16(0)},
	}, config.Ports)
}
