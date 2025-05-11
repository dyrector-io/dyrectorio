import { ConfigBundleDetails } from './config-bundle'
import { ContainerConfig, ContainerConfigData, ContainerConfigKey, ContainerConfigType } from './container'
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

export type SecertOrigin = {
  type: ContainerConfigType
  name: string | null
}

export type SecretInfo = {
  key: string
  defined: boolean
  origins: SecertOrigin[]
}

const processConfigSecrets = (
  infos: Map<string, SecretInfo>,
  config: ContainerConfig,
  definedSecrets: Set<string>,
  originName: string | null,
) => {
  if (!config.secrets) {
    return
  }

  const keys: string[] = config.secrets.map(it => it.key) ?? []
  keys.forEach(key => {
    let info = infos.get(key)
    if (!info) {
      info = {
        key,
        defined: definedSecrets.has(key),
        origins: [],
      }
      infos.set(key, info)
    }

    info.origins.push({
      type: config.type,
      name: originName,
    })
  })
}

export const secretInfosConcreteConfig = (
  relations: ContainerConfigRelations,
  config: ContainerConfigDetails,
  definedSecrets: string[],
): Map<string, SecretInfo> => {
  const agentDefinedSecrets = new Set(definedSecrets)
  const secretInfos: Map<string, SecretInfo> = new Map()

  processConfigSecrets(secretInfos, config, agentDefinedSecrets, null)

  if (config.type === 'image' || config.type === 'config-bundle') {
    return secretInfos
  }

  relations.deployment.configBundles.forEach(bundle =>
    processConfigSecrets(secretInfos, bundle.config, agentDefinedSecrets, bundle.name),
  )

  if (config.type === 'instance') {
    processConfigSecrets(secretInfos, relations.deployment.config, agentDefinedSecrets, null)
    processConfigSecrets(secretInfos, relations.image.config, agentDefinedSecrets, null)
  }

  return secretInfos
}
