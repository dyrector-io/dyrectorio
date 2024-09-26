//go:build unit
// +build unit

package image_test

import (
	"encoding/base64"
	"testing"

	"github.com/stretchr/testify/assert"

	imageHelper "github.com/dyrector-io/dyrectorio/golang/internal/helper/image"
	"github.com/dyrector-io/dyrectorio/golang/internal/pointer"
	"github.com/dyrector-io/dyrectorio/protobuf/go/agent"
)

type RegistryTestCase struct {
	Name        string
	Registry    *string
	RegistryUrl *string
	ExpectedUrl string
}

func TestRegistryWithTable(t *testing.T) {
	testCases := []RegistryTestCase{
		{
			Name:        "Test registry url",
			Registry:    pointer.NewPTR[string](""),
			RegistryUrl: pointer.NewPTR[string]("test"),
			ExpectedUrl: "test",
		},
		{
			Name:        "Test registry url priority",
			Registry:    pointer.NewPTR[string]("other"),
			RegistryUrl: pointer.NewPTR[string]("test"),
			ExpectedUrl: "test",
		},
		{
			Name:        "Test registry url empty",
			Registry:    nil,
			RegistryUrl: nil,
			ExpectedUrl: "",
		},
		{
			Name:        "Test registry url registry",
			Registry:    pointer.NewPTR[string]("other"),
			RegistryUrl: nil,
			ExpectedUrl: "other",
		},
	}

	for _, tC := range testCases {
		t.Run(tC.Name, func(t *testing.T) {
			if tC.RegistryUrl == nil {
				url := imageHelper.GetRegistryURL(tC.Registry, nil)
				assert.Equal(t, url, tC.ExpectedUrl)
			} else {
				auth := &imageHelper.RegistryAuth{URL: *tC.RegistryUrl}
				url := imageHelper.GetRegistryURL(tC.Registry, auth)
				assert.Equal(t, url, tC.ExpectedUrl)
			}
		})
	}
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
	testCases := []struct {
		name     string
		desc     string
		image    string
		expImage string
		expErr   error
	}{
		{
			name:     "defaultExpand",
			desc:     "plain image is expanded to latest tag and it prefixing",
			image:    "nginx",
			expImage: "docker.io/library/nginx:latest",
		},
		{
			name:     "expandWithTag",
			desc:     "plain image name with tag keeps tag",
			image:    "nginx:tag",
			expImage: "docker.io/library/nginx:tag",
		},
		{
			name:     "expandWithRegistry",
			desc:     "image is expanded to latest tag and it has its registry when provided",
			image:    "my-reg.com/library/nginx",
			expImage: "my-reg.com/library/nginx:latest",
		},
		{
			name:     "remainsOriginalIfFullyQuialified",
			desc:     "plain image is not really expanded, keeps its original form",
			image:    "my-reg.com/library/nginx:my-tag",
			expImage: "my-reg.com/library/nginx:my-tag",
		},
		{
			name:     "ifNotLowerCaseThatisFineAndRespected",
			desc:     "image is expanded regardless not just lowercase characters were provided, tags can be uppercase",
			image:    "ghcr.io/test-org/image:MixedCase",
			expImage: "ghcr.io/test-org/image:MixedCase",
		},
	}
	for _, tC := range testCases {
		t.Run(tC.name, func(t *testing.T) {
			res, err := imageHelper.ExpandImageName(tC.image)
			if tC.expErr != nil {
				assert.ErrorIs(t, err, tC.expErr)
			}
			assert.Equal(t, tC.expImage, res, tC.desc)
		})
	}
}

func TestExpandImageNameWithTag(t *testing.T) {
	testCases := []struct {
		name     string
		desc     string
		image    string
		tag      string
		expImage string
		expErr   error
	}{
		{
			name:     "expandWithoutTag",
			desc:     "expand with image with tag in param, without any tag provided in the image",
			image:    "nginx",
			tag:      "tag-1",
			expImage: "docker.io/library/nginx:tag-1",
		},
		{
			name:     "expandWithTag",
			desc:     "expand with image with tag in param, with tag provided in the image",
			image:    "nginx:mytag",
			tag:      "tag-2",
			expImage: "docker.io/library/nginx:tag-2",
		},
		{
			name:     "customRegCustomTagExpandNoTag",
			desc:     "expand with custom image provided tag, without any tag provided in the image",
			image:    "my-reg.com/library/nginx",
			tag:      "tag-3",
			expImage: "my-reg.com/library/nginx:tag-3",
		},
		{
			name:     "customRegCustomTagExpandWithTag",
			desc:     "expand with custom provided tag, with a tag present already in the image",
			image:    "my-reg.com/library/nginx:my-tag",
			tag:      "tag-4",
			expImage: "my-reg.com/library/nginx:tag-4",
		},
		{
			name:     "invalidTagChars",
			desc:     "if invalid characters are in the tag it throws error",
			image:    "my-reg.com/library/nginx",
			tag:      "-12@3%44-",
			expImage: "",
			expErr:   imageHelper.ErrInvalidTag,
		},
		{
			name:     "capitalsHandled",
			desc:     "with capitals in the image parsing works smoothly",
			image:    "my-reg.com/Library/nginx:my-tag",
			tag:      "tag-4",
			expImage: "my-reg.com/library/nginx:tag-4",
		},
	}
	for _, tC := range testCases {
		t.Run(tC.name, func(t *testing.T) {
			res, err := imageHelper.ExpandImageNameWithTag(tC.image, tC.tag)
			if tC.expErr != nil {
				assert.ErrorIs(t, err, tC.expErr)
			}
			assert.Equal(t, tC.expImage, res, tC.desc)
		})
	}
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

func TestAuthConfigToBasicAuth(t *testing.T) {
	authConfig := "{\"username\":\"test-user\",\"password\":\"test-password\"}"
	encodedAuth := base64.URLEncoding.EncodeToString([]byte(authConfig))

	expectedBasicAuth := "test-user:test-password"
	expected := base64.URLEncoding.EncodeToString([]byte(expectedBasicAuth))

	basicAuth, err := imageHelper.AuthConfigToBasicAuth(encodedAuth)

	assert.NoError(t, err)
	assert.Equal(t, expected, basicAuth)
}

func TestParseDistribRefErr(t *testing.T) {
	_, err := imageHelper.ParseDistributionRef("invalid%image!123-name::")
	assert.NotNil(t, err, "invalid image name triggers image name parse error")
}

func TestParseDistribRef(t *testing.T) {
	name, err := imageHelper.ParseDistributionRef("nginx:latest")
	assert.Nil(t, err, "valid image name does not trigger any error, and it is expanded properly")
	assert.Equal(t, "docker.io/library/nginx:latest", name.String())
	name, err = imageHelper.ParseDistributionRef("nginx")
	assert.Nil(t, err, "valid image name does not trigger any error even without a tag, default tag is appended")
	assert.Equal(t, "docker.io/library/nginx:latest", name.String())
}
