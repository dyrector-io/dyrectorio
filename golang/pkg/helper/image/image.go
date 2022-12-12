package image

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"strings"
	"time"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/filters"
	"github.com/docker/docker/client"
	"github.com/rs/zerolog/log"

	"github.com/dyrector-io/dyrectorio/protobuf/go/agent"
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

// PullResponse is not explicit
type PullResponse struct {
	ID             string `json:"id"`
	Status         string `json:"status"`
	ProgressDetail struct {
		Current int64 `json:"current"`
		Total   int64 `json:"total"`
	} `json:"progressDetail"`
	Progress string `json:"progress"`
}

const MaxColonsInURI = 2

// ImageURIFromString results in an image that is split respectively
// imageName can be fully qualified or dockerhub image name plus tag
func URIFromString(imageName string) (*URI, error) {
	if imageName == "" {
		return nil, &EmptyError{}
	}

	image := &URI{}

	if strings.Count(imageName, ":") > MaxColonsInURI {
		return nil, &MultiColonRegistryURIError{}
	}

	lastColon := strings.LastIndex(imageName, ":")
	if lastColon == -1 {
		return nil, &InvalidURIError{Image: imageName}
	}

	image.Tag = imageName[lastColon+1:]

	firstSlash := strings.Index(imageName, "/")
	if firstSlash != -1 {
		image.Host = imageName[0:firstSlash]
	}

	image.Name = imageName[firstSlash+1 : lastColon]

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

func GetRegistryURL(registry *string, registryAuth *RegistryAuth) string {
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

func GetImageByReference(ctx context.Context, reference string) (*types.ImageSummary, error) {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return nil, err
	}

	images, err := cli.ImageList(ctx, types.ImageListOptions{
		Filters: filters.NewArgs(filters.KeyValuePair{Key: "reference", Value: reference}),
	})
	if err != nil {
		return nil, err
	}

	if len(images) == 1 {
		return &images[0], nil
	}

	return nil, errors.New("found more than 1 image with the same reference")
}

func Exists(ctx context.Context, logger io.StringWriter, fullyQualifiedImageName string) (bool, error) {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return false, err
	}

	images, err := cli.ImageList(ctx, types.ImageListOptions{
		Filters: filters.NewArgs(filters.KeyValuePair{Key: "reference", Value: fullyQualifiedImageName}),
	})
	if err != nil {
		if logger != nil {
			_, err = logger.WriteString("Failed to list images")
			if err != nil {
				//nolint
				fmt.Printf("Failed to write log: %s", err.Error())
			}
		}

		return false, err
	}

	if count := len(images); count == 1 {
		return true, nil
	} else if count > 1 {
		return false, errors.New("unexpected image count")
	}

	return false, nil
}

// force pulls the given image name
// todo(nandor-magyar): the output from docker is not really nice, should be improved
func Pull(ctx context.Context, logger io.StringWriter, fullyQualifiedImageName, authCreds string) error {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return err
	}

	if logger != nil {
		_, err = logger.WriteString("Pulling image: " + fullyQualifiedImageName)
		if err != nil {
			//nolint
			fmt.Printf("Failed to write log: %s", err.Error())
		}
	}

	reader, err := cli.ImagePull(ctx, fullyQualifiedImageName, types.ImagePullOptions{RegistryAuth: authCreds})
	if err != nil {
		return err
	}
	defer reader.Close()

	d := json.NewDecoder(reader)

	var lastLog time.Time
	for {
		pullResult := PullResponse{}
		err = d.Decode(&pullResult)
		if err == io.EOF {
			err = nil
			break
		} else if err != nil {
			log.Error().Stack().Err(err).Msg("Decode error")
			break
		}

		if logger != nil && time.Since(lastLog) > time.Second {
			var logErr error
			if pullResult.ProgressDetail.Current != 0 && pullResult.ProgressDetail.Total != 0 {
				_, logErr = logger.WriteString(
					fmt.Sprintf("Image: %s %s  %0.2f%%",
						pullResult.ID,
						pullResult.Status,
						float64(pullResult.ProgressDetail.Current)/float64(pullResult.ProgressDetail.Total)*100)) //nolint:gomnd
				lastLog = time.Now()
			} else {
				_, logErr = logger.WriteString(fmt.Sprintf("Image: %s %s", pullResult.ID, pullResult.Status))
				lastLog = time.Now()
			}
			if logErr != nil {
				//nolint
				fmt.Printf("Failed to write log: %s", logErr.Error())
			}
		}
	}

	return err
}
