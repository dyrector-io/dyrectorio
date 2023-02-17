import { ContainerState, InstanceContainerConfigData } from './container'
import { ImageConfigFilterType, VersionImage } from './image'

export type InstanceStatus = {
  instanceId: string
  state: ContainerState
}

export type Instance = {
  id: string
  image: VersionImage
  state?: ContainerState
  publicKey?: string
  overriddenConfig?: InstanceContainerConfigData
}

export type PatchInstance = {
  instanceId: string
  config?: Partial<InstanceContainerConfigData>
  resetSection?: ImageConfigFilterType
}
