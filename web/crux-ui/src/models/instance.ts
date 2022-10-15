import {
  Capabilities,
  ContainerConfig,
  ContainerState,
  Environment,
  expandKeyToKeyValues,
  ExplicitContainerConfig,
  mergeExplicitContainerConfig,
  overrideKeyValues,
  UniqueKeySecretValue,
} from './container'
import { VersionImage } from './image'

export type InstanceStatus = {
  instanceId: string
  state: ContainerState
}

export type InstanceContainerConfig = {
  name?: string
  capabilities: Capabilities
  environment: Environment
  secrets: UniqueKeySecretValue[]
  config: ExplicitContainerConfig
}

export type Instance = {
  id: string
  image: VersionImage
  state?: ContainerState
  publicKey?: string
  overriddenConfig?: Partial<InstanceContainerConfig>
}

export type PatchInstance = {
  instanceId: string
  config: Partial<InstanceContainerConfig>
}

export const mergeConfigs = (
  imageConfig: ContainerConfig,
  overriddenConfig: Partial<InstanceContainerConfig>,
): InstanceContainerConfig => {
  const instanceConfig = overriddenConfig ?? {}

  const envs = overrideKeyValues(imageConfig.environment, instanceConfig.environment)
  const caps = overrideKeyValues(imageConfig.capabilities, instanceConfig.capabilities)

  return {
    name: overriddenConfig.name || imageConfig.name,
    environment: envs,
    capabilities: caps,
    secrets:
      instanceConfig?.secrets && instanceConfig.secrets.length > 0
        ? instanceConfig.secrets
        : expandKeyToKeyValues(imageConfig.secrets),
    config: mergeExplicitContainerConfig(imageConfig?.config ?? {}, overriddenConfig?.config ?? {}),
  }
}

export const mergeContainerConfig = (
  imageConfig: ContainerConfig,
  overriddenConfig: Partial<InstanceContainerConfig>,
): ContainerConfig => {
  const result = mergeConfigs(imageConfig, overriddenConfig)

  return result as ContainerConfig
}
