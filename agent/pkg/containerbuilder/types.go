package containerbuilder

import (
	"context"
	"encoding/json"
	"fmt"
	"io"

	"github.com/docker/docker/api/types/mount"
	"github.com/docker/docker/client"
)

type PortBinding struct {
	ExposedPort uint16 `json:"exposedPort" binding:"required,gte=0,lte=65535"`
	PortBinding uint16 `json:"portBinding" binding:"required,gte=0,lte=65535"`
}

type PortRange struct {
	From uint16 `json:"from" binding:"required,gte=0,lte=65535"`
	To   uint16 `json:"to" binding:"required,gtefield=From,lte=65535"`
}

type PortRangeBinding struct {
	Internal PortRange `json:"internal" binding:"required"`
	External PortRange `json:"external" binding:"required"`
}

// LogConfig is container level defined log-configuration `override`
type LogConfig struct {
	// https://docs.docker.com/config/containers/logging/configure/#supported-logging-drivers
	LogDriver string            `json:"logDriver" binding:"required"`
	LogOpts   map[string]string `json:"logOpts"`
}

type RegistryAuth struct {
	Name     string `json:"name" binding:"required"`
	URL      string `json:"url" binding:"required"`
	User     string `json:"user" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type RestartPolicyName string

const (
	EmptyRestartPolicy                RestartPolicyName = ""
	AlwaysRestartPolicy               RestartPolicyName = "always"
	RestartUnlessStoppedRestartPolicy RestartPolicyName = "unless-stopped"
	NoRestartPolicy                   RestartPolicyName = "no"
	OnFailureRestartPolicy            RestartPolicyName = "on-failure"
)

// RestartPolicyUnmarshalInvalidError represents custom error regarding restart policy
type ErrRestartPolicyUnmarshalInvalid struct{}

func (e *ErrRestartPolicyUnmarshalInvalid) Error() string {
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
		return nil, &ErrRestartPolicyUnmarshalInvalid{}
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
		err = &ErrRestartPolicyUnmarshalInvalid{}
	}
	return err
}

// ImagePullResponse is not explicit
type ImagePullResponse struct {
	ID             string `json:"id"`
	Status         string `json:"status"`
	ProgressDetail struct {
		Current int64 `json:"current"`
		Total   int64 `json:"total"`
	} `json:"progressDetail"`
	Progress string `json:"progress"`
}

type LifecycleFunc func(context.Context, *client.Client, string, *string, []mount.Mount, *io.StringWriter) error
