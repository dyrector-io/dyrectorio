package utils

import (
	"context"
	"os"
	"path"
	"path/filepath"
	"text/template"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/mount"
	"github.com/docker/docker/client"
	"github.com/rs/zerolog/log"

	dockerHelper "github.com/dyrector-io/dyrectorio/golang/internal/helper/docker"
	containerbuilder "github.com/dyrector-io/dyrectorio/golang/pkg/builder/container"

	"github.com/dyrector-io/dyrectorio/golang/pkg/dagent/config"
)

type TraefikDeployRequest struct {
	// LogLevel defaults to INFO
	LogLevel string `json:"logLevel"`
	// if services exposed with certs, default: false
	TLS bool `json:"TLS"`
	// the email address for expiry notifications, sent by acme
	AcmeMail string `json:"acmeMail" binding:"required_if=TLS true"`
	// HTTP port
	Port uint16 `json:"port"`
	// HTTPS port
	TLSPort uint16 `json:"tlsPort"`
}

type UnknownContainerError struct{}

func (err *UnknownContainerError) Error() string {
	return "own container ID unknown"
}

func ExecTraefik(ctx context.Context, traefikDeployReq TraefikDeployRequest, cfg *config.Configuration) error {
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
		{PortBinding: traefikDeployReq.Port, ExposedPort: 80},
	}

	if traefikDeployReq.TLS {
		ports = append(ports, containerbuilder.PortBinding{PortBinding: traefikDeployReq.TLSPort, ExposedPort: 443})
	}

	if err = dockerHelper.DeleteContainerByName(ctx, nil, "traefik", true); err != nil {
		log.Error().Stack().Err(err).Msg("delete traefik container error")
		return err
	}

	if err = dockerHelper.CreateNetwork(ctx, "traefik", "bridge"); err != nil {
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

func GetOwnContainerID() string {
	cgroup, err := ParseCGroupFile()
	if err != nil {
		return os.Getenv("HOSTNAME")
	}

	return cgroup
}

func GetOwnContainer(ctx context.Context) (*types.Container, error) {
	containerID := GetOwnContainerID()
	if containerID == "" {
		return nil, &UnknownContainerError{}
	}

	container, err := dockerHelper.GetContainerByID(ctx, nil, containerID)
	if err != nil {
		return nil, err
	}
	if container.ID != containerID {
		return nil, &UnknownContainerError{}
	}

	return container, nil
}

func GetOwnContainerImage() (*types.ImageInspect, error) {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return nil, err
	}

	container, err := GetOwnContainer(context.Background())
	if err != nil {
		return nil, err
	}

	image, _, err := cli.ImageInspectWithRaw(context.Background(), container.ImageID)
	if err != nil {
		return nil, err
	}

	return &image, nil
}
