package image

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/dyrector-io/dyrectorio/golang/internal/logdefer"
	"github.com/dyrector-io/dyrectorio/golang/internal/util"
	"github.com/dyrector-io/dyrectorio/protobuf/go/agent"

	"github.com/docker/distribution/reference"
	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/filters"
	"github.com/docker/docker/client"
	"github.com/docker/docker/errdefs"
	"github.com/google/go-containerregistry/pkg/authn"
	"github.com/google/go-containerregistry/pkg/crane"
	"github.com/google/go-containerregistry/pkg/v1/remote/transport"
	"github.com/rs/zerolog/log"
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

type remoteCheck struct {
	client          client.APIClient
	distributionRef reference.Named
	encodedAuth     string
}

var (
	errDigestMismatch  = errors.New("digest mismatch")
	errDigestsMatching = errors.New("digests already matching")
)

func GetRegistryURL(reg *string, registryAuth *RegistryAuth) string {
	if registryAuth != nil {
		return registryAuth.URL
	} else if reg != nil {
		return *reg
	} else {
		return ""
	}
}

func GetRegistryURLProto(reg *string, registryAuth *agent.RegistryAuth) string {
	if registryAuth != nil {
		return registryAuth.Url
	} else if reg != nil {
		return *reg
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

// Exists checks local references using a filter, this uses exact matching
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
				//nolint:forbidigo
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
// TODO(@nandor-magyar): the output from docker is not really nice, should be improved
func Pull(ctx context.Context, logger io.StringWriter, expandedImageName, authCreds string) error {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return err
	}

	if logger != nil {
		_, err = logger.WriteString("Pulling image: " + expandedImageName)
		if err != nil {
			//nolint:forbidigo
			fmt.Printf("Failed to write log: %s", err.Error())
		}
	}

	reader, err := cli.ImagePull(ctx, expandedImageName, types.ImagePullOptions{RegistryAuth: authCreds})
	if err != nil {
		return err
	}
	defer logdefer.LogDeferredErr(reader.Close, log.Warn(), "error closing image pull reader")

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
				//nolint:forbidigo
				fmt.Printf("Failed to write log: %s", logErr.Error())
			}
		}
	}

	return err
}

// CustomImagePull is a client side `smart` Pull, that only pulls if the digests are not matching
func CustomImagePull(ctx context.Context, imageName, encodedAuth string, forcePull, preferLocal bool, displayFn PullDisplayFn) error {
	distributionRef, nameErr := reference.ParseNormalizedNamed(imageName)
	switch {
	case nameErr != nil:
		return nameErr
	case reference.IsNameOnly(distributionRef):
		distributionRef = reference.TagNameOnly(distributionRef)
		if tagged, ok := distributionRef.(reference.Tagged); ok {
			log.Info().Msgf("Using default tag for image %s", tagged.String())
		}
	}

	cli, cliErr := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if cliErr != nil {
		return cliErr
	}

	if !forcePull {
		err := checkRemote(ctx, remoteCheck{
			client:          cli,
			distributionRef: distributionRef,
			encodedAuth:     encodedAuth,
		})
		if err != nil {
			if preferLocal &&
				(errors.Is(err, errDigestMismatch) && !errors.Is(err, ErrLocalImageNotFound)) {
				log.Debug().Msgf("using local image")
				return nil
			}
			if errors.Is(err, errDigestsMatching) {
				return nil
			}
			if !(errors.Is(err, errDigestMismatch) || errors.Is(err, ErrImageNotFound)) {
				return err
			}
		}
	}
	options := types.ImagePullOptions{
		RegistryAuth: encodedAuth,
	}

	responseBody, err := cli.ImagePull(ctx, imageName, options)
	if err != nil {
		return err
	}
	defer logdefer.LogDeferredErr(responseBody.Close, log.Warn(), "error in defer when closing pull response body:")

	if displayFn == nil {
		return nil
	}

	return displayFn(fmt.Sprintf("Pull %v status:", imageName), responseBody)
}

// check local and remote registry for container image and do digest comparison
func checkRemote(ctx context.Context, check remoteCheck) (err error) {
	localImageNotFound := false
	insp, _, err := check.client.ImageInspectWithRaw(ctx, check.distributionRef.String())
	if err != nil {
		if errdefs.IsNotFound(err) {
			localImageNotFound = true
		} else {
			return err
		}
	}

	craneOpts := []crane.Option{}

	if check.encodedAuth != "" {
		basicAuth, convertError := authConfigToBasicAuth(check.encodedAuth)
		if convertError != nil {
			return convertError
		}
		craneOpts = append(craneOpts, crane.WithAuth(authn.FromConfig(authn.AuthConfig{Auth: basicAuth})))
	}
	remoteDigest, err := crane.Digest(check.distributionRef.String(), craneOpts...)
	if err != nil {
		if localImageNotFound {
			if manifestErr, ok := err.(*transport.Error); ok {
				if manifestErr.StatusCode == http.StatusNotFound {
					return errors.Join(ErrImageNotFound, ErrLocalImageNotFound)
				}
			}

			return err
		}
	}

	log.Debug().Msgf("%v in %v",
		fmt.Sprintf("%v@%v", reference.FamiliarName(reference.TrimNamed(check.distributionRef)), remoteDigest), insp.RepoDigests)
	if !util.Contains(insp.RepoDigests,
		fmt.Sprintf("%v@%v", reference.FamiliarName(reference.TrimNamed(check.distributionRef)), remoteDigest)) {
		if insp.ID == "" {
			return errors.Join(errDigestMismatch, ErrLocalImageNotFound)
		}

		return errDigestMismatch
	}

	if localImageNotFound {
		return ErrLocalImageNotFound
	}
	return errDigestsMatching
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

func SplitImageName(expandedImageName string) (imageName, tag string, tagError error) {
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

func authConfigToBasicAuth(authConfigEncoded string) (string, error) {
	authConfigJSON, err := base64.URLEncoding.DecodeString(authConfigEncoded)
	if err != nil {
		return "", err
	}

	var authOpts types.AuthConfig
	err = json.Unmarshal(authConfigJSON, &authOpts)
	if err != nil {
		return "", err
	}

	basicAuthString := fmt.Sprintf("%s:%s", authOpts.Username, authOpts.Password)

	return base64.URLEncoding.EncodeToString([]byte(basicAuthString)), nil
}
