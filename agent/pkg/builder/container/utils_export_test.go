package container

var RegistryAuthBase64 = registryAuthBase64

func DeleteContainer(container string) error {
	return deleteContainer(container)
}
