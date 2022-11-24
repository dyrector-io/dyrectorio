package container

import (
	"context"
	"encoding/json"
	"fmt"
	"io"

	"github.com/docker/docker/api/types/mount"
	"github.com/docker/docker/client"
)

// The PortBinding struct defines port bindings of a container.
// ExposedPort is the port in the container, while PortBinding is the port
// on the host.
type PortBinding struct {
	ExposedPort uint16 `json:"exposedPort" binding:"required,gte=0,lte=65535"`
	PortBinding uint16 `json:"portBinding" binding:"required,gte=0,lte=65535"`
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

// RestartPolicyName defines the restart policy used by a container.
type RestartPolicyName string

const (
	EmptyRestartPolicy                RestartPolicyName = ""
	AlwaysRestartPolicy               RestartPolicyName = "always"
	RestartUnlessStoppedRestartPolicy RestartPolicyName = "unless-stopped"
	NoRestartPolicy                   RestartPolicyName = "no"
	OnFailureRestartPolicy            RestartPolicyName = "on-failure"
)

// RestartPolicyUnmarshalInvalidError represents custom error regarding restart policy
type RestartPolicyUnmarshalInvalidError struct{}

func (e *RestartPolicyUnmarshalInvalidError) Error() string {
	return "restart policy invalid value provided"
}

// policyToString static mapping enum type into the docker supported string values
var policyToString = map[RestartPolicyName]string{
	EmptyRestartPolicy:                "unless-stopped",
	RestartUnlessStoppedRestartPolicy: "unless-stopped",
	NoRestartPolicy:                   "no",
	AlwaysRestartPolicy:               "always",
	OnFailureRestartPolicy:            "on-failure",
}

// policyToID static mapping string values eg. from JSON into enums
var policyToID = map[string]RestartPolicyName{
	"":               RestartUnlessStoppedRestartPolicy,
	"unless-stopped": RestartUnlessStoppedRestartPolicy,
	"no":             NoRestartPolicy,
	"always":         AlwaysRestartPolicy,
	"on-failure":     OnFailureRestartPolicy,
}

// custom enum marshal JSON interface implementation
func (policy RestartPolicyName) MarshalJSON() ([]byte, error) {
	str, ok := policyToString[policy]
	if !ok {
		return nil, &RestartPolicyUnmarshalInvalidError{}
	}
	return []byte(fmt.Sprintf(`%q`, str)), nil
}

// custom enum unmarshal JSON interface implementation
func (policy *RestartPolicyName) UnmarshalJSON(b []byte) error {
	var j string
	err := json.Unmarshal(b, &j)
	if err != nil {
		return err
	}

	if _, ok := policyToID[j]; ok {
		*policy = policyToID[j]
	} else {
		*policy = RestartPolicyName("")
		err = &RestartPolicyUnmarshalInvalidError{}
	}
	return err
}

// Hook function  which can be used to add custom logic before and after events of the lifecycle of a container.
// 'containerId' can be nil depending on the hook.
type LifecycleFunc func(ctx context.Context, client *client.Client, containerName string,
	containerId *string, mountList []mount.Mount, logger *io.StringWriter) error

// WaitResult with the status code from the container
type WaitResult struct {
	StatusCode int64
}
