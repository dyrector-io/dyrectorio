package config

import (
	"fmt"

	"github.com/rs/zerolog/log"

	config "github.com/dyrector-io/dyrectorio/golang/internal/config"
)

type ConfigFromFile string

func (field *ConfigFromFile) SetValue(secretPath string) error {
	log.Debug().Str("secretPath", secretPath).Msg("Loading config from file")
	if secretPath == "" {
		return fmt.Errorf("env private key file value can't be empty")
	}

	key, err := config.CheckGenerateKeys(secretPath)
	if err != nil {
		return err
	}

	*field = ConfigFromFile(key)
	return nil
}
