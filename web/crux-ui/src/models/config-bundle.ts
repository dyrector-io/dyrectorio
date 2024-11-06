import { ContainerConfigData, UniqueKeyValue } from './container'

export type BasicConfigBundle = {
  id: string
  name: string
}

export type ConfigBundle = BasicConfigBundle & {
  description?: string
}

export type ConfigBundleDetails = ConfigBundle & {
  config: ContainerConfigData
}

export type CreateConfigBundle = {
  name: string
  description?: string
}

export type PatchConfigBundle = {
  name?: string
  description?: string
  config?: ContainerConfigData
}

export type UpdateConfigBundle = CreateConfigBundle & {
  environment: UniqueKeyValue[]
}

export type ConfigBundleOption = BasicConfigBundle
