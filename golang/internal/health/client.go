package health

import (
	"encoding/json"
	"net"

	"github.com/rs/zerolog/log"
)

const ReceiveBufferSize = 1024

func GetHealthy() (bool, error) {
	status, err := GetHealth()
	if err != nil {
		return false, err
	}

	return status.Connected, nil
}

func GetHealth() (*HealthStatus, error) {
	conn, err := net.Dial("unix", HealthSocketPath)
	if err != nil {
		return nil, err
	}

	defer func() {
		err = conn.Close()
		if err != nil {
			log.Error().Err(err).Msg("Failed to close health socket")
		}
	}()

	buffer := make([]byte, ReceiveBufferSize)

	length, err := conn.Read(buffer)
	if err != nil {
		return nil, err
	}

	var health HealthStatus
	err = json.Unmarshal(buffer[:length], &health)

	return &health, err
}
