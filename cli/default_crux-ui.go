package main

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
			},
			Volumes: []Volume{{"crux-certs", "/app/certs", true}},
			Ports:   []Port{{3000, 3000}},
			Restart: true,
		},
	}
}
