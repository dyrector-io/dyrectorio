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
	"gitlab.com/dyrector_io/dyrector.io/go/internal/dogger"
	"gitlab.com/dyrector_io/dyrector.io/go/internal/util"
	v1 "gitlab.com/dyrector_io/dyrector.io/go/pkg/api/v1"
	"gitlab.com/dyrector_io/dyrector.io/go/pkg/dagent/config"
	"gitlab.com/dyrector_io/dyrector.io/protobuf/go/crux"
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
	importContainer *v1.ImportContainer, dog *dogger.DeploymentLogger) error {
	dog.WriteDeploymentStatus(crux.DeploymentStatus_IN_PROGRESS, "Spawning importer container to load assets")
	targetVolumeIndex, err := checkIfTargetVolumeIsThere(mountList, importContainer)

	if err != nil {
		return err
	}

	builder := NewDockerBuilder(cli)

	importContainerName := util.JoinV("-", name, "import")
	targetVolume := mount.Mount{Type: mount.TypeBind, Source: mountList[targetVolumeIndex].Source, Target: "/data/output"}

	builder.
		WithImage(config.Cfg.ImportContainerImage).
		WithCmd(strings.Split(importContainer.Command, " ")).
		WithName(importContainerName).
		WithEnv(EnvMapToSlice(importContainer.Environments)).
		WithMountPoints([]mount.Mount{targetVolume}).
		WithoutConflict().
		WithDogger(dog).
		Create(ctx)

	_, err = builder.Start()

	if err != nil {
		return err
	}

	dog.WriteDeploymentStatus(crux.DeploymentStatus_IN_PROGRESS, "Waiting for import container to finish")

	cli.ContainerWait(ctx, builder.containerID, container.WaitConditionNextExit)
	cont, err := cli.ContainerInspect(ctx, builder.containerID)

	if err != nil {
		return err
	}

	if cont.State.ExitCode == 0 {
		err = DeleteContainer(builder.containerID)
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
