package utils

import (
	"context"
	"errors"
	"fmt"
	"log"
	"strings"

	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/mount"
	"github.com/docker/docker/client"

	"github.com/dyrector-io/dyrectorio/agent/internal/dogger"
	"github.com/dyrector-io/dyrectorio/agent/internal/util"
	v1 "github.com/dyrector-io/dyrectorio/agent/pkg/api/v1"
	containerbuilder "github.com/dyrector-io/dyrectorio/agent/pkg/builder/container"
	"github.com/dyrector-io/dyrectorio/agent/pkg/dagent/config"
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
	cli *client.Client, ctx context.Context, name string, mountList []mount.Mount,
	importContainer *v1.ImportContainer, dog *dogger.DeploymentLogger, cfg *config.Configuration) error {
	dog.WriteDeploymentStatus(common.DeploymentStatus_IN_PROGRESS, "Spawning importer container to load assets")
	targetVolumeIndex, err := checkIfTargetVolumeIsThere(mountList, importContainer)

	if err != nil {
		return err
	}

	builder := containerbuilder.NewDockerBuilder(ctx)

	importContainerName := util.JoinV("-", name, "import")
	targetVolume := mount.Mount{Type: mount.TypeBind, Source: mountList[targetVolumeIndex].Source, Target: "/data/output"}

	builder.
		WithClient(cli).
		WithImage(cfg.ImportContainerImage).
		WithCmd(strings.Split(importContainer.Command, " ")).
		WithName(importContainerName).
		WithEnv(EnvMapToSlice(importContainer.Environments)).
		WithMountPoints([]mount.Mount{targetVolume}).
		WithoutConflict().
		WithLogWriter(dog).
		Create()

	_, err = builder.Start()

	if err != nil {
		return err
	}

	dog.WriteDeploymentStatus(common.DeploymentStatus_IN_PROGRESS, "Waiting for import container to finish")

	containerID := *builder.GetContainerID()
	cli.ContainerWait(ctx, containerID, container.WaitConditionNextExit)
	cont, err := cli.ContainerInspect(ctx, containerID)

	if err != nil {
		return err
	}

	if cont.State.ExitCode == 0 {
		err = DeleteContainer(containerID)
		if err != nil {
			log.Println("warning: failed to delete import container after completion")
		}
	} else {
		return fmt.Errorf("import container exited with code: %v", cont.State.ExitCode)
	}

	if err != nil {
		return err
	}
	return nil
}
