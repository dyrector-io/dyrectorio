package k8s

import (
	"context"
	"fmt"
	"log"

	"github.com/dyrector-io/dyrectorio/agent/pkg/crane/config"

	v1 "k8s.io/client-go/kubernetes/typed/core/v1"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	corev1 "k8s.io/client-go/applyconfigurations/core/v1"

	"github.com/ProtonMail/gopenpgp/v2/helper"
)

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

	decrypted, err := decryptSecrets(values, s.appConfig)

	if err != nil {
		return err
	}

	secrets := corev1.Secret(name, namespace).WithData(decrypted)

	result, err := cli.Apply(s.ctx, secrets, metav1.ApplyOptions{
		FieldManager: s.appConfig.FieldManagerName,
		Force:        s.appConfig.ForceOnConflicts,
	})

	if result != nil {
		log.Println("Secret updated: " + result.Name)
		if len(values) > 0 {
			s.avail = append(s.avail, name)
		}
	}

	return err
}

func decryptSecrets(arr map[string]string, appConfig *config.Configuration) (map[string][]byte, error) {
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

func getSecretClient(namespace string, cfg *config.Configuration) (v1.SecretInterface, error) {
	clientset, err := GetClientSet(cfg)

	if err != nil {
		return nil, err
	}

	return clientset.CoreV1().Secrets(namespace), nil
}
