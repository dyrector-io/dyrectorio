package container

import (
	"context"
	"fmt"

	"github.com/AlekSi/pointer"
	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/mount"
	"github.com/docker/docker/client"

	"github.com/dyrector-io/dyrectorio/golang/internal/dogger"
)

// The PortBinding struct defines port bindings of a container.
// ExposedPort is the port in the container, while PortBinding is the port
// on the host.
type PortBinding struct {
	PortBinding *uint16 `json:"portBinding" binding:"gte=0,lte=65535"`
	ExposedPort uint16  `json:"exposedPort" binding:"required,gte=0,lte=65535"`
}

// same style as default String() method, need this because one is optional
func (p PortBinding) String() string {
	return fmt.Sprintf("{%v %v}", pointer.GetUint16(p.PortBinding), p.ExposedPort)
}

// PortRange defines a range of ports from 0 to 65535.
type PortRange struct {
	From uint16 `json:"from" binding:"required,gte=0,lte=65535"`
	To   uint16 `json:"to" binding:"required,gtefield=From,lte=65535"`
}

// PortRangeBinding defines port range bindings of a container.
// Internal is the port in the container, while External is the port
// on the host.
type PortRangeBinding struct {
	Internal PortRange `json:"internal" binding:"required"`
	External PortRange `json:"external" binding:"required"`
}

type ParentContainer struct {
	Logger *dogger.LogWriter
	*types.Container
	Name        string
	MountList   []mount.Mount
	Environment []string
}

// Hook function  which can be used to add custom logic before and after events of the lifecycle of a container.
// 'containerId' can be nil depending on the hook.
type LifecycleFunc func(ctx context.Context, client client.APIClient, cont ParentContainer) error

// WaitResult with the status code from the container
type WaitResult struct {
	Logs       []string
	StatusCode int64
}
