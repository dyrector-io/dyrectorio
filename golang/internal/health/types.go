package health

import (
	"os"
	"path"
	"sync"
)

const (
	socketType = "unix"
	dirPerm    = 0o755
)

type Status struct {
	Connected bool `json:"connected" binding:"required"`
	rw        sync.RWMutex
}

func getSocketDir() string {
	return path.Join(os.TempDir(), "dyrectorio")
}

func getSocketPath() string {
	return path.Join(getSocketDir(), "agenthealth.sock")
}
