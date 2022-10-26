package container

import (
	"context"
	"io"
)

var RegistryAuthBase64 = registryAuthBase64

func PullImage(ctx context.Context, logger io.StringWriter, fullyQualifiedImageName, authCreds string) error {
	return pullImage(ctx, logger, fullyQualifiedImageName, authCreds)
}
