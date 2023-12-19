package domain

import (
	"fmt"

	"github.com/dyrector-io/dyrectorio/golang/internal/util"

	"k8s.io/apimachinery/pkg/api/validation"
)

type HostRouting struct {
	// the preceding part of the domain identifying the service, can be empty
	Subdomain,
	// the domain name from input
	RootDomain,
	// fallback, ContainerName.Prefix will be the name before the domain
	ContainerName,
	// fallback, ContainerName.Prefix will be the name before the domain
	Prefix,
	// domain name fallback (usually from env config)
	DomainFallback string
}

func GetHostRule(h *HostRouting) string {
	domain := []string{}
	rootDomain := util.Fallback(h.RootDomain, h.DomainFallback)
	prefix := util.Fallback(h.Subdomain, util.JoinV(".", h.ContainerName, h.Prefix))

	if rootDomain != "" && prefix != "" {
		domain = append(domain, prefix)
	}

	if rootDomain != "" {
		domain = append(domain, rootDomain)
	}
	return util.JoinV(".", domain...)
}

// if any input is given that is used and nothing else (allows to bind single values like `localhost`)
func GetHostRuleStrict(h *HostRouting) string {
	if h.RootDomain != "" {
		return util.JoinV(".", h.Subdomain, h.RootDomain)
	}

	return GetHostRule(h)
}

func IsCompliantDNS(str string) error {
	errs := validation.NameIsDNSLabel(str, false)
	if len(errs) > 0 {
		return fmt.Errorf("invalid value: %v", errs)
	}
	return nil
}
