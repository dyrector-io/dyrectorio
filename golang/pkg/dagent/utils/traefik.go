// traefik functions related to deployment
package utils

import (
	"fmt"

	v1 "github.com/dyrector-io/dyrectorio/golang/api/v1"
	"github.com/dyrector-io/dyrectorio/golang/internal/util"
	"github.com/dyrector-io/dyrectorio/golang/pkg/dagent/config"
)

// generating container labels for traefik
// if Expose is provided we bind 80 and the given ingressName + ingressHost
func GetTraefikLabels(instanceConfig *v1.InstanceConfig, containerConfig *v1.ContainerConfig, cfg *config.Configuration) map[string]string {
	labels := map[string]string{}

	serviceName := util.JoinV("-", instanceConfig.ContainerPreName, containerConfig.Container)
	labels["traefik.enable"] = "true"

	labels["traefik.http.services."+serviceName+".loadbalancer.server.port"] = fmt.Sprint(containerConfig.Ports[0].ExposedPort)
	labels["traefik.http.routers."+serviceName+".rule"] = "Host(`" + GetServiceName(instanceConfig, containerConfig, cfg) + "`)"
	if containerConfig.ExposeTLS {
		labels["traefik.http.routers."+serviceName+".entrypoints"] = "websecure"
		labels["traefik.http.routers."+serviceName+".tls.certresolver"] = "le"
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

// keeping the template like this solves builds/asset management issues
// dev environment <-> containerization differences
// TODO(nandor-magyar): solve assets' relative directory issues
func GetTraefikGoTemplate() string {
	return `
log:
  level: {{ or .LogLevel "INFO"}}

accessLog: {}

providers:
  docker:
# if used with network based routing this is not needed
#    useBindPortIP: true
    exposedByDefault: false

entryPoints:
  web:
    address: ":80"

{{ if .TLS }}
  ## following is the http -> https redirect
    http:
      redirections:
        entryPoint:
         to: "websecure"
         scheme: "https"
         permanent: "true"

  websecure:
    address: ":443"

certificatesResolvers:
  le:
    acme:
      httpChallenge:
        entryPoint: "web"
      email: {{ .AcmeMail }}
      storage: "/letsencrypt/acme.json"
{{ end }}
`
}
