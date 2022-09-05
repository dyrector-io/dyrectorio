package main

// Return Satellite services' containers
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
