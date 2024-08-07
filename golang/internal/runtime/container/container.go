package container

import (
	"context"
	"errors"

	"github.com/docker/docker/client"
	"github.com/hashicorp/go-version"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

// If a runtime version doesn't satisfy recommendation: show warning
// If a runtime version doesn't satisfy minimum: failure

const (
	Podman                         = "podman"
	Docker                         = "docker"
	UnknownRuntime                 = "unknown-runtime"
	MinimumDockerServerVersion     = "20.10.0"
	RecommendedDockerServerVersion = "23.0.0"
	MinimumPodmanServerVersion     = "4.0.0"
	RecommendedPodmanServerVersion = "4.4.0"
	PodmanHost                     = "host.containers.internal"
	DockerHost                     = "host.docker.internal"
)

var (
	ErrCannotConnectToServer          = errors.New("cannot connect to server")
	ErrServerIsOutdated               = errors.New("server is outdated")
	ErrServerVersionIsNotSupported    = errors.New("serverversion is not supported")
	ErrServerUnknown                  = errors.New("server is unknown")
	ErrServerVersionIsNotValid        = errors.New("server version is not valid")
	ErrInvalidVersionConstant         = errors.New("invalid version constant in code")
	ErrCannotParseServerVersion       = errors.New("cannot parse server version")
	ErrCannotParseVersionConstraint   = errors.New("cannot parse version constraint")
	ErrCannotGetServerInformation     = errors.New("cannot get server information")
	ErrCannotGetServerVersion         = errors.New("cannot get server version")
	ErrCannotSatisfyVersionConstraint = errors.New("cannot satisfy version constraint")
)

func VersionCheck(ctx context.Context, cli client.APIClient) (*zerolog.Event, error) {
	serverVersion, err := cli.ServerVersion(ctx)
	if err != nil {
		return nil, err
	}

	runtime, err := GetContainerRuntime(ctx, cli)
	if err != nil {
		return nil, err
	}

	switch runtime {
	case Podman:
		ev := log.Info().Str("Runtime version", serverVersion.Version).Str("Runtime", "Podman")

		err = SatisfyVersion(MinimumPodmanServerVersion, RecommendedPodmanServerVersion, serverVersion.Version)
		if err != nil {
			return nil, err
		}
		return ev, nil

	case Docker:
		ev := log.Info().Str("Runtime version", serverVersion.Version).Str("Runtime", "Docker")

		err = SatisfyVersion(MinimumDockerServerVersion, RecommendedDockerServerVersion, serverVersion.Version)
		if err != nil {
			return nil, err
		}
		return ev, nil
	default:
		return nil, ErrServerUnknown
	}
}

func SatisfyVersion(minVerStr, preferredVerStr, actualVerStr string) error {
	actualVer, err := version.NewVersion(actualVerStr)
	if err != nil {
		return ErrCannotParseServerVersion
	}

	minVer, err := version.NewVersion(minVerStr)
	if err != nil {
		return ErrInvalidVersionConstant
	}

	preferredVer, err := version.NewVersion(preferredVerStr)
	if err != nil {
		return ErrInvalidVersionConstant
	}

	if !actualVer.GreaterThanOrEqual(minVer) {
		return ErrServerVersionIsNotSupported
	}

	if !actualVer.GreaterThanOrEqual(preferredVer) {
		return ErrServerIsOutdated
	}

	return nil
}

func GetInternalHostDomain(ctx context.Context, cli client.APIClient) (string, error) {
	containerRuntime, err := GetContainerRuntime(ctx, cli)
	if err != nil {
		return containerRuntime, err
	}

	if containerRuntime == Podman {
		return PodmanHost, nil
	}
	return DockerHost, nil
}

func GetContainerRuntime(ctx context.Context, cli client.APIClient) (string, error) {
	info, err := cli.Info(ctx)
	if err != nil {
		return "", err
	}

	switch info.InitBinary {
	case "":
		return Podman, nil
	case "docker-init":
		return Docker, nil
	default:
		return UnknownRuntime, ErrServerUnknown
	}
}
