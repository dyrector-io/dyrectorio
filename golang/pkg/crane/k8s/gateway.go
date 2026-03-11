package k8s

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/rs/zerolog/log"
	k8sapierrors "k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	gwv1 "sigs.k8s.io/gateway-api/apis/v1"
	gwapply "sigs.k8s.io/gateway-api/applyconfiguration/apis/v1"
	gatewayclientset "sigs.k8s.io/gateway-api/pkg/client/clientset/versioned"
	gatewayv1client "sigs.k8s.io/gateway-api/pkg/client/clientset/versioned/typed/apis/v1"

	"github.com/dyrector-io/dyrectorio/golang/internal/domain"
	"github.com/dyrector-io/dyrectorio/golang/internal/util"
	"github.com/dyrector-io/dyrectorio/golang/pkg/crane/config"
)

const (
	defaultHTTPPort    = 80
	defaultHTTPSPort   = 443
	maxConflictRetries = 5
)

// facade object for gateway management
type gateway struct {
	ctx       context.Context
	client    *Client
	appConfig *config.Configuration
	status    string
}

// GatewayRef identifies the parent Gateway object to attach HTTPRoutes and listeners to.
type GatewayRef struct {
	Name      string
	Namespace string
}

type DeployGatewayOptions struct {
	annotations            map[string]string
	labels                 map[string]string
	containerName          string
	name                   string
	namespace              string
	gatewayRef             GatewayRef
	stripPrefixReplacement string // rewrite target path when routing.stripPrefix=true, e.g. "/"
	routing                routingOptions
}

func newGateway(ctx context.Context, client *Client) *gateway {
	return &gateway{ctx: ctx, status: "", client: client, appConfig: client.appConfig}
}

// deployHTTPRoute creates or updates an HTTPRoute for the given options and upserts the
// corresponding listener on the parent Gateway.
func (gw *gateway) deployHTTPRoute(options *DeployGatewayOptions) error {
	if options == nil {
		return errors.New("gateway opts is nil")
	}

	routing := options.routing

	if routing.port == 0 && len(routing.portList) == 0 {
		return errors.New("empty ports, nothing to expose")
	}

	routedPort := routing.port
	if routedPort == 0 {
		routedPort = uint16(routing.portList[0]) //#nosec G115
	}

	hostname := domain.GetHostRule(&domain.HostRouting{
		Subdomain:      options.name,
		RootDomain:     routing.ingressHost,
		ContainerName:  options.containerName,
		Prefix:         options.namespace,
		DomainFallback: gw.appConfig.RootDomain,
	})

	// Route name mirrors the migration convention: <container>-<hostname-with-dashes>
	// e.g. management-management-ver-hanover-cloud
	routeName := options.containerName + "-" + strings.ReplaceAll(hostname, ".", "-")

	ingressPath := "/"
	if routing.ingressPath != "" {
		ingressPath = routing.ingressPath
	}

	rule := gwapply.HTTPRouteRule().
		WithName(gwv1.SectionName("rule-0")).
		WithMatches(
			gwapply.HTTPRouteMatch().WithPath(
				gwapply.HTTPPathMatch().
					WithType(gwv1.PathMatchPathPrefix).
					WithValue(ingressPath),
			),
		).
		WithBackendRefs(
			gwapply.HTTPBackendRef().
				WithName(gwv1.ObjectName(options.containerName)).
				WithPort(gwv1.PortNumber(routedPort)),
		)

	if routing.stripPrefix {
		rewriteTo := options.stripPrefixReplacement
		if rewriteTo == "" {
			rewriteTo = "/"
		}
		rule.WithFilters(
			gwapply.HTTPRouteFilter().
				WithType(gwv1.HTTPRouteFilterURLRewrite).
				WithURLRewrite(
					gwapply.HTTPURLRewriteFilter().WithPath(
						gwapply.HTTPPathModifier().
							WithType(gwv1.PrefixMatchHTTPPathModifier).
							WithReplacePrefixMatch(rewriteTo),
					),
				),
		)
	}

	gwRef := gw.appConfig.Gateway
	parentRef := gwapply.ParentReference().
		WithName(gwv1.ObjectName(gwRef.Name))
	if gwRef.Namespace != "" {
		parentRef.WithNamespace(gwv1.Namespace(gwRef.Namespace))
	}

	applyConfig := gwapply.HTTPRoute(routeName, options.namespace).
		WithSpec(
			gwapply.HTTPRouteSpec().
				WithHostnames(gwv1.Hostname(hostname)).
				WithParentRefs(parentRef).
				WithRules(rule),
		)

	client, err := gw.getHTTPRouteClient(options.namespace)
	if err != nil {
		return err
	}

	result, err := client.Apply(gw.ctx, applyConfig, metav1.ApplyOptions{
		FieldManager: gw.appConfig.FieldManagerName,
		Force:        gw.appConfig.ForceOnConflicts,
	})
	if err != nil {
		log.Error().Err(err).Str("httpRoute", routeName).Send()
		return err
	}

	log.Info().Str("httpRoute", result.Name).Msg("HTTPRoute applied")

	listenerName := options.namespace + "-" + options.containerName
	return gw.upsertGatewayListener(gw.appConfig.Gateway, hostname, listenerName, routing.tls, options.containerName)
}

// upsertGatewayListener upserts listener(s) on the parent Gateway using a Get→modify→Update cycle.
// Listeners are keyed by name (<namespace>-<container>). Unrelated listeners are never touched.
//
// When tls=false: one HTTP listener on port 80, named listenerName.
// When tls=true:  two listeners —
//   - HTTPS on port 443, named listenerName (primary, with TLS termination)
//   - HTTP  on port 80,  named listenerName+"-http" (required for cert-manager HTTP-01 challenge)
func (gw *gateway) upsertGatewayListener(gwRef config.Gateway, hostname, listenerName string, tls bool, containerName string) error {
	gwClient, err := gw.getGatewayClient(gwRef.Namespace)
	if err != nil {
		return err
	}

	listenerHostname := gwv1.Hostname(hostname)
	from := gwv1.NamespacesFromAll
	allowedRoutes := &gwv1.AllowedRoutes{
		Namespaces: &gwv1.RouteNamespaces{From: &from},
	}

	// Build the desired listeners keyed by name.
	desired := map[string]gwv1.Listener{}

	if tls {
		httpsName := listenerName + "-https"
		tlsMode := gwv1.TLSModeTerminate
		secretName := gwv1.ObjectName(util.JoinV("-", containerName, "tls"))
		desired[httpsName] = gwv1.Listener{
			Name:          gwv1.SectionName(httpsName),
			Port:          gwv1.PortNumber(defaultHTTPSPort),
			Hostname:      &listenerHostname,
			Protocol:      gwv1.HTTPSProtocolType,
			AllowedRoutes: allowedRoutes,
			TLS: &gwv1.ListenerTLSConfig{
				Mode:            &tlsMode,
				CertificateRefs: []gwv1.SecretObjectReference{{Name: secretName}},
			},
		}
		httpName := listenerName + "-http"
		desired[httpName] = gwv1.Listener{
			Name:          gwv1.SectionName(httpName),
			Port:          gwv1.PortNumber(defaultHTTPPort),
			Hostname:      &listenerHostname,
			Protocol:      gwv1.HTTPProtocolType,
			AllowedRoutes: allowedRoutes,
		}
	} else {
		desired[listenerName] = gwv1.Listener{
			Name:          gwv1.SectionName(listenerName),
			Port:          gwv1.PortNumber(defaultHTTPPort),
			Hostname:      &listenerHostname,
			Protocol:      gwv1.HTTPProtocolType,
			AllowedRoutes: allowedRoutes,
		}
	}

	for attempt := range maxConflictRetries {
		current, err := gwClient.Get(gw.ctx, gwRef.Name, metav1.GetOptions{})
		if err != nil {
			return err
		}

		// For each desired listener: replace by name if found, otherwise append.
		listeners := current.Spec.Listeners
		for name, dl := range desired {
			found := false
			for i, l := range listeners {
				if string(l.Name) == name {
					listeners[i] = dl
					found = true
					break
				}
			}
			if !found {
				listeners = append(listeners, dl)
			}
		}
		current.Spec.Listeners = listeners

		result, err := gwClient.Update(gw.ctx, current, metav1.UpdateOptions{})
		if err != nil {
			if k8sapierrors.IsConflict(err) {
				log.Warn().Err(err).
					Str("gateway", gwRef.Name).
					Str("listener", listenerName).
					Int("attempt", attempt+1).
					Msg("Gateway conflict, retrying")
				continue
			}
			log.Error().Err(err).Str("gateway", gwRef.Name).Str("listener", listenerName).Send()
			return err
		}

		log.Info().Str("gateway", result.Name).Str("listener", listenerName).Msg("Gateway listener upserted")
		return nil
	}

	return fmt.Errorf("gateway %q update failed after %d conflict retries", gwRef.Name, maxConflictRetries)
}

func (gw *gateway) deleteHTTPRoute(namespace, name string) error {
	client, err := gw.getHTTPRouteClient(namespace)
	if err != nil {
		return err
	}

	return client.Delete(gw.ctx, name, metav1.DeleteOptions{})
}

func (gw *gateway) getHTTPRouteClient(namespace string) (gatewayv1client.HTTPRouteInterface, error) {
	restConfig, err := gw.client.GetRestConfig()
	if err != nil {
		return nil, err
	}

	cs, err := gatewayclientset.NewForConfig(restConfig)
	if err != nil {
		return nil, err
	}

	return cs.GatewayV1().HTTPRoutes(namespace), nil
}

func (gw *gateway) getGatewayClient(namespace string) (gatewayv1client.GatewayInterface, error) {
	restConfig, err := gw.client.GetRestConfig()
	if err != nil {
		return nil, err
	}

	cs, err := gatewayclientset.NewForConfig(restConfig)
	if err != nil {
		return nil, err
	}

	return cs.GatewayV1().Gateways(namespace), nil
}
