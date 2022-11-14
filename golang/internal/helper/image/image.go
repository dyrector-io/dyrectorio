package image

import (
	"fmt"
	"strings"

	"github.com/dyrector-io/dyrectorio/protobuf/go/agent"

	"github.com/dyrector-io/dyrectorio/golang/internal/util"
	builder "github.com/dyrector-io/dyrectorio/golang/pkg/builder/container"
)

type URI struct {
	Host string
	Name string
	Tag  string
}

type EmptyError struct{}

func (e *EmptyError) Error() string {
	return "empty image name is not valid"
}

type MultiColonRegistryURIError struct{}

func (e *MultiColonRegistryURIError) Error() string {
	return "multiple colons in registry URI"
}

type InvalidURIError struct {
	Image string
}

func (e *InvalidURIError) Error() string {
	return "no colons in registry URI: " + e.Image
}

const PartCountAfterSplitByColon = 2

// ImageURIFromString results in an image that is split respectively
// imageName can be fully qualified or dockerhub image name plus tag
func URIFromString(imageName string) (*URI, error) {
	if imageName == "" {
		return nil, &EmptyError{}
	}

	image := &URI{}

	nameArr := strings.Split(imageName, ":")

	if len(nameArr) == 1 {
		return nil, &InvalidURIError{Image: imageName}
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
		image.Host = util.JoinV("/", repoArr...)
	} else {
		image.Name = nameArr[0]
	}

	return image, nil
}

func (image *URI) String() string {
	setDefaults(image)
	return fmt.Sprintf("%s/%s", image.Host, image.Name+":"+image.Tag)
}

func (image *URI) StringNoTag() string {
	setDefaults(image)
	return fmt.Sprintf("%s/%s", image.Host, image.Name)
}

func setDefaults(image *URI) {
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

func GetRegistryURLProto(registry *string, registryAuth *agent.RegistryAuth) string {
	if registryAuth != nil {
		return registryAuth.Url
	} else if registry != nil {
		return *registry
	} else {
		return ""
	}
}
