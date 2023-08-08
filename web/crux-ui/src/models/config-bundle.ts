import { UniqueKeyValue } from './container'

export type BasicConfigBundle = {
  id: string
  name: string
}

export type ConfigBundle = BasicConfigBundle

export type ConfigBundleDetails = BasicConfigBundle & {
  environment: UniqueKeyValue[]
}

export type CreateConfigBundle = {
  name: string
}

export type UpdateConfigBundle = CreateConfigBundle & {
  environment: UniqueKeyValue[]
}

export type ConfigBundleOption = BasicConfigBundle

// ws
export const WS_TYPE_PATCH_CONFIG_BUNDLE = 'patch-config-bundle'
export type PatchConfigBundleMessage = {
  name?: string
  environment?: UniqueKeyValue[]
}

export const WS_TYPE_CONFIG_BUNDLE_UPDATED = 'config-bundle-updated'
export type ConfigBundleUpdatedMessage = {
  name?: string
  environment?: UniqueKeyValue[]
}

export const WS_TYPE_PATCH_RECEIVED = 'patch-received'
