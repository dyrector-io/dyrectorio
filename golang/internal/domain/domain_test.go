//go:build unit
// +build unit

package domain_test

import (
	"testing"

	"github.com/dyrector-io/dyrectorio/golang/internal/domain"
	"github.com/stretchr/testify/assert"
)

func TestHostRoutingDomainGeneration(t *testing.T) {
	testCases := []struct {
		in   *domain.HostRouting
		exp  string
		desc string
	}{
		{
			in:   &domain.HostRouting{},
			exp:  "",
			desc: "if nothing is provided empty string is returned",
		},
		{
			in: &domain.HostRouting{
				Subdomain:      "sub",
				RootDomain:     "domain.com",
				ContainerName:  "name",
				Prefix:         "prefix",
				DomainFallback: "fallbackdomain.com",
			},
			exp:  "sub.domain.com",
			desc: "if sub and root domain is given no fallback is used",
		},
		{
			in: &domain.HostRouting{
				Subdomain:      "sub",
				RootDomain:     "",
				ContainerName:  "name",
				Prefix:         "prefix",
				DomainFallback: "fallbackdomain.com",
			},
			exp:  "sub.fallbackdomain.com",
			desc: "if subdomain is given root is missing, fallback is used",
		},
		{
			in: &domain.HostRouting{
				Subdomain:      "",
				RootDomain:     "domain.com",
				ContainerName:  "name",
				Prefix:         "prefix",
				DomainFallback: "fallbackdomain.com",
			},
			exp:  "name.prefix.domain.com",
			desc: "if no name is given, name and prefix is combined for host routing",
		},
		{
			in: &domain.HostRouting{
				Subdomain:      "",
				RootDomain:     "",
				ContainerName:  "name",
				Prefix:         "prefix",
				DomainFallback: "fallbackdomain.com",
			},
			exp:  "name.prefix.fallbackdomain.com",
			desc: "if no name, nor domain is given, name and prefix is combined with fallback domain",
		},
		{
			in: &domain.HostRouting{
				Subdomain:      "",
				RootDomain:     "domain.com",
				ContainerName:  "",
				Prefix:         "",
				DomainFallback: "fallbackdomain.com",
			},
			exp:  "domain.com",
			desc: "root domain is selected if nothing else provided",
		},
		{
			in: &domain.HostRouting{
				Subdomain:      "",
				RootDomain:     "",
				ContainerName:  "",
				Prefix:         "",
				DomainFallback: "fallbackdomain.com",
			},
			exp:  "fallbackdomain.com",
			desc: "fallbackdomain is selected if nothing else provided",
		},
	}

	for _, tC := range testCases {
		t.Run(tC.desc, func(t *testing.T) {
			assert.Equal(t, tC.exp, domain.GetHostRule(tC.in), tC.desc)
		})
	}
}

func TestDomainStrictHostRule(t *testing.T) {
	assert.Equal(t, "localhost", domain.GetHostRuleStrict(&domain.HostRouting{RootDomain: "localhost"}))
}

func TestIsCompliantDNS(t *testing.T) {
	type args struct {
		str string
	}
	tests := []struct {
		name    string
		args    args
		wantErr bool
	}{
		// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if err := domain.IsCompliantDNS(tt.args.str); (err != nil) != tt.wantErr {
				t.Errorf("IsCompliantDNS() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}
