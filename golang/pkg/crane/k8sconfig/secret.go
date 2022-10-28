package k8sconfig

import (
	"context"
	"fmt"

	config "github.com/dyrector-io/dyrectorio/golang/internal/config"
	craneConfig "github.com/dyrector-io/dyrectorio/golang/pkg/crane/config"
	"github.com/dyrector-io/dyrectorio/golang/pkg/crane/k8s"

	"github.com/rs/zerolog/log"
	"k8s.io/apimachinery/pkg/api/errors"
)

const SecretFileName = "private.key"

func GetValidSecret(ctx context.Context, namespace, name string, appConfig *craneConfig.Configuration) (string, error) {
	if namespace == "" || name == "" {
		return "", fmt.Errorf("secret name or namespace can't be empty")
	}

	if err := ensureNamespaceExisted(ctx, namespace, appConfig); err != nil {
		return "", err
	}

	objects, version, err := k8s.GetSecret(ctx, namespace, name, appConfig)
	if err != nil {
		if errors.IsNotFound(err) {
			return addValidSecret(ctx, namespace, name, appConfig)
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

	isExpired, err := config.IsExpiredKey(secretContent)
	if err != nil {
		return "", fmt.Errorf("handling k8s stored secret %s/%s was on error: %w", namespace, name, err)
	}
	if isExpired {
		log.Printf("k8s stored secret %s/%s was expired (resourceVersion: %s), so renewing...", namespace, name, version)
		return addValidSecret(ctx, namespace, name, appConfig)
	}
	return secretContent, nil
}

func addValidSecret(ctx context.Context, namespace, name string, appConfig *craneConfig.Configuration) (string, error) {
	log.Printf("storing k8s secret at %s/%s", namespace, name)

	keyStr, keyErr := config.GenerateKeyString()
	if keyErr != nil {
		return "", keyErr
	}

	secret := map[string][]byte{}
	secret[SecretFileName] = []byte(keyStr)

	storedVersion, storingErr := k8s.ApplyOpaqueSecret(ctx, namespace, name, secret, appConfig)
	if storingErr != nil {
		return "", storingErr
	}

	log.Printf("k8s secret at %s/%s is updated (resourceVersion: %s)", namespace, name, storedVersion)

	return keyStr, nil
}

func ensureNamespaceExisted(ctx context.Context, namespace string, appConfig *craneConfig.Configuration) error {
	namespaces, err := k8s.GetNamespaces(appConfig)
	if err != nil {
		return fmt.Errorf("namespace fetching error: %w", err)
	}

	var isNamespaceFound bool
	for _, item := range namespaces {
		if item.Name == namespace {
			isNamespaceFound = true
			break
		}
	}
	if !isNamespaceFound {
		return k8s.DeployNamespace(ctx, namespace, appConfig)
	}
	return nil
}

func InjectSecret(secret string, appConfig *craneConfig.Configuration) {
	appConfig.CommonConfiguration.SecretPrivateKey = secret
}
