package utils

import (
	"errors"
)

const (
	LabelSecretKeys      = "secret.keys"
	LabelContainerPrefix = "container.prefix"
)

// generating dyrector.io specific labels for containers
// org.dyrectorio is our official label prefix
func SetOrganizationLabel(key, value string) (map[string]string, error) {
	if key == "" || value == "" {
		return nil, errors.New("missing key or value to build an organization label")
	}

	labels := map[string]string{}

	labels["org.dyrectorio."+key] = value

	return labels, nil
}

func GetOrganizationLabel(labels map[string]string, key string) (string, bool) {
	if val, ok := labels["org.dyrectorio."+key]; ok {
		return val, true
	}

	return "", false
}
