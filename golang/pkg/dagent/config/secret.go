package config

import (
	"fmt"

	config "github.com/dyrector-io/dyrectorio/golang/internal/config"
)

type ConfigFromFile string

func (field *ConfigFromFile) SetValue(secretPath string) error {
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

func (c *Configuration) Update() error {
	if c.SecretPrivateKeyFile != "" {
		// NOTE(minhoryang@gmail.com): propagate the value to the core.
		c.CommonConfiguration.SecretPrivateKey = string(c.SecretPrivateKeyFile)
	}
	return nil
}
