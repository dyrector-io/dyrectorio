package caps

import (
	"encoding/json"

	"github.com/AlekSi/pointer"
	"github.com/rs/zerolog/log"

	v1 "github.com/dyrector-io/dyrectorio/golang/api/v1"
	"github.com/dyrector-io/dyrectorio/golang/internal/util"
	builder "github.com/dyrector-io/dyrectorio/golang/pkg/builder/container"
)

type Port struct {
	Listening int64 `json:"listening"`
	Exposed   bool  `json:"exposed"`
}

type NetworkLabel struct {
	Ports []Port `json:"ports"`
}

func ParseLabelsIntoContainerConfig(labels map[string]string, config *v1.ContainerConfig) error {
	for key, value := range labels {
		if key != "io.dyrector.cap.network.v1" {
			continue
		}
		network := NetworkLabel{}

		err := json.Unmarshal([]byte(value), &network)
		if err != nil {
			log.Error().Stack().Err(err).Send()
		}

		ports := []builder.PortBinding{}

		if config != nil && len(config.Ports) > 0 {
			ports = config.Ports
		}
		for i := range network.Ports {
			exposedPort, err := util.SafeInt64ToUint16(network.Ports[i].Listening)
			if err != nil {
				return err
			}
			ports = append(ports, builder.PortBinding{
				ExposedPort: exposedPort,
				PortBinding: pointer.ToUint16(0),
			})
		}

		config.Ports = ports
	}

	return nil
}
