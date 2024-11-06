import { ContainerConfigData } from 'src/domain/container'
import { ContainerConfigProperty } from './container.const'

export const WS_TYPE_PATCH_CONFIG = 'patch-config'
export type PatchConfigMessage = {
  config?: ContainerConfigData
  resetSection?: ContainerConfigProperty
}

export const WS_TYPE_PATCH_RECEIVED = 'patch-received'

export const WS_TYPE_CONFIG_UPDATED = 'config-updated'
export type ConfigUpdatedMessage = ContainerConfigData & {
  id: string
}
