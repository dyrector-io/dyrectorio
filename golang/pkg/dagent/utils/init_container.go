package utils

import (
	"context"
	"fmt"

	v1 "github.com/dyrector-io/dyrectorio/golang/api/v1"
	"github.com/dyrector-io/dyrectorio/golang/internal/dogger"
	"github.com/dyrector-io/dyrectorio/golang/internal/util"
	containerbuilder "github.com/dyrector-io/dyrectorio/golang/pkg/builder/container"
	dockerHelper "github.com/dyrector-io/dyrectorio/golang/pkg/helper/docker"
	"github.com/dyrector-io/dyrectorio/protobuf/go/common"

	"github.com/docker/docker/api/types/mount"
	"github.com/docker/docker/client"
	"github.com/rs/zerolog/log"
)

// before application container starts, loads import container
func spawnInitContainer(
	ctx context.Context, cli *client.Client,
	parentName string, cont *v1.InitContainer, mountMap map[string]mount.Mount,
	dog *dogger.DeploymentLogger,
) error {
	initContName := util.JoinV("-", parentName, cont.Name)
	dog.WriteDeploymentStatus(common.DeploymentStatus_IN_PROGRESS, fmt.Sprintf("Spawning init container: %s", initContName))
	builder := containerbuilder.NewDockerBuilder(ctx)

	targetVolumes := []mount.Mount{}

	for _, v := range cont.Volumes {
		linkedVolume, ok := mountMap[v.Name]
		if !ok {
			return fmt.Errorf("linked volume not found")
		}
		targetVolumes = append(targetVolumes,
			mount.Mount{
				Type:   mount.TypeBind,
				Source: linkedVolume.Source,
				Target: v.Path,
			},
		)
	}

	builder, err := builder.
		WithClient(cli).
		WithImage(cont.Image).
		WithCmd(cont.Command).
		WithName(initContName).
		WithEnv(EnvMapToSlice(cont.Envs)).
		WithMountPoints(targetVolumes).
		WithoutConflict().
		WithLogWriter(dog).
		Create()
	if err != nil {
		return err
	}

	dog.WriteDeploymentStatus(common.DeploymentStatus_IN_PROGRESS, "Waiting for import container to finish")

	exitResult, err := builder.StartWaitUntilExit()
	if err != nil {
		return fmt.Errorf("import container start failed: %w", err)
	}

	if exitResult.StatusCode == 0 {
		containerID := *builder.GetContainerID()
		err = dockerHelper.DeleteContainerByID(ctx, dog, containerID)
		if err != nil {
			log.Warn().Msg("Failed to delete import container after completion")
		}
	} else {
		return fmt.Errorf("import container exited with code: %v", exitResult.StatusCode)
	}
	return nil
}
