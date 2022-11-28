import { ContainerConfig, ContainerState } from './container'
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
  config: ContainerConfig
}
