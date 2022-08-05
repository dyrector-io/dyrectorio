package util

import (
	"strings"

	builder "github.com/dyrector-io/dyrectorio/agent/pkg/containerbuilder"
	"github.com/dyrector-io/dyrectorio/protobuf/go/agent"
)

type ImageURI struct {
	Host string
	Name string
	Tag  string
}

type EmptyImageError struct{}

func (e *EmptyImageError) Error() string {
	return "Empty image name is not valid"
}

type MultiColonRegistryURIError struct{}

func (e *MultiColonRegistryURIError) Error() string {
	return "multiple colons in registry URI"
}

type InvalidImageURIError struct {
	Image string
}

func (e *InvalidImageURIError) Error() string {
	return "No colons in registry URI: " + e.Image
}

const PartCountAfterSplitByColon = 2

// ImageURIFromString results in an image that is split respectively
// imageName can be fully qualified or dockerhub image name plus tag
func ImageURIFromString(imageName string) (*ImageURI, error) {
	if imageName == "" {
		return nil, &EmptyImageError{}
	}

	image := &ImageURI{}

	nameArr := strings.Split(imageName, ":")

	if len(nameArr) == 1 {
		return nil, &InvalidImageURIError{Image: imageName}
	} else if len(nameArr) > PartCountAfterSplitByColon {
		return nil, &MultiColonRegistryURIError{}
	} else if len(nameArr) == PartCountAfterSplitByColon {
		image.Tag = nameArr[1]
	}

	if strings.ContainsRune(nameArr[0], '/') {
		// split by / tokens
		repoArr := strings.Split(nameArr[0], "/")
		// taking the last element into the result
		image.Name = repoArr[len(repoArr)-1]
		// removing the last element
		repoArr = repoArr[:len(repoArr)-1]
		// conjoining the remaining into the result
		image.Host = JoinV("/", repoArr...)
	} else {
		image.Name = nameArr[0]
	}

	return image, nil
}

func (image *ImageURI) String() string {
	setDefaults(image)
	return JoinV("/", image.Host, image.Name+":"+image.Tag)
}

func (image *ImageURI) StringNoTag() string {
	setDefaults(image)
	return JoinV("/", image.Host, image.Name)
}

func setDefaults(image *ImageURI) {
	if image.Host == "" {
		image.Host = "docker.io/library"
	}
	if image.Tag == "" {
		image.Tag = "latest"
	}
}

func GetRegistryURL(registry *string, registryAuth *builder.RegistryAuth) string {
	if registryAuth != nil {
		return registryAuth.URL
	} else if registry != nil {
		return *registry
	} else {
		return ""
	}
}

func GetRegistryURLProto(registry *string, registryAuth *agent.DeployRequest_RegistryAuth) string {
	if registryAuth != nil {
		return registryAuth.Url
	} else if registry != nil {
		return *registry
	} else {
		return ""
	}
}
