package health

import (
	"context"
	"encoding/json"
	"net"
	"os"

	"github.com/rs/zerolog/log"
)

var health = Status{
	Connected: false,
}

func sendHealthData(conn net.Conn, healthData *Status) error {
	data, err := json.Marshal(healthData)
	if err != nil {
		return err
	}

	_, err = conn.Write(data)
	return err
}

func acceptLoop(socket net.Listener) {
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
}

func SetHealthGRPCStatus(connected bool) {
	health.Connected = connected
}

func Serve(ctx context.Context) error {
	_, err := os.Stat(socketPath)
	if err == nil {
		err = os.RemoveAll(socketPath)
		if err != nil {
			log.Error().Err(err).Msg("Failed to remove socket file")
		}
	}

	socket, err := net.Listen(socketType, socketPath)
	if err != nil {
		return err
	}

	go func() {
		<-ctx.Done()

		err := socket.Close()
		if err != nil {
			log.Error().Err(err).Msg("Health serve close error")
		}

		err = os.Remove(socketPath)
		if err != nil {
			log.Error().Err(err).Msg("Health serve close error")
		}
	}()

	go acceptLoop(socket)

	return nil
}
