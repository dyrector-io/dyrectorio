package utils

import (
	"context"
	"fmt"
	"os"
	"path"
	"path/filepath"
	"text/template"

	"github.com/docker/docker/api/types/mount"
	"github.com/rs/zerolog/log"

	containerbuilder "github.com/dyrector-io/dyrectorio/golang/pkg/builder/container"
	"github.com/dyrector-io/dyrectorio/golang/pkg/dagent/model"

	"github.com/dyrector-io/dyrectorio/golang/pkg/dagent/config"
)

func ExecWatchtowerOneShot(ctx context.Context, cfg *config.Configuration) error {
	b := initDagentUpdaterBuilder(ctx, cfg)

	_, err := b.WithCmd([]string{"--run-once", cfg.AgentContainerName}).
		Create().
		Start()

	return err
}

func ExecWatchtowerPoll(ctx context.Context, cfg *config.Configuration) error {
	// TODO(nandor-magyar): do we need this updater? IIRC dagent can update itself
	container := GetContainer(cfg.UpdaterContainerName)
	var err error

	if len(container) < 1 {
		b := initDagentUpdaterBuilder(ctx, cfg)
		_, err = b.WithCmd([]string{
			"--interval",
			fmt.Sprintf("%d", int(cfg.UpdatePollInterval.Seconds())),
			cfg.AgentContainerName,
		}).
			Create().
			Start()
	}

	return err
}

func initDagentUpdaterBuilder(ctx context.Context, cfg *config.Configuration) *containerbuilder.DockerContainerBuilder {
	return containerbuilder.NewDockerBuilder(ctx).WithImage("index.docker.io/containrrr/watchtower:latest").
		WithAutoRemove(true).
		WithName(cfg.UpdaterContainerName).
		WithMountPoints(getUpdaterMounts(cfg)).
		WithEnv([]string{
			fmt.Sprintf("REPO_USER=%s", cfg.RegistryUsername),
			fmt.Sprintf("REPO_PASS=%s", cfg.RegistryPassword),
			"WATCHTOWER_LIFECYCLE_HOOKS=true",
		})
}

func getUpdaterMounts(cfg *config.Configuration) []mount.Mount {
	mounts := []mount.Mount{}

	mounts = append(mounts, mount.Mount{
		Type: mount.TypeBind, Source: cfg.HostDockerSockPath, Target: "/var/run/docker.sock",
	})

	if cfg.UpdateHostTimezone {
		mounts = append(mounts, mount.Mount{
			Type:     mount.TypeBind,
			Source:   "/etc/localtime",
			Target:   "/etc/localtime",
			ReadOnly: true,
		})
	}
	return mounts
}

func ExecTraefik(ctx context.Context, traefikDeployReq model.TraefikDeployRequest, cfg *config.Configuration) error {
	mounts := []mount.Mount{}

	// dagent/traefik/config
	mounts = append(mounts, mount.Mount{
		Type:   mount.TypeBind,
		Source: cfg.HostDockerSockPath,
		Target: "/var/run/docker.sock",
	}, mount.Mount{
		Type:   mount.TypeBind,
		Source: filepath.Join(cfg.DataMountPath, "traefik", "config"),
		Target: path.Join("/etc", "traefik"),
	})

	if traefikDeployReq.TLS {
		mounts = append(mounts, mount.Mount{
			Type:   mount.TypeBind,
			Source: filepath.Join(cfg.DataMountPath, "traefik", "letsencrypt"),
			Target: "/letsencrypt",
		})
	}

	internalPath := cfg.InternalMountPath

	// ensure directories exist
	configDir := filepath.Join(internalPath, "traefik", "config")
	if err := os.MkdirAll(configDir, os.ModePerm); err != nil {
		return err
	}

	if err := os.MkdirAll(filepath.Join(internalPath, "traefik", "letsencrypt"), os.ModePerm); err != nil {
		return err
	}

	// create treafik.yml
	configTmpl, err := template.New("config").Parse(GetTraefikGoTemplate())
	if err != nil {
		log.Error().Stack().Err(err).Msg("could not parse template string")
		return err
	}

	//#nosec G304
	configFile, err := os.Create(filepath.Join(configDir, "traefik.yml"))
	if err != nil {
		log.Error().Stack().Err(err).Msg("could not create traefik.yml file")
		return err
	}
	// anonymized defer to swallow error, at least something is logged about it
	defer func(configFile *os.File) {
		if err = configFile.Close(); err != nil {
			log.Error().Stack().Err(err).Msg("closing traefik.yml failed")
		}
	}(configFile)

	err = configTmpl.Execute(configFile, traefikDeployReq)
	if err != nil {
		log.Error().Stack().Err(err).Msg("rendering traefik config template error")
		return err
	}
	if err != nil {
		log.Error().Stack().Err(err).Msg("could not sync traefik.yml - flush to disk")
		return err
	}

	// ports
	ports := []containerbuilder.PortBinding{
		{PortBinding: traefikDeployReq.Port, ExposedPort: 80}}

	if traefikDeployReq.TLS {
		ports = append(ports, containerbuilder.PortBinding{PortBinding: traefikDeployReq.TLSPort, ExposedPort: 443})
	}

	container := GetContainer("traefik")

	if len(container) == 1 {
		_ = stopContainer("traefik")
		_ = removeContainer("traefik")
	}

	if err = CreateNetwork(ctx, "traefik", "bridge"); err != nil {
		log.Error().Stack().Err(err).Msg("create traefik network error")
		return err
	}

	builder := containerbuilder.NewDockerBuilder(ctx).WithImage("index.docker.io/library/traefik:v2.8.0").
		WithAutoRemove(true).
		WithName("traefik").
		WithMountPoints(mounts).
		WithPortBindings(ports).
		WithRestartPolicy(containerbuilder.AlwaysRestartPolicy).
		WithAutoRemove(false).
		WithNetworkMode("traefik").
		WithCmd([]string{"--add-host", "host.docker.internal:172.17.0.1"}).
		WithForcePullImage().
		Create()

	_, err = builder.Start()

	return err
}
