package utils

import (
	"context"
	"fmt"
	"io"

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

// before application container starts, loads import container
func spawnInitContainer(
	ctx context.Context, cli client.APIClient,
	parentName string, cont *v1.InitContainer, mountMap map[string]mount.Mount,
	dog *dogger.DeploymentLogger,
) error {
	initContName := util.JoinV("-", parentName, cont.Name)
	dog.WriteDeploymentStatus(common.DeploymentStatus_IN_PROGRESS, fmt.Sprintf("Spawning init container: %s", initContName))
	builder := containerbuilder.NewDockerBuilder(ctx)

	targetVolumes := []mount.Mount{}

	for _, v := range cont.Volumes {
		linkedVolume := FindVolumeInMountMap(v.Name, mountMap)
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
		WithImage(cont.Image).
		WithCmd(cont.Command).
		WithName(initContName).
		WithEnv(EnvMapToSlice(cont.Envs)).
		WithMountPoints(targetVolumes).
		WithoutConflict().
		WithPreStartHooks(
			func(ctx context.Context, client client.APIClient, containerName string,
				containerId *string, mountList []mount.Mount, logger *io.StringWriter,
			) error {
				dog.WriteDeploymentStatus(common.DeploymentStatus_IN_PROGRESS, "Waiting for init container to finish")
				return nil
			}).
		WithLogWriter(dog).CreateAndStartWaitUntilExit()
	if err != nil {
		return err
	}

	if waitResult.StatusCode == 0 {
		containerID := *resultCont.GetContainerID()
		err = dockerHelper.DeleteContainerByID(ctx, dog, containerID)
		if err != nil {
			log.Warn().Msg("Failed to delete import container after completion")
		}
	} else {
		return fmt.Errorf("import container exited with code: %v", waitResult.StatusCode)
	}
	return nil
}
