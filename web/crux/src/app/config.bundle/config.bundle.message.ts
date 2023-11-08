import { UniqueKeyValue } from 'src/domain/container'

export const WS_TYPE_PATCH_CONFIG_BUNDLE = 'patch-config-bundle'
export type PatchConfigBundleEnvMessage = {
  name?: string
  description?: string
  environment?: UniqueKeyValue[]
}

export const WS_TYPE_CONFIG_BUNDLE_UPDATED = 'config-bundle-updated'
export type ConfigBundleEnvUpdatedMessage = {
  name?: string
  description?: string
  environment?: UniqueKeyValue[]
}

export const WS_TYPE_PATCH_RECEIVED = 'patch-received'
