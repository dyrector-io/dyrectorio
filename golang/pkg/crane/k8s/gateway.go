package k8s

import (
	"context"
	"errors"
	"strconv"
	"strings"

	"github.com/rs/zerolog/log"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	gwv1 "sigs.k8s.io/gateway-api/apis/v1"
	gwapply "sigs.k8s.io/gateway-api/applyconfiguration/apis/v1"
	gwapplyv1a2 "sigs.k8s.io/gateway-api/applyconfiguration/apis/v1alpha2"
	gatewayclientset "sigs.k8s.io/gateway-api/pkg/client/clientset/versioned"
	gatewayv1client "sigs.k8s.io/gateway-api/pkg/client/clientset/versioned/typed/apis/v1"
	gatewayv1a2client "sigs.k8s.io/gateway-api/pkg/client/clientset/versioned/typed/apis/v1alpha2"

	v1 "github.com/dyrector-io/dyrectorio/golang/api/v1"
	"github.com/dyrector-io/dyrectorio/golang/internal/domain"
	"github.com/dyrector-io/dyrectorio/golang/pkg/crane/config"
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
	stripPrefixReplacement string
	customRoutes           []v1.CustomRoute
	routing                routingOptions
}

func newGateway(ctx context.Context, client *Client) *gateway {
	return &gateway{ctx: ctx, status: "", client: client, appConfig: client.appConfig}
}

// deployRoutes creates or updates an HTTPRoute for the given options and upserts the
// corresponding listener on the parent Gateway.
func (gw *gateway) deployRoutes(options *DeployGatewayOptions) error {
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

	routeName := options.containerName + "-" + strings.ReplaceAll(hostname, ".", "-")

	ingressPath := "/"
	if routing.ingressPath != "" {
		ingressPath = routing.ingressPath
	}

	backendName := gwv1.ObjectName(options.containerName)
	backendPort := gwv1.PortNumber(routedPort)

	var httpRoutes, tcpRoutes []v1.CustomRoute
	for i := range options.customRoutes {
		if strings.EqualFold(options.customRoutes[i].Protocol, "tcp") {
			tcpRoutes = append(tcpRoutes, options.customRoutes[i])
		} else {
			httpRoutes = append(httpRoutes, options.customRoutes[i])
		}
	}

	if len(httpRoutes) > 0 || len(options.customRoutes) == 0 {
		if err := gw.deployHTTPRoute(options, routeName, hostname, ingressPath, httpRoutes, backendName, backendPort); err != nil {
			return err
		}
	}

	for i := range tcpRoutes {
		if err := gw.deployTCPRoute(options, &tcpRoutes[i], routedPort); err != nil {
			return err
		}
	}

	return nil
}

func (gw *gateway) deployHTTPRoute(
	options *DeployGatewayOptions,
	routeName, hostname, ingressPath string,
	httpRoutes []v1.CustomRoute,
	backendName gwv1.ObjectName,
	backendPort gwv1.PortNumber,
) error {
	var rules []*gwapply.HTTPRouteRuleApplyConfiguration
	if len(httpRoutes) > 0 {
		rules = buildCustomRules(httpRoutes, backendName, backendPort)
	} else {
		rules = []*gwapply.HTTPRouteRuleApplyConfiguration{
			buildDefaultRule(ingressPath, backendName, backendPort, options.routing.stripPrefix, options.stripPrefixReplacement),
		}
	}

	gwRef := gw.appConfig.Gateway
	parentRef := gwapply.ParentReference().
		WithName(gwv1.ObjectName(gwRef.Name))
	if gwRef.Namespace != "" {
		parentRef.WithNamespace(gwv1.Namespace(gwRef.Namespace))
	}

	applyConfig := gwapply.HTTPRoute(routeName, options.namespace).
		WithAnnotations(options.annotations).
		WithLabels(options.labels).
		WithSpec(
			gwapply.HTTPRouteSpec().
				WithHostnames(gwv1.Hostname(hostname)).
				WithParentRefs(parentRef).
				WithRules(rules...),
		)

	httpClient, err := gw.getHTTPRouteClient(options.namespace)
	if err != nil {
		return err
	}

	result, err := httpClient.Apply(gw.ctx, applyConfig, metav1.ApplyOptions{
		FieldManager: gw.appConfig.FieldManagerName,
		Force:        gw.appConfig.ForceOnConflicts,
	})
	if err != nil {
		log.Error().Err(err).Str("httpRoute", routeName).Send()
		return err
	}

	log.Info().Str("httpRoute", result.Name).Msg("HTTPRoute applied")
	return nil
}

func buildDefaultRule(
	path string,
	backendName gwv1.ObjectName,
	port gwv1.PortNumber,
	stripPrefix bool,
	stripPrefixReplacement string,
) *gwapply.HTTPRouteRuleApplyConfiguration {
	rule := gwapply.HTTPRouteRule().
		WithName(gwv1.SectionName("rule-0")).
		WithMatches(
			gwapply.HTTPRouteMatch().WithPath(
				gwapply.HTTPPathMatch().
					WithType(gwv1.PathMatchPathPrefix).
					WithValue(path),
			),
		).
		WithBackendRefs(
			gwapply.HTTPBackendRef().
				WithName(backendName).
				WithPort(port),
		)

	if stripPrefix {
		rewriteTo := stripPrefixReplacement
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

	return rule
}

func buildCustomRules(
	routes []v1.CustomRoute,
	backendName gwv1.ObjectName,
	port gwv1.PortNumber,
) []*gwapply.HTTPRouteRuleApplyConfiguration {
	rules := make([]*gwapply.HTTPRouteRuleApplyConfiguration, 0, len(routes))

	for i := range routes {
		route := &routes[i]
		name := route.Name
		if name == "" {
			name = "rule-" + strconv.Itoa(i)
		}
		ruleName := gwv1.SectionName(name)

		if route.Protocol != "" && route.Protocol != "http" {
			continue
		}

		if route.HTTPSRedirect {
			statusCode := 301
			rules = append(rules, gwapply.HTTPRouteRule().
				WithName(ruleName).
				WithFilters(
					gwapply.HTTPRouteFilter().
						WithType(gwv1.HTTPRouteFilterRequestRedirect).
						WithRequestRedirect(
							gwapply.HTTPRequestRedirectFilter().
								WithScheme("https").
								WithStatusCode(statusCode),
						),
				),
			)
			continue
		}

		var matches []*gwapply.HTTPRouteMatchApplyConfiguration
		if len(route.Paths) > 0 {
			for _, p := range route.Paths {
				matchType := gwv1.PathMatchPathPrefix
				switch p.Type {
				case "Exact":
					matchType = gwv1.PathMatchExact
				case "RegularExpression":
					matchType = gwv1.PathMatchRegularExpression
				}
				val := p.Value
				if val == "" {
					val = "/"
				}
				matches = append(matches, gwapply.HTTPRouteMatch().WithPath(
					gwapply.HTTPPathMatch().WithType(matchType).WithValue(val),
				))
			}
		} else {
			path := route.Path
			if path == "" {
				path = "/"
			}
			matches = append(matches, gwapply.HTTPRouteMatch().WithPath(
				gwapply.HTTPPathMatch().WithType(gwv1.PathMatchPathPrefix).WithValue(path),
			))
		}

		rule := gwapply.HTTPRouteRule().
			WithName(ruleName).
			WithMatches(matches...).
			WithBackendRefs(
				gwapply.HTTPBackendRef().
					WithName(backendName).
					WithPort(port),
			)

		for _, f := range route.Filters {
			rule.WithFilters(buildRouteFilter(f))
		}

		if route.Timeouts != "" {
			timeouts := gwapply.HTTPRouteTimeouts()
			timeouts.WithRequest(gwv1.Duration(route.Timeouts))
			rule.WithTimeouts(timeouts)
		}

		rules = append(rules, rule)
	}

	return rules
}

func buildRouteFilter(f v1.CustomRouteFilter) *gwapply.HTTPRouteFilterApplyConfiguration {
	filter := gwapply.HTTPRouteFilter().WithType(gwv1.HTTPRouteFilterType(f.Type))

	if f.RequestRedirect != nil {
		redirect := gwapply.HTTPRequestRedirectFilter()
		if f.RequestRedirect.Scheme != "" {
			redirect.WithScheme(f.RequestRedirect.Scheme)
		}
		if f.RequestRedirect.Hostname != "" {
			redirect.WithHostname(gwv1.PreciseHostname(f.RequestRedirect.Hostname))
		}
		if f.RequestRedirect.Port != nil {
			redirect.WithPort(gwv1.PortNumber(*f.RequestRedirect.Port)) //nolint:unconvert
		}
		if f.RequestRedirect.StatusCode != nil {
			redirect.WithStatusCode(*f.RequestRedirect.StatusCode)
		}
		filter.WithRequestRedirect(redirect)
	}

	if f.URLRewrite != nil {
		rewrite := gwapply.HTTPURLRewriteFilter()
		if f.URLRewrite.Hostname != "" {
			rewrite.WithHostname(gwv1.PreciseHostname(f.URLRewrite.Hostname))
		}
		filter.WithURLRewrite(rewrite)
	}

	if f.RequestHeaderModifier != nil {
		filter.WithRequestHeaderModifier(buildHeaderFilter(f.RequestHeaderModifier))
	}

	if f.ResponseHeaderModifier != nil {
		filter.WithResponseHeaderModifier(buildHeaderFilter(f.ResponseHeaderModifier))
	}

	return filter
}

func buildHeaderFilter(h *v1.CustomRouteHeaderFilter) *gwapply.HTTPHeaderFilterApplyConfiguration {
	hf := gwapply.HTTPHeaderFilter()
	for _, s := range h.Set {
		hf.WithSet(gwapply.HTTPHeader().WithName(gwv1.HTTPHeaderName(s.Name)).WithValue(s.Value))
	}
	for _, a := range h.Add {
		hf.WithAdd(gwapply.HTTPHeader().WithName(gwv1.HTTPHeaderName(a.Name)).WithValue(a.Value))
	}
	if len(h.Remove) > 0 {
		hf.WithRemove(h.Remove...)
	}
	return hf
}

func (gw *gateway) deployTCPRoute(options *DeployGatewayOptions, route *v1.CustomRoute, defaultPort uint16) error {
	port := defaultPort
	if route.Port != nil {
		port = *route.Port
	}

	routeName := options.containerName + "-tcp-" + strconv.Itoa(int(port))

	gwRef := gw.appConfig.Gateway
	parentRef := gwapply.ParentReference().
		WithName(gwv1.ObjectName(gwRef.Name))
	if gwRef.Namespace != "" {
		parentRef.WithNamespace(gwv1.Namespace(gwRef.Namespace))
	}
	if route.SectionName != "" {
		parentRef.WithSectionName(gwv1.SectionName(route.SectionName))
	}

	rule := gwapplyv1a2.TCPRouteRule().
		WithName(gwv1.SectionName("rule-0")).
		WithBackendRefs(
			gwapply.BackendRef().
				WithName(gwv1.ObjectName(options.containerName)).
				WithPort(gwv1.PortNumber(port)),
		)

	applyConfig := gwapplyv1a2.TCPRoute(routeName, options.namespace).
		WithAnnotations(options.annotations).
		WithLabels(options.labels).
		WithSpec(
			gwapplyv1a2.TCPRouteSpec().
				WithParentRefs(parentRef).
				WithRules(rule),
		)

	client, err := gw.getTCPRouteClient(options.namespace)
	if err != nil {
		return err
	}

	result, err := client.Apply(gw.ctx, applyConfig, metav1.ApplyOptions{
		FieldManager: gw.appConfig.FieldManagerName,
		Force:        gw.appConfig.ForceOnConflicts,
	})
	if err != nil {
		log.Error().Err(err).Str("tcpRoute", routeName).Send()
		return err
	}

	log.Info().Str("tcpRoute", result.Name).Msg("TCPRoute applied")
	return nil
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

func (gw *gateway) getTCPRouteClient(namespace string) (gatewayv1a2client.TCPRouteInterface, error) {
	restConfig, err := gw.client.GetRestConfig()
	if err != nil {
		return nil, err
	}

	cs, err := gatewayclientset.NewForConfig(restConfig)
	if err != nil {
		return nil, err
	}

	return cs.GatewayV1alpha2().TCPRoutes(namespace), nil
}
