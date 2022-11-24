package k8s

import (
	"context"
	"encoding/base64"
	"encoding/json"

	"github.com/dyrector-io/dyrectorio/golang/internal/crypt"
	imageHelper "github.com/dyrector-io/dyrectorio/golang/internal/helper/image"
	"github.com/dyrector-io/dyrectorio/golang/pkg/crane/config"

	"github.com/rs/zerolog/log"
	v1 "k8s.io/client-go/kubernetes/typed/core/v1"

	apicorev1 "k8s.io/api/core/v1"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	corev1 "k8s.io/client-go/applyconfigurations/core/v1"
)

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
type secret struct {
	ctx context.Context

	avail     []string
	appConfig *config.Configuration
}

func newSecret(ctx context.Context, cfg *config.Configuration) *secret {
	secr := secret{ctx: ctx, appConfig: cfg, avail: []string{}}
	return &secr
}

func (s *secret) applySecrets(namespace, name string, values map[string]string) error {
	cli, err := getSecretClient(namespace, s.appConfig)
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

func ListSecrets(ctx context.Context, namespace, name string, appConfig *config.Configuration) ([]string, error) {
	cli, err := getSecretClient(namespace, appConfig)
	if err != nil {
		return nil, err
	}

	list, err := cli.List(ctx, metav1.ListOptions{})
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

func getSecretClient(namespace string, cfg *config.Configuration) (v1.SecretInterface, error) {
	clientset, err := NewClient().GetClientSet(cfg)
	if err != nil {
		return nil, err
	}

	return clientset.CoreV1().Secrets(namespace), nil
}

func ApplyOpaqueSecret(ctx context.Context, namespace, name string, values map[string][]byte, appConfig *config.Configuration) (
	version string, err error,
) {
	cli, err := getSecretClient(namespace, appConfig)
	if err != nil {
		return "", err
	}

	secrets := corev1.Secret(name, namespace).WithData(values)

	result, err := cli.Apply(ctx, secrets, metav1.ApplyOptions{
		FieldManager: appConfig.FieldManagerName,
		Force:        appConfig.ForceOnConflicts,
	})
	if err != nil {
		return "", err
	}

	return result.ResourceVersion, nil
}

func ApplyRegistryAuthSecret(ctx context.Context,
	namespace,
	name string,
	credentials *imageHelper.RegistryAuth,
	appConfig *config.Configuration,
) error {
	cli, err := getSecretClient(namespace, appConfig)
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

func GetSecret(ctx context.Context, namespace, name string, appConfig *config.Configuration) (
	secretFiles map[string][]byte, version string, err error,
) {
	cli, err := getSecretClient(namespace, appConfig)
	if err != nil {
		return nil, "", err
	}

	item, err := cli.Get(ctx, name, metav1.GetOptions{})
	if err != nil {
		return nil, "", err
	}
	return item.Data, item.ResourceVersion, nil
}
