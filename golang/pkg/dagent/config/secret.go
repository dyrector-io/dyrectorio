package config

import (
	"fmt"

	"github.com/rs/zerolog/log"

	config "github.com/dyrector-io/dyrectorio/golang/internal/config"
)

type KeyFromFile string

func (field *KeyFromFile) SetValue(secretPath string) error {
	log.Debug().Str("secretPath", secretPath).Msg("Loading config from file")
	if secretPath == "" {
		return fmt.Errorf("env private key file value can't be empty")
	}

	key, err := config.CheckGenerateKeys(secretPath)
	if err != nil {
		return err
	}

	*field = KeyFromFile(key)
	return nil
}

type JwtFromFile string

func (field *JwtFromFile) SetValue(jwtPath string) error {
	log.Debug().Str("jwtPath", jwtPath).Msg("Loading config from file")
	if jwtPath == "" {
		return fmt.Errorf("env jwt file value can't be empty")
	}

	jwt, err := config.ReadJwtFromFile(jwtPath)
	if err != nil {
		return err
	}

	*field = JwtFromFile(jwt)
	return nil
}
