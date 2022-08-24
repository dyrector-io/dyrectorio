package container

import "context"

var RegistryAuthBase64 = registryAuthBase64

func DeleteContainer(ctx context.Context, container string) error {
	return deleteContainer(ctx, container)
}

func DeleteNetwork(ctx context.Context, networkID string) error {
	return deleteNetwork(ctx, networkID)
}
