package k8s

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"

	commonConfig "github.com/dyrector-io/dyrectorio/golang/internal/config"
	"github.com/dyrector-io/dyrectorio/golang/internal/crypt"
	"github.com/dyrector-io/dyrectorio/golang/pkg/crane/config"
	imageHelper "github.com/dyrector-io/dyrectorio/golang/pkg/helper/image"

	"github.com/rs/zerolog/log"
	v1 "k8s.io/client-go/kubernetes/typed/core/v1"

	apicorev1 "k8s.io/api/core/v1"

	"k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	corev1 "k8s.io/client-go/applyconfigurations/core/v1"
)

const SecretFileName = "private.key"

// types from kubectl
// DockerConfigJSON represents a local docker auth config file
// for pulling images.
type DockerConfigJSON struct {
	Auths DockerConfig `json:"auths"`
}

// DockerConfig represents the config file used by the docker CLI.
type DockerConfig map[string]DockerConfigEntry

// DockerConfigEntry holds the user information that grant the access to docker registry
type DockerConfigEntry struct {
	Username string `json:"username,omitempty"`
	Password string `json:"password,omitempty"`
	Email    string `json:"email,omitempty"`
	Auth     string `json:"auth,omitempty"`
}

// namespace wrapper for the facade
type Secret struct {
	ctx       context.Context
	client    *Client
	avail     []string
	appConfig *config.Configuration
}

func NewSecret(ctx context.Context, client *Client) *Secret {
	secr := Secret{ctx: ctx, client: client, appConfig: client.appConfig, avail: []string{}}
	return &secr
}

func (s *Secret) applySecrets(namespace, name string, values map[string]string) error {
	cli, err := s.getSecretClient(namespace)
	if err != nil {
		return err
	}

	data, err := crypt.DecryptSecrets(values, &s.appConfig.CommonConfiguration)
	if err != nil {
		return err
	}

	secrets := corev1.Secret(name, namespace).WithData(data)

	result, err := cli.Apply(s.ctx, secrets, metav1.ApplyOptions{
		FieldManager: s.appConfig.FieldManagerName,
		Force:        s.appConfig.ForceOnConflicts,
	})

	if result != nil {
		log.Info().Str("name", name).Msg("Secret updated")
		if len(values) > 0 {
			s.avail = append(s.avail, name)
		}
	}

	return err
}

func (s *Secret) ListSecrets(namespace, name string) ([]string, error) {
	cli, err := s.getSecretClient(namespace)
	if err != nil {
		return nil, err
	}

	list, err := cli.List(s.ctx, metav1.ListOptions{})
	if err != nil {
		return nil, err
	}

	names := []string{}

	for index := range list.Items {
		secret := &list.Items[index]
		if secret.Name == name {
			for key := range secret.Data {
				names = append(names, key)
			}
			break
		}
	}

	return names, nil
}

func (s *Secret) getSecretClient(namespace string) (v1.SecretInterface, error) {
	clientset, err := s.client.GetClientSet()
	if err != nil {
		return nil, err
	}

	return clientset.CoreV1().Secrets(namespace), nil
}

func (s *Secret) ApplyOpaqueSecret(ctx context.Context, namespace, name string, values map[string][]byte) (
	version string, err error,
) {
	cli, err := s.getSecretClient(namespace)
	if err != nil {
		return "", err
	}

	secrets := corev1.Secret(name, namespace).WithData(values)

	result, err := cli.Apply(ctx, secrets, metav1.ApplyOptions{
		FieldManager: s.appConfig.FieldManagerName,
		Force:        s.appConfig.ForceOnConflicts,
	})
	if err != nil {
		return "", err
	}

	return result.ResourceVersion, nil
}

func (s *Secret) ApplyRegistryAuthSecret(ctx context.Context,
	namespace,
	name string,
	credentials *imageHelper.RegistryAuth,
	appConfig *config.Configuration,
) error {
	cli, err := s.getSecretClient(namespace)
	if err != nil {
		return err
	}

	data, err := handleDockerCfgJSONContent(credentials.User, credentials.Password, "", credentials.URL)
	if err != nil {
		return err
	}

	secrets := corev1.Secret(name, namespace).WithType(apicorev1.SecretTypeDockerConfigJson).WithData(
		map[string][]byte{
			".dockerconfigjson": data,
		},
	)

	_, err = cli.Apply(ctx, secrets, metav1.ApplyOptions{
		FieldManager: appConfig.FieldManagerName,
		Force:        appConfig.ForceOnConflicts,
	})
	if err != nil {
		return err
	}

	return nil
}

func (s *Secret) GetValidSecret() (string, error) {
	namespace := s.appConfig.Namespace
	name := s.appConfig.SecretName

	if namespace == "" || name == "" {
		return "", fmt.Errorf("secret name or namespace can't be empty")
	}

	objects, version, err := s.GetSecret(namespace, name)
	if err != nil {
		if errors.IsNotFound(err) {
			return addValidSecret(s.ctx, s.client, namespace, name)
		}
		return "", fmt.Errorf("k8s stored secret %s/%s was on error: %w", namespace, name, err)
	}

	secretContent := ""
	for secretFileName, secretFileContent := range objects {
		if secretFileName == SecretFileName {
			secretContent = string(secretFileContent)
			break
		}
	}
	if secretContent == "" {
		return "", fmt.Errorf("k8s stored secret %s/%s was empty (resourceVersion: %s)", namespace, name, version)
	}

	isExpired, err := commonConfig.IsExpiredKey(secretContent)
	if err != nil {
		return "", fmt.Errorf("handling k8s stored secret %s/%s was on error: %w", namespace, name, err)
	}
	if isExpired {
		log.Printf("k8s stored secret %s/%s was expired (resourceVersion: %s), so renewing...", namespace, name, version)
		return addValidSecret(s.ctx, s.client, namespace, name)
	}
	return secretContent, nil
}

func addValidSecret(ctx context.Context, client *Client, namespace, name string) (string, error) {
	log.Printf("storing k8s secret at %s/%s", namespace, name)

	keyStr, keyErr := commonConfig.GenerateKeyString()
	if keyErr != nil {
		return "", keyErr
	}

	secret := map[string][]byte{}
	secret[SecretFileName] = []byte(keyStr)

	nsHandler := NewNamespaceClient(ctx, namespace, client)
	nsErr := nsHandler.EnsureExists(namespace)
	if nsErr != nil {
		return "", nsErr
	}
	secretHandler := NewSecret(ctx, client)
	storedVersion, storingErr := secretHandler.ApplyOpaqueSecret(ctx, namespace, name, secret)
	if storingErr != nil {
		return "", storingErr
	}

	log.Printf("k8s secret at %s/%s is updated (resourceVersion: %s)", namespace, name, storedVersion)

	return keyStr, nil
}

// handleDockerCfgJSONContent serializes a ~/.docker/config.json file
func handleDockerCfgJSONContent(username, password, email, server string) ([]byte, error) {
	dockerConfigAuth := DockerConfigEntry{
		Username: username,
		Password: password,
		Email:    email,
		Auth:     encodeDockerConfigFieldAuth(username, password),
	}
	dockerConfigJSON := DockerConfigJSON{
		Auths: map[string]DockerConfigEntry{server: dockerConfigAuth},
	}

	return json.Marshal(dockerConfigJSON)
}

// encodeDockerConfigFieldAuth returns base64 encoding of the username and password string
func encodeDockerConfigFieldAuth(username, password string) string {
	fieldValue := username + ":" + password
	return base64.StdEncoding.EncodeToString([]byte(fieldValue))
}

func (s *Secret) GetSecret(namespace, name string) (
	secretFiles map[string][]byte, version string, err error,
) {
	cli, err := s.getSecretClient(namespace)
	if err != nil {
		return nil, "", err
	}

	item, err := cli.Get(s.ctx, name, metav1.GetOptions{})
	if err != nil {
		return nil, "", err
	}
	return item.Data, item.ResourceVersion, nil
}
