package update

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/rs/zerolog/log"

	"github.com/dyrector-io/dyrectorio/golang/internal/helper/docker"
	"github.com/dyrector-io/dyrectorio/golang/internal/helper/image"
	"github.com/dyrector-io/dyrectorio/golang/internal/util"
	"github.com/dyrector-io/dyrectorio/golang/pkg/dagent/utils"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/mount"
	"github.com/docker/docker/client"

	containerbuilder "github.com/dyrector-io/dyrectorio/golang/pkg/builder/container"
)

var _selfUpdateDeadline *int64

func getContainerName(ctx context.Context, base string) (string, error) {
	name := base
	count := 0

	for {
		container, err := docker.GetContainerByName(ctx, nil, name)
		if err != nil {
			return base, err
		}
		if len(container.Names) == 0 {
			return name, nil
		}

		count++
		name = base + fmt.Sprint(count)
	}
}

func findImageAndPull(ctx context.Context, imageName string) (string, error) {
	exists, err := containerbuilder.ImageExists(ctx, nil, imageName)
	if err != nil {
		return "", err
	}

	if !exists {
		err = containerbuilder.PullImage(ctx, nil, imageName, "")
		if err != nil {
			return "", err
		}
	}

	findImage, err := image.GetImageByReference(ctx, imageName)
	if err != nil {
		return "", err
	}

	return findImage.ID, nil
}

func SelfUpdate(ctx context.Context, tag string, timeoutSeconds int32) error {
	if _selfUpdateDeadline != nil && time.Now().Unix() > *_selfUpdateDeadline {
		return errors.New("update already in progress")
	}

	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return err
	}

	container, err := utils.GetOwnContainer(ctx)
	if err != nil {
		return err
	}

	imageURI, err := image.URIFromString(container.Image)
	if err != nil {
		return err
	}

	newImage := util.JoinV("/", imageURI.Host, imageURI.Name) + ":" + tag

	newImageID, err := findImageAndPull(ctx, newImage)
	if err != nil {
		return err
	}

	ownImage, err := utils.GetOwnContainerImage()
	if err != nil {
		return err
	}

	if newImageID == ownImage.ID {
		return errors.New("update does not change image")
	}

	originalName := container.Names[0]

	rename, err := getContainerName(ctx, originalName+"-update")
	if err != nil {
		return err
	}

	err = cli.ContainerRename(ctx, container.ID, rename)
	if err != nil {
		return err
	}

	inspect, err := cli.ContainerInspect(ctx, container.ID)
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

	log.Debug().Str("rename", rename).Msg("Creating new DAgent")

	builder := containerbuilder.NewDockerBuilder(ctx).
		WithClient(cli).
		WithImage(newImage).
		WithRestartPolicy(containerbuilder.RestartPolicyName(inspect.HostConfig.RestartPolicy.Name)).
		WithName(originalName).
		WithEnv(inspect.Config.Env).
		WithMountPoints(mounts)

	ok, err := builder.Create().Start()
	if !ok {
		return err
	}

	unixTime := time.Now().Unix() + int64(timeoutSeconds)
	_selfUpdateDeadline = &unixTime

	log.Debug().Str("containerID", *builder.GetContainerID()).Msg("Created new DAgent")

	return nil
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

	log.Debug().Msg("Update finished, shutting down - 2")

	containerID := utils.GetOwnContainerID()
	if containerID == "" {
		return errors.New("unable to get own container ID")
	}

	removeOptions := types.ContainerRemoveOptions{
		RemoveVolumes: true,
		Force:         true,
	}

	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return err
	}

	err = cli.ContainerRemove(ctx, containerID, removeOptions)
	if err != nil {
		return err
	}

	return nil
}
