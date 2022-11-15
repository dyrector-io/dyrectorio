//go:build unit
// +build unit

package image_test

import (
	"testing"

	"github.com/rs/zerolog/log"
	"github.com/stretchr/testify/assert"

	imageHelper "github.com/dyrector-io/dyrectorio/golang/internal/helper/image"
	"github.com/dyrector-io/dyrectorio/golang/internal/util"
	builder "github.com/dyrector-io/dyrectorio/golang/pkg/builder/container"
	"github.com/dyrector-io/dyrectorio/protobuf/go/agent"
)

func TestNameEmpty(t *testing.T) {
	empty := ""
	res, err := imageHelper.URIFromString(empty)

	assert.Nil(t, res)
	assert.ErrorIs(t, err, &imageHelper.EmptyError{})
	log.Print(err.Error())
}

func TestNameShort(t *testing.T) {
	image := "nginx"
	tag := "latest"
	res, err := imageHelper.URIFromString(util.JoinV(":", image, tag))

	assert.Equal(t, res.Host, "")
	assert.Equal(t, res.Name, image)
	assert.Equal(t, res.Tag, tag)
	assert.Nil(t, err)
}

func TestNameNoTag(t *testing.T) {
	imageName := "nginx"
	res, err := imageHelper.URIFromString(imageName)

	assert.Nil(t, res)
	testErr := &imageHelper.InvalidURIError{Image: imageName}
	assert.Equal(t, err.Error(), testErr.Error())
}

func TestNameFullyQualified(t *testing.T) {
	image := "reg.dyrector.io/library/nginx"
	tag := "test"

	res, err := imageHelper.URIFromString(util.JoinV(":", image, tag))

	assert.Equal(t, res.Host, "reg.dyrector.io/library")
	assert.Equal(t, res.Name, "nginx")
	assert.Equal(t, res.Tag, tag)
	assert.Nil(t, err)
}

func TestNameInvalid(t *testing.T) {
	image := "reg.dyrector.io/library/inv:alid"
	tag := "te:st"

	res, err := imageHelper.URIFromString(util.JoinV(":", image, tag))

	assert.Nil(t, res)
	assert.ErrorIs(t, err, &imageHelper.MultiColonRegistryURIError{})
	log.Print(err.Error())
}

func TestImageToStringDockerHub(t *testing.T) {
	image := &imageHelper.URI{Host: "", Name: "nginx", Tag: "latest"}

	assert.Equal(t, "docker.io/library/nginx:latest", image.String())
	assert.Equal(t, "docker.io/library/nginx", image.StringNoTag())
}

func TestImageToStringPrivateRegistry(t *testing.T) {
	image := &imageHelper.URI{Host: "reg.example.com", Name: "example-project/service-api", Tag: "latest"}

	assert.Equal(t, "reg.example.com/example-project/service-api:latest", image.String())
	assert.Equal(t, "reg.example.com/example-project/service-api", image.StringNoTag())
}

func TestImageToStringWithoutTag(t *testing.T) {
	image := &imageHelper.URI{Host: "", Name: "alpine"}

	assert.Equal(t, "docker.io/library/alpine:latest", image.String())
	assert.Equal(t, "docker.io/library/alpine", image.StringNoTag())
}

func TestRegistryUrl(t *testing.T) {
	auth := &builder.RegistryAuth{
		URL: "test",
	}

	url := imageHelper.GetRegistryURL(nil, auth)
	assert.Equal(t, url, "test")
}

func TestRegistryUrlPriority(t *testing.T) {
	registry := "other"
	auth := &builder.RegistryAuth{
		URL: "test",
	}

	url := imageHelper.GetRegistryURL(&registry, auth)
	assert.Equal(t, url, "test")
}

func TestRegistryUrlRegistry(t *testing.T) {
	registry := "other"

	url := imageHelper.GetRegistryURL(&registry, nil)
	assert.Equal(t, url, "other")
}

func TestRegistryUrlEmpty(t *testing.T) {
	url := imageHelper.GetRegistryURL(nil, nil)
	assert.Equal(t, url, "")
}

func TestProtoRegistryUrl(t *testing.T) {
	auth := &agent.RegistryAuth{
		Url: "test",
	}

	url := imageHelper.GetRegistryURLProto(nil, auth)
	assert.Equal(t, url, "test")
}

func TestProtoRegistryUrlPriority(t *testing.T) {
	registry := "other"
	auth := &agent.RegistryAuth{
		Url: "test",
	}

	url := imageHelper.GetRegistryURLProto(&registry, auth)
	assert.Equal(t, url, "test")
}

func TestProtoRegistryUrlRegistry(t *testing.T) {
	registry := "other"

	url := imageHelper.GetRegistryURLProto(&registry, nil)
	assert.Equal(t, url, "other")
}

func TestProtoRegistryUrlEmpty(t *testing.T) {
	url := imageHelper.GetRegistryURLProto(nil, nil)
	assert.Equal(t, url, "")
}
