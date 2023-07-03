package utils

import (
	"context"
	"fmt"

	v1 "github.com/dyrector-io/dyrectorio/golang/api/v1"
	"github.com/dyrector-io/dyrectorio/golang/internal/dogger"
	dockerHelper "github.com/dyrector-io/dyrectorio/golang/internal/helper/docker"
	"github.com/dyrector-io/dyrectorio/golang/internal/util"
	containerbuilder "github.com/dyrector-io/dyrectorio/golang/pkg/builder/container"
	"github.com/dyrector-io/dyrectorio/protobuf/go/common"

	"github.com/docker/docker/api/types/mount"
	"github.com/docker/docker/client"
	"github.com/rs/zerolog/log"
)

type InitContainer struct {
	Parent   string
	Config   *v1.InitContainer
	MountMap map[string]mount.Mount
	EnvList  []string
}

// before application container starts, launches an init container
func spawnInitContainer(
	ctx context.Context, cli client.APIClient,
	initCont InitContainer,
	dog *dogger.DeploymentLogger,
) error {
	initContName := util.JoinV("-", initCont.Parent, initCont.Config.Name)
	dog.WriteDeploymentStatus(common.DeploymentStatus_IN_PROGRESS, fmt.Sprintf("Spawning init container: %s", initContName))
	builder := containerbuilder.NewDockerBuilder(ctx)

	targetVolumes := []mount.Mount{}

	for _, v := range initCont.Config.Volumes {
		linkedVolume := FindVolumeInMountMap(v.Name, initCont.MountMap)
		if linkedVolume == nil {
			return fmt.Errorf("linked volume not found: %s", v.Name)
		}
		targetVolumes = append(targetVolumes,
			mount.Mount{
				Type:   mount.TypeBind,
				Source: linkedVolume.Source,
				Target: v.Path,
			},
		)
	}

	resultCont, waitResult, err := builder.
		WithClient(cli).
		WithImage(initCont.Config.Name).
		WithCmd(initCont.Config.Command).
		WithName(initContName).
		WithEnv(initCont.EnvList).
		WithMountPoints(targetVolumes).
		WithoutConflict().
		WithPreStartHooks(
			func(ctx context.Context, client client.APIClient, parentCont containerbuilder.ParentContainer) error {
				dog.WriteDeploymentStatus(common.DeploymentStatus_IN_PROGRESS, "Waiting for init container to finish")
				return nil
			}).
		WithLogWriter(dog).CreateAndStartWaitUntilExit()
	if err != nil {
		return err
	}

	dog.WriteDeploymentStatus(common.DeploymentStatus_IN_PROGRESS,
		fmt.Sprintf("Init container (%v) exited with status %v, output:", initContName, waitResult.StatusCode))
	dog.WriteDeploymentStatus(common.DeploymentStatus_IN_PROGRESS, waitResult.Logs...)
	if waitResult.StatusCode == 0 {
		containerID := *resultCont.GetContainerID()
		err = dockerHelper.DeleteContainerByID(ctx, dog, containerID)
		if err != nil {
			log.Warn().Msg("Failed to delete init container after completion")
		}
	} else {
		return fmt.Errorf("init container exited with code: %v", waitResult.StatusCode)
	}
	return nil
}
