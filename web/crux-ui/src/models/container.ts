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

export type UniqueKeySecretValue = UniqueKeyValue & {
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

export const CONTAINER_NETWORK_MODE_VALUES = ['none', 'host', 'bridge', 'overlay', 'ipvlan', 'macvlan'] as const
export type ContainerNetworkMode = typeof CONTAINER_NETWORK_MODE_VALUES[number]

export const CONTAINER_RESTART_POLICY_TYPE_VALUES = ['undefined', 'always', 'unlessStopped', 'no', 'onFailure'] as const
export type ContainerRestartPolicyType = typeof CONTAINER_RESTART_POLICY_TYPE_VALUES[number]

export const CONTAINER_DEPLOYMENT_STRATEGY_VALUES = ['unknown', 'recreate', 'rolling'] as const
export type ContainerDeploymentStrategyType = typeof CONTAINER_DEPLOYMENT_STRATEGY_VALUES[number]

export const CONTAINER_EXPOSE_STRATEGY_VALUES = ['none', 'expose', 'expose_with_tls'] as const
export type ContainerConfigExposeStrategy = typeof CONTAINER_EXPOSE_STRATEGY_VALUES[number]

export type ContainerConfigIngress = {
  name: string
  host: string
  uploadLimitInBytes?: string
}
export const CONTAINER_VOLUME_TYPE_VALUES = ['ro', 'rw', 'rwx', 'mem', 'tmp'] as const
export type VolumeType = typeof CONTAINER_VOLUME_TYPE_VALUES[number]

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
  environments: UniqueKeyValue[]
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
  environments?: UniqueKeyValue[]
  useParentConfig?: boolean
  volumes?: InitContainerVolumeLink[]
}

export type ContainerConfig = {
  //common
  name?: string
  environments?: UniqueKeyValue[]
  secrets?: UniqueKeyValue[]
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

  //dagent
  logConfig?: ContainerConfigLog
  restartPolicy?: ContainerRestartPolicyType
  networkMode?: ContainerNetworkMode
  networks?: UniqueKey[]

  //crane
  deploymentStrategy?: ContainerDeploymentStrategyType
  customHeaders?: UniqueKey[]
  proxyHeaders?: boolean
  useLoadBalancer?: boolean
  extraLBAnnotations?: UniqueKeyValue[]
  healthCheckConfig?: ContainerConfigHealthCheck
  resourceConfig?: ContainerConfigResourceConfig
}

type DockerSpecificConfig = 'logConfig' | 'restartPolicy' | 'networkMode' | 'networks'
type KubernetesSpecificConfig =
  | 'deploymentStrategy'
  | 'customHeaders'
  | 'proxyHeaders'
  | 'useLoadBalancer'
  | 'extraLBAnnotations'
  | 'healthCheckConfig'
  | 'resourceConfig'

export type DagentConfigDetails = Pick<ContainerConfig, DockerSpecificConfig>
export type CraneConfigDetails = Pick<ContainerConfig, KubernetesSpecificConfig>
export type CommonConfigDetails = Omit<ContainerConfig, DockerSpecificConfig | KubernetesSpecificConfig>
