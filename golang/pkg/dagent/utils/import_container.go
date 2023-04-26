package utils

import (
	"context"
	"errors"
	"fmt"
	"io"
	"strings"

	"github.com/docker/docker/api/types/mount"
	"github.com/docker/docker/client"
	"github.com/rs/zerolog/log"

	v1 "github.com/dyrector-io/dyrectorio/golang/api/v1"
	"github.com/dyrector-io/dyrectorio/golang/internal/dogger"
	dockerHelper "github.com/dyrector-io/dyrectorio/golang/internal/helper/docker"
	"github.com/dyrector-io/dyrectorio/golang/internal/util"
	containerbuilder "github.com/dyrector-io/dyrectorio/golang/pkg/builder/container"
	"github.com/dyrector-io/dyrectorio/golang/pkg/dagent/config"
	"github.com/dyrector-io/dyrectorio/protobuf/go/common"
)

func checkIfTargetVolumeIsThere(mountList []mount.Mount, targetVolumeName string) (int, error) {
	for i := range mountList {
		if strings.Contains(mountList[i].Source, targetVolumeName) {
			return i, nil
		}
	}

	return -1, errors.New("import container target volume is not enlisted")
}

// before application container starts, loads import container
func spawnImportContainer(
	ctx context.Context, cli client.APIClient, name string, mountList []mount.Mount,
	importContainer *v1.ImportContainer, dog *dogger.DeploymentLogger, cfg *config.Configuration,
) error {
	dog.WriteDeploymentStatus(common.DeploymentStatus_IN_PROGRESS, "Spawning importer container to load assets")
	targetVolumeIndex, err := checkIfTargetVolumeIsThere(mountList, importContainer.Volume)
	if err != nil {
		return err
	}

	builder := containerbuilder.NewDockerBuilder(ctx)

	importContainerName := util.JoinV("-", name, "import")
	targetVolume := mount.Mount{Type: mount.TypeBind, Source: mountList[targetVolumeIndex].Source, Target: "/data/output"}

	cont, waitResult, err := builder.
		WithClient(cli).
		WithImage(cfg.ImportContainerImage).
		WithCmd(strings.Split(importContainer.Command, " ")).
		WithName(importContainerName).
		WithEnv(EnvMapToSlice(importContainer.Environments)).
		WithMountPoints([]mount.Mount{targetVolume}).
		WithoutConflict().
		WithLogWriter(dog).
		WithPreStartHooks(func(ctx context.Context, client client.APIClient,
			containerName string, containerId *string, mountList []mount.Mount, logger *io.StringWriter,
		) error {
			dog.WriteDeploymentStatus(common.DeploymentStatus_IN_PROGRESS, "Waiting for import container to finish")
			return nil
		}).
		CreateAndStartWaitUntilExit()
	if err != nil {
		return err
	}

	if waitResult.StatusCode == 0 {
		containerID := *cont.GetContainerID()
		err = dockerHelper.DeleteContainerByID(ctx, dog, containerID)
		if err != nil {
			log.Warn().Msg("Failed to delete import container after completion")
		}
	} else {
		return fmt.Errorf("import container exited with code: %v", waitResult.StatusCode)
	}
	return nil
}
