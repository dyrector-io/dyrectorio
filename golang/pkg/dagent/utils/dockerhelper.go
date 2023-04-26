// These functions are dagent specific, yet it's more closely related to dockerHelper itself.
// Latter implementation is not straightforward at this moment as it would introduce circular dependencies

package utils

import (
	"context"
	"fmt"

	"github.com/docker/docker/api/types"
	"github.com/rs/zerolog/log"

	dockerHelper "github.com/dyrector-io/dyrectorio/golang/internal/helper/docker"
	"github.com/dyrector-io/dyrectorio/golang/internal/label"
	"github.com/dyrector-io/dyrectorio/golang/internal/mapper"
	"github.com/dyrector-io/dyrectorio/golang/internal/util"
	"github.com/dyrector-io/dyrectorio/protobuf/go/common"
)

func GetContainersByPrefix(ctx context.Context, prefix string) []*common.ContainerStateItem {
	var containers []types.Container
	var err error

	if prefix == "" {
		containers, err = dockerHelper.GetAllContainers(ctx)
	} else {
		containers, err = dockerHelper.GetAllContainersByLabel(ctx, label.GetPrefixLabelFilter(prefix))
	}

	if err != nil {
		log.Error().Stack().Err(err).Send()
	}

	return mapper.MapContainerState(containers, prefix)
}

func GetContainerByPrefixAndName(ctx context.Context, prefix, name string) (*types.Container, error) {
	if prefix == "" {
		return dockerHelper.GetContainerByName(ctx, name)
	}

	containers, err := dockerHelper.GetAllContainersByLabel(ctx, label.GetPrefixLabelFilter(prefix))
	if err != nil {
		return nil, err
	}

	targetName := util.JoinV("-", "/"+prefix, name)
	for index := range containers {
		for _, name := range containers[index].Names {
			if name == targetName {
				return &containers[index], nil
			}
		}
	}

	return nil, fmt.Errorf("container not found by prefix(%s), name(%s)", prefix, name)
}

func DeleteContainerByPrefixAndName(ctx context.Context, prefix, name string) error {
	container, err := GetContainerByPrefixAndName(ctx, prefix, name)
	if err != nil {
		return fmt.Errorf("could not get container (%s, %s) to delete: %s", prefix, name, err.Error())
	}

	if container == nil {
		return nil
	}

	return dockerHelper.DeleteContainer(ctx, container)
}
