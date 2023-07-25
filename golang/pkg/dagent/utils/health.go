package utils

import (
	"context"
	"encoding/json"
	"net"
	"os"

	"github.com/rs/zerolog/log"
)

const (
	HealthSocketPath  = "/tmp/dagenthealth.sock"
	ReceiveBufferSize = 1024
)

type Health struct {
	Connected bool `json:"connected" binding:"required"`
}

var health = Health{
	Connected: false,
}

func SetHealthGRPCConnected(connected bool) {
	health.Connected = connected
}

func sendHealthData(conn net.Conn, healthData *Health) error {
	data, err := json.Marshal(healthData)
	if err != nil {
		return err
	}

	_, err = conn.Write(data)
	return err
}

func HealthServe(ctx context.Context) error {
	_, err := os.Stat(HealthSocketPath)
	if err == nil {
		err = os.RemoveAll(HealthSocketPath)
		if err != nil {
			log.Error().Err(err).Msg("Failed to remove socket file")
		}
	}

	socket, err := net.Listen("unix", HealthSocketPath)
	if err != nil {
		return err
	}

	go func() {
		<-ctx.Done()

		err := socket.Close()
		if err != nil {
			log.Error().Err(err).Msg("Health serve close error")
		}
		err = os.Remove(HealthSocketPath)
		if err != nil {
			log.Error().Err(err).Msg("Health serve close error")
		}
	}()

	go func() {
		for {
			conn, err := socket.Accept()
			if err != nil {
				log.Error().Err(err).Msg("Health accept error")
				break
			}

			err = sendHealthData(conn, &health)
			if err != nil {
				log.Error().Err(err).Msg("Failed to write health socket")
			}

			err = conn.Close()
			if err != nil {
				log.Error().Err(err).Msg("Failed to close health socket")
			}
		}
	}()

	return nil
}

func GetHealth() (*Health, error) {
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

	var health Health

	err = json.Unmarshal(buffer[:length], &health)

	return &health, err
}
