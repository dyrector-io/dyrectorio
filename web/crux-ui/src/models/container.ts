import { v4 as uuid } from 'uuid'

export type ContainerState = 'created' | 'restarting' | 'running' | 'removing' | 'paused' | 'exited' | 'dead'

export type Container = {
  id: string
  name: string
  date: string
  state: ContainerState
}

export type UniqueKey = {
  id: string
  key: string
}

export type UniqueKeyValue = {
  id: string
  key: string
  value: string
}

export type KeyValue = {
  key: string
  value: string
}

export type UniqueSecretKey = UniqueKeyValue & {
  required: boolean
}

export type UniqueSecretKeyValue = UniqueKeyValue & {
  publicKey: string
  required: boolean
  encrypted?: boolean
}

export type ContainerConfigPort = {
  id: string
  internal: number
  external: number
}

export type PortRange = {
  from: number
  to: number
}

export type ContainerConfigPortRange = {
  id: string
  internal: PortRange
  external: PortRange
}

export type JsonKeyValue = { [key: string]: string }

export const CONTAINER_NETWORK_MODE_VALUES = ['none', 'host', 'bridge', 'overlay', 'ipvlan', 'macvlan'] as const
export type ContainerNetworkMode = typeof CONTAINER_NETWORK_MODE_VALUES[number]

export const CONTAINER_RESTART_POLICY_TYPE_VALUES = ['undefined', 'always', 'unlessStopped', 'no', 'onFailure'] as const
export type ContainerRestartPolicyType = typeof CONTAINER_RESTART_POLICY_TYPE_VALUES[number]

export const CONTAINER_DEPLOYMENT_STRATEGY_VALUES = ['unknown', 'recreate', 'rolling'] as const
export type ContainerDeploymentStrategyType = typeof CONTAINER_DEPLOYMENT_STRATEGY_VALUES[number]

export const CONTAINER_EXPOSE_STRATEGY_VALUES = ['none', 'expose', 'exposeWithTls'] as const
export type ContainerConfigExposeStrategy = typeof CONTAINER_EXPOSE_STRATEGY_VALUES[number]

export const CONTAINER_VOLUME_TYPE_VALUES = ['ro', 'rw', 'rwx', 'mem', 'tmp'] as const
export type VolumeType = typeof CONTAINER_VOLUME_TYPE_VALUES[number]

export type ContainerConfigIngress = {
  name: string
  host: string
  uploadLimitInBytes?: string
}

export type ContainerConfigVolume = {
  id: string
  name: string
  path: string
  size?: string
  type?: VolumeType
  class?: string
}

export const CONTAINER_LOG_DRIVER_VALUES = [
  'none',
  'gcplogs',
  'local',
  'json-file',
  'syslog',
  'journald',
  'gelf',
  'fluentd',
  'awslogs',
  'splunk',
  'etwlogs',
  'logentries',
] as const
export type ContainerLogDriverType = typeof CONTAINER_LOG_DRIVER_VALUES[number]

export type ContainerConfigLog = {
  driver: ContainerLogDriverType
  options: UniqueKeyValue[]
}

export type ContainerConfigHealthCheck = {
  port?: number
  livenessProbe?: string
  readinessProbe?: string
  startupProbe?: string
}

export type ContainerConfigResource = {
  cpu?: string
  memory?: string
}

export type ContainerConfigResourceConfig = {
  limits?: ContainerConfigResource
  requests?: ContainerConfigResource
}

export type ContainerConfigContainer = {
  image: string
  volume: string
  path: string
  keepFiles: boolean
}

export type ContainerConfigImportContainer = {
  environment: UniqueKeyValue[]
  volume: string
  command: string
}

export type InitContainerVolumeLink = {
  id: string
  name: string
  path: string
}

export type InitContainer = {
  id: string
  name: string
  image: string
  command?: UniqueKey[]
  args?: UniqueKey[]
  environment?: UniqueKeyValue[]
  useParentConfig?: boolean
  volumes?: InitContainerVolumeLink[]
}

export type ContainerConfig = {
  // common
  name?: string
  environment?: UniqueKeyValue[]
  secrets?: UniqueSecretKeyValue[]
  ingress?: ContainerConfigIngress
  expose?: ContainerConfigExposeStrategy
  user?: number
  tty?: boolean
  importContainer?: ContainerConfigImportContainer
  configContainer?: ContainerConfigContainer
  ports?: ContainerConfigPort[]
  portRanges?: ContainerConfigPortRange[]
  volumes?: ContainerConfigVolume[]
  commands?: UniqueKey[]
  args?: UniqueKey[]
  initContainers?: InitContainer[]
  capabilities: UniqueKeyValue[]

  // dagent
  logConfig?: ContainerConfigLog
  restartPolicy?: ContainerRestartPolicyType
  networkMode?: ContainerNetworkMode
  networks?: UniqueKey[]

  // crane
  deploymentStrategy?: ContainerDeploymentStrategyType
  customHeaders?: UniqueKey[]
  proxyHeaders?: boolean
  useLoadBalancer?: boolean
  extraLBAnnotations?: UniqueKeyValue[]
  healthCheckConfig?: ContainerConfigHealthCheck
  resourceConfig?: ContainerConfigResourceConfig
}

export type JsonInitContainer = {
  name: string
  image: string
  command?: string[]
  args?: string[]
  environment?: JsonKeyValue
  useParentConfig?: boolean
  volumes?: JsonInitContainerVolumeLink[]
}

export type JsonContainerConfigLog = {
  driver: ContainerLogDriverType
  options: JsonKeyValue
}

export type JsonContainerConfigImportContainer = Omit<ContainerConfigImportContainer, 'environment'> & {
  environment: JsonKeyValue
}

export type JsonInitContainerVolumeLink = Omit<InitContainerVolumeLink, 'id'>
export type JsonContainerConfigPortRange = Omit<ContainerConfigPortRange, 'id'>
export type JsonContainerConfigPort = Omit<ContainerConfigPort, 'id'>
export type JsonContainerConfigVolume = Omit<ContainerConfigVolume, 'id'>

export type JsonContainerConfigSecret = {
  key: string
  required?: boolean
}

export type JsonContainerConfig = {
  // common
  name?: string
  environment?: JsonKeyValue
  secrets?: JsonContainerConfigSecret[]
  ingress?: ContainerConfigIngress
  expose?: ContainerConfigExposeStrategy
  user?: number
  tty?: boolean
  importContainer?: JsonContainerConfigImportContainer
  configContainer?: ContainerConfigContainer
  ports?: JsonContainerConfigPort[]
  portRanges?: JsonContainerConfigPortRange[]
  volumes?: JsonContainerConfigVolume[]
  commands?: string[]
  args?: string[]
  initContainers?: JsonInitContainer[]
  capabilities?: JsonKeyValue

  // dagent
  logConfig?: JsonContainerConfigLog
  restartPolicy?: ContainerRestartPolicyType
  networkMode?: ContainerNetworkMode
  networks?: string[]

  // crane
  deploymentStrategy?: ContainerDeploymentStrategyType
  customHeaders?: string[]
  proxyHeaders?: boolean
  useLoadBalancer?: boolean
  extraLBAnnotations?: JsonKeyValue
  healthCheckConfig?: ContainerConfigHealthCheck
  resourceConfig?: ContainerConfigResourceConfig
}

export type InstanceJsonContainerConfig = Omit<JsonContainerConfig, 'secrets'>

type DagentSpecificConfig = 'logConfig' | 'restartPolicy' | 'networkMode' | 'networks'
type CraneSpecificConfig =
  | 'deploymentStrategy'
  | 'customHeaders'
  | 'proxyHeaders'
  | 'useLoadBalancer'
  | 'extraLBAnnotations'
  | 'healthCheckConfig'
  | 'resourceConfig'

export type DagentConfigDetails = Pick<ContainerConfig, DagentSpecificConfig>
export type CraneConfigDetails = Pick<ContainerConfig, CraneSpecificConfig>
export type CommonConfigDetails = Omit<ContainerConfig, DagentSpecificConfig | CraneSpecificConfig>

export type JsonConfig = InstanceJsonContainerConfig | JsonContainerConfig

const overrideKeyValues = (weak: UniqueKeyValue[], strong: UniqueKeyValue[]): UniqueKeyValue[] => {
  const overridenKeys: Set<string> = new Set(strong?.map(it => it.key))
  return [...(weak?.filter(it => !overridenKeys.has(it.key)) ?? []), ...(strong ?? [])]
}

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

  const envs = overrideKeyValues(imageConfig.environment, instanceConfig.environment)
  const caps = overrideKeyValues(imageConfig.capabilities, instanceConfig.capabilities)

  return {
    // common
    name: instanceConfig.name || imageConfig.name,
    environment: envs,
    secrets: instanceConfig?.secrets ? instanceConfig.secrets : imageConfig.secrets,
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

    // crane
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

    // dagent
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

const keyValueArrayToJson = (list: UniqueKeyValue[]): JsonKeyValue =>
  list?.reduce((prev, it) => ({ ...prev, [it.key]: it.value }), {})

const keyArrayToJson = (list: UniqueKey[]): string[] => list?.map(it => it.key)

const simplify = <T>(item: T): Omit<T, 'id'> => {
  const newItem: any = { ...item }
  delete newItem.id

  return newItem
}

export const imageConfigToJsonContainerConfig = (imageConfig: ContainerConfig): JsonContainerConfig => {
  const config: JsonContainerConfig = {
    ...imageConfig,
    commands: keyArrayToJson(imageConfig.commands),
    args: keyArrayToJson(imageConfig.args),
    networks: keyArrayToJson(imageConfig.networks),
    customHeaders: keyArrayToJson(imageConfig.customHeaders),
    extraLBAnnotations: keyValueArrayToJson(imageConfig.extraLBAnnotations),
    environment: keyValueArrayToJson(imageConfig.environment),
    capabilities: keyValueArrayToJson(imageConfig.capabilities),
    secrets: imageConfig.secrets?.map(it => ({ key: it.key, required: it.required })),
    portRanges: imageConfig.portRanges?.map(it => simplify(it)),
    ports: imageConfig.ports?.map(it => simplify(it)),
    logConfig: imageConfig.logConfig
      ? {
          ...imageConfig.logConfig,
          options: keyValueArrayToJson(imageConfig.logConfig?.options),
        }
      : null,
    initContainers: imageConfig.initContainers?.map(it =>
      simplify({
        ...it,
        command: keyArrayToJson(it.command),
        args: keyArrayToJson(it.args),
        environment: keyValueArrayToJson(it.environment),
        volumes: it.volumes?.map(vit => simplify(vit)),
      } as JsonInitContainer),
    ),
    importContainer: imageConfig.importContainer
      ? {
          ...imageConfig.importContainer,
          environment: keyValueArrayToJson(imageConfig.importContainer?.environment),
        }
      : null,
    volumes: imageConfig.volumes?.map(it => simplify(it)),
  }

  return config
}

export const imageConfigToJsonInstanceConfig = (imageConfig: ContainerConfig): InstanceJsonContainerConfig => {
  const config = imageConfigToJsonContainerConfig(imageConfig)

  delete config.secrets

  return config as InstanceJsonContainerConfig
}

const mergeKeyValuesWithJson = (items: UniqueKeyValue[], json: JsonKeyValue): UniqueKeyValue[] => {
  if (!json || Object.keys(json).length < 1) {
    return []
  }

  let modified = false
  const result = []
  const jsonKeys = Object.keys(json)

  jsonKeys.forEach(key => {
    const value = json[key]

    const byKey = items.find(it => it.key === key)
    if (!byKey) {
      const byValue = items.find(it => it.value === value)

      result.push({
        key,
        value,
        id: byValue?.id ?? uuid(),
      })

      modified = true
    } else {
      if (byKey.value !== value) {
        modified = true
      }

      result.push({
        key,
        value,
        id: byKey.id,
      })
    }
  })

  const removed = items.filter(it => !jsonKeys.includes(it.key))
  if (removed.length > 0) {
    modified = true
  }

  return modified ? result : items
}

const mergeKeysWithJson = (items: UniqueKey[], json: string[]): UniqueKey[] => {
  if (!json || Object.entries(json).length < 1) {
    return []
  }

  let modified = false
  const result = []
  json.forEach(entry => {
    const byKey = items.find(it => it.key === entry)
    if (!byKey) {
      result.push({
        key: entry,
        id: uuid(),
      })

      modified = true
    } else {
      if (byKey.key !== entry) {
        modified = true
      }

      result.push({
        key: entry,
        id: byKey.id,
      })
    }
  })

  const jsonKeys = Object.keys(json)
  const removed = items.filter(it => !jsonKeys.includes(it.key))
  if (removed.length > 0) {
    modified = true
  }

  return modified ? result : items
}

export const mergeJsonConfigToContainerConfig = (
  serialized: ContainerConfig,
  json: JsonConfig,
): Partial<ContainerConfig> => {
  const config = {
    ...serialized,
    ...json,
    environment: mergeKeyValuesWithJson(serialized.environment, json.environment),
    extraLBAnnotations: mergeKeyValuesWithJson(serialized.extraLBAnnotations, json.extraLBAnnotations),
    capabilities: mergeKeyValuesWithJson(serialized.capabilities, json.capabilities),
    commands: mergeKeysWithJson(serialized.commands, json.commands),
    customHeaders: mergeKeysWithJson(serialized.customHeaders, json.customHeaders),
    networks: mergeKeysWithJson(serialized.networks, json.networks),
    args: mergeKeysWithJson(serialized.args, json.args),
    logConfig: json.logConfig
      ? {
          ...json.logConfig,
          options: mergeKeyValuesWithJson(serialized.logConfig?.options, json.logConfig?.options),
        }
      : null,
    initContainers: json.initContainers?.map(it => {
      const index = serialized.initContainers?.map(iit => iit.name).indexOf(it.name)

      if (index !== -1) {
        const prev = serialized.initContainers[index]

        return {
          ...prev,
          args: mergeKeysWithJson(prev.args, it.args),
          command: mergeKeysWithJson(prev.command, it.command),
          environment: mergeKeyValuesWithJson(prev.environment, it.environment),
          volumes: it.volumes?.map(vit => {
            const volumeIndex = prev.volumes?.map(pv => pv.name).indexOf(vit.name)
            const id = volumeIndex !== -1 ? prev.volumes[volumeIndex].id : uuid()

            return {
              ...vit,
              id,
            } as InitContainerVolumeLink
          }),
        } as InitContainer
      }

      return {
        ...it,
        id: uuid(),
        command: it.command?.map(cit => ({ id: uuid(), key: cit })),
        args: it.args ? it.args?.map(ait => ({ id: uuid(), key: ait })) : [],
        environment: Object.keys(it.environment ?? {}).map(eit => ({
          key: eit,
          value: it.environment[eit],
          id: uuid(),
        })),
        volumes: it.volumes?.map(vit => ({ ...vit, id: uuid() })),
      } as InitContainer
    }),
    ports: json.ports?.map(it => ({
      ...it,
      id: uuid(),
    })),
    portRanges: json.portRanges?.map(it => ({
      ...it,
      id: uuid(),
    })),
  } as Partial<ContainerConfig>

  if ((json as JsonContainerConfig).secrets) {
    config.secrets = (json as JsonContainerConfig).secrets.map(it => {
      const prev = serialized.secrets?.map(sit => sit.key).indexOf(it.key)

      return {
        id: prev !== -1 ? serialized.secrets[prev].id : uuid(),
        key: it.key,
        value: '',
        required: it.required ?? false,
      }
    })
  }

  return config
}
