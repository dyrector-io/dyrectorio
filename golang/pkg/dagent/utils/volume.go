package utils

import (
	"strings"

	"github.com/docker/docker/api/types/mount"
)

func MountListToMap(in []mount.Mount) map[string]mount.Mount {
	mountMap := map[string]mount.Mount{}

	for _, m := range in {
		split := strings.Split(m.Source, "/")
		mountMap[split[len(split)-1]] = m
	}

	return mountMap
}
