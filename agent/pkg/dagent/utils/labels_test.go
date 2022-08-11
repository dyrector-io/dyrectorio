//go:build unit
// +build unit

package utils_test

import (
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/dyrector-io/dyrectorio/agent/pkg/dagent/utils"
)

func TestGetOrganizationLabels(t *testing.T) {
	key := "key"
	value := "value"

	expected := map[string]string{}
	expected["org.dyrectorio.key"] = "value"

	actual, _ := utils.SetOrganizationLabel(key, value)

	assert.EqualValues(t, expected, actual)
}

func TestGetOrganizationLabelsWithEmptyKey(t *testing.T) {
	var key string
	value := "value"

	_, err := utils.SetOrganizationLabel(key, value)

	expectedErrorMsg := "missing key or value to build an organization label"
	assert.EqualErrorf(t, err, expectedErrorMsg, "Error should be: %v, got: %v", expectedErrorMsg, err)
}
