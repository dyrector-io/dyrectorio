package k8s

import (
	"context"
	"fmt"

	v1 "github.com/dyrector-io/dyrectorio/golang/api/v1"
	"github.com/dyrector-io/dyrectorio/golang/pkg/crane/config"

	versionedv1 "github.com/prometheus-operator/prometheus-operator/pkg/client/versioned"

	smv1 "github.com/prometheus-operator/prometheus-operator/pkg/client/applyconfiguration/monitoring/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

type ServiceMonitor struct {
	Ctx    context.Context
	Client *Client

	ClientSet *versionedv1.Clientset
	appConfig *config.Configuration
}

const (
	ServiceMonitorKind    = "ServiceMonitor"
	ServiceMonitorVersion = "monitoring.coreos.com/v1"
)

// service monitor is spawned per deployment
func NewServiceMonitor(ctx context.Context, cli *Client) (*ServiceMonitor, error) {
	if !cli.VerifyAPIResourceExists(ServiceMonitorVersion, ServiceMonitorKind) {
		return nil, fmt.Errorf("service monitor is not installed")
	}

	restConf, err := cli.GetRestConfig()
	if err != nil {
		return nil, err
	}

	smClient, err := versionedv1.NewForConfig(restConf)

	return &ServiceMonitor{
		Ctx:       ctx,
		Client:    cli,
		ClientSet: smClient,
		appConfig: cli.appConfig,
	}, err
}

// Deploy firstPort is used as a fallback if only path is provided, the first port is used
func (sm *ServiceMonitor) Deploy(namespace, serviceName string, metricParams v1.Metrics, firstPort string) error {
	if sm == nil || sm.ClientSet == nil {
		return fmt.Errorf("service monitor client uninitialized")
	}
	nsHandler := NewNamespaceClient(sm.Ctx, namespace, sm.Client)
	err := nsHandler.EnsureExists(namespace)
	if err != nil {
		return err
	}

	portName := metricParams.Port

	if portName == "" {
		portName = firstPort
	}

	metricsPath := metricParams.Path
	if metricsPath == "" {
		metricsPath = "/metrics"
	}

	smApplyConfig := smv1.ServiceMonitor(serviceName, namespace).
		WithSpec(smv1.ServiceMonitorSpec().
			WithEndpoints(
				smv1.Endpoint().WithPort(portName).WithPath(metricsPath),
			).WithSelector(
			metav1.LabelSelector{
				MatchLabels: map[string]string{
					"app": serviceName,
				},
			},
		))

	_, err = sm.ClientSet.MonitoringV1().ServiceMonitors(namespace).Apply(sm.Ctx, smApplyConfig, metav1.ApplyOptions{
		FieldManager: sm.appConfig.FieldManagerName,
		Force:        sm.appConfig.ForceOnConflicts,
	})

	return err
}

// cleanup ignores errors, expected to run if no metrics were defined
func (sm *ServiceMonitor) Cleanup(namespace, serviceName string) error {
	if sm.Client != nil {
		return sm.ClientSet.MonitoringV1().ServiceMonitors(namespace).Delete(sm.Ctx, serviceName, metav1.DeleteOptions{})
	}

	return nil
}
