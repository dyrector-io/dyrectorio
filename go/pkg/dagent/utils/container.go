package utils

import (
	"context"
	"fmt"
	"log"
	"os"
	"path"
	"path/filepath"
	"text/template"

	"github.com/docker/docker/api/types/mount"
	v1 "gitlab.com/dyrector_io/dyrector.io/go/pkg/api/v1"
	"gitlab.com/dyrector_io/dyrector.io/go/pkg/dagent/model"

	"gitlab.com/dyrector_io/dyrector.io/go/pkg/dagent/config"
)

func ExecWatchtowerOneShot() error {
	b := initDagentUpdaterBuilder()

	_, err := b.WithCmd([]string{"--run-once", config.Cfg.AgentContainerName}).
		Create(context.TODO()).
		Start()

	return err
}

func ExecWatchtowerPoll() error {
	// TODO(nandi): do we need this updater? IIRC dagent can update itself
	container := GetContainer(config.Cfg.UpdaterContainerName)
	var err error

	if len(container) < 1 {
		b := initDagentUpdaterBuilder()
		_, err = b.WithCmd([]string{
			"--interval",
			fmt.Sprintf("%d", int(config.Cfg.UpdatePollInterval.Seconds())),
			config.Cfg.AgentContainerName,
		}).
			Create(context.TODO()).
			Start()
	}

	return err
}

func initDagentUpdaterBuilder() *dockerContainerBuilder {
	return new(dockerContainerBuilder).WithImage("index.docker.io/containrrr/watchtower:latest").
		WithAutoRemove(true).
		WithName(config.Cfg.UpdaterContainerName).
		WithMountPoints(getUpdaterMounts()).
		WithEnv([]string{
			fmt.Sprintf("REPO_USER=%s", config.Cfg.RegistryUsername),
			fmt.Sprintf("REPO_PASS=%s", config.Cfg.RegistryPassword),
			"WATCHTOWER_LIFECYCLE_HOOKS=true",
		})
}

func getUpdaterMounts() []mount.Mount {
	mounts := []mount.Mount{}

	mounts = append(mounts, mount.Mount{
		Type: mount.TypeBind, Source: config.Cfg.HostDockerSockPath, Target: "/var/run/docker.sock",
	})

	if config.Cfg.UpdateHostTimezone {
		mounts = append(mounts, mount.Mount{
			Type:     mount.TypeBind,
			Source:   "/etc/localtime",
			Target:   "/etc/localtime",
			ReadOnly: true,
		})
	}
	return mounts
}

func ExecTraefik(ctx context.Context, traefikDeployReq model.TraefikDeployRequest) error {
	mounts := []mount.Mount{}

	// dagent/traefik/config
	mounts = append(mounts, mount.Mount{
		Type:   mount.TypeBind,
		Source: config.Cfg.HostDockerSockPath,
		Target: "/var/run/docker.sock",
	}, mount.Mount{
		Type:   mount.TypeBind,
		Source: filepath.Join(config.Cfg.DataMountPath, "traefik", "config"),
		Target: path.Join("/etc", "traefik"),
	})

	if traefikDeployReq.TLS {
		mounts = append(mounts, mount.Mount{
			Type:   mount.TypeBind,
			Source: filepath.Join(config.Cfg.DataMountPath, "traefik", "letsencrypt"),
			Target: "/letsencrypt",
		})
	}

	internalPath := config.Cfg.InternalMountPath

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
		log.Println("could not parse template string: " + err.Error())
		return err
	}

	//#nosec G304
	configFile, err := os.Create(filepath.Join(configDir, "traefik.yml"))
	if err != nil {
		log.Println("could not create traefik.yml file: " + err.Error())
		return err
	}
	// anonymized defer to swallow error, at least something is logged about it
	defer func(configFile *os.File) {
		if err = configFile.Close(); err != nil {
			log.Println("closing traefik.yml failedd: ", err.Error())
		}
	}(configFile)

	err = configTmpl.Execute(configFile, traefikDeployReq)
	if err != nil {
		log.Println("rendering traefik config template error: " + err.Error())
		return err
	}
	if err != nil {
		log.Println("could not sync traefik.yml - flush to disk: " + err.Error())
		return err
	}

	// ports
	ports := []v1.PortBinding{
		{PortBinding: 80, ExposedPort: 80}}

	if traefikDeployReq.TLS {
		ports = append(ports, v1.PortBinding{PortBinding: 443, ExposedPort: 443})
	}

	container := GetContainer("traefik")

	if len(container) == 1 {
		_ = stopContainer("traefik")
		_ = removeContainer("traefik")
	}

	builder := new(dockerContainerBuilder).WithImage("index.docker.io/library/traefik:v2.6").
		WithAutoRemove(true).
		WithName("traefik").
		WithMountPoints(mounts).
		WithPortBindings(ports).
		WithRestartPolicy(v1.AlwaysRestartPolicy).
		WithAutoRemove(false).
		WithNetworkMode("traefik").
		WithCmd([]string{"--add-host", "host.docker.internal:172.17.0.1"}).
		Create(ctx)

	_, err = builder.Start()

	return err
}
