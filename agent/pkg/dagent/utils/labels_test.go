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

	actual := utils.SetOrganizationLabel(key, value)

	assert.EqualValues(t, expected, actual)
}

func TestGetOrganizationLabelsWithEmptyKey(t *testing.T) {
	var key string
	value := "value"

	assert.Panics(t, func() { utils.SetOrganizationLabel(key, value) }, "The code did not panic. ")
}
