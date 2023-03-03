// These functions are dagent specific, yet it's more closely related to dockerHelper itself.
// Latter implementation is not straightforward at this moment as it would introduce circular dependencies

package utils

import (
	"context"
	"fmt"

	"github.com/docker/docker/api/types"
	"github.com/rs/zerolog/log"

	"github.com/dyrector-io/dyrectorio/golang/internal/mapper"
	"github.com/dyrector-io/dyrectorio/golang/internal/util"
	dockerHelper "github.com/dyrector-io/dyrectorio/golang/pkg/helper/docker"
	"github.com/dyrector-io/dyrectorio/protobuf/go/common"
)

func GetContainersByName(ctx context.Context, nameFilter string) []*common.ContainerStateItem {
	containers, err := dockerHelper.GetAllContainersByName(ctx, nameFilter)
	if err != nil {
		log.Error().Stack().Err(err).Send()
	}

	return mapper.MapContainerState(containers)
}

func GetContainerByPrefixName(ctx context.Context, prefix, name string) (*types.Container, error) {
	if prefix == "" {
		return dockerHelper.GetContainerByName(ctx, name)
	}

	containers, err := dockerHelper.GetAllContainersByLabel(ctx, prefix)
	if err != nil {
		return nil, err
	}

	targetName := util.JoinV("-", prefix, name)
	for index := range containers {
		for _, name := range containers[index].Names {
			if name == targetName {
				return &containers[index], nil
			}
		}
	}

	return nil, fmt.Errorf("container not found by prefix(%s), name(%s)", prefix, name)
}

func DeleteContainerByPrefixName(ctx context.Context, prefix, name string) error {
	container, err := GetContainerByPrefixName(ctx, prefix, name)
	if err != nil {
		return fmt.Errorf("could not get container (%s, %s) to delete: %s", prefix, name, err.Error())
	}

	if container == nil {
		return nil
	}

	return dockerHelper.DeleteContainer(ctx, container)
}

func getPrefixLabelFilter(prefix string) string {
	return util.JoinV("=", LabelContainerPrefix, prefix)
}
