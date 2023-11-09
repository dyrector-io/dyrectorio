package health

import (
	"context"
	"encoding/json"
	"errors"
	"net"
	"os"

	"github.com/rs/zerolog/log"
)

type Health struct {
	data *Status
	ctx  context.Context
}

func (h *Health) sendHealthData(conn net.Conn, healthData *Status) error {
	data, err := json.Marshal(healthData)
	if err != nil {
		return err
	}

	_, err = conn.Write(data)
	return err
}

func (h *Health) acceptLoop(socket net.Listener) {
	for {
		conn, err := socket.Accept()
		if err != nil {
			if !errors.Is(err, net.ErrClosed) {
				log.Error().Err(err).Msg("Health accept error")
			}
			break
		}

		h.data.rw.RLock()
		data := h.data
		h.data.rw.RUnlock()

		err = h.sendHealthData(conn, data)
		if err != nil {
			log.Error().Err(err).Msg("Failed to write health socket")
		}
		log.Debug().Bool("connected", data.Connected).Msg("Healthcheck")

		err = conn.Close()
		if err != nil {
			log.Error().Err(err).Msg("Failed to close health socket")
		}
	}
}

func (h *Health) SetHealthGRPCStatus(connected bool) {
	h.data.rw.Lock()
	h.data.Connected = connected
	h.data.rw.Unlock()
}

func InitHealth(ctx context.Context) (*Health, error) {
	h := Health{
		data: &Status{},
		ctx:  ctx,
	}
	socketPath := getSocketPath()

	_, err := os.Stat(socketPath)
	if err == nil {
		err = os.RemoveAll(socketPath)
		if err != nil {
			log.Error().Str("file", socketPath).Err(err).Msg("Failed to remove socket file")
		}
	} else if !errors.Is(err, os.ErrNotExist) {
		log.Error().Str("file", socketPath).Err(err).Msg("Failed to check socket file")
	}

	err = os.MkdirAll(getSocketDir(), dirPerm)
	if err != nil {
		return nil, err
	}

	socket, err := net.Listen(socketType, socketPath)
	if err != nil {
		return nil, err
	}

	go h.acceptLoop(socket)

	go func() {
		<-ctx.Done()

		err := socket.Close()
		if err != nil {
			log.Error().Err(err).Msg("Health serve close error")
		}

		err = os.Remove(socketPath)
		if err != nil && !errors.Is(err, os.ErrNotExist) {
			log.Error().Err(err).Msg("Health serve close error")
		}
	}()

	return &h, nil
}
