/*
File for all the secret key file parsing and initializiation
*/
package config

import (
	"errors"
	"fmt"
	"os"
	"syscall"

	"github.com/ProtonMail/gopenpgp/v2/crypto"
	"github.com/rs/zerolog/log"
)

func CheckGenerateKeys(secretPath string) (string, error) {
	log.Printf("Checking key file: %v\n", secretPath)
	fileContent, err := os.ReadFile(secretPath) //#nosec G304 -- secret path comes from an env

	if errors.Is(err, syscall.EISDIR) {
		return "", fmt.Errorf("key path is a directory: %w", err)
	}

	if errors.Is(err, os.ErrNotExist) {
		log.Printf("Key file does not exist: %v\n", secretPath)
		return generateKey(secretPath)
	} else if err != nil {
		return "", fmt.Errorf("key file can't be read: %w", err)
	}

	// exists but expired -> migrate present keys?!
	privateKeyObj, keyErr := crypto.NewKeyFromArmored(string(fileContent))

	if keyErr != nil {
		return "", keyErr
	}

	if privateKeyObj == nil {
		return "", fmt.Errorf("key file is nil: %v", secretPath)
	}

	if !privateKeyObj.IsExpired() {
		keyStr, keyErr := privateKeyObj.ArmorWithCustomHeaders("", "")

		return keyStr, keyErr
	} else {
		log.Printf("Key file is expired: %v\n", secretPath)
		return generateKey(secretPath)
	}
}

func GenerateKeyString() (string, error) {
	log.Printf("Generating new key file...")
	const (
		name  = "dyrector.io agent"
		email = "hello@dyrector.io"
	)

	ecKey, keyErr := crypto.GenerateKey(name, email, "x25519", 0)

	if keyErr != nil {
		return "", keyErr
	}
	keyStr, keyErr := ecKey.ArmorWithCustomHeaders("", "")

	if keyErr != nil {
		return "", keyErr
	}
	return keyStr, nil
}

func generateKey(secretPath string) (string, error) {
	keyStr, keyErr := GenerateKeyString()
	if keyErr != nil {
		return "", keyErr
	}

	fileErr := os.WriteFile(secretPath, []byte(keyStr), os.ModePerm)
	if fileErr != nil {
		return "", fileErr
	}
	log.Printf("New key is generated and saved")

	return keyStr, nil
}

func GetPublicKey(keyStr string) (string, error) {
	key, err := crypto.NewKeyFromArmored(keyStr)
	if err != nil {
		return "", fmt.Errorf("could not get key from armored key: %w", err)
	}

	publicKey, err := key.GetArmoredPublicKeyWithCustomHeaders("", "")
	if err != nil {
		return "", fmt.Errorf("could not get public key from key object: %w", err)
	}

	return publicKey, nil
}

func IsExpiredKey(fileContent string) (bool, error) {
	privateKeyObj, keyErr := crypto.NewKeyFromArmored(fileContent)

	if keyErr != nil {
		return false, keyErr
	}

	if privateKeyObj == nil {
		return false, fmt.Errorf("key content is nil")
	}

	return privateKeyObj.IsExpired(), nil
}
