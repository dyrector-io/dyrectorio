package container

import "context"

var RegistryAuthBase64 = registryAuthBase64

func DeleteContainer(ctx context.Context, container string) error {
	return deleteContainer(ctx, container)
}
