import { ContainerConfig, ContainerConfigData } from './container'

export type BasicConfigBundle = {
  id: string
  name: string
}

export type ConfigBundle = BasicConfigBundle & {
  description?: string
  configId: string
}

export type ConfigBundleDetails = Omit<ConfigBundle, 'configId'> & {
  config: ContainerConfig
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

export const detailsToConfigBundle = (bundle: ConfigBundleDetails): ConfigBundle => ({
  ...bundle,
  configId: bundle.config.id,
})
