//go:build unit
// +build unit

package k8s_test

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"

	v1 "github.com/dyrector-io/dyrectorio/golang/api/v1"
	internalconfig "github.com/dyrector-io/dyrectorio/golang/internal/config"
	"github.com/dyrector-io/dyrectorio/golang/pkg/crane/config"
	"github.com/dyrector-io/dyrectorio/golang/pkg/crane/k8s"
)

func testConfig() *config.Configuration {
	return &config.Configuration{
		CommonConfiguration: internalconfig.CommonConfiguration{
			DefaultLimitsCPU:     "1m",
			DefaultLimitsMemory:  "2m",
			DefaultRequestsCPU:   "3m",
			DefaultRequestMemory: "4m",
		},
	}
}

// rabbitmq reference example from the design spec
func rabbitmqJobContainerConfig() *v1.ContainerConfig {
	return &v1.ContainerConfig{
		Container: "test-job",
		Experimental: v1.Experimental{
			Job: &v1.Job{
				PollingInterval:            3,
				MaxReplicaCount:            8,
				SuccessfulJobsHistoryLimit: 2,
				FailedJobsHistoryLimit:     5,
				Parallelism:                1,
				Completions:                1,
				BackoffLimit:               3,
				Triggers: []v1.JobTriggers{
					{
						Type:                  "rabbitmq",
						Protocol:              "http",
						Mode:                  "QueueLength",
						QueueName:             "pdfRequests",
						Value:                 "1",
						ExcludeUnacknowledged: true,
						AuthSecretName:        "rabbitmq-auth",
					},
				},
			},
		},
	}
}

func TestBuildScaledJobMeta(t *testing.T) {
	obj, err := k8s.BuildScaledJobForTest(rabbitmqJobContainerConfig(), "keda-poc", testConfig())
	require.NoError(t, err)

	assert.Equal(t, "keda.sh/v1alpha1", obj.GetAPIVersion())
	assert.Equal(t, "ScaledJob", obj.GetKind())
	assert.Equal(t, "test-job", obj.GetName())
	assert.Equal(t, "keda-poc", obj.GetNamespace())
}

func TestBuildScaledJobScalars(t *testing.T) {
	obj, err := k8s.BuildScaledJobForTest(rabbitmqJobContainerConfig(), "keda-poc", testConfig())
	require.NoError(t, err)

	assertNestedInt(t, obj, 3, "spec", "pollingInterval")
	assertNestedInt(t, obj, 8, "spec", "maxReplicaCount")
	assertNestedInt(t, obj, 2, "spec", "successfulJobsHistoryLimit")
	assertNestedInt(t, obj, 5, "spec", "failedJobsHistoryLimit")
	assertNestedInt(t, obj, 1, "spec", "jobTargetRef", "parallelism")
	assertNestedInt(t, obj, 1, "spec", "jobTargetRef", "completions")
	assertNestedInt(t, obj, 3, "spec", "jobTargetRef", "backoffLimit")
}

func TestBuildScaledJobPodTemplate(t *testing.T) {
	obj, err := k8s.BuildScaledJobForTest(rabbitmqJobContainerConfig(), "keda-poc", testConfig())
	require.NoError(t, err)

	restartPolicy, found, err := unstructured.NestedString(obj.Object,
		"spec", "jobTargetRef", "template", "spec", "restartPolicy")
	require.NoError(t, err)
	require.True(t, found)
	assert.Equal(t, "Never", restartPolicy)

	containers, found, err := unstructured.NestedSlice(obj.Object,
		"spec", "jobTargetRef", "template", "spec", "containers")
	require.NoError(t, err)
	require.True(t, found)
	require.Len(t, containers, 1)

	container := containers[0].(map[string]interface{})
	assert.Equal(t, "test-job", container["name"])
}

func TestBuildScaledJobTriggers(t *testing.T) {
	obj, err := k8s.BuildScaledJobForTest(rabbitmqJobContainerConfig(), "keda-poc", testConfig())
	require.NoError(t, err)

	triggers, found, err := unstructured.NestedSlice(obj.Object, "spec", "triggers")
	require.NoError(t, err)
	require.True(t, found)
	require.Len(t, triggers, 1)

	trigger := triggers[0].(map[string]interface{})
	assert.Equal(t, "rabbitmq", trigger["type"])

	metadata := trigger["metadata"].(map[string]interface{})
	assert.Equal(t, "http", metadata["protocol"])
	assert.Equal(t, "QueueLength", metadata["mode"])
	assert.Equal(t, "pdfRequests", metadata["queueName"])
	assert.Equal(t, "1", metadata["value"])
	assert.Equal(t, "true", metadata["excludeUnacknowledged"])

	authRef := trigger["authenticationRef"].(map[string]interface{})
	assert.Equal(t, "rabbitmq-auth", authRef["name"])
}

func TestBuildScaledJobOmitsZeroScalars(t *testing.T) {
	containerConfig := &v1.ContainerConfig{
		Container: "minimal",
		Experimental: v1.Experimental{
			Job: &v1.Job{
				Triggers: []v1.JobTriggers{{Type: "cron"}},
			},
		},
	}

	obj, err := k8s.BuildScaledJobForTest(containerConfig, "ns", testConfig())
	require.NoError(t, err)

	_, found, err := unstructured.NestedFieldNoCopy(obj.Object, "spec", "pollingInterval")
	require.NoError(t, err)
	assert.False(t, found, "zero pollingInterval should be omitted so KEDA defaults apply")

	_, found, err = unstructured.NestedFieldNoCopy(obj.Object, "spec", "jobTargetRef", "backoffLimit")
	require.NoError(t, err)
	assert.False(t, found, "zero backoffLimit should be omitted")
}

func assertNestedInt(t *testing.T, obj *unstructured.Unstructured, want int64, fields ...string) {
	t.Helper()
	got, found, err := unstructured.NestedInt64(obj.Object, fields...)
	require.NoError(t, err)
	require.Truef(t, found, "field %v not found", fields)
	assert.Equalf(t, want, got, "field %v", fields)
}
