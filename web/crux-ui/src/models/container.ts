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

export type Environment = UniqueKeyValue[]
export type Capabilities = UniqueKeyValue[]
export type Secrets = UniqueKey[]

export type ExplicitContainerConfigPort = {
  internal: number
  external: number
}

export type PortRange = {
  from: number
  to: number
}

export type ExplicitContainerConfigPortRange = {
  internal: PortRange
  external: PortRange
}

export const EXPLICIT_CONTAINER_NETWORK_MODE_VALUES = ['none', 'host', 'bridge'] as const
export type ExplicitContainerNetworkMode = typeof EXPLICIT_CONTAINER_NETWORK_MODE_VALUES[number]

export const EXPLICIT_CONTAINER_RESTART_POLICY_TYPE_VALUES = [
  '',
  'always',
  'unless_stopped',
  'no',
  'on_failure',
] as const
export type ExplicitContainerRestartPolicyType = typeof EXPLICIT_CONTAINER_RESTART_POLICY_TYPE_VALUES[number]

export const EXPLICIT_CONTAINER_DEPLOYMENT_STRATEGY_VALUES = ['recreate', 'rolling'] as const
export type ExplicitContainerDeploymentStrategyType = typeof EXPLICIT_CONTAINER_DEPLOYMENT_STRATEGY_VALUES[number]

export type ExplicitContainerConfigExpose = {
  public: boolean
  tls: boolean
}

export type ExplicitContainerConfigIngress = {
  name: string
  host: string
  uploadLimitInBytes?: string
}

export type ExplicitContainerConfigVolume = {
  name: string
  path: string
  size?: string
  type?: string
  class?: string
}

export type ExplicitContainerConfigLog = {
  type: string
  config: { [key: string]: string }
}

export type ExplicitContainerConfigHealthCheck = {
  port: number
  livenessProbe?: string
  readinessProbe?: string
  startupProbe?: string
}

export type ExplicitContainerConfigResource = {
  cpu?: string
  memory?: string
}

export type ExplicitContainerConfigResourceConfig = {
  limits?: ExplicitContainerConfigResource
  requests?: ExplicitContainerConfigResource
}

export type ExplicitContainerConfigContainer = {
  image: string
  volume: string
  path: string
  keepFiles: boolean
}

export type ExplicitContainerConfigImportContainer = {
  environments: { [key: string]: string }
  volume: string
  command: string
}

export type ExplicitInitContainerVolumeLink = {
  name: string
  path: string
}

export type ExplicitInitContainer = {
  name: string
  image: string
  command?: string[]
  args?: string[]
  environments?: { [key: string]: string }
  useParentConfig?: boolean
  volumes?: ExplicitInitContainerVolumeLink[]
}

export type ExplicitContainerConfig = {
  ingress?: ExplicitContainerConfigIngress
  expose?: ExplicitContainerConfigExpose
  user?: number
  tty?: boolean
  importContainer?: ExplicitContainerConfigImportContainer
  configContainer?: ExplicitContainerConfigContainer

  ports?: ExplicitContainerConfigPort[]
  portRanges?: ExplicitContainerConfigPortRange[]
  volumes?: ExplicitContainerConfigVolume[]
  commands?: string[]
  args?: string[]
  initContainers?: ExplicitInitContainer[]

  // dagent-specific:
  logConfig?: ExplicitContainerConfigLog
  restartPolicy?: ExplicitContainerRestartPolicyType
  networkMode?: ExplicitContainerNetworkMode
  networks?: string[]

  // crane-specific:
  deploymentStrategy?: ExplicitContainerDeploymentStrategyType
  customHeaders?: string[]
  proxyHeaders?: boolean
  useLoadBalancer?: boolean
  extraLBAnnotations?: { [key: string]: string }
  healthCheckConfig?: ExplicitContainerConfigHealthCheck
  resourceConfig?: ExplicitContainerConfigResourceConfig
}

export type ContainerConfig = {
  name: string
  capabilities: Capabilities
  environment: Environment
  config: ExplicitContainerConfig
  secrets: Secrets
}

export type CompleteContainerConfig = ExplicitContainerConfig & {
  name: string
  environment?: Record<string, string>
  capabilities?: Record<string, string>
  secrets?: Record<string, string>
}
