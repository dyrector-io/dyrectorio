package image

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"time"

	"github.com/docker/distribution/reference"
	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/filters"
	"github.com/docker/docker/client"
	"github.com/rs/zerolog/log"

	"github.com/dyrector-io/dyrectorio/protobuf/go/agent"
)

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

func GetImageByReference(ctx context.Context, ref string) (*types.ImageSummary, error) {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return nil, err
	}

	images, err := cli.ImageList(ctx, types.ImageListOptions{
		Filters: filters.NewArgs(filters.KeyValuePair{Key: "reference", Value: ref}),
	})
	if err != nil {
		return nil, err
	}

	if len(images) == 1 {
		return &images[0], nil
	}

	return nil, errors.New("found more than 1 image with the same reference")
}

func Exists(ctx context.Context, logger io.StringWriter, expandedImageName string) (bool, error) {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return false, err
	}

	images, err := cli.ImageList(ctx, types.ImageListOptions{
		Filters: filters.NewArgs(filters.KeyValuePair{Key: "reference", Value: expandedImageName}),
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
func Pull(ctx context.Context, logger io.StringWriter, expandedImageName, authCreds string) error {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return err
	}

	if logger != nil {
		_, err = logger.WriteString("Pulling image: " + expandedImageName)
		if err != nil {
			//nolint
			fmt.Printf("Failed to write log: %s", err.Error())
		}
	}

	reader, err := cli.ImagePull(ctx, expandedImageName, types.ImagePullOptions{RegistryAuth: authCreds})
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

func ExpandImageName(imageWithTag string) (string, error) {
	ref, err := reference.ParseAnyReference(imageWithTag)
	if err != nil {
		return "", err
	}

	named, ok := ref.(reference.Named)
	if !ok {
		return "", errors.New("invalid image with tag")
	}

	if reference.IsNameOnly(named) {
		return reference.TagNameOnly(named).String(), nil
	}

	return named.String(), nil
}

func ExpandImageNameWithTag(image, tag string) (string, error) {
	ref, err := reference.ParseAnyReference(image)
	if err != nil {
		return "", err
	}

	named, ok := ref.(reference.Named)
	if !ok {
		return "", errors.New("invalid image with tag")
	}

	if reference.IsNameOnly(named) {
		return fmt.Sprintf("%s:%s", named.String(), tag), nil
	}

	ref, err = reference.WithTag(named, tag)
	if err != nil {
		return "", err
	}

	return ref.String(), nil
}

func SplitImageName(expandedImageName string) (name, tag string, err error) {
	ref, err := reference.ParseNamed(expandedImageName)
	if err != nil {
		return "", "", err
	}

	tagged, ok := ref.(reference.NamedTagged)
	if !ok {
		return "", "", errors.New("image name is not tagged")
	}

	return tagged.Name(), tagged.Tag(), nil
}
