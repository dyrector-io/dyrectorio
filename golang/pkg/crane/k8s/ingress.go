package k8s

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/rs/zerolog/log"
	"golang.org/x/exp/maps"
	v1 "k8s.io/api/networking/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	applymetav1 "k8s.io/client-go/applyconfigurations/meta/v1"
	netv1 "k8s.io/client-go/applyconfigurations/networking/v1"

	"github.com/dyrector-io/dyrectorio/golang/internal/util"
	"github.com/dyrector-io/dyrectorio/golang/pkg/crane/config"

	networking "k8s.io/client-go/kubernetes/typed/networking/v1"
)

// facade object for ingress management
type ingress struct {
	ctx       context.Context
	status    string
	appConfig *config.Configuration
}

type DeployIngressOptions struct {
	namespace, containerName, ingressName, ingressHost, uploadLimit string
	ports                                                           []int32
	tls, proxyHeaders                                               bool
	customHeaders                                                   []string
	labels                                                          map[string]string
	annotations                                                     map[string]string
}

func newIngress(ctx context.Context, cfg *config.Configuration) *ingress {
	return &ingress{ctx: ctx, status: "", appConfig: cfg}
}

func (ing *ingress) deployIngress(options *DeployIngressOptions) error {
	if options == nil {
		return errors.New("ingress deployment is nil")
	}

	client, err := getIngressClient(options.namespace, ing.appConfig)
	if err != nil {
		log.Error().Err(err).Stack().Msg("Error with ingress client")
	}

	if len(options.ports) == 0 {
		return errors.New("empty ports, nothing to expose")
	}

	var ingressRoot string
	if options.ingressHost != "" {
		ingressRoot = options.ingressHost
	} else if ing.appConfig.IngressRootDomain != "" {
		ingressRoot = ing.appConfig.IngressRootDomain
	} else {
		return fmt.Errorf("no ingress domain provided in deploy request or configuration")
	}

	var ingressPath string
	if options.ingressName != "" {
		ingressPath = util.JoinV(".", options.ingressName, ingressRoot)
	} else {
		ingressPath = util.JoinV(".", options.containerName, options.namespace, ingressRoot)
	}

	spec := netv1.IngressSpec().
		WithRules(
			netv1.IngressRule().
				WithHost(ingressPath).
				WithHTTP(netv1.HTTPIngressRuleValue().WithPaths(
					netv1.HTTPIngressPath().WithPath("/").
						WithPathType(v1.PathTypeImplementationSpecific).
						WithBackend(
							netv1.IngressBackend().WithService(
								netv1.IngressServiceBackend().
									WithName(options.containerName).
									WithPort(netv1.ServiceBackendPort().WithNumber(options.ports[0])),
							),
						),
				)))
	tlsConf := getTLSConfig(ingressPath, options.containerName, options.tls)
	if tlsConf != nil {
		spec.WithTLS(tlsConf)
	}

	annot := getIngressAnnotations(options.tls,
		options.proxyHeaders,
		options.uploadLimit,
		options.customHeaders,
	)
	maps.Copy(annot, options.annotations)

	labels := map[string]string{}
	maps.Copy(labels, options.labels)

	applyConfig := &netv1.IngressApplyConfiguration{
		TypeMetaApplyConfiguration: *applymetav1.TypeMeta().WithKind("Ingress").WithAPIVersion("networking.k8s.io/v1"),
		ObjectMetaApplyConfiguration: applymetav1.ObjectMeta().
			WithName(options.containerName).
			WithAnnotations(annot).WithLabels(labels),
		Spec: spec,
	}

	ingress, err := client.Apply(ing.ctx, applyConfig, metav1.ApplyOptions{
		FieldManager: ing.appConfig.FieldManagerName,
		Force:        ing.appConfig.ForceOnConflicts,
	})
	if err != nil {
		log.Printf("%v, ingress: %s", err, ingress.ObjectMeta.Name)
	}

	return err
}

func (ing *ingress) deleteIngress(namespace, name string) error {
	client, err := getIngressClient(namespace, ing.appConfig)
	if err != nil {
		panic(err)
	}

	return client.Delete(ing.ctx, name, metav1.DeleteOptions{})
}

func getTLSConfig(ingressPath, containerName string, enabled bool) *netv1.IngressTLSApplyConfiguration {
	if enabled {
		return netv1.IngressTLS().
			WithHosts(ingressPath).
			WithSecretName(util.JoinV("-", containerName, "tls"))
	} else {
		return nil
	}
}

func getIngressAnnotations(tlsIsWanted, proxyHeaders bool,
	uploadLimit string, customHeaders []string,
) map[string]string {
	corsHeaders := []string{}

	annotations := map[string]string{
		"kubernetes.io/ingress.class": "nginx",
	}

	if tlsIsWanted {
		annotations["kubernetes.io/tls-acme"] = fmt.Sprintf("%v", true)
		annotations["cert-manager.io/cluster-issuer"] = "letsencrypt-prod"
	}

	// Add Custom Headers to the CORS Allow Header annotation if presents
	if len(customHeaders) > 0 {
		corsHeaders = customHeaders
	}

	if proxyHeaders {
		extraHeaders := []string{"X-Forwarded-For", "X-Forwarded-Host", "X-Forwarded-Server", "X-Real-IP", "X-Requested-With"}
		corsHeaders = append(corsHeaders, extraHeaders...)

		annotations["nginx.ingress.kubernetes.io/enable-cors"] = "true"
		annotations["nginx.ingress.kubernetes.io/proxy-buffering"] = "on"
		annotations["nginx.ingress.kubernetes.io/proxy-buffer-size"] = "256k"
	}

	// Add header string to cors-allow-headers if presents any value
	if len(corsHeaders) > 0 {
		annotations["nginx.ingress.kubernetes.io/cors-allow-headers"] = strings.Join(corsHeaders, ", ")
	}

	if uploadLimit != "" {
		annotations["nginx.ingress.kubernetes.io/proxy-body-size"] = uploadLimit
	}

	return annotations
}

func getIngressClient(namespace string, cfg *config.Configuration) (networking.IngressInterface, error) {
	clientset, err := NewClient().GetClientSet(cfg)
	if err != nil {
		return nil, err
	}

	client := clientset.NetworkingV1().Ingresses(namespace)

	return client, nil
}
