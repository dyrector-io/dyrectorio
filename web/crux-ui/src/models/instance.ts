import { ConcreteContainerConfig } from './container'
import { containerNameOfImage, VersionImage } from './image'

export type Instance = {
  id: string
  image: VersionImage
  config: ConcreteContainerConfig
}

export const nameOfInstance = (instance: Instance) => instance.config.name ?? containerNameOfImage(instance.image)
