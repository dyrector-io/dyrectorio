/*
File for all the secret key file parsing and initializiation
*/
package config

import (
	"errors"
	"fmt"
	"log"
	"os"

	"github.com/ProtonMail/gopenpgp/v2/crypto"
)

type ConfigFromFile string

func (field *ConfigFromFile) SetValue(location string) error {
	log.Println("Custom key parsing config things")
	if location == "" {
		return fmt.Errorf("field value can't be empty")
	}

	key, err := checkGenerateKeys(location)
	if err != nil {
		return err
	}

	*field = ConfigFromFile(key)
	return nil
}

func checkGenerateKeys(location string) (string, error) {
	log.Printf("Checking key file: %v\n", location)
	file, err := os.ReadFile(location)

	if errors.Is(err, os.ErrNotExist) {
		log.Printf("Key file does not exist: %v\n", location)
		return generateKey(location)
	}

	// exists but expired -> migrate present keys?!
	privateKeyObj, keyErr := crypto.NewKeyFromArmored(string(file))

	if !privateKeyObj.IsExpired() {
		if keyErr != nil {
			return "", keyErr
		}
		keyStr, keyErr := privateKeyObj.Armor()

		return keyStr, keyErr
	} else {
		log.Printf("Key file is expired: %v\n", location)
		return generateKey(location)
	}
}

func generateKey(location string) (string, error) {
	log.Printf("Generating new key file...")
	const (
		name  = "dyrectorio crane"
		email = "agent@dyrector.io"
	)

	ecKey, keyErr := crypto.GenerateKey(name, email, "x25519", 0)

	if keyErr != nil {
		return "", keyErr
	}
	keyStr, keyErr := ecKey.Armor()

	if keyErr != nil {
		return "", keyErr
	}

	fileErr := os.WriteFile(location, []byte(keyStr), os.ModePerm)
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

	publicKey, err := key.GetArmoredPublicKey()

	if err != nil {
		return "", fmt.Errorf("could not get public key from key object: %w", err)
	}

	return publicKey, nil
}
