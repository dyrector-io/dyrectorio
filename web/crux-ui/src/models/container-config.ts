import { ContainerConfigData } from './container'
import { ImageConfigProperty } from './image'

export const WS_TYPE_PATCH_CONFIG = 'patch-config'
export type PatchConfigMessage = {
  config?: ContainerConfigData
  resetSection?: ImageConfigProperty
}

export const WS_TYPE_CONFIG_UPDATED = 'config-updated'
export type ConfigUpdatedMessage = ContainerConfigData & {
  id: string
}
