package k8s

import (
	v1 "github.com/dyrector-io/dyrectorio/agent/api/v1"

	"github.com/dyrector-io/dyrectorio/agent/pkg/crane/config"

	corev1 "k8s.io/client-go/applyconfigurations/core/v1"
)

func GetResourceManagementForTest(resourceConfig v1.ResourceConfig,
	cfg *config.Configuration) (*corev1.ResourceRequirementsApplyConfiguration, error) {
	return getResourceManagement(resourceConfig, cfg)
}
