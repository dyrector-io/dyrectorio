// traefik functions related to deployment
package utils

import (
	v1 "github.com/dyrector-io/dyrectorio/golang/api/v1"
	"github.com/dyrector-io/dyrectorio/golang/internal/util"
	"github.com/dyrector-io/dyrectorio/golang/pkg/dagent/config"
)

const TraefikTrue = "true"

// generating container labels for traefik
// if Expose is provided we bind 80 and the given ingressName + ingressHost
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

	if containerConfig.IngressUploadLimit != "" {
		labels["traefik.http.middlewares.limit.buffering.maxRequestBodyBytes"] = containerConfig.IngressUploadLimit
	}

	return labels
}

// serviceName container-name.container-pre-name.ingress.host is default
func GetServiceName(instanceConfig *v1.InstanceConfig, containerConfig *v1.ContainerConfig, cfg *config.Configuration) string {
	domain := []string{}

	name := util.Fallback(containerConfig.IngressName, containerConfig.Container)
	domain = append(domain, name)
	prefix := instanceConfig.ContainerPreName

	// if explicit Host is given, prefix is omitted
	if containerConfig.IngressHost == "" {
		domain = append(domain, prefix)
	}

	// containerConfig.IngressRoot > env INGRESS_HOST
	ingressHost := util.Fallback(containerConfig.IngressHost, cfg.IngressRootDomain)
	domain = append(domain, ingressHost)

	return util.JoinV(".", domain...)
}
