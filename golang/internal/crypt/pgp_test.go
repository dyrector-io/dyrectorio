//go:build unit

package crypt_test

import (
	"testing"

	"github.com/ProtonMail/gopenpgp/v2/helper"
	"github.com/stretchr/testify/assert"

	"github.com/dyrector-io/dyrectorio/golang/internal/config"
	"github.com/dyrector-io/dyrectorio/golang/internal/crypt"
)

// if change is necessary make sure to exactly copy keys
const (
	// public key
	pubKey = `-----BEGIN PGP PUBLIC KEY BLOCK-----

mDMEYvuRIRYJKwYBBAHaRw8BAQdANZa5ngbeG9ckv+QTpzvQfpwrTqWcO7P4aFaU
3ZLGiXe0H2R5cmVjdG9yaW8gY3JhbmUgPHRlc3RAdGVzdC50ZT6IjAQTFggAPgUC
YvuRIQmQvJ1oSzuyHX8WIQQ6yKBy1dYmmcIp03i8nWhLO7IdfwIbAwIeAQIZAQML
CQcCFQgDFgACAiIBAABpEwD9EwjxMTIC27Zdi36B0GNNrg+AKWZzeKJAFTM8pQ5d
uOMA/3RIExcs0zJLtiwTSL7y75JwPZjt21CH+FXSisrpX4oAuDgEYvuRIRIKKwYB
BAGXVQEFAQEHQPvkrAWAi9Ec1pr3S50OSsycsM0hmGD4RMeTUI8G4spZAwEKCYh4
BBgWCAAqBQJi+5EhCZC8nWhLO7IdfxYhBDrIoHLV1iaZwinTeLydaEs7sh1/AhsM
AAB13AD+ILGl+53mrNsllhBhqT75sPzau+UYfLJySo8ls/pJ8ioBAPsV1o5vfJad
POzzIF3Az5E5z0Dl/FsWAWgEUCl74Q4I
=Tpdk
-----END PGP PUBLIC KEY BLOCK-----`
	// private key for unit test
	privKey = `-----BEGIN PGP PRIVATE KEY BLOCK-----

xVgEYvuRIRYJKwYBBAHaRw8BAQdANZa5ngbeG9ckv+QTpzvQfpwrTqWcO7P4aFaU
3ZLGiXcAAP40CvyVv87ZGFReXnn8518Aj6xe7KcXo2fQyPwS80WNnRJrzR9keXJl
Y3RvcmlvIGNyYW5lIDx0ZXN0QHRlc3QudGU+wowEExYIAD4FAmL7kSEJkLydaEs7
sh1/FiEEOsigctXWJpnCKdN4vJ1oSzuyHX8CGwMCHgECGQEDCwkHAhUIAxYAAgIi
AQAAaRMA/RMI8TEyAtu2XYt+gdBjTa4PgClmc3iiQBUzPKUOXbjjAP90SBMXLNMy
S7YsE0i+8u+ScD2Y7dtQh/hV0orK6V+KAMddBGL7kSESCisGAQQBl1UBBQEBB0D7
5KwFgIvRHNaa90udDkrMnLDNIZhg+ETHk1CPBuLKWQMBCgkAAP9ZHqyX3OERdvTQ
sOrTBeCczBYnHz/xFlcT18DCR6b0ABHBwngEGBYIACoFAmL7kSEJkLydaEs7sh1/
FiEEOsigctXWJpnCKdN4vJ1oSzuyHX8CGwwAAHXcAP4gsaX7neas2yWWEGGpPvmw
/Nq75Rh8snJKjyWz+knyKgEA+xXWjm98lp087PMgXcDPkTnPQOX8WxYBaARQKXvh
Dgg=
=RnEi
-----END PGP PRIVATE KEY BLOCK-----`
	// public key
	pubKey1 = `-----BEGIN PGP PUBLIC KEY BLOCK-----

xsBNBGNL/YwBCADoeS0lcePet5BS+nCWrM8LLFR3tFXz/q/5hwaiqZTXR6So
559uq0htGHsxP0529EZlbftHGDCZDfQ79N3uEmCSNQXpCPfSwPeAupRolA+C
pXvbXrqC/jA3415ukNBWD7PecLcpza7n88lQpsSqsxwNAEAKt44Gzg7D8vzK
wcdWJkO4C6GrDELHSN5nOKSlnmZsQVbuJ6IPdb5RIq4pBwnGQjjQM1bI9IuX
h7iM9o4kxTxQHhbZ6gFXvXsBEgbGatI0jR44fU1kxxF86wxcL4quc8pnkBjd
zN501BZjxscjZZBzYdDjowR8H/a+3iF97OEXjU0ytf39VXXx1BECXj6bABEB
AAHNFHRlc3QgPHRlc3RAdGVzdC5jb20+wsCNBBABCAAgBQJjS/2MBgsJBwgD
AgQVCAoCBBYCAQACGQECGwMCHgEAIQkQT8F/790UG6kWIQQloKf3rmNF5eEz
rYRPwX/v3RQbqTzaB/wPRhkAXgdGZ4bdS5NHDpONHHd+Kgz+2CaPg+BkTzI9
9i/rpCtQIOWbGDObUkP16EKr7Kuqz8uaefckB+h4wadNvzlwfl2maBN4WKoO
OaOlMme6qF0FLucvHNb4Nk1Rpq4EkZcIpKPhkrbieMDtDzsd5QAFWaGPsuJM
D2DX3rC2LUZIjweqiaDUGsiDeYwZ7ocvB+KcK0A+j05Za28jh560MPETgghX
N2JDV/6ijCR1r5uXDyjivGbbjG36YWwJG/PhuOxiCeeMcGoeZt4LSbG8mFOT
ww4agYo+4BC6VOwAvIe1qHqWqS+qkux8aSG5d8JifKiLLlUWqTFm3yKlooNt
zsBNBGNL/YwBCACtLvLwlJWwzhk1XO+ZPUkaqGTLMpds3N3/uxxunrQxMhZd
bSeCy4Ski6+gAvwimYjoWg5xZUAt4u/TECxY08f87DjvffWN7mdUywNYWZ/S
KuMSIfbGsbEuv10CPSbknfzGcqtgkAu1yJQhRh2am/o0EZzqbZKPYypAYgmo
IEmTxkhRVPBTT49Jjd92KB6Ysn/vXftWhR9fqD7OhbwR82eOfbDo5dh0h6bF
7u6zonRr5Uj7TCEgrGllnM19OpdvuVzSSK9YTCrOrFvqRjl1v77MqEa99vA5
CqXFosfnNEDhUrLAY39SVc7AACxEDGXnfLemQflhqdmpeVRpoPt0381zABEB
AAHCwHYEGAEIAAkFAmNL/YwCGwwAIQkQT8F/790UG6kWIQQloKf3rmNF5eEz
rYRPwX/v3RQbqTy9B/9oUJR40+rkhwMEPblBjvbtFXJ5GSIb2gk2nfvRfnmq
aR7npayqvuEpNE9bbgWRY85yXDhjzDMo0omlE1yH3/geQ7Dzg3X+u0SDuOEV
dL+yz5t9m1C4Ns+xKtun2BEZ2yv8KoEBY0ccLEDKMPyySyeW1z3uB7J/klW2
D8lPOwOlj3yhj8dZZ8ItDCOZMYOlYwS/Jdho8ZAwza5poE4GYfRYQhYR6wyS
OkAba6Xu8xCJwZ0I+Z8321OP6Ra07NfOnmeQeEcHL66+8EEHt+Wne8sMDNL/
m9i3nF7Bw3jnCioAbVJMpKecLMKUdCg0Cw5OnG7+1WSC+lwb2OEgY5V6hHan
=Zkso
-----END PGP PUBLIC KEY BLOCK-----`

	inputText = "Chimichanga"
	inputKey  = "secret"
)

// test decrypt a valid secrets
func TestDecryptSecrets(t *testing.T) {
	encryptedMsg, err := helper.EncryptMessageArmored(pubKey, inputText)
	assert.Nil(t, err, "received error: %v", err)

	arr := map[string]string{
		inputKey: encryptedMsg,
	}
	appConfig := &config.CommonConfiguration{SecretPrivateKey: privKey}
	decrypted, err := crypt.DecryptSecrets(arr, appConfig)
	assert.Nil(t, err)
	assert.Equal(t, inputText, string(decrypted[inputKey]))
}

// test decrypt an invalid secrets should fail
func TestDecryptSecretsError(t *testing.T) {
	encryptedMsg, err := helper.EncryptMessageArmored(pubKey1, inputText)
	assert.Nil(t, err)

	arr := map[string]string{
		inputKey: encryptedMsg,
	}
	appConfig := &config.CommonConfiguration{SecretPrivateKey: privKey}
	_, err = crypt.DecryptSecrets(arr, appConfig)
	assert.NotNil(t, err)
	assert.Contains(t, err.Error(), "could not process secret")
}
