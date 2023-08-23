package k8s

import "github.com/dyrector-io/dyrectorio/golang/internal/config"

func (s *Secret) CheckPermissions() error {
	// TODO (@m8vago, @nandor.magyar) implement
	return nil
}

func (s *Secret) GetConnectionToken() (string, error) {
	value, _, err := s.getSecretByKey(config.ConnectionTokenFileName)
	return value, err
}

func (s *Secret) SaveConnectionToken(token string) error {
	return s.addValidSecret(config.ConnectionTokenFileName, token)
}

func (s *Secret) GetBlacklistedNonce() (string, error) {
	value, _, err := s.getSecretByKey(config.NonceBlacklistFileName)
	return value, err
}

func (s *Secret) BlacklistNonce(value string) error {
	return s.addValidSecret(config.NonceBlacklistFileName, value)
}

func (s *Secret) LoadPrivateKey() (string, error) {
	return s.GetOrCreatePrivateKey()
}
