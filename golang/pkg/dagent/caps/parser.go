package caps

import (
	"encoding/json"

	"github.com/rs/zerolog/log"

	v1 "github.com/dyrector-io/dyrectorio/golang/api/v1"
	builder "github.com/dyrector-io/dyrectorio/golang/pkg/builder/container"
)

type Port struct {
	Listening int64 `json:"listening"`
	Exposed   bool  `json:"exposed"`
}

type NetworkLabel struct {
	Ports []Port `json:"ports"`
}

func ParseLabelsIntoContainerConfig(labels map[string]string, config *v1.ContainerConfig) {
	for key, value := range labels {
		if key != "io.dyrector.cap.network.v1" {
			continue
		} else {
			network := NetworkLabel{}

			err := json.Unmarshal([]byte(value), &network)
			if err != nil {
				log.Error().Stack().Err(err).Msg("")
			}

			ports := []builder.PortBinding{}
			if config.Ports != nil && len(config.Ports) > 0 {
				ports = config.Ports
			}
			for i := range network.Ports {
				ports = append(ports, builder.PortBinding{ExposedPort: uint16(network.Ports[i].Listening), PortBinding: 0})
			}

			config.Ports = ports
		}
	}
}
