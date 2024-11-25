import { v4 as uuid } from 'uuid'
import { imageName } from './registry'

export const CONTAINER_STATE_VALUES = ['running', 'waiting', 'exited', 'removed'] as const
export type ContainerState = (typeof CONTAINER_STATE_VALUES)[number]

export type ContainerPort = {
  internal: number
  external: number
}

export type ContainerIdentifier = {
  prefix?: string
  name: string
}

export type Container = {
  id: ContainerIdentifier
  imageName: string
  imageTag: string
  createdAt: string
  state: ContainerState
  reason: string // kubernetes reason (like crashloop backoff) or docker state
  ports: ContainerPort[]
  labels: Record<string, string>
}

export type ContainerOperation = 'start' | 'stop' | 'restart'

export type ContainerCommand = {
  container: ContainerIdentifier
  operation: ContainerOperation
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

export type UniqueSecretKey = UniqueKey & {
  required: boolean
}

export type UniqueSecretKeyValue = UniqueSecretKey &
  UniqueKeyValue & {
    publicKey?: string
    encrypted: boolean
  }

export type Port = {
  id: string
  internal: number
  external?: number
}

export type PortRange = {
  from: number
  to: number
}

export type ContainerPortRange = {
  id: string
  internal: PortRange
  external: PortRange
}

export type JsonKeyValue = { [key: string]: string }

export const CONTAINER_NETWORK_MODE_VALUES = ['none', 'host', 'bridge'] as const
export type ContainerNetworkMode = (typeof CONTAINER_NETWORK_MODE_VALUES)[number]

export const CONTAINER_RESTART_POLICY_TYPE_VALUES = ['always', 'unlessStopped', 'no', 'onFailure'] as const
export type ContainerRestartPolicyType = (typeof CONTAINER_RESTART_POLICY_TYPE_VALUES)[number]

export const CONTAINER_DEPLOYMENT_STRATEGY_VALUES = ['recreate', 'rolling'] as const
export type ContainerDeploymentStrategyType = (typeof CONTAINER_DEPLOYMENT_STRATEGY_VALUES)[number]

export const CONTAINER_EXPOSE_STRATEGY_VALUES = ['none', 'expose', 'exposeWithTls'] as const
export type ContainerConfigExposeStrategy = (typeof CONTAINER_EXPOSE_STRATEGY_VALUES)[number]

export const CONTAINER_VOLUME_TYPE_VALUES = ['ro', 'rwo', 'rwx', 'mem', 'tmp'] as const
export type VolumeType = (typeof CONTAINER_VOLUME_TYPE_VALUES)[number]

export type ContainerConfigRouting = {
  domain?: string
  path?: string
  stripPath?: boolean
  uploadLimit?: string
  port?: number
}

export type Volume = {
  id: string
  name: string
  path: string
  size?: string
  type?: VolumeType
  class?: string
}

export const CONTAINER_LOG_DRIVER_VALUES = [
  'nodeDefault',
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
export type ContainerLogDriverType = (typeof CONTAINER_LOG_DRIVER_VALUES)[number]

export type Log = {
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

export type ResourceConfig = {
  limits?: ContainerConfigResource
  requests?: ContainerConfigResource
}

export type ContainerConfigContainer = {
  image: string
  volume: string
  path: string
  keepFiles: boolean
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
  command: UniqueKey[]
  args: UniqueKey[]
  environment: UniqueKeyValue[]
  useParentConfig: boolean
  volumes: InitContainerVolumeLink[]
}

export type Marker = {
  service?: UniqueKeyValue[]
  deployment?: UniqueKeyValue[]
  ingress?: UniqueKeyValue[]
}

export type ContainerStorage = {
  storageId?: string
  path?: string
  bucket?: string
}

export type Metrics = {
  enabled: boolean
  path?: string
  port?: number
}

export type ExpectedContainerState = {
  state: ContainerState
  timeout?: number
  exitCode?: number
}

export type ContainerConfigType = 'image' | 'instance' | 'deployment' | 'config-bundle'
export type ContainerConfigSectionType = 'base' | 'concrete'

export type ContainerConfig = (ContainerConfigData | ConcreteContainerConfigData) & {
  id: string
  type: ContainerConfigType
}

export type ContainerConfigDataWithId = ContainerConfig

export type ContainerConfigData = {
  // common
  name?: string
  environment?: UniqueKeyValue[]
  secrets?: UniqueSecretKey[]
  routing?: ContainerConfigRouting
  expose?: ContainerConfigExposeStrategy
  user?: number
  workingDirectory?: string
  tty?: boolean
  configContainer?: ContainerConfigContainer
  ports?: Port[]
  portRanges?: ContainerPortRange[]
  volumes?: Volume[]
  commands?: UniqueKey[]
  args?: UniqueKey[]
  initContainers?: InitContainer[]
  capabilities?: UniqueKeyValue[]
  storage?: ContainerStorage

  // dagent
  logConfig?: Log
  restartPolicy?: ContainerRestartPolicyType
  networkMode?: ContainerNetworkMode
  networks?: UniqueKey[]
  dockerLabels?: UniqueKeyValue[]
  expectedState?: ExpectedContainerState

  // crane
  deploymentStrategy?: ContainerDeploymentStrategyType
  customHeaders?: UniqueKey[]
  proxyHeaders?: boolean
  useLoadBalancer?: boolean
  extraLBAnnotations?: UniqueKeyValue[]
  healthCheckConfig?: ContainerConfigHealthCheck
  resourceConfig?: ResourceConfig
  annotations?: Marker
  labels?: Marker
  metrics?: Metrics
}

export const COMMON_CONFIG_KEYS = [
  'name',
  'environment',
  'secrets',
  'routing',
  'expose',
  'user',
  'tty',
  'workingDirectory',
  'configContainer',
  'ports',
  'portRanges',
  'volumes',
  'commands',
  'args',
  'initContainers',
  'storage',
] as const

export const CRANE_CONFIG_KEYS = [
  'deploymentStrategy',
  'customHeaders',
  'proxyHeaders',
  'useLoadBalancer',
  'extraLBAnnotations',
  'healthCheckConfig',
  'resourceConfig',
  'labels',
  'annotations',
  'metrics',
] as const

export const DAGENT_CONFIG_KEYS = [
  'logConfig',
  'restartPolicy',
  'networkMode',
  'networks',
  'dockerLabels',
  'expectedState',
] as const

export const CONTAINER_CONFIG_KEYS = [...COMMON_CONFIG_KEYS, ...CRANE_CONFIG_KEYS, ...DAGENT_CONFIG_KEYS] as const

export type CommonConfigKey = (typeof COMMON_CONFIG_KEYS)[number]
export type CraneConfigKey = (typeof CRANE_CONFIG_KEYS)[number]
export type DagentConfigKey = (typeof DAGENT_CONFIG_KEYS)[number]
export type ContainerConfigKey = (typeof CONTAINER_CONFIG_KEYS)[number]

export type ConcreteContainerConfigData = Omit<ContainerConfigData, 'secrets'> & {
  secrets?: UniqueSecretKeyValue[]
}

export type ConcreteContainerConfig = ConcreteContainerConfigData & {
  id: string
  type: ContainerConfigType
}

export const CRANE_CONFIG_FILTER_VALUES = CRANE_CONFIG_KEYS.filter(it => it !== 'extraLBAnnotations')

export type ContainerConfigFilterType = 'all' | 'common' | 'dagent' | 'crane'

export const filterContains = (
  filter: CommonConfigKey | CraneConfigKey | DagentConfigKey,
  filters: ContainerConfigKey[],
): boolean => filters.includes(filter)

export const filterEmpty = (filterValues: string[], filters: ContainerConfigKey[]): boolean =>
  filterValues.filter(x => filters.includes(x as ContainerConfigKey)).length > 0

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

export type JsonMarker = {
  service: JsonKeyValue
  deployment: JsonKeyValue
  ingress: JsonKeyValue
}

export type JsonInitContainerVolumeLink = Omit<InitContainerVolumeLink, 'id'>
export type JsonContainerConfigPortRange = Omit<ContainerPortRange, 'id'>
export type JsonContainerConfigPort = Omit<Port, 'id'>
export type JsonContainerConfigVolume = Omit<Volume, 'id'>
export type JsonContainerConfigSecretKey = Omit<UniqueSecretKey, 'id'>

export type JsonContainerConfig = {
  // common
  name?: string
  environment?: JsonKeyValue
  secrets?: JsonContainerConfigSecretKey[]
  routing?: ContainerConfigRouting
  expose?: ContainerConfigExposeStrategy
  user?: number
  workingDirectory?: string
  tty?: boolean
  configContainer?: ContainerConfigContainer
  ports?: JsonContainerConfigPort[]
  portRanges?: JsonContainerConfigPortRange[]
  volumes?: JsonContainerConfigVolume[]
  commands?: string[]
  args?: string[]
  initContainers?: JsonInitContainer[]
  capabilities?: JsonKeyValue
  storage?: ContainerStorage
  expectedState?: ExpectedContainerState

  // dagent
  logConfig?: JsonContainerConfigLog
  restartPolicy?: ContainerRestartPolicyType
  networkMode?: ContainerNetworkMode
  networks?: string[]
  dockerLabels?: JsonKeyValue

  // crane
  deploymentStrategy?: ContainerDeploymentStrategyType
  customHeaders?: string[]
  proxyHeaders?: boolean
  useLoadBalancer?: boolean
  extraLBAnnotations?: JsonKeyValue
  healthCheckConfig?: ContainerConfigHealthCheck
  resourceConfig?: ResourceConfig
  annotations?: JsonMarker
  labels?: JsonMarker
}

export type ConcreteJsonContainerConfig = Omit<JsonContainerConfig, 'secrets'>

export const stringResettable = (base: string, concrete: string): boolean => {
  if (!concrete) {
    return false
  }

  if (!base) {
    return true
  }

  return base !== concrete
}

export const numberResettable = (base: number, concrete: number): boolean => {
  if (typeof concrete !== 'number') {
    return false
  }

  if (typeof base !== 'number') {
    return true
  }

  return base !== concrete
}

export const booleanResettable = (base: boolean, concrete: boolean): boolean => {
  if (typeof concrete !== 'boolean') {
    return false
  }

  if (typeof base !== 'boolean') {
    return true
  }

  return base !== concrete
}

const keyValueArrayToJson = (list: UniqueKeyValue[]): JsonKeyValue =>
  list?.reduce((prev, it) => ({ ...prev, [it.key]: it.value }), {})

const keyArrayToJson = (list: UniqueKey[]): string[] => list?.map(it => it.key)

const removeId = <T extends { id: string }>(item: T): Omit<T, 'id'> => {
  const newItem: T = { ...item }
  delete newItem.id

  return newItem
}

export const containerConfigToJsonConfig = (config: ContainerConfigData): JsonContainerConfig => ({
  // common
  name: config.name,
  environment: keyValueArrayToJson(config.environment),
  // secrets are ommited
  routing: config.routing,
  expose: config.expose,
  user: config.user,
  workingDirectory: config.workingDirectory,
  tty: config.tty,
  configContainer: config.configContainer,
  ports: config.ports?.map(it => removeId(it)),
  portRanges: config.portRanges?.map(it => removeId(it)),
  volumes: config.volumes?.map(it => removeId(it)),
  commands: keyArrayToJson(config.commands),
  args: keyArrayToJson(config.args),
  initContainers: config.initContainers?.map(container => ({
    ...removeId(container),
    command: keyArrayToJson(container.command),
    args: keyArrayToJson(container.args),
    environment: keyValueArrayToJson(container.environment),
    volumes: container.volumes?.map(vit => removeId(vit)),
  })),
  capabilities: keyValueArrayToJson(config.capabilities),
  storage: config.storage,

  // dagent
  logConfig: config.logConfig
    ? {
        ...config.logConfig,
        options: keyValueArrayToJson(config.logConfig?.options),
      }
    : null,
  restartPolicy: config.restartPolicy,
  networkMode: config.networkMode,
  networks: keyArrayToJson(config.networks),
  dockerLabels: keyValueArrayToJson(config.dockerLabels),
  expectedState: config.expectedState,

  // crane
  deploymentStrategy: config.deploymentStrategy,
  customHeaders: keyArrayToJson(config.customHeaders),
  proxyHeaders: config.proxyHeaders,
  useLoadBalancer: config.useLoadBalancer,
  extraLBAnnotations: keyValueArrayToJson(config.extraLBAnnotations),
  healthCheckConfig: config.healthCheckConfig,
  resourceConfig: config.resourceConfig,
  annotations: config.annotations
    ? {
        deployment: keyValueArrayToJson(config.annotations.deployment),
        service: keyValueArrayToJson(config.annotations.service),
        ingress: keyValueArrayToJson(config.annotations.ingress),
      }
    : null,
  labels: config.labels
    ? {
        deployment: keyValueArrayToJson(config.labels.deployment),
        service: keyValueArrayToJson(config.labels.service),
        ingress: keyValueArrayToJson(config.labels.ingress),
      }
    : null,
})

export const concreteContainerConfigToJsonConfig = (config: ConcreteContainerConfig): ConcreteJsonContainerConfig => {
  const json = containerConfigToJsonConfig(config)

  delete json.secrets

  return json
}

const mergeKeyValuesWithJson = (items: UniqueKeyValue[], json: JsonKeyValue): UniqueKeyValue[] => {
  items = items ?? []

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
  items = items ?? []

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

const mergeSecretsWithJson = (secrets: UniqueSecretKey[], json: JsonContainerConfigSecretKey[]): UniqueSecretKey[] => {
  secrets = secrets ?? []

  json?.forEach(it => {
    const index = secrets.findIndex(sec => sec.key === it.key)

    if (index > -1) {
      const sec = secrets[index]
      secrets[index] = {
        ...sec,
        ...it,
      }
    } else {
      secrets.push({
        ...it,
        id: uuid(),
      })
    }
  })

  return secrets
}

const mergeInitContainersWithJson = (containers: InitContainer[], json: JsonInitContainer[]): InitContainer[] => {
  if (!json) {
    return containers ?? []
  }

  containers = containers ?? []

  json?.forEach(cont => {
    const contIndex = containers.findIndex(it => it.name === cont.name)

    if (contIndex > -1) {
      const current = containers[contIndex]

      containers[contIndex] = {
        ...current,
        args: mergeKeysWithJson(current.args, cont.args),
        command: mergeKeysWithJson(current.command, cont.command),
        environment: mergeKeyValuesWithJson(current.environment, cont.environment),
        volumes: cont.volumes?.map(volume => {
          const currentVol = current.volumes?.find(it => it.name === volume.name)

          return {
            ...volume,
            id: currentVol?.id ?? uuid(),
          }
        }),
      }
    } else {
      containers.push({
        ...cont,
        id: uuid(),
        command: cont.command?.map(it => ({ id: uuid(), key: it })) ?? [],
        args: cont.args?.map(it => ({ id: uuid(), key: it })) ?? [],
        environment:
          Object.keys(cont.environment ?? {}).map(it => ({
            key: it,
            value: cont.environment[it],
            id: uuid(),
          })) ?? [],
        useParentConfig: cont.useParentConfig ?? false,
        volumes: cont.volumes?.map(it => ({ ...it, id: uuid() })) ?? [],
      })
    }
  })

  return containers
}

export const mergeJsonConfigToConcreteContainerConfig = (
  config: ConcreteContainerConfig,
  json: ConcreteJsonContainerConfig,
): ConcreteContainerConfig => {
  const result: ConcreteContainerConfig = {
    ...config,
    ...json,
    environment: mergeKeyValuesWithJson(config.environment, json.environment),
    extraLBAnnotations: mergeKeyValuesWithJson(config.extraLBAnnotations, json.extraLBAnnotations),
    capabilities: mergeKeyValuesWithJson(config.capabilities, json.capabilities),
    commands: mergeKeysWithJson(config.commands, json.commands),
    customHeaders: mergeKeysWithJson(config.customHeaders, json.customHeaders),
    networks: mergeKeysWithJson(config.networks, json.networks),
    args: mergeKeysWithJson(config.args, json.args),
    logConfig: json.logConfig
      ? {
          ...config.logConfig,
          ...json.logConfig,
          options: mergeKeyValuesWithJson(config.logConfig?.options, json.logConfig?.options),
        }
      : null,
    initContainers: mergeInitContainersWithJson(config.initContainers, json.initContainers),
    ports: !json.ports
      ? []
      : json.ports.map(it => ({
          ...it,
          id: uuid(),
        })),
    portRanges: !json.portRanges
      ? []
      : json.portRanges.map(it => ({
          ...it,
          id: uuid(),
        })),
    dockerLabels: mergeKeyValuesWithJson(config.dockerLabels, json.dockerLabels),
    labels: json.labels
      ? {
          deployment: mergeKeyValuesWithJson(config.labels?.deployment, json.labels.deployment),
          service: mergeKeyValuesWithJson(config.labels?.service, json.labels.service),
          ingress: mergeKeyValuesWithJson(config.labels?.ingress, json.labels.ingress),
        }
      : null,
    annotations: json.annotations
      ? {
          deployment: mergeKeyValuesWithJson(config.annotations?.deployment, json.annotations.deployment),
          service: mergeKeyValuesWithJson(config.annotations?.service, json.annotations.service),
          ingress: mergeKeyValuesWithJson(config.annotations?.ingress, json.annotations.ingress),
        }
      : null,
    volumes: json.volumes
      ? json.volumes.map(volume => {
          const currentVol = config.volumes?.find(it => it.name === volume.name)

          return {
            ...volume,
            id: currentVol?.id ?? uuid(),
          }
        })
      : null,
  }

  return result
}

export const mergeJsonWithContainerConfig = (config: ContainerConfig, json: JsonContainerConfig): ContainerConfig => {
  const concreteConfig: ConcreteContainerConfig = {
    ...config,
    secrets: null,
  }

  const mergedConf = mergeJsonConfigToConcreteContainerConfig(concreteConfig, json)
  return {
    ...config,
    ...mergedConf,
    secrets: mergeSecretsWithJson(config.secrets, json.secrets),
  }
}

export const portToString = (port: ContainerPort): string => {
  const { internal, external } = port

  if (internal && external) {
    return `${external}->${internal}`
  }

  if (internal) {
    return `None->${internal}`
  }

  if (external) {
    return `${external}->None`
  }

  return '?'
}

export const containerPortsToString = (ports: ContainerPort[], truncateAfter: number = 2): string => {
  ports = ports.sort((one, other) => one.internal - other.internal)

  const result: string[] = []

  truncateAfter = Math.min(ports.length, truncateAfter + 1)

  let start: ContainerPort = null
  let end: ContainerPort = null
  let next: string = null
  for (let index = 0; index < truncateAfter && result.length < truncateAfter; index++) {
    const port = ports[index]

    if (!start) {
      start = port
      end = port
      next = portToString(start)
    } else if (port.internal - 1 === end.internal) {
      end = port
      next = `${portToString(start)}-${portToString(end)}`
    } else {
      result.push(next)

      start = port
      end = port
      next = portToString(start)
    }
  }

  if (next && result.length < truncateAfter) {
    result.push(next)
  }

  return result.join(', ')
}

export const imageNameOfContainer = (container: Container): string => imageName(container.imageName, container.imageTag)
export const containerPrefixNameOf = (id: ContainerIdentifier): string =>
  !id.prefix ? id.name : `${id.prefix}-${id.name}`

export const containerIsStartable = (state: ContainerState) => state === 'exited'
export const containerIsStopable = (state: ContainerState) => state === 'running'
export const containerIsRestartable = (state: ContainerState) => state === 'running'

export const serviceCategoryIsHidden = (it: string | null) => it && it.startsWith('_')
export const kubeNamespaceIsSystem = (it: string | null) => it && it === 'kube-system'
export const containerIsHidden = (it: Container) => {
  const serviceCategory = it.labels['org.dyrectorio.service-category']
  const kubeNamespace = it.labels['io.kubernetes.pod.namespace']

  return serviceCategoryIsHidden(serviceCategory) || kubeNamespaceIsSystem(kubeNamespace)
}

export const containerConfigTypeToSectionType = (type: ContainerConfigType): ContainerConfigSectionType => {
  if (type === 'instance' || type === 'deployment') {
    return 'concrete'
  }

  return 'base'
}
