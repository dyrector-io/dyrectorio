package image

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/dyrector-io/dyrectorio/golang/internal/logdefer"
	"github.com/dyrector-io/dyrectorio/golang/internal/util"
	"github.com/dyrector-io/dyrectorio/protobuf/go/agent"

	"github.com/docker/distribution/reference"
	"github.com/docker/docker/api/types/filters"
	"github.com/docker/docker/api/types/image"
	"github.com/docker/docker/api/types/registry"
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
	Progress       string `json:"progress"`
	ProgressDetail struct {
		Current int64 `json:"current"`
		Total   int64 `json:"total"`
	} `json:"progressDetail"`
}

type remoteCheck struct {
	Client          client.APIClient
	DistributionRef reference.Named
	EncodedAuth     string
}

type ExistResult struct {
	LocalExists  bool
	RemoteExists bool
	Matching     bool
}

var (
	errDigestMismatch  = errors.New("digest mismatch")
	errDigestsMatching = errors.New("digests already matching")
)

var (
	ErrInvalidTag   = errors.New("invalid image tag")
	ErrInvalidImage = errors.New("invalid image")
)

func GetRegistryURL(reg *string, registryAuth *RegistryAuth) string {
	if registryAuth != nil {
		return registryAuth.URL
	} else if reg != nil {
		return *reg
	}
	return ""
}

func GetRegistryURLProto(reg *string, registryAuth *agent.RegistryAuth) string {
	if registryAuth != nil {
		return registryAuth.Url
	} else if reg != nil {
		return *reg
	}
	return ""
}

func GetImageByReference(ctx context.Context, cli client.APIClient, ref string) (*image.Summary, error) {
	images, err := cli.ImageList(ctx, image.ListOptions{
		Filters: filters.NewArgs(filters.KeyValuePair{Key: "reference", Value: ref}),
	})
	if err != nil {
		return nil, err
	}
	if len(images) == 0 {
		return nil, errors.New("image not found with the given reference")
	}

	if len(images) == 1 {
		return &images[0], nil
	}

	return nil, errors.New("found more than 1 image with the same reference")
}

// Exists checks local references using a filter, this uses exact matching
func Exists(
	ctx context.Context, cli client.APIClient,
	logger io.StringWriter, expandedImageName, encodedAuth string,
) (*ExistResult, error) {
	exists := ExistResult{}
	images, err := cli.ImageList(ctx, image.ListOptions{
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

		return nil, err
	}

	if count := len(images); count == 1 {
		exists.LocalExists = true
	} else if count > 1 {
		return nil, errors.New("unexpected image count")
	}

	craneOpts := []crane.Option{}

	if encodedAuth != "" {
		basicAuth, convertError := authConfigToBasicAuth(encodedAuth)
		if convertError != nil {
			return nil, convertError
		}
		craneOpts = append(craneOpts, crane.WithAuth(authn.FromConfig(authn.AuthConfig{Auth: basicAuth})))
	}
	remoteDigest, err := crane.Digest(expandedImageName, craneOpts...)
	if err != nil {
		if manifestErr, ok := err.(*transport.Error); ok {
			if manifestErr.StatusCode == http.StatusNotFound {
				exists.RemoteExists = false
			}
		}
	}

	if exists.LocalExists && exists.RemoteExists {
		exists.Matching = images[0].ID == remoteDigest
	}

	return &exists, nil
}

// force pulls the given image name
// TODO(@nandor-magyar): the output from docker is not really nice, should be improved
func Pull(ctx context.Context, cli client.APIClient, logger io.StringWriter, expandedImageName, authCreds string) error {
	var err error
	if logger != nil {
		_, err = logger.WriteString("Pulling image: " + expandedImageName)
		if err != nil {
			//nolint:forbidigo
			fmt.Printf("Failed to write log: %s", err.Error())
		}
	}

	reader, err := cli.ImagePull(ctx, expandedImageName, image.PullOptions{RegistryAuth: authCreds})
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
						float64(pullResult.ProgressDetail.Current)/float64(pullResult.ProgressDetail.Total)*100)) //nolint:mnd
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

func parseDistributionRef(imageName string) (reference.Named, error) {
	distributionRef, nameErr := reference.ParseNormalizedNamed(imageName)
	switch {
	case nameErr != nil:
		return nil, nameErr
	case reference.IsNameOnly(distributionRef):
		distributionRef = reference.TagNameOnly(distributionRef)
		if tagged, ok := distributionRef.(reference.Tagged); ok {
			log.Info().Msgf("Using default tag for image %s", tagged.String())
		}
	}
	return distributionRef, nil
}

func shouldUseLocalImage(ctx context.Context, cli client.APIClient,
	distributionRef reference.Named, encodedAuth string, preferLocal bool,
) (bool, error) {
	err := checkRemote(ctx, remoteCheck{
		Client:          cli,
		DistributionRef: distributionRef,
		EncodedAuth:     encodedAuth,
	})
	if err != nil {
		// Local image is present, but does not match the remote image
		if errors.Is(err, errDigestMismatch) && !errors.Is(err, ErrLocalImageNotFound) {
			return preferLocal, nil
		}

		if errors.Is(err, errDigestsMatching) {
			return true, nil
		}

		// Swallowing specific errors
		if !errors.Is(err, errDigestMismatch) && !errors.Is(err, ErrImageNotFound) {
			return false, err
		}
	}

	return false, nil
}

func pullImage(ctx context.Context, cli client.APIClient, imageName, encodedAuth string) (io.ReadCloser, error) {
	options := image.PullOptions{
		RegistryAuth: encodedAuth,
	}

	responseBody, err := cli.ImagePull(ctx, imageName, options)
	if err != nil {
		if errdefs.IsSystem(err) && strings.Contains(err.Error(), "manifest unknown") {
			return nil, ErrImageNotFound
		}
		return nil, err
	}

	return responseBody, nil
}

// CustomImagePull is a client side `smart` Pull, that only pulls if the digests are not matching
func CustomImagePull(ctx context.Context, cli client.APIClient,
	imageName, encodedAuth string, imagePriority PullPriority, displayFn PullDisplayFn,
) error {
	distributionRef, err := parseDistributionRef(imageName)
	if err != nil {
		return err
	}

	if imagePriority != ForcePull {
		useLocalImage, localImageErr := shouldUseLocalImage(ctx, cli, distributionRef, encodedAuth, imagePriority == PreferLocal)
		if localImageErr != nil {
			return err
		}

		if useLocalImage {
			log.Debug().Msgf("using local image")
			return nil
		}
	}

	responseBody, err := pullImage(ctx, cli, imageName, encodedAuth)
	if err != nil {
		return err
	}
	defer logdefer.LogDeferredErr(responseBody.Close, log.Warn(), "error in defer when closing pull response body:")

	if displayFn == nil {
		_, discardErr := io.Copy(io.Discard, responseBody)
		return discardErr
	}

	return displayFn(fmt.Sprintf("Pull %v status:", imageName), responseBody)
}

// check local and remote registry for container image and do digest comparison
func checkRemote(ctx context.Context, check remoteCheck) (err error) {
	localImageNotFound := false
	insp, _, err := check.Client.ImageInspectWithRaw(ctx, check.DistributionRef.String())
	if err != nil {
		if errdefs.IsNotFound(err) {
			localImageNotFound = true
		} else {
			return err
		}
	}

	craneOpts := []crane.Option{}

	if check.EncodedAuth != "" {
		basicAuth, convertError := authConfigToBasicAuth(check.EncodedAuth)
		if convertError != nil {
			return convertError
		}
		craneOpts = append(craneOpts, crane.WithAuth(authn.FromConfig(authn.AuthConfig{Auth: basicAuth})))
	}
	remoteDigest, err := crane.Digest(check.DistributionRef.String(), craneOpts...)
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
		fmt.Sprintf("%v@%v", reference.FamiliarName(reference.TrimNamed(check.DistributionRef)), remoteDigest), insp.RepoDigests)
	if !util.Contains(insp.RepoDigests,
		fmt.Sprintf("%v@%v", reference.FamiliarName(reference.TrimNamed(check.DistributionRef)), remoteDigest)) {
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

func ParseReference(img string) (reference.Reference, error) {
	return reference.ParseAnyReference(img)
}

func ExpandImageName(imageWithTag string) (string, error) {
	ref, err := ParseReference(imageWithTag)
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

func ExpandImageNameWithTag(img, tag string) (string, error) {
	ref, err := ParseReference(img)
	if err != nil {
		return "", err
	}

	anchoredTagRegexp := regexp.MustCompile(`^` + reference.TagRegexp.String() + `$`)

	if !anchoredTagRegexp.MatchString(tag) {
		return "", ErrInvalidTag
	}

	named, ok := ref.(reference.Named)
	if !ok {
		return "", ErrInvalidImage
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

	var authOpts registry.AuthConfig
	err = json.Unmarshal(authConfigJSON, &authOpts)
	if err != nil {
		return "", err
	}

	basicAuthString := fmt.Sprintf("%s:%s", authOpts.Username, authOpts.Password)

	return base64.URLEncoding.EncodeToString([]byte(basicAuthString)), nil
}
