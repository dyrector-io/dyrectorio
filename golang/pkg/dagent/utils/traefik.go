// traefik functions related to deployment
package utils

import (
	"fmt"

	v1 "github.com/dyrector-io/dyrectorio/golang/api/v1"
	"github.com/dyrector-io/dyrectorio/golang/internal/util"
	"github.com/dyrector-io/dyrectorio/golang/pkg/dagent/config"
)

const TraefikTrue = "true"

// generating container labels for traefik
// if Expose is provided we bind 80 and the given (domainName or (containerName + prefix)) + RootDomain
func GetTraefikLabels(
	instanceConfig *v1.InstanceConfig,
	containerConfig *v1.ContainerConfig,
	cfg *config.Configuration,
) map[string]string {
	labels := map[string]string{}

	rule := GetRule(instanceConfig, containerConfig, cfg)

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
		labels["traefik.http.routers."+serviceName+"-secure.rule"] = rule
		labels["traefik.http.routers."+serviceName+"-secure.tls"] = TraefikTrue
		labels["traefik.http.routers."+serviceName+"-secure.tls.certresolver"] = "le"
	}

	if containerConfig.IngressUploadLimit != "" {
		labels["traefik.http.middlewares.limit.buffering.maxRequestBodyBytes"] = containerConfig.IngressUploadLimit
	}

	return labels
}

// serviceName container-name.container-pre-name.ingress.host is default
func GetRule(instanceConfig *v1.InstanceConfig, containerConfig *v1.ContainerConfig, cfg *config.Configuration) string {
	rules := []string{}
	domain := []string{}

	// generate the name.prefix.domain from prefix and container name
	if containerConfig.IngressName == "" && containerConfig.IngressHost == "" {
		domain = append(domain, containerConfig.Container, instanceConfig.ContainerPreName)
	} else if containerConfig.IngressName != "" {
		domain = append(domain, containerConfig.IngressName)
	}

	// use ingressHost that might be localhost
	if containerConfig.IngressHost != "" {
		domain = append(domain, containerConfig.IngressHost)
	} else if cfg.RootDomain != "" {
		domain = append(domain, cfg.RootDomain)
	}

	if len(domain) != 0 {
		rules = append(rules, fmt.Sprintf("Host(`%s`)", util.JoinV(".", domain...)))
	}

	if containerConfig.IngressPath != "" {
		rules = append(rules, fmt.Sprintf("PathPrefix(`%s`)", containerConfig.IngressPath))
	}

	return util.JoinV(" && ", rules...)
}
