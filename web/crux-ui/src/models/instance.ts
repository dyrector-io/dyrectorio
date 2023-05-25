import { InstanceContainerConfigData } from './container'
import { VersionImage } from './image'

export type Instance = {
  id: string
  image: VersionImage
  config?: InstanceContainerConfigData
}
