package main

import (
	"bufio"
	"errors"
	"log"
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
	Command string
}

// Container services
type ServiceName string

const (
	CruxUI ServiceName = "cruxui"
	Crux   ServiceName = "crux"
	Utils  ServiceName = "utils"
)

// Gather and strip environment variables from .env.examples
// func Get_env_opts(envexample string) []string {
// 	env_var := regexp.MustCompile(`(([A-Z_]){3,})`)
// 	found := env_var.FindAll([]byte(envexample), -1)
// 	var results []string
// 	for _, item := range found {
// 		fmt.Println(item)
// 		results = append(results, string(item))
// 	}
// 	return results
// }

func Get_crux_container_defaults() []Container {
	return []Container{
		{
			Enabled: true,
			Image:   "ghcr.io/dyrector-io/dyrectorio/web/crux:latest",
			Name:    "crux",
			Depends: []string{"crux-migrate:\n        condition: service_completed_successfully"},
			EnvVars: []EnvVar{
				{"TZ", "Europe/Budapest"},
				{"DATABASE_URL", "postgresql://crux:RhdAVuEnozSR4FLS@crux-postgres:5432/crux?schema=public"},
				{"KRATOS_ADMIN_URL", "http://kratos:9434"},
				{"CRUX_UI_URL", "http://crux-ui:3000"},
				{"SENDGRID_KEY", "$SENDGRID_KEY"},
				{"FROM_EMAIL", "$FROM_EMAIL"},
				{"FROM_NAME", "$FROM_NAME"},
			},
			Volumes: []Volume{{"crux-certs", "/app/certs", false}},
			Ports: []Port{
				{5000, 5000},
				{5001, 5001},
			},
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
}

func Get_cruxui_container_defaults() []Container {
	return []Container{
		{
			Enabled: true,
			Image:   "ghcr.io/dyrector-io/dyrectorio/web/crux-ui:latest",
			Name:    "crux-ui",
			EnvVars: []EnvVar{
				{"TZ", "Europe/Budapest"},
				{"KRATOS_URL", "http://kratos:4433"},
				{"CRUX_ADDRESS", "http://crux:5001"},
				{"CAPTCHA", "false"},
				{"RECAPTCHA_SECRET_KEY", ""},
				{"RECAPTCHA_SITE_KEY", ""},
			},
			Volumes: []Volume{{"crux-certs", "/app/certs", true}},
			Ports:   []Port{{3000, 3000}},
		},
	}
}

func Get_utils_container_defaults() []Container {
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
			Volumes: []Volume{{"kratos-config", "/etc/config/kratos", true}},
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
				{"KRATOS_ADMIN_URL", "http://kratos:9434"},
				{"KRATOS_URL", "http://kratos:4433"},
				{"AUTH_URL", "http://crux-ui:3000/auth"},
				{"CRUX_UI_URL", "http://crux-ui:3000"},
				{"DEV", "false"},
				{"LOG_LEVEL", "info"},
				{"LOG_LEAK_SENSITIVE_VALUES", "true"},
				{"SECRETS_COOKIE", "AvGMteMxePpJ4ZVM"},
				{"COURIER_SMTP_CONNECTION_URI", "smtps://${SMTP_USER}:${SMTP_PASSWORD}@${SMTP_URL}"},
			},
			Ports: []Port{
				{9433, 4433},
				{9434, 9434},
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
			Volumes: []Volume{{"kratos-db", "/var/lib/postgresql/data", false}},
		},
	}
}

func Get_container_defaults(services []ServiceName) (error, []Container) {
	var containers []Container

	for _, i := range services {
		switch i {
		case CruxUI:
			containers = append(containers, Get_cruxui_container_defaults()...)
		case Crux:
			containers = append(containers, Get_crux_container_defaults()...)
		case Utils:
			containers = append(containers, Get_utils_container_defaults()...)
		default:
			return errors.New("invalid service name"), []Container{}
		}
	}

	return nil, containers
}

func Gen_container(services []ServiceName) (error, string) {
	ReadConfig()
	container_template := `version: "3.9"
services:{{ range . }}{{ if .Enabled }}

  {{ .Name }}:
    image: {{ .Image }}
    networks:
    - dyo{{ if .EnvVars }}
    environment:{{ end }}{{ range .EnvVars }}
    - {{ .Key }}={{ .Value }}{{ end }}{{ if .Depends }}
    depends_on:{{ end }}{{range .Depends }}
      {{ . }}{{ end }}{{ if .Ports }}
    ports:{{ end }}{{ range .Ports }}
    - {{ .Host }}:{{ .Container }}{{ end }}{{ if .Volumes }}
    volumes:{{ end }}{{ range .Volumes }}
    - {{ .Host }}:{{ .Container }}:{{ if .RO }}ro{{ else }}rw{{ end }}{{ end }}
    restart: unless-stopped{{ if .Command }}
    command: {{ .Command }}{{ end }}{{ end }}{{ end }}

networks:
  dyo:
    driver: bridge

volumes:{{ range . }}{{ range .Volumes}}
  {{ .Host }}:{{ end }}{{ end }}
`

	f, err := os.Create("docker-compose.yaml")
	if err != nil {
		return err, ""
	}

	defer f.Close()
	buffer := bufio.NewWriter(f)

	var containers []Container
	allservices := []ServiceName{"crux", "cruxui", "utils"}
	services = []ServiceName{}

	for _, a := range allservices {
		if Cfg.Services.Disabled != nil {
			if Cfg.Services.Disabled[0] == a {
				if len(Cfg.Services.Disabled) > 1 {
					Cfg.Services.Disabled = Cfg.Services.Disabled[1:]
				}
			} else {
				services = append(services, a)
			}
		}
	}

	err, containers = Get_container_defaults(services)
	if err != nil {
		return err, ""
	}

	err, containers = EnvVarOverwrite(containers)
	if err != nil {
		return err, ""
	}

	//log.Println(containers)

	template, err := template.New("container").Parse(container_template)
	if err != nil {
		return err, ""
	}

	err = template.Execute(buffer, containers)
	if err != nil {
		return err, ""
	}

	if err = buffer.Flush(); err != nil {
		log.Fatal(err)
	}

	return nil, ""
}
