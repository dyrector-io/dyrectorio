// traefik functions related to deployment
package utils

import (
	"errors"
	"fmt"

	v1 "github.com/dyrector-io/dyrectorio/golang/api/v1"
	"github.com/dyrector-io/dyrectorio/golang/internal/util"
	"github.com/dyrector-io/dyrectorio/golang/pkg/dagent/config"
)

const TraefikTrue = "true"

var ErrInsufficientRoutingRules = errors.New("no enough configuration was provided for the container to be routable")

// generating container labels for traefik
// if Expose is provided we bind 80 and the given (domainName or (containerName + prefix)) + RootDomain
func GetTraefikLabels(
	instanceConfig *v1.InstanceConfig,
	containerConfig *v1.ContainerConfig,
	cfg *config.Configuration,
) (map[string]string, error) {
	labels := map[string]string{}

	rules := GetRules(instanceConfig, containerConfig, cfg)
	if len(rules) == 0 {
		return nil, ErrInsufficientRoutingRules
	}
	rule := util.JoinV(" && ", rules...)

	serviceName := util.JoinV("-", instanceConfig.ContainerPreName, containerConfig.Container)
	labels["traefik.enable"] = TraefikTrue

	labels["traefik.http.routers."+serviceName+".rule"] = rule
	labels["traefik.http.routers."+serviceName+".entrypoints"] = "web"

	if containerConfig.IngressStripPath && containerConfig.IngressPath != "" {
		labels["traefik.http.middlewares."+serviceName+"-stripper.stripprefix.prefixes"] = containerConfig.IngressPath
		labels["traefik.http.routers."+serviceName+".middlewares"] = serviceName + "-stripper"
	}

	if containerConfig.ExposeTLS {
		labels["traefik.http.routers."+serviceName+"-secure.entrypoints"] = "websecure"
		if containerConfig.IngressStripPath && containerConfig.IngressPath != "" {
			labels["traefik.http.routers."+serviceName+"-secure.middlewares"] = serviceName + "-stripper"
		}
		labels["traefik.http.routers."+serviceName+"-secure.rule"] = rule
		labels["traefik.http.routers."+serviceName+"-secure.tls"] = TraefikTrue
		labels["traefik.http.routers."+serviceName+"-secure.tls.certresolver"] = "le"
	}

	if containerConfig.IngressUploadLimit != "" {
		labels["traefik.http.middlewares.limit.buffering.maxRequestBodyBytes"] = containerConfig.IngressUploadLimit
	}

	return labels, nil
}

// serviceName container-name.container-pre-name.ingress.host is default
func GetRules(instanceConfig *v1.InstanceConfig, containerConfig *v1.ContainerConfig, cfg *config.Configuration) []string {
	rules := []string{}
	domain := []string{}

	rootDomain := ""

	if containerConfig.IngressHost != "" {
		rootDomain = containerConfig.IngressHost
	} else if cfg.RootDomain != "" {
		rootDomain = cfg.RootDomain
	}

	// generate the name.prefix.domain from prefix and container name
	// no root domain -> no host rule
	if containerConfig.IngressName == "" && containerConfig.IngressHost == "" && cfg.RootDomain != "" {
		domain = append(domain, containerConfig.Container, instanceConfig.ContainerPreName, cfg.RootDomain)
	} else if containerConfig.IngressName != "" && rootDomain != "" {
		domain = append(domain, containerConfig.IngressName, rootDomain)
	}

	if len(domain) == 0 && rootDomain != "" {
		domain = append(domain, rootDomain)
	}
	if len(domain) != 0 {
		rules = append(rules, fmt.Sprintf("Host(`%s`)", util.JoinV(".", domain...)))
	}

	if containerConfig.IngressPath != "" {
		rules = append(rules, fmt.Sprintf("PathPrefix(`%s`)", containerConfig.IngressPath))
	}

	return rules
}
