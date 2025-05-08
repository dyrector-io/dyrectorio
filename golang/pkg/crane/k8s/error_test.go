//go:build unit
// +build unit

package k8s_test

import (
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/dyrector-io/dyrectorio/golang/pkg/crane/k8s"
)

func TestErrorWithoutFallback(t *testing.T) {
	// GIVEN
	resourceError := k8s.NewResourceError("ErrorField", "ErrorGroup", false)

	// WHEN
	result := resourceError.Error()

	// THEN
	assert.Equal(t, "failed to parse 'ErrorField' in 'ErrorGroup'", result)
}

func TestErrorWithFallback(t *testing.T) {
	// GIVEN
	resourceError := k8s.NewResourceError("ErrorField", "ErrorGroup", true)

	// WHEN
	result := resourceError.Error()

	// THEN
	assert.Equal(t, "failed to parse default 'ErrorField' in 'ErrorGroup'", result)
}
