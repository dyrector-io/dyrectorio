package main

// Crux services: db migrations and crux api service
func GetCruxContainerDefaults() ([]Container, error) {
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
