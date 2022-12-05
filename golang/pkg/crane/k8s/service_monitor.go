package k8s

import (
	"context"
	"fmt"

	"github.com/rs/zerolog/log"

	v1 "github.com/dyrector-io/dyrectorio/golang/api/v1"
	"github.com/dyrector-io/dyrectorio/golang/pkg/crane/config"

	monitoringapiv1 "github.com/prometheus-operator/prometheus-operator/pkg/apis/monitoring/v1"
	monitoringv1 "github.com/prometheus-operator/prometheus-operator/pkg/client/versioned/typed/monitoring/v1"
	apierrors "k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/rest"
)

type ServiceMonitor struct {
	Ctx       context.Context
	Client    *monitoringv1.MonitoringV1Client
	appConfig *config.Configuration
}

const (
	ServiceMonitorKind    = "ServiceMonitor"
	ServiceMonitorVersion = "monitoring.coreos.com/v1"
)

// service monitor is spawned per deployment
func NewServiceMonitor(ctx context.Context, cli *Client) *ServiceMonitor {
	if !cli.VerifyAPIResourceExists(ServiceMonitorVersion, ServiceMonitorKind) {
		log.Warn().Msg("service monitor could not be spawned")
		return nil
	}

	restConf, err := cli.GetRestConfig()
	if err != nil {
		log.Panic().Err(err).Stack().Send()
	}

	// todo(nandor-magyar): fix error handling here, and with every sub-component
	smClient, err := NewServiceMonitorClient(restConf)
	log.Warn().AnErr("Monitor spawn error", err).Send()

	return &ServiceMonitor{
		Ctx:       ctx,
		Client:    smClient,
		appConfig: cli.appConfig,
	}
}

// Deploy firstPort is used as a fallback if only path is provided, the first port is used
func (sm *ServiceMonitor) Deploy(namespace, serviceName string, metricParams v1.Metrics, firstPort string) error {
	if sm == nil || sm.Client == nil {
		return fmt.Errorf("service monitor client uninitialized")
	}
	newMonitor := createServiceMonitorSpec(serviceName, metricParams, firstPort)
	clientSet := sm.Client.ServiceMonitors(namespace)

	oldServiceMonitor, err := clientSet.Get(sm.Ctx, serviceName, metav1.GetOptions{})
	if apierrors.IsNotFound(err) {
		_, err = clientSet.Create(sm.Ctx, newMonitor, metav1.CreateOptions{
			FieldManager: sm.appConfig.FieldManagerName,
		})
		if err != nil {
			return err
		}
	} else if err != nil && !apierrors.IsNotFound(err) {
		return err
	} else {
		newMonitor.ResourceVersion = oldServiceMonitor.ResourceVersion
		_, err := clientSet.Update(sm.Ctx, newMonitor, metav1.UpdateOptions{
			FieldManager: sm.appConfig.FieldManagerName,
		})
		if err != nil {
			return err
		}
	}

	return nil
}

// cleanup ignores errors, expected to run if no metrics were defined
func (sm *ServiceMonitor) Cleanup(namespace, serviceName string) {
	if sm.Client != nil {
		clientSet := sm.Client.ServiceMonitors(namespace)
		_ = clientSet.Delete(sm.Ctx, serviceName, metav1.DeleteOptions{})
	}
}

func createServiceMonitorSpec(name string,
	metricParams v1.Metrics,
	defaultPortName string,
) *monitoringapiv1.ServiceMonitor {
	portName := metricParams.Port

	if portName == "" {
		portName = defaultPortName
	}

	metricsPath := metricParams.Path
	if metricsPath == "" {
		metricsPath = "/metrics"
	}

	return &monitoringapiv1.ServiceMonitor{
		ObjectMeta: metav1.ObjectMeta{
			Name: name,
		},
		Spec: monitoringapiv1.ServiceMonitorSpec{
			Endpoints: []monitoringapiv1.Endpoint{
				{Port: portName, Path: metricsPath},
			},
			Selector: metav1.LabelSelector{
				MatchLabels: map[string]string{
					"app": name,
				},
			},
		},
	}
}

func NewServiceMonitorClient(c *rest.Config) (*monitoringv1.MonitoringV1Client, error) {
	return monitoringv1.NewForConfig(c)
}
