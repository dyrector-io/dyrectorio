package utils

import (
	"context"
	"fmt"
	"os"
	"path/filepath"

	"github.com/rs/zerolog/log"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/mount"
	"github.com/docker/docker/client"

	dockerHelper "github.com/dyrector-io/dyrectorio/golang/internal/helper/docker"
	containerbuilder "github.com/dyrector-io/dyrectorio/golang/pkg/builder/container"

	"github.com/dyrector-io/dyrectorio/golang/pkg/dagent/config"
)

const (
	TraefikHTTPPort  = 80
	TraefikHTTPSPort = 443
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
	return "unknown container ID"
}

func ExecTraefik(ctx context.Context, traefikDeployReq TraefikDeployRequest, cfg *config.Configuration) error {
	mounts := []mount.Mount{}

	mounts = append(mounts, mount.Mount{
		Type:   mount.TypeBind,
		Source: cfg.HostDockerSockPath,
		Target: "/var/run/docker.sock",
	}, mount.Mount{
		Type:   mount.TypeBind,
		Source: filepath.Join(cfg.DataMountPath, "traefik", "logs"),
		Target: "/var/log/traefik",
	})

	if traefikDeployReq.TLS {
		mounts = append(mounts, mount.Mount{
			Type:   mount.TypeBind,
			Source: filepath.Join(cfg.DataMountPath, "traefik", "letsencrypt"),
			Target: "/letsencrypt",
		})
	}

	// ensure directories exist
	err := os.MkdirAll(filepath.Join(cfg.InternalMountPath, "traefik", "logs"), os.ModePerm)
	if err != nil {
		return err
	}

	if traefikDeployReq.TLS {
		err = os.MkdirAll(filepath.Join(cfg.InternalMountPath, "traefik", "letsencrypt"), os.ModePerm)
		if err != nil {
			return err
		}
	}

	// build the command
	command := []string{
		fmt.Sprintf("--entryPoints.web.address=:%d", traefikDeployReq.Port),
		"--log.filePath=/var/log/traefik/traefik.log",
		fmt.Sprintf("--log.level=%s", traefikDeployReq.LogLevel),
		"--providers.docker.exposedByDefault=false",
	}

	if traefikDeployReq.TLS {
		command = append(command,
			fmt.Sprintf("--entryPoints.websecure.address=:%d", traefikDeployReq.TLSPort),
			"--certificatesResolvers.le.acme.httpChallenge.entryPoint=web",
			"--certificatesResolvers.le.acme.storage=/letsencrypt/acme.json",
			fmt.Sprintf("--certificatesResolvers.le.acme.email=%s", traefikDeployReq.AcmeMail),
		)
	}

	if traefikDeployReq.LogLevel == "DEBUG" {
		command = append(command,
			"--api.insecure=true",
			"--api.dashboard=true",
		)
	}

	// check if "host" network mode is supported
	if !container.NetworkMode("host").IsHost() {
		log.Warn().Msg("Trying to start Traefic with unsupported 'host' network mode! Traefik will not work!")
	}

	builder := containerbuilder.NewDockerBuilder(ctx).WithImage("index.docker.io/library/traefik:v2.8.0").
		WithName("traefik").
		WithMountPoints(mounts).
		WithRestartPolicy(containerbuilder.AlwaysRestartPolicy).
		WithAutoRemove(false).
		WithoutConflict().
		WithNetworkMode("host").
		WithCmd(command).
		WithForcePullImage().
		WithExtraHosts([]string{"host.docker.internal:host-gateway"}).
		WithoutConflict()

	_, err = builder.CreateAndStart()
	return err
}

func GetOwnContainer(ctx context.Context) (*types.Container, error) {
	hostname := os.Getenv("HOSTNAME")

	log.Info().Str("hostname", hostname).Msg("Getting self by hostname")

	ownContainer, err := dockerHelper.GetContainerByName(ctx, hostname)
	if err != nil {
		return nil, err
	}
	if ownContainer != nil {
		return ownContainer, nil
	}

	ownContainer, err = dockerHelper.GetContainerByID(ctx, hostname)
	if err != nil {
		return nil, err
	}
	if ownContainer != nil {
		return ownContainer, nil
	}

	cgroup, err := ParseCGroupFile()
	if err != nil {
		return nil, err
	}

	log.Info().Str("cgroup", cgroup).Msg("Getting self by CGroup")

	ownContainer, err = dockerHelper.GetContainerByID(ctx, cgroup)
	if err != nil {
		return nil, err
	}
	if ownContainer != nil {
		return ownContainer, nil
	}

	return nil, &UnknownContainerError{}
}

func GetOwnContainerImage() (*types.ImageInspect, error) {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return nil, err
	}

	self, err := GetOwnContainer(context.Background())
	if err != nil {
		return nil, err
	}

	image, _, err := cli.ImageInspectWithRaw(context.Background(), self.ImageID)
	if err != nil {
		return nil, err
	}

	return &image, nil
}
