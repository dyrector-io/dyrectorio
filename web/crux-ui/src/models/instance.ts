import {
  Capabilities,
  ContainerConfig,
  ContainerState,
  Environment,
  ExplicitContainerConfig,
  ExplicitContainerConfigPort,
  UniqueKey,
  UniqueKeySecretValue,
  UniqueKeyValue,
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

const overrideKeyValues = (weak: UniqueKeyValue[], strong: UniqueKeyValue[]): UniqueKeyValue[] => {
  const overridenKeys: Set<string> = new Set(strong?.map(it => it.key))
  return [...(weak?.filter(it => !overridenKeys.has(it.key)) ?? []), ...(strong ?? [])]
}

const expandKeytoKeyValues = (weak: UniqueKey[]): UniqueKeyValue[] => [
  ...weak.map((it): UniqueKeyValue => ({ id: it.id, key: it.key, value: '' })),
]

const overridePorts = (
  weak: ExplicitContainerConfigPort[],
  strong: ExplicitContainerConfigPort[],
): ExplicitContainerConfigPort[] => {
  const overridenPorts: Set<number> = new Set(strong?.map(it => it.internal))
  return [...(weak?.filter(it => !overridenPorts.has(it.internal)) ?? []), ...(strong ?? [])]
}

const override = <T>(weak: T, strong: T): T => strong ?? weak

const overrideWithDefaultValue = <T>(weak: T, strong: T, defaultValue: T): T => override(weak, strong) ?? defaultValue

const overrideArrays = <T>(weak: T[], strong: T[]): T[] => {
  const strongs: Set<T> = new Set(strong?.map(it => it))
  return [...(weak?.filter(it => !strongs.has(it)) ?? []), ...(strong ?? [])]
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
        : expandKeytoKeyValues(imageConfig.secrets),
    config: {
      ...imageConfig.config,
      ...(instanceConfig.config ?? {}),
      networkMode: overrideWithDefaultValue(
        imageConfig?.config?.networkMode,
        instanceConfig.config?.networkMode,
        'none',
      ),
      deploymentStrategy: overrideWithDefaultValue(
        imageConfig?.config?.deploymentStrategy,
        instanceConfig.config?.deploymentStrategy,
        'recreate',
      ),
      restartPolicy: overrideWithDefaultValue(
        imageConfig?.config?.restartPolicy,
        instanceConfig.config?.restartPolicy,
        'unless_stopped',
      ),
      ports: overridePorts(imageConfig?.config?.ports, instanceConfig.config?.ports),
      user: override(imageConfig?.config?.user, instanceConfig.config?.user),
      tty: override(imageConfig?.config?.tty, instanceConfig.config?.tty),
      useLoadBalancer: override(imageConfig?.config?.useLoadBalancer, instanceConfig.config?.useLoadBalancer),
      portRanges: override(imageConfig?.config?.portRanges, instanceConfig.config?.portRanges),
      args: overrideArrays(imageConfig?.config?.args, instanceConfig.config?.args),
      commands: overrideArrays(imageConfig?.config?.commands, instanceConfig.config?.commands),
      expose: override(imageConfig?.config?.expose, instanceConfig.config?.expose),
      configContainer: override(imageConfig?.config?.configContainer, instanceConfig.config?.configContainer),
      customHeaders: overrideArrays(imageConfig?.config?.customHeaders, instanceConfig.config?.customHeaders),
      proxyHeaders: override(imageConfig?.config?.proxyHeaders, instanceConfig.config?.proxyHeaders),
      extraLBAnnotations: override(imageConfig?.config?.extraLBAnnotations, instanceConfig.config?.extraLBAnnotations),
      ingress: override(imageConfig?.config?.ingress, instanceConfig.config?.ingress),
      volumes: override(imageConfig?.config?.volumes, instanceConfig.config?.volumes),
      logConfig: override(imageConfig?.config?.logConfig, instanceConfig.config?.logConfig),
      healthCheckConfig: override(imageConfig?.config?.healthCheckConfig, instanceConfig.config?.healthCheckConfig),
      importContainer: override(imageConfig?.config?.importContainer, instanceConfig.config?.importContainer),
      resourceConfig: override(imageConfig?.config?.resourceConfig, instanceConfig.config?.resourceConfig),
      initContainers: override(imageConfig?.config?.initContainers, instanceConfig.config?.initContainers),
    },
  }
}

export const mergeContainerConfig = (
  imageConfig: ContainerConfig,
  overriddenConfig: Partial<InstanceContainerConfig>,
): ContainerConfig => {
  const result = mergeConfigs(imageConfig, overriddenConfig)

  return result as ContainerConfig
}
