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
	networking "k8s.io/client-go/kubernetes/typed/networking/v1"

	"github.com/dyrector-io/dyrectorio/golang/internal/domain"
	"github.com/dyrector-io/dyrectorio/golang/internal/util"
	"github.com/dyrector-io/dyrectorio/golang/pkg/crane/config"
)

// facade object for ingress management
type ingress struct {
	ctx       context.Context
	client    *Client
	appConfig *config.Configuration
	status    string
}

type routingOptions struct {
	ingressHost    string
	ingressPath    string
	uploadLimit    string
	proxyHeaders   []string
	corsHeaders    []string
	portList       []int32
	port           uint16
	proxyBuffering bool
	stripPrefix    bool
	tls            bool
}

type DeployIngressOptions struct {
	annotations   map[string]string
	labels        map[string]string
	containerName string
	name          string
	namespace     string
	routing       routingOptions
}

func newIngress(ctx context.Context, client *Client) *ingress {
	return &ingress{ctx: ctx, status: "", client: client, appConfig: client.appConfig}
}

func (ing *ingress) deployIngress(options *DeployIngressOptions) error {
	if options == nil {
		return errors.New("ingress deployment is nil")
	}

	client, err := ing.getIngressClient(options.namespace)
	if err != nil {
		log.Error().Err(err).Stack().Msg("Error with ingress client")
	}

	routing := options.routing

	if routing.port == 0 && len(routing.portList) == 0 {
		return errors.New("empty ports, nothing to expose")
	}

	routedPort := routing.port
	if routedPort == 0 {
		routedPort = uint16(routing.portList[0]) //#nosec G115
	}

	ingressDomain := domain.GetHostRule(
		&domain.HostRouting{
			Subdomain:      options.name,
			RootDomain:     routing.ingressHost,
			ContainerName:  options.containerName,
			Prefix:         options.namespace,
			DomainFallback: ing.appConfig.RootDomain,
		})

	ingressPath := "/"
	if routing.ingressPath != "" {
		ingressPath = routing.ingressPath
		// prefix stripping works in combination with annotations
		if routing.stripPrefix {
			split := strings.Split(ingressPath, "/")

			split = append(split, "?(.*)")
			ingressPath = util.JoinV("/", split...)
			ingressPath = "/" + ingressPath
		}
	}

	spec := netv1.IngressSpec().
		WithRules(
			netv1.IngressRule().
				WithHost(ingressDomain).
				WithHTTP(netv1.HTTPIngressRuleValue().WithPaths(
					netv1.HTTPIngressPath().WithPath(ingressPath).
						WithPathType(v1.PathTypeImplementationSpecific).
						WithBackend(
							netv1.IngressBackend().WithService(
								netv1.IngressServiceBackend().
									WithName(options.containerName).
									WithPort(netv1.ServiceBackendPort().WithNumber(int32(routedPort))),
							),
						),
				)))
	tlsConf := getTLSConfig(ingressDomain, options.containerName, options.routing.tls)
	if tlsConf != nil {
		spec.WithTLS(tlsConf)
	}

	annot := getIngressAnnotations(options.namespace, options.containerName, &options.routing)
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
		log.Error().Err(err).Str("ingress", ingress.ObjectMeta.Name).Send()
	}

	return err
}

func (ing *ingress) deleteIngress(namespace, name string) error {
	client, err := ing.getIngressClient(namespace)
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
	}
	return nil
}

func getIngressAnnotations(namespace, name string, opts *routingOptions) map[string]string {
	annotations := map[string]string{
		"kubernetes.io/ingress.class": "nginx",
	}

	if opts.tls {
		annotations["kubernetes.io/tls-acme"] = fmt.Sprintf("%v", true)
		annotations["cert-manager.io/cluster-issuer"] = "letsencrypt-prod"
	}

	if len(opts.corsHeaders) > 0 {
		annotations["nginx.ingress.kubernetes.io/enable-cors"] = "true"
		annotations["nginx.ingress.kubernetes.io/cors-allow-headers"] = strings.Join(opts.proxyHeaders, ", ")
	}

	if opts.proxyBuffering {
		annotations["nginx.ingress.kubernetes.io/proxy-buffering"] = "on"
		annotations["nginx.ingress.kubernetes.io/proxy-buffer-size"] = "256k"
	}

	if len(opts.proxyHeaders) > 0 {
		annotations["nginx.ingress.kubernetes.io/proxy-set-headers"] = util.JoinV("/", namespace, name)
	}

	if opts.uploadLimit != "" {
		annotations["nginx.ingress.kubernetes.io/proxy-body-size"] = opts.uploadLimit
	}

	if opts.stripPrefix {
		annotations["nginx.ingress.kubernetes.io/rewrite-target"] = "/$1"
	}

	return annotations
}

func (ing *ingress) getIngressClient(namespace string) (networking.IngressInterface, error) {
	clientset, err := ing.client.GetClientSet()
	if err != nil {
		return nil, err
	}

	client := clientset.NetworkingV1().Ingresses(namespace)

	return client, nil
}
