package utils

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/docker/docker/api/types/mount"
	"github.com/docker/docker/client"
	"github.com/rs/zerolog/log"

	v1 "github.com/dyrector-io/dyrectorio/golang/api/v1"
	"github.com/dyrector-io/dyrectorio/golang/internal/dogger"
	"github.com/dyrector-io/dyrectorio/golang/internal/util"
	containerbuilder "github.com/dyrector-io/dyrectorio/golang/pkg/builder/container"
	"github.com/dyrector-io/dyrectorio/golang/pkg/dagent/config"
	dockerHelper "github.com/dyrector-io/dyrectorio/golang/pkg/helper/docker"
	"github.com/dyrector-io/dyrectorio/protobuf/go/common"
)

func checkIfTargetVolumeIsThere(mountList []mount.Mount, importContainer *v1.ImportContainer) (int, error) {
	for i := range mountList {
		if strings.Contains(mountList[i].Source, importContainer.Volume) {
			return i, nil
		}
	}

	return -1, errors.New("import container target volume is not enlisted")
}

// before application container starts, loads import container
func spawnInitContainer(
	ctx context.Context, cli *client.Client, name string, mountList []mount.Mount,
	importContainer *v1.ImportContainer, dog *dogger.DeploymentLogger, cfg *config.Configuration,
) error {
	dog.WriteDeploymentStatus(common.DeploymentStatus_IN_PROGRESS, "Spawning importer container to load assets")
	targetVolumeIndex, err := checkIfTargetVolumeIsThere(mountList, importContainer)
	if err != nil {
		return err
	}

	builder := containerbuilder.NewDockerBuilder(ctx)

	importContainerName := util.JoinV("-", name, "import")
	targetVolume := mount.Mount{Type: mount.TypeBind, Source: mountList[targetVolumeIndex].Source, Target: "/data/output"}

	builder, err = builder.
		WithClient(cli).
		WithImage(cfg.ImportContainerImage).
		WithCmd(strings.Split(importContainer.Command, " ")).
		WithName(importContainerName).
		WithEnv(EnvMapToSlice(importContainer.Environments)).
		WithMountPoints([]mount.Mount{targetVolume}).
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
