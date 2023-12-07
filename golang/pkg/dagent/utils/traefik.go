// traefik functions related to deployment
package utils

import (
	"errors"
	"fmt"
	"strconv"

	v1 "github.com/dyrector-io/dyrectorio/golang/api/v1"
	"github.com/dyrector-io/dyrectorio/golang/internal/domain"
	"github.com/dyrector-io/dyrectorio/golang/internal/util"
	"github.com/dyrector-io/dyrectorio/golang/pkg/builder/container"
	"github.com/dyrector-io/dyrectorio/golang/pkg/dagent/config"

	"github.com/c2h5oh/datasize"
)

const TraefikTrue = "true"

var (
	ErrInsufficientRoutingRules = errors.New("no enough configuration was provided for the container to be routable")
	ErrExposedPortNotFound      = errors.New("selected port was provided as exposed port")
	ErrInvalidUploadLimit       = errors.New("invalid value provided for uploadLimit")
)

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

	if containerConfig.IngressPort != 0 {
		if !util.ContainsMatcher(containerConfig.Ports,
			container.PortBinding{ExposedPort: containerConfig.IngressPort}, func(i1, i2 container.PortBinding) bool {
				return i1.ExposedPort == i2.ExposedPort
			}) {
			return nil, ErrExposedPortNotFound
		}
		labels["traefik.http.services."+serviceName+".loadbalancer.server.port"] = fmt.Sprint(containerConfig.IngressPort)
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

	limit, err := getUploadLimit(containerConfig.IngressUploadLimit)
	if err != nil {
		return nil, ErrInvalidUploadLimit
	}

	if containerConfig.IngressUploadLimit != "" {
		labels["traefik.http.middlewares.limit.buffering.maxRequestBodyBytes"] = limit
	}

	return labels, nil
}

func getUploadLimit(str string) (string, error) {
	num, err := strconv.ParseInt(str, 10, 64)
	if err == nil {
		return fmt.Sprint(num), nil
	}

	qty, err := datasize.ParseString(str)
	if err != nil {
		return "", err
	}
	return fmt.Sprint(qty.Bytes()), nil
}

// serviceName container-name.container-pre-name.ingress.host is default
func GetRules(containerConfig *v1.ContainerConfig, instanceConfig *v1.InstanceConfig, cfg *config.Configuration) []string {
	prefix := instanceConfig.ContainerPreName

	if containerConfig.ContainerPreName != "" {
		prefix = instanceConfig.ContainerPreName
	}
	rules := []string{}
	host := domain.GetHostRuleStrict(
		&domain.HostRouting{
			Subdomain:      containerConfig.IngressName,
			RootDomain:     containerConfig.IngressHost,
			ContainerName:  containerConfig.Container,
			Prefix:         prefix,
			DomainFallback: cfg.RootDomain,
		})

	if host != "" {
		rules = append(rules, fmt.Sprintf("Host(`%s`)", host))
	}

	if containerConfig.IngressPath != "" {
		rules = append(rules, fmt.Sprintf("PathPrefix(`%s`)", containerConfig.IngressPath))
	}

	return rules
}
