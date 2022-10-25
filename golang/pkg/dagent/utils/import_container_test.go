//go:build unit
// +build unit

package utils

import (
	"testing"

	"github.com/docker/docker/api/types/mount"
	v1 "github.com/dyrector-io/dyrectorio/golang/api/v1"
	"github.com/stretchr/testify/assert"
)

func TestCheckIfTargetVolumeIsThere(t *testing.T) {
	importContainer := &v1.ImportContainer{
		Volume: "foo",
	}
	mounts := []mount.Mount{
		{Source: "foo"},
	}

	index, err := checkIfTargetVolumeIsThere(mounts, importContainer)
	assert.Nil(t, err)
	assert.Equal(t, 0, index)
}

func TestCheckIfTargetVolumeIsThere_NotThere(t *testing.T) {
	importContainer := &v1.ImportContainer{}

	index, err := checkIfTargetVolumeIsThere([]mount.Mount{}, importContainer)
	assert.Equal(t, -1, index)
	assert.Error(t, err, "import container target volume is not enlisted")
}
