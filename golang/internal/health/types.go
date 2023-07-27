package health

import (
	"os"
	"path"
)

const socketType = "unix"

type Status struct {
	Connected bool `json:"connected" binding:"required"`
}

func getSocketPath() string {
	return path.Join(os.TempDir(), "dyrectorio", "agenthealth.sock")
}
