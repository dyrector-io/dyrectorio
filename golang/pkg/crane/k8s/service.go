package k8s

import (
	"context"
	"fmt"
	"os"

	"github.com/rs/zerolog/log"
	"golang.org/x/exp/maps"
	"gopkg.in/yaml.v3"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/util/intstr"

	builder "github.com/dyrector-io/dyrectorio/golang/pkg/builder/container"
	"github.com/dyrector-io/dyrectorio/golang/pkg/crane/config"

	typedcorev1 "k8s.io/client-go/kubernetes/typed/core/v1"

	acorev1 "k8s.io/client-go/applyconfigurations/core/v1"

	corev1 "k8s.io/api/core/v1"
)

// 9000: "default/example-go:8080"
// this is/was needed to expose ancient ports - passive ftp
type IngressPortMap struct {
	TCP   map[uint16]string `yaml:"tcp"`
	Ports map[string]int    `yaml:"ports"`
}

// facade object for service management
type service struct {
	ctx        context.Context
	status     string
	portsBound []int32
	appConfig  *config.Configuration
}

func newService(ctx context.Context, cfg *config.Configuration) *service {
	return &service{status: "", ctx: ctx, appConfig: cfg}
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

func (s *service) deployService(params *ServiceParams) error {
	client, err := getServiceClient(params.namespace, s.appConfig)
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

	labels := map[string]string{}
	maps.Copy(labels, params.labels)
	svc.WithLabels(labels)

	res, err := client.Apply(s.ctx, svc, metav1.ApplyOptions{
		FieldManager: s.appConfig.FieldManagerName,
		Force:        s.appConfig.ForceOnConflicts,
	})

	if err != nil {
		log.Error().Err(err).Stack().Msg("Service deploy error")
	} else {
		log.Printf("Service deployed: %s", res.Name)
	}

	if s.appConfig.CraneGenTCPIngressMap != "" {
		genIngressMapFile(ports, params.namespace, params.name)
	}

	// this might actually not reflect the objects present in the cluster
	for _, servicePort := range getServicePorts(params.portBindings, params.portRanges) {
		s.portsBound = append(s.portsBound, *servicePort.Port)
	}
	return nil
}

func (s *service) deleteServices(namespace, name string) error {
	client, err := getServiceClient(namespace, s.appConfig)
	if err != nil {
		return err
	}

	return client.Delete(s.ctx, name, metav1.DeleteOptions{})
}

func getServicePorts(portBindings []builder.PortBinding, portRanges []builder.PortRangeBinding) []*acorev1.ServicePortApplyConfiguration {
	ports := []*acorev1.ServicePortApplyConfiguration{}

	for i := range portBindings {
		ports = append(ports,
			acorev1.ServicePort().
				WithName(fmt.Sprintf("tcp-%v", i)).
				WithProtocol(corev1.ProtocolTCP).
				WithPort(int32(portBindings[i].PortBinding)).
				WithTargetPort(intstr.FromInt(int(portBindings[i].ExposedPort))))
	}

	for i := range portRanges {
		internalFrom := int(portRanges[i].Internal.From)
		externalFrom := int(portRanges[i].External.From)
		internalTo := int(portRanges[i].Internal.To)
		for j := 0; internalFrom+j < internalTo; j++ {
			ports = append(ports,
				acorev1.ServicePort().
					WithName(fmt.Sprintf("tcp-%v", internalFrom+j)).
					WithProtocol(corev1.ProtocolTCP).
					WithPort(int32(internalFrom+j)).
					WithTargetPort(intstr.FromInt(externalFrom+j)))
		}
	}

	return ports
}

func getServiceClient(namespace string, cfg *config.Configuration) (typedcorev1.ServiceInterface, error) {
	clientset, err := NewClient().GetClientSet(cfg)
	if err != nil {
		return nil, err
	}

	client := clientset.CoreV1().Services(namespace)

	return client, nil
}

func genIngressMapFile(ports []*acorev1.ServicePortApplyConfiguration, namespace, serviceName string) {
	content := IngressPortMap{}
	content.TCP = make(map[uint16]string)
	content.Ports = make(map[string]int)
	for i := range ports {
		content.TCP[uint16(ports[i].TargetPort.IntVal)] = fmt.Sprintf("%s/%s:%v", namespace, serviceName, *ports[i].Port)
		content.Ports["tcp-"+fmt.Sprint(ports[i].TargetPort.IntVal)] = int(ports[i].TargetPort.IntVal)
	}

	bytes, err := yaml.Marshal(content)
	if err != nil {
		log.Error().Err(err).Stack().Msg("could not unmarshal ingress map")
	}

	err = os.WriteFile("ingress-map.yml", bytes, os.ModePerm)

	if err != nil {
		log.Error().Err(err).Stack().Msg("could not write file")
	}
}
