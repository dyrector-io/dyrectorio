//go:build unit
// +build unit

package utils

import (
	"testing"

	v1 "github.com/dyrector-io/dyrectorio/golang/api/v1"
	"github.com/stretchr/testify/assert"
)

func TestMapDeployResponseToRelease(t *testing.T) {
	image := "image"
	deployVersionResponse := v1.DeployVersionResponse{
		{ImageName: &image, Tag: "test", Started: true},
	}

	result := mapDeployResponseToRelease(deployVersionResponse)

	expected := []ReleaseContainer{
		{Image: "image", Tag: "test", Successful: true},
	}

	assert.Equal(t, expected, result)
}
