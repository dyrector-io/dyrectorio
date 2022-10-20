package container_test

import (
	"encoding/json"
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/dyrector-io/dyrectorio/golang/pkg/builder/container"
)

func TestRestartPolicyNameMarshal(t *testing.T) {
	testPolicies := map[container.RestartPolicyName]string{
		container.EmptyRestartPolicy:                "unless-stopped",
		container.RestartUnlessStoppedRestartPolicy: "unless-stopped",
		container.NoRestartPolicy:                   "no",
		container.AlwaysRestartPolicy:               "always",
		container.OnFailureRestartPolicy:            "on-failure",
	}

	for key, value := range testPolicies {
		text, err := json.Marshal(key)

		expectedResult := fmt.Sprintf("%q", value)

		assert.Nil(t, err)
		assert.Equal(t, expectedResult, string(text))
	}
}

func TestRestartPolicyNameUnmarshal(t *testing.T) {
	testPolicies := map[string]container.RestartPolicyName{
		"":               container.RestartUnlessStoppedRestartPolicy,
		"unless-stopped": container.RestartUnlessStoppedRestartPolicy,
		"no":             container.NoRestartPolicy,
		"always":         container.AlwaysRestartPolicy,
		"on-failure":     container.OnFailureRestartPolicy,
	}

	for key, value := range testPolicies {
		var parsed container.RestartPolicyName
		jsonValue := fmt.Sprintf("%q", key)
		err := json.Unmarshal([]byte(jsonValue), &parsed)

		assert.Nil(t, err)
		assert.Equal(t, value, parsed)
	}
}

func TestRestartPolicyNameUnmarshalError(t *testing.T) {
	var parsed container.RestartPolicyName
	err := json.Unmarshal([]byte("\"not-valid-policy-name\""), &parsed)

	assert.ErrorIs(t, err, &container.ErrRestartPolicyUnmarshalInvalid{})
}
