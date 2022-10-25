package util

import (
	"os"

	"github.com/ilyakaznacheev/cleanenv"

	craneConfig "github.com/dyrector-io/dyrectorio/golang/pkg/crane/config"
	dagentConfig "github.com/dyrector-io/dyrectorio/golang/pkg/dagent/config"
)

func ReadConfig[T craneConfig.Configuration | dagentConfig.Configuration](cfg *T) error {
	// cleanenv configuration reader
	err := cleanenv.ReadConfig(".env", cfg)

	if err != nil && !os.IsNotExist(err) {
		return err
	} else {
		err = cleanenv.ReadEnv(cfg)
		if err != nil {
			return err
		}
	}

	return nil
}
