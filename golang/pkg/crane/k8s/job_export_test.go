package k8s

import (
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"

	v1 "github.com/dyrector-io/dyrectorio/golang/api/v1"
	"github.com/dyrector-io/dyrectorio/golang/pkg/crane/config"
)

// BuildScaledJobForTest builds the unstructured KEDA ScaledJob from a container
// config (whose Experimental.Job must be set) without touching a live cluster.
func BuildScaledJobForTest(
	containerConfig *v1.ContainerConfig,
	namespace string,
	cfg *config.Configuration,
) (*unstructured.Unstructured, error) {
	p := &DeploymentParams{
		namespace:       namespace,
		image:           "test-image",
		containerConfig: containerConfig,
	}
	return buildScaledJob(p, containerConfig.Experimental.Job, cfg)
}
