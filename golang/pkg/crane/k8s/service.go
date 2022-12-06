package k8s

import (
	"context"
	"fmt"

	"github.com/rs/zerolog/log"
	"golang.org/x/exp/maps"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/util/intstr"

	"github.com/dyrector-io/dyrectorio/golang/internal/util"
	builder "github.com/dyrector-io/dyrectorio/golang/pkg/builder/container"
	"github.com/dyrector-io/dyrectorio/golang/pkg/crane/config"

	typedcorev1 "k8s.io/client-go/kubernetes/typed/core/v1"

	acorev1 "k8s.io/client-go/applyconfigurations/core/v1"

	corev1 "k8s.io/api/core/v1"
)

// facade object for Service management
type Service struct {
	ctx        context.Context
	client     *Client
	status     string
	portsBound []int32
	portNames  []string
	appConfig  *config.Configuration
}

func NewService(ctx context.Context, client *Client) *Service {
	return &Service{status: "", ctx: ctx, client: client, appConfig: client.appConfig}
}

type ServiceParams struct {
	namespace     string
	name          string
	selector      string
	portBindings  []builder.PortBinding
	portRanges    []builder.PortRangeBinding
	useLB         bool
	LBAnnotations map[string]string
	labels        map[string]string
	annotations   map[string]string
}

func (s *Service) DeployService(params *ServiceParams) error {
	client, err := s.getServiceClient(params.namespace)
	if err != nil {
		return err
	}

	if len(params.portBindings) == 0 {
		return nil
	}

	ports := getServicePorts(params.portBindings, params.portRanges)

	svcSpec := acorev1.ServiceSpec().
		WithSelector(map[string]string{"app": params.selector}).
		WithPorts(ports...)

	if params.useLB {
		svcSpec.WithType(corev1.ServiceTypeLoadBalancer).
			WithExternalTrafficPolicy(corev1.ServiceExternalTrafficPolicyTypeLocal)
	} else {
		svcSpec.WithType(corev1.ServiceTypeClusterIP)
	}

	svc := acorev1.Service(params.name, params.namespace).
		WithSpec(svcSpec)

	annot := map[string]string{}
	if params.useLB {
		maps.Copy(annot, params.LBAnnotations)
	}
	maps.Copy(annot, params.annotations)
	svc.WithAnnotations(annot)

	labels := map[string]string{
		"app": params.name,
	}
	maps.Copy(labels, params.labels)
	svc.WithLabels(labels)

	res, err := client.Apply(s.ctx, svc, metav1.ApplyOptions{
		FieldManager: s.appConfig.FieldManagerName,
		Force:        s.appConfig.ForceOnConflicts,
	})

	if err != nil {
		log.Error().Err(err).Stack().Msg("Service deploy error")
	} else {
		log.Info().Str("name", res.Name).Msg("Service deployed")
	}

	for _, servicePort := range res.Spec.Ports {
		s.portsBound = append(s.portsBound, servicePort.Port)
		s.portNames = append(s.portNames, servicePort.Name)
	}
	return nil
}

func (s *Service) GetServices(namespace string) (*corev1.ServiceList, error) {
	client, err := s.getServiceClient(namespace)
	if err != nil {
		return nil, err
	}

	return client.List(s.ctx, metav1.ListOptions{})
}

func (s *Service) deleteServices(namespace, name string) error {
	client, err := s.getServiceClient(namespace)
	if err != nil {
		return err
	}

	return client.Delete(s.ctx, name, metav1.DeleteOptions{})
}

func getServicePorts(portBindings []builder.PortBinding, portRanges []builder.PortRangeBinding) []*acorev1.ServicePortApplyConfiguration {
	ports := []*acorev1.ServicePortApplyConfiguration{}

	for i := range portBindings {
		portNum := int32(portBindings[i].PortBinding)
		ports = append(ports,
			acorev1.ServicePort().
				WithName(fmt.Sprintf("tcp-%v", portNum)).
				WithProtocol(corev1.ProtocolTCP).
				WithPort(portNum).
				WithTargetPort(intstr.FromInt(int(portBindings[i].ExposedPort))))
	}

	for i := range portRanges {
		internalFrom := int(portRanges[i].Internal.From)
		externalFrom := int(portRanges[i].External.From)
		internalTo := int(portRanges[i].Internal.To)
		for j := 0; internalFrom+j < internalTo; j++ {
			portNum := int32(internalFrom + j)
			ports = append(ports,
				acorev1.ServicePort().
					WithName(fmt.Sprintf("tcp-%v", portNum)).
					WithProtocol(corev1.ProtocolTCP).
					WithPort(portNum).
					WithTargetPort(intstr.FromInt(externalFrom+j)))
		}
	}

	return ports
}

func (s *Service) getServiceClient(namespace string) (typedcorev1.ServiceInterface, error) {
	clientset, err := s.client.GetClientSet()
	if err != nil {
		return nil, err
	}

	client := clientset.CoreV1().Services(util.Fallback(namespace, corev1.NamespaceAll))

	return client, nil
}
