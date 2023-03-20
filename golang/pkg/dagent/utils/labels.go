package utils

import (
	"errors"

	"github.com/dyrector-io/dyrectorio/golang/internal/label"
)

// generating dyrector.io specific labels for containers
// org.dyrectorio is our official label prefix
func SetOrganizationLabel(key, value string) (map[string]string, error) {
	if key == "" || value == "" {
		return nil, errors.New("missing key or value to build an organization label")
	}

	labels := map[string]string{}

	labels[label.DyrectorioOrg+key] = value

	return labels, nil
}

func GetOrganizationLabel(labels map[string]string, key string) (string, bool) {
	if val, ok := labels[label.DyrectorioOrg+key]; ok {
		return val, true
	}

	return "", false
}
