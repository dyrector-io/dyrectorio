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
  'args',
  'commands',
  'configContainer',
  'name',
  'environment',
  'expose',
  'initContainers',
  'portRanges',
  'ports',
  'routing',
  'secrets',
  'storage',
  'tty',
  'user',
  'volumes',
  'workingDirectory',
] as const

export const CRANE_CONFIG_KEYS = [
  'annotations',
  'customHeaders',
  'deploymentStrategy',
  'extraLBAnnotations',
  'healthCheckConfig',
  'labels',
  'metrics',
  'proxyHeaders',
  'resourceConfig',
  'useLoadBalancer',
] as const

export const DAGENT_CONFIG_KEYS = [
  'dockerLabels',
  'expectedState',
  'logConfig',
  'networkMode',
  'networks',
  'restartPolicy',
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
