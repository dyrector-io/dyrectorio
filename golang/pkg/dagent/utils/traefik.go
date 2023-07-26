// traefik functions related to deployment
package utils

import (
	"errors"
	"fmt"

	v1 "github.com/dyrector-io/dyrectorio/golang/api/v1"
	"github.com/dyrector-io/dyrectorio/golang/internal/domain"
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

	rules := GetRules(containerConfig, instanceConfig, cfg)
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
func GetRules(containerConfig *v1.ContainerConfig, instanceConfig *v1.InstanceConfig, cfg *config.Configuration) []string {
	prefix := instanceConfig.ContainerPreName

	if containerConfig.ContainerPreName != "" {
		prefix = containerConfig.ContainerPreName
	}
	rules := []string{}
	host := domain.GetHostRule(
		containerConfig.IngressName, containerConfig.IngressHost,
		containerConfig.Container, prefix, &cfg.CommonConfiguration)

	if host != "" {
		rules = append(rules, fmt.Sprintf("Host(`%s`)", host))
	}

	if containerConfig.IngressPath != "" {
		rules = append(rules, fmt.Sprintf("PathPrefix(`%s`)", containerConfig.IngressPath))
	}

	return rules
}
