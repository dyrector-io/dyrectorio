import { ContainerConfig, ContainerConfigPort, ContainerState, UniqueKey, UniqueKeyValue } from './container'
import { VersionImage } from './image'

export type InstanceStatus = {
  instanceId: string
  state: ContainerState
}

export type Instance = {
  id: string
  image: VersionImage
  state?: ContainerState
  publicKey?: string
  overriddenConfig?: Partial<ContainerConfig>
}

export type PatchInstance = {
  instanceId: string
  config: Partial<ContainerConfig>
}

const overrideKeyValues = (weak: UniqueKeyValue[], strong: UniqueKeyValue[]): UniqueKeyValue[] => {
  const overridenKeys: Set<string> = new Set(strong?.map(it => it.key))
  return [...(weak?.filter(it => !overridenKeys.has(it.key)) ?? []), ...(strong ?? [])]
}

const expandKeytoKeyValues = (weak: UniqueKey[]): UniqueKeyValue[] => [
  ...weak.map((it): UniqueKeyValue => ({ id: it.id, key: it.key, value: '' })),
]

const overridePorts = (weak: ContainerConfigPort[], strong: ContainerConfigPort[]): ContainerConfigPort[] => {
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
  overriddenConfig: Partial<ContainerConfig>,
): ContainerConfig => {
  const instanceConfig = overriddenConfig ?? {}

  const envs = overrideKeyValues(imageConfig.environments, instanceConfig.environments)
  const caps = overrideKeyValues(imageConfig.capabilities, instanceConfig.capabilities)

  return {
    //common
    name: overriddenConfig.name || imageConfig.name,
    environments: envs,
    secrets:
      instanceConfig?.secrets && instanceConfig.secrets.length > 0
        ? instanceConfig.secrets
        : expandKeytoKeyValues(imageConfig.secrets),
    ports: overridePorts(imageConfig?.ports, instanceConfig.ports),
    user: override(imageConfig?.user, instanceConfig.user),
    tty: override(imageConfig?.tty, instanceConfig.tty),
    portRanges: override(imageConfig?.portRanges, instanceConfig.portRanges),
    args: overrideArrays(imageConfig?.args, instanceConfig.args),
    commands: overrideArrays(imageConfig?.commands, instanceConfig.commands),
    expose: override(imageConfig?.expose, instanceConfig.expose),
    configContainer: override(imageConfig?.configContainer, instanceConfig.configContainer),
    ingress: override(imageConfig?.ingress, instanceConfig.ingress),
    volumes: override(imageConfig?.volumes, instanceConfig.volumes),
    importContainer: override(imageConfig?.importContainer, instanceConfig.importContainer),
    initContainers: override(imageConfig?.initContainers, instanceConfig.initContainers),
    capabilities: caps,

    //crane
    customHeaders: overrideArrays(imageConfig?.customHeaders, instanceConfig?.customHeaders),
    proxyHeaders: override(imageConfig?.proxyHeaders, instanceConfig?.proxyHeaders),
    extraLBAnnotations: override(imageConfig?.extraLBAnnotations, instanceConfig?.extraLBAnnotations),
    healthCheckConfig: override(imageConfig?.healthCheckConfig, instanceConfig?.healthCheckConfig),
    resourceConfig: override(imageConfig?.resourceConfig, instanceConfig?.resourceConfig),
    useLoadBalancer: override(imageConfig?.useLoadBalancer, instanceConfig?.useLoadBalancer),
    deploymentStrategy: overrideWithDefaultValue(
      imageConfig?.deploymentStrategy,
      instanceConfig?.deploymentStrategy,
      'recreate',
    ),

    //dagent
    logConfig: override(imageConfig?.logConfig, instanceConfig?.logConfig),
    networkMode: overrideWithDefaultValue(imageConfig?.networkMode, instanceConfig?.networkMode, 'none'),
    restartPolicy: overrideWithDefaultValue(imageConfig?.restartPolicy, instanceConfig?.restartPolicy, 'unlessStopped'),
    networks: overrideArrays(imageConfig?.networks, instanceConfig?.networks),
  }
}

export const mergeContainerConfig = (
  imageConfig: ContainerConfig,
  overriddenConfig: Partial<ContainerConfig>,
): ContainerConfig => {
  const result = mergeConfigs(imageConfig, overriddenConfig)

  return result as ContainerConfig
}
