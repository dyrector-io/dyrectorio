import { NetworkMode } from '@prisma/client'
import { UniqueKey, UniqueKeyValue, UniqueSecretKey, UniqueSecretKeyValue } from './common'

export type ContainerConfigPort = {
  id: string
  internal: number
  external?: number
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

export const CONTAINER_RESTART_POLICY_TYPE_VALUES = ['always', 'unlessStopped', 'no', 'onFailure'] as const
export type ContainerRestartPolicyType = typeof CONTAINER_RESTART_POLICY_TYPE_VALUES[number]

export const CONTAINER_DEPLOYMENT_STRATEGY_VALUES = ['recreate', 'rolling'] as const
export type ContainerDeploymentStrategyType = typeof CONTAINER_DEPLOYMENT_STRATEGY_VALUES[number]

export const CONTAINER_EXPOSE_STRATEGY_VALUES = ['none', 'expose', 'exposeWithTls'] as const
export type ContainerConfigExposeStrategy = typeof CONTAINER_EXPOSE_STRATEGY_VALUES[number]

export const CONTAINER_VOLUME_TYPE_VALUES = ['ro', 'rwo', 'rwx', 'mem', 'tmp'] as const
export type VolumeType = typeof CONTAINER_VOLUME_TYPE_VALUES[number]

export type ContainerConfigIngress = {
  name: string
  host: string
  uploadLimit?: string
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

export type ContainerConfigData = {
  // common
  name: string
  environment?: UniqueKeyValue[]
  secrets?: UniqueSecretKey[]
  ingress?: ContainerConfigIngress
  expose: ContainerConfigExposeStrategy
  user?: number
  tty: boolean
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
  healthCheckConfig?: ContainerConfigHealthCheck
  resourceConfig?: ContainerConfigResourceConfig
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
  'initContainers',

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
