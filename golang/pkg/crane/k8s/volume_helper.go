package k8s

import (
	"strings"

	"github.com/rs/zerolog/log"

	v1 "github.com/dyrector-io/dyrectorio/golang/api/v1"
)

// Map the short notation ["volume|/internal/mount/path"]
// into Volume type struct
func mapShortNotationToVolumeMap(volumes []string) map[string]v1.Volume {
	v := map[string]v1.Volume{}

	for i := range volumes {
		split := strings.Split(volumes[i], "|")
		name := split[0]
		path := split[1]

		var volumeType v1.VolumeType

		if len(name) > 0 {
			switch name[0] {
			case '@':
				volumeType = v1.ReadWriteManyVolumeType
				name = name[1:]
			case '!':
				volumeType = v1.EmptyDirVolumeType
			default:
				volumeType = v1.ReadWriteOnceVolumeType
			}

			v[name] = v1.Volume{
				Name: name,
				Path: path,
				Type: string(volumeType),
			}
		} else {
			log.Warn().Msg("Empty volume name")
		}
	}

	return v
}

func volumeSliceToMap(volumes []v1.Volume) map[string]v1.Volume {
	v := map[string]v1.Volume{}

	for i := range volumes {
		v[volumes[i].Name] = volumes[i]
	}

	return v
}

// no generics yet
func safeMergeVolumeMaps(one, other map[string]v1.Volume) map[string]v1.Volume {
	for name := range other {
		if _, ok := one[name]; ok {
			log.Warn().Str("name", name).Msg("Volume name collision")
		}
		one[name] = other[name]
	}

	return one
}
