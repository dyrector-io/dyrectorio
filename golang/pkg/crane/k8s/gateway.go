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
	gatewayclientset "sigs.k8s.io/gateway-api/pkg/client/clientset/versioned"
	gatewayv1client "sigs.k8s.io/gateway-api/pkg/client/clientset/versioned/typed/apis/v1"

	v1 "github.com/dyrector-io/dyrectorio/golang/api/v1"
	"github.com/dyrector-io/dyrectorio/golang/internal/domain"
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
	customRoutes           []v1.CustomRoute // nil/empty = use default rule
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

	backendName := gwv1.ObjectName(options.containerName)
	backendPort := gwv1.PortNumber(routedPort)

	var rules []*gwapply.HTTPRouteRuleApplyConfiguration
	if len(options.customRoutes) > 0 {
		rules = buildCustomRules(options.customRoutes, backendName, backendPort)
	} else {
		rules = []*gwapply.HTTPRouteRuleApplyConfiguration{
			buildDefaultRule(ingressPath, backendName, backendPort, routing.stripPrefix, options.stripPrefixReplacement),
		}
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
				WithRules(rules...),
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

	for i, route := range routes {
		ruleName := gwv1.SectionName("rule-" + strconv.Itoa(i))

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

		path := route.Path
		if path == "" {
			path = "/"
		}

		rule := gwapply.HTTPRouteRule().
			WithName(ruleName).
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
			redirect.WithPort(gwv1.PortNumber(*f.RequestRedirect.Port))
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
