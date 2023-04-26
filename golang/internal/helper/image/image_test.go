//go:build unit
// +build unit

package image_test

import (
	"testing"

	"github.com/stretchr/testify/assert"

	imageHelper "github.com/dyrector-io/dyrectorio/golang/internal/helper/image"
	"github.com/dyrector-io/dyrectorio/protobuf/go/agent"
)

func TestRegistryUrl(t *testing.T) {
	auth := &imageHelper.RegistryAuth{
		URL: "test",
	}

	url := imageHelper.GetRegistryURL(nil, auth)
	assert.Equal(t, url, "test")
}

func TestRegistryUrlPriority(t *testing.T) {
	registry := "other"
	auth := &imageHelper.RegistryAuth{
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

func TestExpandImageName(t *testing.T) {
	name, err := imageHelper.ExpandImageName("nginx")
	assert.NoError(t, err)
	assert.Equal(t, "docker.io/library/nginx:latest", name)

	name, err = imageHelper.ExpandImageName("nginx:tag")
	assert.NoError(t, err)
	assert.Equal(t, "docker.io/library/nginx:tag", name)

	name, err = imageHelper.ExpandImageName("my-reg.com/library/nginx")
	assert.NoError(t, err)
	assert.Equal(t, "my-reg.com/library/nginx:latest", name)

	name, err = imageHelper.ExpandImageName("my-reg.com/library/nginx:my-tag")
	assert.NoError(t, err)
	assert.Equal(t, "my-reg.com/library/nginx:my-tag", name)
}

func TestExpandImageNameWithTag(t *testing.T) {
	name, err := imageHelper.ExpandImageNameWithTag("nginx", "tag-1")
	assert.NoError(t, err)
	assert.Equal(t, "docker.io/library/nginx:tag-1", name)

	name, err = imageHelper.ExpandImageNameWithTag("nginx:tag", "tag-2")
	assert.NoError(t, err)
	assert.Equal(t, "docker.io/library/nginx:tag-2", name)

	name, err = imageHelper.ExpandImageNameWithTag("my-reg.com/library/nginx", "tag-3")
	assert.NoError(t, err)
	assert.Equal(t, "my-reg.com/library/nginx:tag-3", name)

	name, err = imageHelper.ExpandImageNameWithTag("my-reg.com/library/nginx:my-tag", "tag-4")
	assert.NoError(t, err)
	assert.Equal(t, "my-reg.com/library/nginx:tag-4", name)
}

func TestSplitImageName(t *testing.T) {
	_, _, err := imageHelper.SplitImageName("nginx")
	assert.Error(t, err)

	name, tag, err := imageHelper.SplitImageName("docker.io/library/nginx:tag-2")
	assert.NoError(t, err)
	assert.Equal(t, "docker.io/library/nginx", name)
	assert.Equal(t, "tag-2", tag)

	name, tag, err = imageHelper.SplitImageName("my-reg.com/test/nginx:tag-3")
	assert.Equal(t, "my-reg.com/test/nginx", name)
	assert.NoError(t, err)
	assert.Equal(t, "tag-3", tag)

	name, tag, err = imageHelper.SplitImageName("my-reg.com/test/nginx")
	assert.Error(t, err)
}
