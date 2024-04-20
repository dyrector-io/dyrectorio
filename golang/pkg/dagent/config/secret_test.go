package config_test

import (
	"os"
	"testing"

	"github.com/ProtonMail/gopenpgp/v2/crypto"

	"github.com/stretchr/testify/assert"

	internalConfig "github.com/dyrector-io/dyrectorio/golang/internal/config"
	"github.com/dyrector-io/dyrectorio/golang/pkg/dagent/config"
)

//nolint:gosec
const (
	missingKeyFile = "missing-file.key"
	testPrivateKey = `-----BEGIN PGP PRIVATE KEY BLOCK-----

xVgEY0a/axYJKwYBBAHaRw8BAQdAYOtTwtAIPQpkekA0EGFSD8AkBQXSsyX/LjgE
u9DbDREAAQDrm97I/otLFVS2+Hy1puy7r1TX0D0y5IWIpADhLsHOTxMxzSVkeXJl
Y3Rvci5pbyBhZ2VudCA8aGVsbG9AZHlyZWN0b3IuaW8+wowEExYIAD4FAmNGv2sJ
kNVkUM9k9l5SFiEEX6QvZVKXns2HlqEk1WRQz2T2XlICGwMCHgECGQEDCwkHAhUI
AxYAAgIiAQAA21cA/2XLfVMwZzdvoXKGgxn1nwx28Mq/TTbPpSDai5iofwEoAQDl
dtmHfomw4MU0IUwKlx7xBbeHf9hnZKSqPWxMsdlxDsddBGNGv2sSCisGAQQBl1UB
BQEBB0CxUfqL1b9by80DRQzk5nQhiJvUSJkOQM692GuQOF5PaQMBCgkAAP91i9Ir
Fr+/EGWk+FV82MTQhjnD9TGz9cpRpcBHIMOhCBKBwngEGBYIACoFAmNGv2sJkNVk
UM9k9l5SFiEEX6QvZVKXns2HlqEk1WRQz2T2XlICGwwAAFW3AQCJLnREMLWcZGQd
X+FmTsl+eqJeIi5ZDYxm1DGz5w1zvAEA7lhixDtBFtrvS9SCYDp+BjV2tobEkz25
VA6Ob1z0jQk=
=iHmE
-----END PGP PRIVATE KEY BLOCK-----`

	testPublicKey = `-----BEGIN PGP PUBLIC KEY BLOCK-----

xjMEY0a/axYJKwYBBAHaRw8BAQdAYOtTwtAIPQpkekA0EGFSD8AkBQXSsyX/LjgE
u9DbDRHNJWR5cmVjdG9yLmlvIGFnZW50IDxoZWxsb0BkeXJlY3Rvci5pbz7CjAQT
FggAPgUCY0a/awmQ1WRQz2T2XlIWIQRfpC9lUpeezYeWoSTVZFDPZPZeUgIbAwIe
AQIZAQMLCQcCFQgDFgACAiIBAADbVwD/Zct9UzBnN2+hcoaDGfWfDHbwyr9NNs+l
INqLmKh/ASgBAOV22Yd+ibDgxTQhTAqXHvEFt4d/2GdkpKo9bEyx2XEOzjgEY0a/
axIKKwYBBAGXVQEFAQEHQLFR+ovVv1vLzQNFDOTmdCGIm9RImQ5Azr3Ya5A4Xk9p
AwEKCcJ4BBgWCAAqBQJjRr9rCZDVZFDPZPZeUhYhBF+kL2VSl57Nh5ahJNVkUM9k
9l5SAhsMAABVtwEAiS50RDC1nGRkHV/hZk7JfnqiXiIuWQ2MZtQxs+cNc7wBAO5Y
YsQ7QRba70vUgmA6fgY1draGxJM9uVQOjm9c9I0J
=Bpv5
-----END PGP PUBLIC KEY BLOCK-----`
)

func TestCheckOrGenerateKeys(t *testing.T) {
	// setup
	f, err := tmpTestFile()
	assert.NoError(t, err)
	defer func() {
		err = f.Close()
		assert.NoError(t, err)
		err = os.Remove(f.Name())
		assert.NoError(t, err)
	}()
	cfg := config.Configuration{}

	// empty path
	privateKey, err := cfg.CheckOrGenerateKeys("")
	assert.Error(t, err)
	assert.Equal(t, "env private key file value can't be empty", err.Error())
	assert.Equal(t, "", privateKey)

	// empty file
	privateKey, err = cfg.CheckOrGenerateKeys(f.Name())
	assert.Error(t, err)
	assert.Equal(t, "gopenpgp: error in reading key ring: openpgp: invalid argument: no armored data found", err.Error())
	assert.Equal(t, "", privateKey)

	// with a dir
	privateKey, err = cfg.CheckOrGenerateKeys("./")
	assert.Error(t, err)
	assert.Equal(t, "key path is a directory: read ./: is a directory", err.Error())
	assert.Equal(t, "", privateKey)

	// non existing file: key is generated
	privateKey, err = cfg.CheckOrGenerateKeys(missingKeyFile)
	defer func() {
		err = os.Remove(missingKeyFile)
		assert.NoError(t, err)
	}()
	assert.NoError(t, err)

	// read newly generated key file and compare
	key, err := os.ReadFile(missingKeyFile)
	assert.NoError(t, err)
	assert.Equal(t, string(key), privateKey)

	// valid key
	_, err = f.WriteString(testPrivateKey)
	assert.NoError(t, err)

	privateKey, err = cfg.CheckOrGenerateKeys(f.Name())
	assert.NoError(t, err)
	assert.Equal(t, testPrivateKey, privateKey)
}

func tmpTestFile() (*os.File, error) {
	return os.CreateTemp(".", "test-secret")
}

func TestGetPublicKey(t *testing.T) {
	// empty or wrong key
	pk, err := internalConfig.GetPublicKey("")
	assert.Error(t, err)
	assert.Equal(t, "", pk)

	// correct key
	pk, err = internalConfig.GetPublicKey(testPrivateKey)
	assert.NoError(t, err)

	testPublicParsed, err := crypto.NewKeyFromArmored(testPublicKey)
	assert.NoError(t, err)
	expectedPublic, err := testPublicParsed.GetPublicKey()
	assert.NoError(t, err)

	parsedPublic, err := crypto.NewKeyFromArmored(pk)
	assert.NoError(t, err)
	publicKey, err := parsedPublic.GetPublicKey()
	assert.NoError(t, err)

	assert.Equal(t, expectedPublic, publicKey)
}
