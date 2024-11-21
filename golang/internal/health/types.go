package health

import (
	"os"
	"path"
)

const (
	socketType = "unix"
)

type Status struct {
	Connected bool `json:"connected" binding:"required"`
}

func getSocketDir() string {
	return path.Join(os.TempDir(), "dyrectorio")
}

func getSocketPath() string {
	return path.Join(getSocketDir(), "agenthealth.sock")
}
