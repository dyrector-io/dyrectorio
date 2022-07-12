//go:build unit
// +build unit

package util_test

import (
	"log"
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/dyrector-io/dyrectorio/agent/internal/util"
)

func TestNameEmpty(t *testing.T) {
	empty := ""
	res, err := util.ImageURIFromString(empty)

	assert.Nil(t, res)
	assert.ErrorIs(t, err, &util.EmptyImageError{})
	log.Println(err.Error())
}

func TestNameShort(t *testing.T) {
	image := "nginx"
	tag := "latest"
	res, err := util.ImageURIFromString(util.JoinV(":", image, tag))

	assert.Equal(t, res.Host, "")
	assert.Equal(t, res.Name, image)
	assert.Equal(t, res.Tag, tag)
	assert.Nil(t, err)
}

func TestNameFullyQualified(t *testing.T) {
	image := "reg.dyrector.io/library/nginx"
	tag := "test"

	res, err := util.ImageURIFromString(util.JoinV(":", image, tag))

	assert.Equal(t, res.Host, "reg.dyrector.io/library")
	assert.Equal(t, res.Name, "nginx")
	assert.Equal(t, res.Tag, tag)
	assert.Nil(t, err)
}

func TestNameInvalid(t *testing.T) {
	image := "reg.dyrector.io/library/inv:alid"
	tag := "te:st"

	res, err := util.ImageURIFromString(util.JoinV(":", image, tag))

	assert.Nil(t, res)
	assert.ErrorIs(t, err, &util.MultiColonRegistryURIError{})
	log.Println(err.Error())
}

func TestImageToStringDockerHub(t *testing.T) {
	image := &util.ImageURI{Host: "", Name: "nginx", Tag: "latest"}

	assert.Equal(t, "docker.io/library/nginx:latest", image.String())
	assert.Equal(t, "docker.io/library/nginx", image.StringNoTag())
}

func TestImageToStringPrivateRegistry(t *testing.T) {
	image := &util.ImageURI{Host: "reg.sunilium.com", Name: "helios/platform-iam", Tag: "1.0.0.sta-20210721.1"}

	assert.Equal(t, "reg.sunilium.com/helios/platform-iam:1.0.0.sta-20210721.1", image.String())
	assert.Equal(t, "reg.sunilium.com/helios/platform-iam", image.StringNoTag())
}

func TestImageToStringWithoutTag(t *testing.T) {
	image := &util.ImageURI{Host: "", Name: "alpine"}

	assert.Equal(t, "docker.io/library/alpine:latest", image.String())
	assert.Equal(t, "docker.io/library/alpine", image.StringNoTag())
}
