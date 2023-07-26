package health

const (
	socketType = "unix"
	socketPath = "/tmp/agenthealth.sock"
)

type Status struct {
	Connected bool `json:"connected" binding:"required"`
}
