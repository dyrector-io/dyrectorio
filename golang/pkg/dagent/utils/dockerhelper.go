// These functions are dagent specific, yet it's more closely related to dockerHelper itself.
// Latter implementation is not straightforward at this moment as it would introduce circular dependencies

package utils

import (
	"context"
	"fmt"

	"github.com/rs/zerolog/log"

	dockerHelper "github.com/dyrector-io/dyrectorio/golang/internal/helper/docker"
	"github.com/dyrector-io/dyrectorio/golang/internal/mapper"
	"github.com/dyrector-io/dyrectorio/protobuf/go/common"
)

func DeleteContainerByName(ctx context.Context, prefix, name string) error {
	return dockerHelper.DeleteContainerByName(context.Background(), nil, fmt.Sprintf("%s-%s", prefix, name), false)
}

func GetContainersByName(ctx context.Context, nameFilter string) []*common.ContainerStateItem {
	containers, err := dockerHelper.GetAllContainersByName(ctx, nil, nameFilter)
	if err != nil {
		log.Error().Stack().Err(err).Send()
	}

	return mapper.MapContainerState(containers)
}
