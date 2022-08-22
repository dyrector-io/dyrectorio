//go:build unit
// +build unit

package container_test

import (
	"testing"

	"github.com/stretchr/testify/assert"

	builder "github.com/dyrector-io/dyrectorio/agent/pkg/builder/container"
)

func TestRegistryAuthUpdateBase64Empty(t *testing.T) {
	val := builder.RegistryAuthBase64("", "")

	assert.Equal(t, "", val)
}

func TestRegistryAuthUpdateBase64WithoutUser(t *testing.T) {
	val := builder.RegistryAuthBase64("", "test1234")

	assert.Equal(t, "", val)
}

func TestRegistryAuthUpdateBase64WithoutPass(t *testing.T) {
	val := builder.RegistryAuthBase64("test", "")

	assert.Equal(t, "", val)
}

func TestRegistryAuthUpdateBase64Correct(t *testing.T) {
	val := builder.RegistryAuthBase64("test", "test1234")

	assert.Equal(t, "eyJ1c2VybmFtZSI6InRlc3QiLCJwYXNzd29yZCI6InRlc3QxMjM0In0=", val)
}
