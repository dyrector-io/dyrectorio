package crypt

import (
	"fmt"

	"github.com/dyrector-io/dyrectorio/golang/internal/config"

	"github.com/ProtonMail/gopenpgp/v2/helper"
)

func DecryptSecrets(arr map[string]string, appConfig *config.CommonConfiguration) (map[string][]byte, error) {
	out := map[string][]byte{}

	for key, sec := range arr {
		decrypted, err := helper.DecryptMessageArmored(string(appConfig.SecretPrivateKey), nil, sec)
		if err != nil {
			return out, fmt.Errorf("could not process secret: %v %w", key, err)
		}
		out[key] = []byte(decrypted)
	}

	return out, nil
}
