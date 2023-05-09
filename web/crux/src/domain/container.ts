import { NetworkMode } from '@prisma/client'

export const PORT_MIN = 0
export const PORT_MAX = 65535

export type UniqueKey = {
  id: string
  key: string
}

export type UniqueKeyValue = UniqueKey & {
  value: string
}

export type UniqueSecretKey = UniqueKey & {
  required: boolean
}

export type UniqueSecretKeyValue = UniqueKeyValue &
  UniqueSecretKey & {
    encrypted: boolean
    publicKey?: string
  }

export const CONTAINER_STATE_VALUES = ['created', 'restarting', 'running', 'removing', 'paused', 'exited', 'dead']
export type ContainerState = (typeof CONTAINER_STATE_VALUES)[number]

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

export const CONTAINER_NETWORK_MODE_VALUES = ['none', 'host', 'bridge', 'overlay', 'ipvlan', 'macvlan'] as const
export type ContainerNetworkMode = (typeof CONTAINER_NETWORK_MODE_VALUES)[number]

export const CONTAINER_RESTART_POLICY_TYPE_VALUES = ['always', 'unlessStopped', 'no', 'onFailure'] as const
export type ContainerRestartPolicyType = (typeof CONTAINER_RESTART_POLICY_TYPE_VALUES)[number]

export const CONTAINER_DEPLOYMENT_STRATEGY_VALUES = ['recreate', 'rolling'] as const
export type ContainerDeploymentStrategyType = (typeof CONTAINER_DEPLOYMENT_STRATEGY_VALUES)[number]

export const CONTAINER_EXPOSE_STRATEGY_VALUES = ['none', 'expose', 'exposeWithTls'] as const
export type ContainerExposeStrategy = (typeof CONTAINER_EXPOSE_STRATEGY_VALUES)[number]

export const CONTAINER_VOLUME_TYPE_VALUES = ['ro', 'rwo', 'rwx', 'mem', 'tmp'] as const
export type ContainerVolumeType = (typeof CONTAINER_VOLUME_TYPE_VALUES)[number]

export type Ingress = {
  name: string
  host: string
  uploadLimit?: string
}

export type Volume = {
  id: string
  name: string
  path: string
  size?: string
  type?: ContainerVolumeType
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
export type ContainerLogDriverType = (typeof CONTAINER_LOG_DRIVER_VALUES)[number]

export type Log = {
  driver: ContainerLogDriverType
  options: UniqueKeyValue[]
}

export type HealthCheck = {
  port?: number
  livenessProbe?: string
  readinessProbe?: string
  startupProbe?: string
}

export type Resource = {
  cpu?: string
  memory?: string
}

export type ResourceConfig = {
  limits?: Resource
  requests?: Resource
}

export type Container = {
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

export type Storage = {
  path?: string
  bucket?: string
}

export type ContainerConfigData = {
  // common
  name: string
  environment?: UniqueKeyValue[]
  secrets?: UniqueSecretKey[]
  ingress?: Ingress
  expose: ContainerExposeStrategy
  user?: number
  tty: boolean
  configContainer?: Container
  ports?: Port[]
  portRanges?: ContainerPortRange[]
  volumes?: Volume[]
  commands?: UniqueKey[]
  args?: UniqueKey[]
  initContainers?: InitContainer[]
  capabilities: UniqueKeyValue[]
  storageSet?: boolean
  storageId?: string
  storageConfig?: Storage

  // dagent
  logConfig?: Log
  restartPolicy: ContainerRestartPolicyType
  networkMode: NetworkMode
  networks?: UniqueKey[]
  dockerLabels?: UniqueKeyValue[]

  // crane
  deploymentStrategy: ContainerDeploymentStrategyType
  customHeaders?: UniqueKey[]
  proxyHeaders: boolean
  useLoadBalancer: boolean
  extraLBAnnotations?: UniqueKeyValue[]
  healthCheckConfig?: HealthCheck
  resourceConfig?: ResourceConfig
  annotations?: Marker
  labels?: Marker
}

type DagentSpecificConfig = 'logConfig' | 'restartPolicy' | 'networkMode' | 'networks' | 'dockerLabels'
type CraneSpecificConfig =
  | 'deploymentStrategy'
  | 'customHeaders'
  | 'proxyHeaders'
  | 'useLoadBalancer'
  | 'extraLBAnnotations'
  | 'healthCheckConfig'
  | 'resourceConfig'
  | 'labels'
  | 'annotations'

export type DagentConfigDetails = Pick<ContainerConfigData, DagentSpecificConfig>
export type CraneConfigDetails = Pick<ContainerConfigData, CraneSpecificConfig>
export type CommonConfigDetails = Omit<ContainerConfigData, DagentSpecificConfig | CraneSpecificConfig>

export type MergedContainerConfigData = Omit<ContainerConfigData, 'secrets'> & {
  secrets: UniqueSecretKeyValue[]
}

export type InstanceContainerConfigData = Partial<MergedContainerConfigData>

export const CONTAINER_CONFIG_JSON_FIELDS = [
  // Common
  'environment',
  'secrets',
  'capabilities',
  'ingress',
  'configContainer',
  'importContainer',
  'ports',
  'portRanges',
  'volumes',
  'commands',
  'args',
  'storageConfig',

  // Dagent
  'logConfig',
  'networks',
  'dockerLabels',

  // Crane
  'healthCheckConfig',
  'resourceConfig',
  'extraLBAnnotations',
  'customHeaders',
  'annotations',
  'labels',
]

export const CONTAINER_CONFIG_DEFAULT_VALUES = {
  storageSet: false,
}

export const CONTAINER_CONFIG_COMPOSITE_FIELDS = {
  storage: ['storageSet', 'storageId', 'storageConfig'],
}
