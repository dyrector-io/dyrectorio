import { ContainerConfig, Prisma } from '@prisma/client'

export const getContainerConfig = (imageId: string, name: string) => {
  return {
    name: name,
    capabilities: [],
    config: {},
    environment: [],
    imageId: imageId,
  } as Omit<ContainerConfig, 'id'>
}
