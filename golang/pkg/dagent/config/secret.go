package config

import (
	"errors"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"syscall"

	"github.com/ProtonMail/gopenpgp/v2/crypto"
	"github.com/rs/zerolog/log"

	config "github.com/dyrector-io/dyrectorio/golang/internal/config"
)

func (c *Configuration) CheckOrGenerateKeys(path string) (string, error) {
	if path == "" {
		return "", fmt.Errorf("env private key file value can't be empty")
	}

	log.Info().Msgf("Checking key file: %v", path)
	fileContent, err := os.ReadFile(path) //#nosec G304 -- secret path comes from an env

	if errors.Is(err, syscall.EISDIR) {
		return "", fmt.Errorf("key path is a directory: %w", err)
	}

	if errors.Is(err, os.ErrNotExist) {
		log.Debug().Msgf("Key file does not exist: %v", path)
		return generateKey(path)
	} else if err != nil {
		return "", fmt.Errorf("key file can't be read: %w", err)
	}

	// exists but expired -> migrate present keys?!
	privateKeyObj, keyErr := crypto.NewKeyFromArmored(string(fileContent))

	if keyErr != nil {
		return "", keyErr
	}

	if privateKeyObj == nil {
		return "", fmt.Errorf("key file is nil: %v", path)
	}

	if !privateKeyObj.IsExpired() {
		keyStr, keyErr := privateKeyObj.ArmorWithCustomHeaders("", "")

		return keyStr, keyErr
	}
	log.Debug().Msgf("Key file is expired: %v", path)
	return generateKey(path)
}

func generateKey(path string) (string, error) {
	keyStr, keyErr := config.GenerateKeyString()
	if keyErr != nil {
		return "", keyErr
	}

	fileErr := os.WriteFile(path, []byte(keyStr), os.ModePerm)
	if fileErr != nil {
		return "", fileErr
	}
	log.Info().Msgf("New key is generated and saved")

	return keyStr, nil
}

func readStringFromFile(path string) (string, error) {
	log.Info().Msgf("Looking for file: %v", path)
	fileContent, err := os.ReadFile(path) //#nosec G304 -- secret path comes from an env

	if errors.Is(err, syscall.EISDIR) {
		return "", fmt.Errorf("file path is a directory: %w", err)
	}

	if errors.Is(err, os.ErrNotExist) {
		return "", nil
	} else if err != nil {
		return "", fmt.Errorf("can not read file: %w", err)
	}

	return string(fileContent), nil
}

func writeStringToFile(path, value string) error {
	if value == "" {
		err := os.Remove(path)
		if err != nil && errors.Is(err, fs.ErrNotExist) {
			return err
		}

		log.Info().Str("path", path).Msg("File removed")
		return nil
	}

	err := os.WriteFile(path, []byte(value), os.ModePerm)
	if err != nil {
		return err
	}

	log.Info().Str("path", path).Msg("File saved")
	return nil
}

func (c *Configuration) appendPathMountPath(path string) string {
	return filepath.Join(c.InternalMountPath, path)
}

func checkFilePermissions(path string) error {
	file, err := os.OpenFile(path, os.O_RDWR|os.O_CREATE, filePermReadWriteOnlyByOwner)
	if err != nil {
		return err
	}

	defer file.Close()
	return nil
}
