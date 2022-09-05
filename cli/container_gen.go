package main

import (
	"bufio"
	"bytes"
	_ "embed"
	"errors"
	"os"
	"text/template"
)

// Container template's subtype
type Volume struct {
	Host      string
	Container string
	RO        bool
}

// Container template's subtype
type Port struct {
	Host      int
	Container int
}

// Container template's subtype
type EnvVar struct {
	Key   string `yaml:"variable"`
	Value string `yaml:"value"`
}

// Generating a container template
type Container struct {
	Enabled bool
	Image   string
	Name    string
	EnvVars []EnvVar
	Volumes []Volume
	Depends []string
	Ports   []Port
	Restart bool
	Command string
}

// template file
//
//go:embed "template.hbr"
var templatefile string

// Container services
type Services string

// Go's idea about enums :c
const (
	CruxUI Services = "crux-ui"
	Crux   Services = "crux"
	Utils  Services = "utils"
)

const FilePerms = 0600

// Crux services: db migrations and crux api service
func GetCruxContainerDefaults() []Container {
	crux := []Container{
		{
			Enabled: true,
			Image:   "ghcr.io/dyrector-io/dyrectorio/web/crux:latest",
			Name:    "crux",
			Depends: []string{"crux-migrate:\n        condition: service_completed_successfully"},
			EnvVars: []EnvVar{
				{"TZ", "Europe/Budapest"},
				{"DATABASE_URL", "postgresql://crux:RhdAVuEnozSR4FLS@crux-postgres:5432/crux?schema=public"},
				{"KRATOS_ADMIN_URL", "http://kratos:4434"},
				{"CRUX_UI_URL", "http://localhost:3000"},
				{"CRUX_ADDRESS", ":5000"},
				{"GRPC_API_INSECURE", "true"},
				{"GRPC_AGENT_INSECURE", "true"},
				{"GRPC_AGENT_INSTALL_SCRIPT_INSECURE", "true"},
				{"LOCAL_DEPLOYMENT", "true"},
				{"JWT_SECRET", "alDhxsIP7VvsKNEJ"},
				{"CRUX_DOMAIN", "DNS:localhost"},
				{"FROM_NAME", "Dyo"},
				{"SENDGRID_KEY", "SG.InvalidKey"},
				{"FROM_EMAIL", "mail@szolgalta.to"},
				{"SMTP_USER", "test"},
				{"SMTP_PASSWORD", "test"},
				{"SMTP_URL", "mailslurper:1025/?skip_ssl_verify=true&legacy_ssl=true"},
			},
			Volumes: []Volume{{"crux-certs", "/app/certs", false}},
			Ports: []Port{
				{5000, 5000},
				{5001, 5001},
			},
			Restart: true,
			Command: "serve",
		},
		{
			Enabled: true,
			Image:   "ghcr.io/dyrector-io/dyrectorio/web/crux:latest",
			Name:    "crux-migrate",
			Depends: []string{"- crux-postgres"},
			EnvVars: []EnvVar{
				{"TZ", "Europe/Budapest"},
				{"DATABASE_URL", "postgresql://crux:RhdAVuEnozSR4FLS@crux-postgres:5432/crux?schema=public"},
			},
			Command: "migrate",
		},
	}

	return OverwriteContainerConf(crux)
}

func GetCruxuiContainerDefaults() []Container {
	return []Container{
		{
			Enabled: true,
			Image:   "ghcr.io/dyrector-io/dyrectorio/web/crux-ui:latest",
			Name:    "crux-ui",
			EnvVars: []EnvVar{
				{"TZ", "Europe/Budapest"},
				{"KRATOS_URL", "http://kratos:4433"},
				{"KRATOS_ADMIN_URL", "http://kratos:4434"},
				{"CRUX_ADDRESS", "crux:5001"},
				{"CRUX_INSECURE", "true"},
				{"DISABLE_RECAPTCHA", "true"},
				{"RECAPTCHA_SECRET_KEY", ""},
				{"RECAPTCHA_SITE_KEY", ""},
				{"SMTP_URL", "mailslurper:1025/?skip_ssl_verify=true&legacy_ssl=true"},
			},
			Volumes: []Volume{{"crux-certs", "/app/certs", true}},
			Ports:   []Port{{3000, 3000}},
			Restart: true,
		},
	}
}

func GetUtilsContainerDefaults() []Container {
	return []Container{
		{
			Enabled: true,
			Image:   "ghcr.io/dyrector-io/dyrectorio/web/kratos:latest",
			Name:    "kratos-migrate",
			Depends: []string{"- kratos-postgres"},
			EnvVars: []EnvVar{
				{"SQA_OPT_OUT", "true"},
				{"DSN", "postgres://kratos:IPNuH10gAXT7bg8g@kratos-postgres:5432/kratos?sslmode=disable&max_conns=20&max_idle_conns=4"},
			},
			Volumes: []Volume{{"kratos-config", "/etc/config/kratos", false}},
			Command: "-c /etc/config/kratos/kratos.yaml migrate sql -e --yes",
		},
		{
			Enabled: true,
			Image:   "ghcr.io/dyrector-io/dyrectorio/web/kratos:latest",
			Name:    "kratos",
			Depends: []string{"kratos-migrate:\n        condition: service_completed_successfully"},
			EnvVars: []EnvVar{
				{"SQA_OPT_OUT", "true"},
				{"DSN", "postgres://kratos:IPNuH10gAXT7bg8g@kratos-postgres:5432/kratos?sslmode=disable&max_conns=20&max_idle_conns=4"},
				{"KRATOS_ADMIN_URL", "http://kratos:4434"},
				{"KRATOS_URL", "http://kratos:4433"},
				{"AUTH_URL", "http://crux-ui:3000/auth"},
				{"CRUX_UI_URL", "http://crux-ui:3000"},
				{"DEV", "false"},
				{"LOG_LEVEL", "info"},
				{"LOG_LEAK_SENSITIVE_VALUES", "true"},
				{"SECRETS_COOKIE", "AvGMteMxePpJ4ZVM"},
				{"SMTP_USER", "test"},
				{"SMTP_PASSWORD", "test"},
				{"SMTP_URL", "mailslurper:1025/?skip_ssl_verify=true&legacy_ssl=true"},
				{"COURIER_SMTP_CONNECTION_URI", "smtps://test:test@mailslurper:1025/?skip_ssl_verify=true&legacy_ssl=true"},
			},
			Restart: true,
			Ports: []Port{
				{4433, 4433},
				{4434, 4434},
			},
		},
		{
			Enabled: true,
			Image:   "docker.io/library/postgres:13.3-alpine3.14",
			Name:    "crux-postgres",
			EnvVars: []EnvVar{
				{"POSTGRES_PASSWORD", "RhdAVuEnozSR4FLS"},
				{"POSTGRES_USER", "crux"},
				{"POSTGRES_DB", "crux"},
			},
			Ports:   []Port{{5432, 5432}},
			Restart: true,
			Volumes: []Volume{{"crux-db", "/var/lib/postgresql/data", false}},
		},
		{
			Enabled: true,
			Image:   "docker.io/library/postgres:13.3-alpine3.14",
			Name:    "kratos-postgres",
			EnvVars: []EnvVar{
				{"POSTGRES_PASSWORD", "IPNuH10gAXT7bg8g"},
				{"POSTGRES_USER", "kratos"},
				{"POSTGRES_DB", "kratos"},
			},
			Ports:   []Port{{5433, 5432}},
			Restart: true,
			Volumes: []Volume{{"kratos-db", "/var/lib/postgresql/data", false}},
		},
		{
			Enabled: true,
			Image:   "docker.io/oryd/mailslurper:latest-smtps",
			Name:    "mailslurper",
			Ports: []Port{
				{4436, 4436},
				{4437, 4437},
			},
			Restart: true,
		},
	}
}

func GetContainerDefaults(services []Services) ([]Container, error) {
	var containers []Container

	for _, i := range services {
		switch i {
		case CruxUI:
			containers = append(containers, GetCruxuiContainerDefaults()...)
		case Crux:
			containers = append(containers, GetCruxContainerDefaults()...)
		case Utils:
			containers = append(containers, GetUtilsContainerDefaults()...)
		default:
			return []Container{}, errors.New("invalid service name")
		}
	}

	return containers, nil
}

func GenContainer(services []Services, write bool) (string, error) {
	containers, err := GetContainerDefaults(services)
	if err != nil {
		return "", err
	}

	if write {
		var settings Settings
		settings, err = ReadSettingsFile(true)
		if err != nil {
			return "", err
		}
		containers, err = EnvVarOverwrite(settings, containers)
		if err != nil {
			return "", err
		}
	}

	buf := bytes.Buffer{}
	buffer := bufio.NewWriter(&buf)

	composetemplate, err := template.New("container").Parse(templatefile)
	if err != nil {
		return "", err
	}

	err = composetemplate.Execute(buffer, containers)
	if err != nil {
		return "", err
	}

	err = buffer.Flush()
	if err != nil {
		return "", err
	}

	return buf.String(), nil
}

func WriteComposeFile(containers string) error {
	err := os.WriteFile("docker-compose.yaml", []byte(containers), FilePerms)
	return err
}
