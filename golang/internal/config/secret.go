/*
File for all the secret key file parsing and initializiation
*/
package config

import (
	"fmt"

	"github.com/ProtonMail/gopenpgp/v2/crypto"
	"github.com/rs/zerolog/log"
)

type NonceBlacklistedError struct{}

func (m *NonceBlacklistedError) Error() string {
	return "nonce is blacklisted"
}

type SecretStore interface {
	CheckPermissions() error
	LoadPrivateKey() (string, error)
	GetConnectionToken() (string, error)
	SaveConnectionToken(value string) error
	GetBlacklistedNonce() (string, error)
	BlacklistNonce(value string) error
}

func GenerateKeyString() (string, error) {
	log.Info().Msgf("Generating new key file...")
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

func ValidateJwtAndCheckNonceBlacklist(secrets SecretStore, unvalidatedToken string) (*ValidJWT, error) {
	blacklistedNonce, err := secrets.GetBlacklistedNonce()
	if err != nil {
		return nil, err
	}

	token, err := ValidateAndCreateJWT(unvalidatedToken)
	if err != nil {
		return nil, err
	}

	if blacklistedNonce != "" && token.Nonce == blacklistedNonce {
		return nil, &NonceBlacklistedError{}
	}

	return token, nil
}

func (c *CommonConfiguration) InjectPrivateKey(secrets SecretStore) error {
	key, err := secrets.LoadPrivateKey()
	if err != nil {
		return err
	}

	c.SecretPrivateKey = key
	return nil
}

func (c *CommonConfiguration) InjectGrpcToken(secrets SecretStore) error {
	token, err := secrets.GetConnectionToken()
	if err == nil && token != "" {
		c.GrpcToken, err = ValidateJwtAndCheckNonceBlacklist(secrets, token)
		if err == nil {
			return nil
		}
	}

	token = c.InstallToken
	if err != nil {
		log.Error().Err(err).Msg("Failed to validate the connection token. Failing back to the install token")
	}

	if token == "" {
		return fmt.Errorf("no token provided")
	}

	c.GrpcToken, err = ValidateJwtAndCheckNonceBlacklist(secrets, token)
	if err != nil {
		return err
	}

	return nil
}
