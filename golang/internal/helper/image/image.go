package image

import (
	"context"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os"
	"runtime"
	"time"

	"github.com/dyrector-io/dyrectorio/golang/internal/logdefer"
	"github.com/dyrector-io/dyrectorio/protobuf/go/agent"

	"github.com/docker/cli/cli/command"
	configtypes "github.com/docker/cli/cli/config/types"
	"github.com/docker/cli/cli/trust"
	"github.com/docker/distribution/reference"
	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/filters"
	registrytypes "github.com/docker/docker/api/types/registry"
	"github.com/docker/docker/client"
	"github.com/docker/docker/pkg/jsonmessage"
	"github.com/docker/docker/registry"
	"github.com/opencontainers/go-digest"
	"github.com/rs/zerolog/log"
	notaryClient "github.com/theupdateframework/notary/client"
	"github.com/theupdateframework/notary/tuf/data"
)

type target struct {
	name   string
	digest digest.Digest
	size   int64
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

// Exists check local references using a filter, this uses exact matching
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
// TODO(nandor-magyar): the output from docker is not really nice, should be improved
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
				//nolint
				fmt.Printf("Failed to write log: %s", logErr.Error())
			}
		}
	}

	return err
}

func PrettyImagePull(ctx context.Context, remote string) (*PullStatus, error) {
	distributionRef, err := reference.ParseNormalizedNamed(remote)
	switch {
	case err != nil:
		return nil, err
	case reference.IsNameOnly(distributionRef):
		distributionRef = reference.TagNameOnly(distributionRef)
		if tagged, ok := distributionRef.(reference.Tagged); ok {
			fmt.Fprintf(os.Stdout, "Using default tag: %s\n", tagged.Tag())
		}
	}

	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return nil, err
	}
	imgRefAndAuth, err := trust.GetImageReferencesAndAuth(ctx, nil, ResolveAuthFn(), distributionRef.String())
	if err != nil {
		return nil, err
	}

	// Check if reference has a digest
	_, isCanonical := distributionRef.(reference.Canonical)
	if !isCanonical {
		return trustedPull(ctx, cli, &imgRefAndAuth)
	}
	status := PullStatus{}
	err = imagePullPrivileged(ctx, cli, &imgRefAndAuth, &status)
	return &status, err
}

func ResolveAuthFn() func(ctx context.Context, index *registrytypes.IndexInfo) types.AuthConfig {
	return func(ctx context.Context, index *registrytypes.IndexInfo) types.AuthConfig {
		return ResolveAuthConfig(ctx, "", index)
	}
}

func ResolveAuthConfig(_ context.Context, config string, index *registrytypes.IndexInfo) types.AuthConfig {
	return types.AuthConfig{}
}

func MergePulls(p1, p2 *PullStatus) *PullStatus {
	p1.LayerCompl += p2.LayerCompl
	p1.LayerCount += p2.LayerCount

	p1.SumProgress = float64(p1.LayerCompl) / float64(p1.LayerCount)
	return p1
}

func trustedPull(ctx context.Context, cli client.APIClient, imgRefAndAuth *trust.ImageRefAndAuth) (*PullStatus, error) {
	refs, err := getTrustedPullTargets(imgRefAndAuth)
	if err != nil {
		return nil, err
	}

	ref := imgRefAndAuth.Reference()
	status := PullStatus{}
	for i, r := range refs {
		displayTag := r.name
		if displayTag != "" {
			displayTag = ":" + displayTag
		}
		log.Debug().Msgf("Pull (%d of %d): %s%s@%s\n", i+1, len(refs), reference.FamiliarName(ref), displayTag, r.digest)
		trustedRef, err := reference.WithDigest(reference.TrimNamed(ref), r.digest)
		if err != nil {
			return nil, err
		}
		updatedImgRefAndAuth, err := trust.GetImageReferencesAndAuth(ctx, nil, ResolveAuthFn(), trustedRef.String())
		if err != nil {
			return nil, err
		}
		err = imagePullPrivileged(ctx, cli, &updatedImgRefAndAuth, &status)
		if err != nil {
			return nil, err
		}

		tagged, err := reference.WithTag(reference.TrimNamed(ref), r.name)
		if err != nil {
			return nil, err
		}

		if err := TagTrusted(ctx, cli, trustedRef, tagged); err != nil {
			return nil, err
		}
	}
	return &status, nil
}

// TagTrusted tags a trusted ref
func TagTrusted(ctx context.Context, cli client.APIClient, trustedRef reference.Canonical, ref reference.NamedTagged) error {
	// Use familiar references when interacting with client and output
	familiarRef := reference.FamiliarString(ref)
	trustedFamiliarRef := reference.FamiliarString(trustedRef)

	fmt.Fprintf(os.Stderr, "Tagging %s as %s\n", trustedFamiliarRef, familiarRef)

	return cli.ImageTag(ctx, trustedFamiliarRef, familiarRef)
}

func imagePullPrivileged(ctx context.Context, cli client.APIClient, imgRefAndAuth *trust.ImageRefAndAuth, status *PullStatus) error {
	ref := reference.FamiliarString(imgRefAndAuth.Reference())

	encodedAuth, err := command.EncodeAuthToBase64(*imgRefAndAuth.AuthConfig())
	if err != nil {
		return err
	}
	requestPrivilege := RegistryAuthenticationPrivilegedFunc(imgRefAndAuth.RepoInfo().Index, "pull")
	options := types.ImagePullOptions{
		RegistryAuth:  encodedAuth,
		PrivilegeFunc: requestPrivilege,
		All:           false,
		Platform:      runtime.GOOS,
	}

	responseBody, err := cli.ImagePull(ctx, ref, options)
	if err != nil {
		return err
	}
	defer logdefer.LogDeferredErr(responseBody.Close, log.Warn(), "image pull body close error")

	return JSONStreamToStatusStream(responseBody, status)
}

type DigestStatus struct {
	digest string
	status int64
}

type PullStatus struct {
	RefsChan    map[string]chan DigestStatus
	LayerCount  int
	LayerCompl  int
	SumProgress float64
}

func JSONStreamToStatusStream(respStream io.ReadCloser, stat *PullStatus) error {
	var (
		dec = json.NewDecoder(respStream)
		ids = make(map[string]uint)
	)

	for {
		var jm jsonmessage.JSONMessage
		if err := dec.Decode(&jm); err != nil {
			if err == io.EOF {
				break
			}
			return err
		}
		stat.LayerCount = len(ids)
		if jm.ID != "" && (jm.Progress != nil || jm.ProgressMessage != "") {
			_, ok := ids[jm.ID]
			if !ok {
				line := uint(len(ids))
				ids[jm.ID] = line
				stat.RefsChan[jm.ID] <- DigestStatus{jm.ID, jm.Progress.Current}
			}
			if jm.Progress.Current == jm.Progress.Total {
				stat.LayerCompl++
			}
		}
		log.Info().Msgf("%v", stat)
	}

	return nil
}

func GetDefaultAuthConfig(checkCredStore bool, serverAddress string, isDefaultRegistry bool) (types.AuthConfig, error) {
	if !isDefaultRegistry {
		serverAddress = registry.ConvertToHostname(serverAddress)
	}
	authconfig := configtypes.AuthConfig{}
	authconfig.ServerAddress = serverAddress
	authconfig.IdentityToken = ""
	res := types.AuthConfig(authconfig)
	return res, nil
}

func RegistryAuthenticationPrivilegedFunc(index *registrytypes.IndexInfo, cmdName string) types.RequestPrivilegeFunc {
	return func() (string, error) {
		indexServer := registry.GetAuthConfigKey(index)
		isDefaultRegistry := indexServer == registry.IndexServer
		authConfig, err := GetDefaultAuthConfig(true, indexServer, isDefaultRegistry)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Unable to retrieve stored credentials for %s, error: %s.\n", indexServer, err)
		}
		return command.EncodeAuthToBase64(authConfig)
	}
}

func getTrustedPullTargets(refAndAuth *trust.ImageRefAndAuth) ([]target, error) {
	notaryRepo, repoErr := trust.GetNotaryRepository(
		io.NopCloser(nil), &io.PipeWriter{}, command.UserAgent(),
		refAndAuth.RepoInfo(), refAndAuth.AuthConfig(), trust.ActionsPullOnly...)
	if repoErr != nil {
		return nil, errors.Join(repoErr, fmt.Errorf("error establishing connection to trust repository"))
	}

	ref := refAndAuth.Reference()
	tagged, isTagged := ref.(reference.NamedTagged)
	if !isTagged {
		// List all targets
		targets, err := notaryRepo.ListTargets(trust.ReleasesRole, data.CanonicalTargetsRole)
		if err != nil {
			return nil, trust.NotaryError(ref.Name(), err)
		}
		var refs []target
		for _, tgt := range targets {
			t, err := convertTarget(tgt.Target)
			if err != nil {
				fmt.Fprintf(os.Stderr, "skipping target for %q\n", reference.FamiliarName(ref))
				continue
			}
			// Only list tags in the top level targets role or the releases delegation role - ignore
			// all other delegation roles
			if tgt.Role != trust.ReleasesRole && tgt.Role != data.CanonicalTargetsRole {
				continue
			}
			refs = append(refs, t)
		}
		if len(refs) == 0 {
			return nil, trust.NotaryError(ref.Name(), fmt.Errorf("no trusted tags for %s", ref.Name()))
		}
		return refs, nil
	}

	t, err := notaryRepo.GetTargetByName(tagged.Tag(), trust.ReleasesRole, data.CanonicalTargetsRole)
	if err != nil {
		return nil, trust.NotaryError(ref.Name(), err)
	}
	// Only get the tag if it's in the top level targets role or the releases delegation role
	// ignore it if it's in any other delegation roles
	if t.Role != trust.ReleasesRole && t.Role != data.CanonicalTargetsRole {
		return nil, trust.NotaryError(ref.Name(), fmt.Errorf("no trust data for %s", tagged.Tag()))
	}

	log.Debug().Msgf("retrieving target for %s role", t.Role)
	r, err := convertTarget(t.Target)
	return []target{r}, err
}

func convertTarget(t notaryClient.Target) (target, error) {
	h, ok := t.Hashes["sha256"]
	if !ok {
		return target{}, errors.New("no valid hash, expecting sha256")
	}
	return target{
		name:   t.Name,
		digest: digest.NewDigestFromHex("sha256", hex.EncodeToString(h)),
		size:   t.Length,
	}, nil
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
