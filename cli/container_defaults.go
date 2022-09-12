package main

import (
	"context"
	"fmt"

	"github.com/docker/docker/api/types/mount"
	containerbuilder "github.com/dyrector-io/dyrectorio/agent/pkg/builder/container"
)

const PostgresImage = "docker.io/library/postgres:13-alpine"
const MailSlurperImage = "docker.io/oryd/mailslurper:latest-smtps"

// Crux services: db migrations and crux api service
func GetCrux(settings Settings) *containerbuilder.DockerContainerBuilder {
	crux := containerbuilder.NewDockerBuilder(context.Background()).
		WithImage(fmt.Sprintf("%s:%s", settings.Crux.Image, settings.SettingsFile.Version)).
		WithName(fmt.Sprintf("%s_crux", settings.SettingsFile.Prefix)).
		WithRestartPolicy(containerbuilder.AlwaysRestartPolicy).
		WithoutConflict().
		WithForcePullImage().
		WithEnv([]string{
			fmt.Sprintf("TZ=%s", settings.SettingsFile.TimeZone),
			fmt.Sprintf("DATABASE_URL=postgresql://%s:%s@%s_crux-postgres:%d/%s?schema=public",
				settings.SettingsFile.CruxPostgresUser,
				settings.SettingsFile.CruxPostgresPassword,
				settings.SettingsFile.Prefix,
				settings.SettingsFile.CruxPostgresPort,
				settings.SettingsFile.CruxPostgresDB),
			fmt.Sprintf("KRATOS_ADMIN_URL=http://%s_kratos:%d",
				settings.SettingsFile.Prefix,
				settings.SettingsFile.KratosAdminPort),
			fmt.Sprintf("CRUX_UI_URL=localhost:%d", settings.SettingsFile.CruxUIPort),
			fmt.Sprintf("CRUX_ADDRESS=%s:%d", settings.NetworkGatewayIP, settings.SettingsFile.CruxAgentGrpcPort),
			"GRPC_API_INSECURE=true",
			"GRPC_AGENT_INSECURE=true",
			"GRPC_AGENT_INSTALL_SCRIPT_INSECURE=true",
			"LOCAL_DEPLOYMENT=true",
			fmt.Sprintf("LOCAL_DEPLOYMENT_NETWORK=%s", settings.SettingsFile.Network),
			fmt.Sprintf("JWT_SECRET=%s", settings.SettingsFile.CruxSecret),
			"CRUX_DOMAIN=DNS:localhost",
			"FROM_NAME=dyrector.io",
			"SENDGRID_KEY=SG.InvalidKey",
			"FROM_EMAIL=mail@szolgalta.to",
			"SMTP_USER=test",
			"SMTP_PASSWORD=test",
			fmt.Sprintf("SMTP_URL=%s_mailslurper:1025/?skip_ssl_verify=true&legacy_ssl=true", settings.SettingsFile.Prefix),
		}).
		WithPortBindings([]containerbuilder.PortBinding{
			{
				ExposedPort: DefaultCruxAgentGrpcPort,
				PortBinding: uint16(settings.SettingsFile.CruxAgentGrpcPort),
			},
			{
				ExposedPort: DefaultCruxGrpcPort,
				PortBinding: uint16(settings.SettingsFile.CruxGrpcPort),
			}}).
		WithNetworks([]string{settings.SettingsFile.Network}).
		WithMountPoints([]mount.Mount{
			{
				Type:   mount.TypeVolume,
				Source: fmt.Sprintf("%s_crux-certs", settings.SettingsFile.Prefix),
				Target: "/app/certs",
			},
		}).
		WithCmd([]string{"serve"})
	return crux
}

func GetCruxMigrate(settings Settings) *containerbuilder.DockerContainerBuilder {
	cruxMigrate := containerbuilder.NewDockerBuilder(context.Background()).
		WithImage(fmt.Sprintf("%s:%s", settings.Crux.Image, settings.SettingsFile.Version)).
		WithName(fmt.Sprintf("%s_crux-migrate", settings.SettingsFile.Prefix)).
		WithoutConflict().
		WithForcePullImage().
		WithEnv([]string{
			fmt.Sprintf("TZ=%s", settings.SettingsFile.TimeZone),
			fmt.Sprintf("DATABASE_URL=postgresql://%s:%s@%s_crux-postgres:%d/%s?schema=public",
				settings.SettingsFile.CruxPostgresUser,
				settings.SettingsFile.CruxPostgresPassword,
				settings.SettingsFile.Prefix,
				settings.SettingsFile.CruxPostgresPort,
				settings.SettingsFile.CruxPostgresDB)}).
		WithNetworks([]string{settings.SettingsFile.Network}).
		WithCmd([]string{"migrate"})

	return cruxMigrate
}

func GetCruxUI(settings Settings) *containerbuilder.DockerContainerBuilder {
	cruxUI := containerbuilder.NewDockerBuilder(context.Background()).
		WithImage(fmt.Sprintf("%s:%s", settings.CruxUI.Image, settings.SettingsFile.Version)).
		WithName(fmt.Sprintf("%s_crux-ui", settings.SettingsFile.Prefix)).
		WithRestartPolicy(containerbuilder.AlwaysRestartPolicy).
		WithoutConflict().
		WithForcePullImage().
		WithEnv([]string{
			fmt.Sprintf("TZ=%s", settings.SettingsFile.TimeZone),
			fmt.Sprintf("KRATOS_URL=http://%s_kratos:%d",
				settings.SettingsFile.Prefix,
				settings.SettingsFile.KratosPublicPort),
			fmt.Sprintf("KRATOS_ADMIN_URL=http://%s_kratos:%d",
				settings.SettingsFile.Prefix,
				settings.SettingsFile.KratosAdminPort),
			fmt.Sprintf("CRUX_ADDRESS=%s:%d", settings.CruxUI.CruxAddr, settings.SettingsFile.CruxGrpcPort),
			"CRUX_INSECURE=true",
			"DISABLE_RECAPTCHA=true",
		}).
		WithPortBindings([]containerbuilder.PortBinding{
			{
				ExposedPort: DefaultCruxUIPort,
				PortBinding: uint16(settings.SettingsFile.CruxUIPort),
			}}).
		WithNetworks([]string{settings.SettingsFile.Network}).
		WithMountPoints([]mount.Mount{
			{
				Type:     mount.TypeVolume,
				Source:   fmt.Sprintf("%s_crux-certs", settings.SettingsFile.Prefix),
				Target:   "/app/certs",
				ReadOnly: true,
			},
		})

	return cruxUI
}

// Return Kratos services' containers
func GetKratos(settings Settings) *containerbuilder.DockerContainerBuilder {
	kratos := containerbuilder.NewDockerBuilder(context.Background()).
		WithImage(fmt.Sprintf("%s:%s", settings.Kratos.Image, settings.SettingsFile.Version)).
		WithName(fmt.Sprintf("%s_kratos", settings.SettingsFile.Prefix)).
		WithRestartPolicy(containerbuilder.AlwaysRestartPolicy).
		WithoutConflict().
		WithForcePullImage().
		WithEnv([]string{
			"SQA_OPT_OUT=true",
			fmt.Sprintf("DSN=postgresql://%s:%s@%s_kratos-postgres:%d/%s?sslmode=disable&max_conns=20&max_idle_conns=4",
				settings.SettingsFile.KratosPostgresUser,
				settings.SettingsFile.KratosPostgresPassword,
				settings.SettingsFile.Prefix,
				settings.SettingsFile.KratosPostgresPort,
				settings.SettingsFile.KratosPostgresDB),
			fmt.Sprintf("KRATOS_URL=http://%s_kratos:%d",
				settings.SettingsFile.Prefix,
				settings.SettingsFile.KratosPublicPort),
			fmt.Sprintf("KRATOS_ADMIN_URL=http://%s_kratos:%d",
				settings.SettingsFile.Prefix,
				settings.SettingsFile.KratosAdminPort),
			fmt.Sprintf("AUTH_URL=http://%s_crux-ui:%d/auth", settings.SettingsFile.Prefix, settings.SettingsFile.CruxUIPort),
			fmt.Sprintf("CRUX_UI_URL=http://%s_crux-ui:%d", settings.SettingsFile.Prefix, settings.SettingsFile.CruxUIPort),
			fmt.Sprintf("CRUX_ADDRESS=%s:%d", settings.NetworkGatewayIP, settings.SettingsFile.CruxAgentGrpcPort),
			"DEV=false",
			"LOG_LEVEL=info",
			"LOG_LEAK_SENSITIVE_VALUES=true",
			fmt.Sprintf("SECRETS_COOKIE=%s", settings.SettingsFile.KratosSecret),
			"SMTP_USER=test",
			"SMTP_PASSWORD=test",
			fmt.Sprintf("SMTP_URL=%s_mailslurper:1025/?skip_ssl_verify=true&legacy_ssl=true", settings.SettingsFile.Prefix),
			fmt.Sprintf("SMTP_URL=test:test@%s_mailslurper:1025/?skip_ssl_verify=true&legacy_ssl=true", settings.SettingsFile.Prefix),
		}).
		WithPortBindings([]containerbuilder.PortBinding{
			{
				ExposedPort: DefaultKratosPublicPort,
				PortBinding: uint16(settings.SettingsFile.KratosPublicPort),
			},
			{
				ExposedPort: DefaultKratosAdminPort,
				PortBinding: uint16(settings.SettingsFile.KratosAdminPort),
			}}).
		WithNetworks([]string{settings.SettingsFile.Network})

	return kratos
}

func GetKratosMigrate(settings Settings) *containerbuilder.DockerContainerBuilder {
	kratosMigrate := containerbuilder.NewDockerBuilder(context.Background()).
		WithImage(fmt.Sprintf("%s:%s", settings.Kratos.Image, settings.SettingsFile.Version)).
		WithName(fmt.Sprintf("%s_kratos-migrate", settings.SettingsFile.Prefix)).
		WithoutConflict().
		WithForcePullImage().
		WithEnv([]string{
			"SQA_OPT_OUT=true",
			fmt.Sprintf("DSN=postgresql://%s:%s@%s_kratos-postgres:%d/%s?sslmode=disable&max_conns=20&max_idle_conns=4",
				settings.SettingsFile.KratosPostgresUser,
				settings.SettingsFile.KratosPostgresPassword,
				settings.SettingsFile.Prefix,
				settings.SettingsFile.KratosPostgresPort,
				settings.SettingsFile.KratosPostgresDB),
		}).
		WithNetworks([]string{settings.SettingsFile.Network}).
		WithNetworkAliases(fmt.Sprintf("%s_kratos-migrate", settings.SettingsFile.Prefix)).
		WithCmd([]string{"-c /etc/config/kratos/kratos.yaml", "migrate", "sql", "-e", "--yes"})

	return kratosMigrate
}

// Return Mailslurper services container
func GetMailSlurper(settings Settings) *containerbuilder.DockerContainerBuilder {
	mailslurper := containerbuilder.NewDockerBuilder(context.Background()).
		WithImage(MailSlurperImage).
		WithName(fmt.Sprintf("%s_mailslurper", settings.SettingsFile.Prefix)).
		WithRestartPolicy(containerbuilder.AlwaysRestartPolicy).
		WithoutConflict().
		WithForcePullImage().
		WithPortBindings([]containerbuilder.PortBinding{
			{
				ExposedPort: DefaultMailSlurperPort,
				PortBinding: uint16(settings.SettingsFile.MailSlurperPort),
			}}).
		WithNetworks([]string{settings.SettingsFile.Network}).
		WithNetworkAliases(fmt.Sprintf("%s_mailslurper", settings.SettingsFile.Prefix))

	return mailslurper
}

// Return Postgres services' containers
func GetCruxPostgres(settings Settings) *containerbuilder.DockerContainerBuilder {
	cruxPostgres := containerbuilder.NewDockerBuilder(context.Background()).
		WithImage(PostgresImage).
		WithName(fmt.Sprintf("%s_crux-postgres", settings.SettingsFile.Prefix)).
		WithRestartPolicy(containerbuilder.AlwaysRestartPolicy).
		WithoutConflict().
		WithForcePullImage().
		WithEnv([]string{
			fmt.Sprintf("POSTGRES_USER=%s", settings.SettingsFile.KratosPostgresUser),
			fmt.Sprintf("POSTGRES_PASSWORD=%s", settings.SettingsFile.KratosPostgresPassword),
			fmt.Sprintf("POSTGRES_DB=%s", settings.SettingsFile.KratosPostgresDB),
		}).
		WithPortBindings([]containerbuilder.PortBinding{
			{
				ExposedPort: DefaultPostgresPort,
				PortBinding: uint16(settings.SettingsFile.CruxPostgresPort),
			}}).
		WithNetworks([]string{settings.SettingsFile.Network}).
		WithMountPoints([]mount.Mount{{
			Type:   mount.TypeVolume,
			Source: fmt.Sprintf("%s_crux-postgres-data", settings.SettingsFile.Prefix), Target: "/var/lib/postgresql/data"}})

	return cruxPostgres
}

func GetKratosPostgres(settings Settings) *containerbuilder.DockerContainerBuilder {
	kratosPostgres := containerbuilder.NewDockerBuilder(context.Background()).
		WithImage(PostgresImage).
		WithName(fmt.Sprintf("%s_kratos-postgres", settings.SettingsFile.Prefix)).
		WithRestartPolicy(containerbuilder.AlwaysRestartPolicy).
		WithoutConflict().
		WithForcePullImage().
		WithEnv([]string{
			fmt.Sprintf("POSTGRES_USER=%s", settings.SettingsFile.KratosPostgresUser),
			fmt.Sprintf("POSTGRES_PASSWORD=%s", settings.SettingsFile.KratosPostgresPassword),
			fmt.Sprintf("POSTGRES_DB=%s", settings.SettingsFile.KratosPostgresDB),
		}).
		WithPortBindings([]containerbuilder.PortBinding{
			{
				ExposedPort: DefaultPostgresPort,
				PortBinding: uint16(settings.SettingsFile.KratosPostgresPort),
			}}).
		WithNetworks([]string{settings.SettingsFile.Network}).
		WithNetworkAliases(fmt.Sprintf("%s_kratos-postgres", settings.SettingsFile.Prefix)).
		WithMountPoints([]mount.Mount{
			{Type: mount.TypeVolume,
				Source: fmt.Sprintf("%s_kratos-postgres-data", settings.SettingsFile.Prefix),
				Target: "/var/lib/postgresql/data"}})

	return kratosPostgres
}
