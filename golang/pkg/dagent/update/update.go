package update

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/rs/zerolog/log"

	"github.com/dyrector-io/dyrectorio/golang/internal/helper/docker"
	"github.com/dyrector-io/dyrectorio/golang/internal/helper/image"
	containerbuilder "github.com/dyrector-io/dyrectorio/golang/pkg/builder/container"
	"github.com/dyrector-io/dyrectorio/golang/pkg/dagent/utils"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/mount"
	"github.com/docker/docker/client"
	"github.com/docker/docker/errdefs"
)

var _selfUpdateDeadline *int64

// errors related to update
var (
	ErrUpdateImageNotFound = errors.New("update failed: image cannot be found")
	ErrUpdateUnauthorized  = errors.New("update failed: registry access: unauthorized")
)

func getUniqueContainerName(ctx context.Context, cli client.APIClient, base string) (string, error) {
	name := base
	count := 0

	for {
		container, err := docker.GetContainerByName(ctx, cli, name)
		if err != nil {
			return base, err
		}
		if container == nil {
			return name, nil
		}

		count++
		name = base + fmt.Sprint(count)
	}
}

// TODO(robot9706): move to utils
func findImageAndPull(ctx context.Context, cli client.APIClient, imageName string) (id string, pullErr error) {
	_, _, matches, err := image.Exists(ctx, cli, nil, imageName, "")
	if err != nil {
		return "", err
	}

	if !matches {
		err = image.Pull(ctx, cli, nil, imageName, "")
		if err != nil {
			return "", err
		}
	}

	findImage, err := image.GetImageByReference(ctx, cli, imageName)
	if err != nil {
		return "", err
	}

	return findImage.ID, nil
}

func createNewDAgentContainer(ctx context.Context, cli client.APIClient, oldContainerID, name, imageWithTag string) error {
	inspect, err := cli.ContainerInspect(ctx, oldContainerID)
	if err != nil {
		return err
	}

	mounts := []mount.Mount{}
	for _, elem := range inspect.Mounts {
		mounts = append(mounts, mount.Mount{
			Type:   elem.Type,
			Source: elem.Source,
			Target: elem.Destination,
		})
	}

	log.Debug().Msg("Creating new DAgent")

	builder := containerbuilder.NewDockerBuilder(ctx).
		WithClient(cli).
		WithImage(imageWithTag).
		WithRestartPolicy(containerbuilder.RestartPolicyName(inspect.HostConfig.RestartPolicy.Name)).
		WithName(name).
		WithEnv(inspect.Config.Env).
		WithMountPoints(mounts)

	cont, err := builder.CreateAndStart()
	if err != nil {
		return err
	}

	log.Debug().Str("containerID", *cont.GetContainerID()).Msg("Created new dagent")

	return nil
}

func SelfUpdate(ctx context.Context, tag string, timeoutSeconds int32) error {
	if _selfUpdateDeadline != nil && time.Now().Unix() > *_selfUpdateDeadline {
		return errors.New("update already in progress")
	}

	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return err
	}

	return RewriteUpdateErrors(ExecuteSelfUpdate(ctx, cli, tag, timeoutSeconds))
}

func ExecuteSelfUpdate(ctx context.Context, cli client.APIClient, tag string, timeoutSeconds int32) error {
	container, err := utils.GetOwnContainer(ctx, cli)
	if err != nil {
		return err
	}

	newImage, err := image.ExpandImageNameWithTag(container.Image, tag)
	if err != nil {
		return err
	}

	log.Info().Str("newImage", newImage).Msg("Finding new image")

	newImageID, err := findImageAndPull(ctx, cli, newImage)
	if err != nil {
		log.Info().Err(err).Msg("finding image error")
		return err
	}

	ownImage, err := utils.GetOwnContainerImage(cli)
	if err != nil {
		return err
	}

	if newImageID == ownImage.ID {
		return errors.New("already using desired image")
	}

	originalName := container.Names[0]

	rename, err := getUniqueContainerName(ctx, cli, originalName+"-update")
	if err != nil {
		return err
	}

	log.Debug().Str("oldName", originalName).Str("newName", rename).Msg("Renaming DAgent container")

	err = cli.ContainerRename(ctx, container.ID, rename)
	if err != nil {
		return err
	}

	err = createNewDAgentContainer(ctx, cli, container.ID, originalName, newImage)
	if err != nil {
		renameErr := cli.ContainerRename(ctx, container.ID, originalName)
		if renameErr != nil {
			return fmt.Errorf("%s (%s)", err.Error(), renameErr.Error())
		}

		return err
	}

	unixTime := time.Now().Unix() + int64(timeoutSeconds)
	_selfUpdateDeadline = &unixTime

	return err
}

func RemoveSelf(ctx context.Context) error {
	if _selfUpdateDeadline == nil {
		return nil
	}

	if time.Now().Unix() > *_selfUpdateDeadline {
		log.Warn().Int64("startedAtUnix", *_selfUpdateDeadline).Msg("Update timed out")
		_selfUpdateDeadline = nil
		return nil
	}

	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return err
	}

	log.Info().Msg("Update finished, shutting down")

	self, err := utils.GetOwnContainer(ctx, cli)
	if err != nil {
		if errors.Is(err, &utils.UnknownContainerError{}) {
			return errors.New("could not find owning container, maybe not running in container")
		}
		return err
	}

	err = cli.ContainerRemove(ctx, self.ID, types.ContainerRemoveOptions{
		Force: true,
	})
	if err != nil {
		return err
	}

	return nil
}

func RewriteUpdateErrors(err error) (newErr error) {
	if errdefs.IsNotFound(err) || errdefs.IsUnknown(err) || client.IsErrNotFound(err) || strings.Contains(err.Error(), "manifest unknown") {
		newErr = ErrUpdateImageNotFound
	}
	if errdefs.IsUnauthorized(err) {
		newErr = ErrUpdateUnauthorized
	}
	log.Debug().Errs("update-errors", []error{err, newErr}).Msg("original and the rewritten error")
	if newErr != nil {
		return newErr
	}
	return err
}
