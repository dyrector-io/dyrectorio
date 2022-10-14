import { ContainerConfig, ContainerConfigPort, ContainerState, UniqueKey, UniqueKeyValue } from './container'
import { VersionImage } from './image'

export type InstanceStatus = {
  instanceId: string
  state: ContainerState
}

export type Instance = {
  id: string
  image: VersionImage
  state?: ContainerState
  publicKey?: string
  overriddenConfig?: Partial<ContainerConfig>
}

export type PatchInstance = {
  instanceId: string
  config: Partial<ContainerConfig>
}
