import { ConfigBundleDetails } from './config-bundle'
import { ContainerConfig, ContainerConfigData, ContainerConfigKey } from './container'
import { DeploymentWithConfig } from './deployment'
import { VersionImage } from './image'
import { BasicProject } from './project'
import { BasicVersion } from './version'

export type ContainerConfigRelations = {
  project?: BasicProject
  version?: BasicVersion
  image?: VersionImage
  deployment?: DeploymentWithConfig
  configBundle?: ConfigBundleDetails
}

export type ContainerConfigParent = {
  id: string
  name: string
  mutable: boolean
}

export type ContainerConfigDetails = ContainerConfig & {
  parent: ContainerConfigParent
  updatedAt?: string
  updatedBy?: string
}

// ws
export const WS_TYPE_PATCH_CONFIG = 'patch-config'
export type PatchConfigMessage = {
  config?: ContainerConfigData
  resetSection?: ContainerConfigKey
}

export const WS_TYPE_CONFIG_UPDATED = 'config-updated'
export type ConfigUpdatedMessage = ContainerConfigData & {
  id: string
}

export const WS_TYPE_GET_CONFIG_SECRETS = 'get-config-secrets'
export const WS_TYPE_CONFIG_SECRETS = 'config-secrets'
export type ConfigSecretsMessage = {
  keys: string[]
  publicKey: string
}
