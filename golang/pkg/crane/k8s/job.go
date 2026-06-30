package k8s

import (
	"context"
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/rs/zerolog/log"
	coreV1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime/schema"
	corev1 "k8s.io/client-go/applyconfigurations/core/v1"
	"k8s.io/client-go/dynamic"

	v1 "github.com/dyrector-io/dyrectorio/golang/api/v1"
	"github.com/dyrector-io/dyrectorio/golang/pkg/crane/config"
)

const (
	ScaledJobKind    = "ScaledJob"
	ScaledJobVersion = "keda.sh/v1alpha1"
)

// scaledJobGVR is the GroupVersionResource of the KEDA ScaledJob CRD.
var scaledJobGVR = schema.GroupVersionResource{
	Group:    "keda.sh",
	Version:  "v1alpha1",
	Resource: "scaledjobs",
}

// facade object for KEDA ScaledJob management
type job struct {
	ctx       context.Context
	appConfig *config.Configuration
	client    dynamic.Interface
}

// newScaledJob creates a job facade. It returns an error when the KEDA ScaledJob CRD
// is not installed in the cluster, mirroring the ServiceMonitor pattern.
func newScaledJob(ctx context.Context, cli *Client) (*job, error) {
	if !cli.VerifyAPIResourceExists(ScaledJobVersion, ScaledJobKind) {
		return nil, fmt.Errorf("KEDA ScaledJob CRD (%s) is not installed", ScaledJobVersion)
	}

	restConf, err := cli.GetRestConfig()
	if err != nil {
		return nil, err
	}

	dynClient, err := dynamic.NewForConfig(restConf)
	if err != nil {
		return nil, err
	}

	return &job{
		ctx:       ctx,
		appConfig: cli.appConfig,
		client:    dynClient,
	}, nil
}

// deployScaledJob server-side applies a KEDA ScaledJob built from the deployment
// params and the experimental job config. The pod template is identical to the one
// used by Deployments (same container, init containers, volumes, node selector...),
// only the restart policy is forced to Never as required for Jobs.
func (j *job) deployScaledJob(p *DeploymentParams) error {
	if j == nil || j.client == nil {
		return fmt.Errorf("scaled job client uninitialized (is KEDA installed?)")
	}

	jobConfig := p.containerConfig.Experimental.Job
	if jobConfig == nil {
		return fmt.Errorf("experimental job config is nil")
	}

	scaledJob, err := buildScaledJob(p, jobConfig, j.appConfig)
	if err != nil {
		return err
	}

	name := p.containerConfig.Container
	result, err := j.client.Resource(scaledJobGVR).Namespace(p.namespace).Apply(
		j.ctx, name, scaledJob, metav1.ApplyOptions{
			FieldManager: j.appConfig.FieldManagerName,
			Force:        j.appConfig.ForceOnConflicts,
		})
	if err != nil {
		log.Error().Err(err).Stack().Msg("ScaledJob error")
		return fmt.Errorf("scaled job error: %w", err)
	}

	log.Info().Str("name", result.GetName()).Msg("ScaledJob succeeded")

	return nil
}

func (j *job) deleteScaledJob(namespace, name string) error {
	if j == nil || j.client == nil {
		return nil
	}
	return j.client.Resource(scaledJobGVR).Namespace(namespace).Delete(j.ctx, name, metav1.DeleteOptions{})
}

// buildScaledJob assembles the ScaledJob as an unstructured object ready for
// server-side apply.
func buildScaledJob(p *DeploymentParams, jobConfig *v1.Job, cfg *config.Configuration) (*unstructured.Unstructured, error) {
	name := p.containerConfig.Container

	container, err := buildContainer(p, cfg)
	if err != nil {
		return nil, err
	}

	labels := map[string]string{"app": name}
	for k, v := range p.labels {
		labels[k] = v
	}

	podSpec := buildPodSpec(container, p, cfg).WithRestartPolicy(coreV1.RestartPolicyNever)
	podTemplate := corev1.PodTemplateSpec().WithLabels(labels).WithSpec(podSpec)

	templateMap, err := toUnstructuredMap(podTemplate)
	if err != nil {
		return nil, err
	}

	jobTargetRef := map[string]interface{}{"template": templateMap}
	setPositive(jobTargetRef, "parallelism", jobConfig.Parallelism)
	setPositive(jobTargetRef, "completions", jobConfig.Completions)
	setPositive(jobTargetRef, "backoffLimit", jobConfig.BackoffLimit)

	spec := map[string]interface{}{
		"jobTargetRef": jobTargetRef,
		"triggers":     buildTriggers(jobConfig.Triggers),
	}
	setPositive(spec, "pollingInterval", jobConfig.PollingInterval)
	setPositive(spec, "maxReplicaCount", jobConfig.MaxReplicaCount)
	setPositive(spec, "successfulJobsHistoryLimit", jobConfig.SuccessfulJobsHistoryLimit)
	setPositive(spec, "failedJobsHistoryLimit", jobConfig.FailedJobsHistoryLimit)

	return &unstructured.Unstructured{Object: map[string]interface{}{
		"apiVersion": ScaledJobVersion,
		"kind":       ScaledJobKind,
		"metadata": map[string]interface{}{
			"name":      name,
			"namespace": p.namespace,
		},
		"spec": spec,
	}}, nil
}

// buildTriggers maps the fixed (rabbitmq-shaped) JobTriggers fields into KEDA's
// generic trigger structure.
func buildTriggers(triggers []v1.JobTriggers) []interface{} {
	result := make([]interface{}, 0, len(triggers))

	for i := range triggers {
		t := triggers[i]

		metadata := map[string]interface{}{
			"excludeUnacknowledged": strconv.FormatBool(t.ExcludeUnacknowledged),
		}
		setNonEmpty(metadata, "protocol", t.Protocol)
		setNonEmpty(metadata, "mode", t.Mode)
		setNonEmpty(metadata, "queueName", t.QueueName)
		setNonEmpty(metadata, "value", t.Value)

		trigger := map[string]interface{}{
			"type":     t.Type,
			"metadata": metadata,
		}
		if t.AuthSecretName != "" {
			trigger["authenticationRef"] = map[string]interface{}{"name": t.AuthSecretName}
		}

		result = append(result, trigger)
	}

	return result
}

// toUnstructuredMap marshals an apply configuration into a plain map for embedding
// into an unstructured object.
func toUnstructuredMap(v any) (map[string]interface{}, error) {
	data, err := json.Marshal(v)
	if err != nil {
		return nil, err
	}
	out := map[string]interface{}{}
	if err := json.Unmarshal(data, &out); err != nil {
		return nil, err
	}
	return out, nil
}

// setPositive stores the value as int64 only when it is greater than zero, leaving
// KEDA's own defaults in place otherwise.
func setPositive(m map[string]interface{}, key string, value uint16) {
	if value > 0 {
		m[key] = int64(value)
	}
}

func setNonEmpty(m map[string]interface{}, key, value string) {
	if value != "" {
		m[key] = value
	}
}
