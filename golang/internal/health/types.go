package health

const (
	HealthSocketType = "unix"
	HealthSocketPath = "/tmp/agenthealth.sock"
)

type HealthStatus struct {
	Connected bool `json:"connected" binding:"required"`
}
