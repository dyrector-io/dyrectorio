package container

import (
	"context"
	"io"
)

var RegistryAuthBase64 = registryAuthBase64

func DeleteContainer(ctx context.Context, container string) error {
	return deleteContainer(ctx, container)
}

func DeleteNetwork(ctx context.Context, networkID string) error {
	return deleteNetwork(ctx, networkID)
}

func PullImage(ctx context.Context, logger io.StringWriter, fullyQualifiedImageName, authCreds string) error {
	return pullImage(ctx, logger, fullyQualifiedImageName, authCreds)
}
