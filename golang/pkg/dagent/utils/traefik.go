// traefik functions related to deployment
package utils

import (
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

	host := GetServiceName(instanceConfig, containerConfig, cfg)

	serviceName := util.JoinV("-", instanceConfig.ContainerPreName, containerConfig.Container)
	labels["traefik.enable"] = TraefikTrue

	labels["traefik.http.routers."+serviceName+".rule"] = "Host(`" + host + "`)"
	labels["traefik.http.routers."+serviceName+".entrypoints"] = "web"

	if containerConfig.ExposeTLS {
		labels["traefik.http.routers."+serviceName+"-secure.entrypoints"] = "websecure"
		labels["traefik.http.routers."+serviceName+"-secure.rule"] = "Host(`" + host + "`)"
		labels["traefik.http.routers."+serviceName+"-secure.tls"] = TraefikTrue
		labels["traefik.http.routers."+serviceName+"-secure.tls.certresolver"] = "le"
	}

	if containerConfig.DomainUploadLimit != "" {
		labels["traefik.http.middlewares.limit.buffering.maxRequestBodyBytes"] = containerConfig.DomainUploadLimit
	}

	return labels
}

// serviceName container-name.container-pre-name.ingress.host is default
func GetServiceName(instanceConfig *v1.InstanceConfig, containerConfig *v1.ContainerConfig, cfg *config.Configuration) string {
	domain := []string{}

	if containerConfig.DomainName == "" {
		domain = append(domain, containerConfig.Container, instanceConfig.ContainerPreName)
	} else {
		domain = append(domain, containerConfig.DomainName)
	}

	if cfg.RootDomain != "" {
		domain = append(domain, cfg.RootDomain)
	}

	return util.JoinV(".", domain...)
}
