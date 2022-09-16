/**
 * This file contains only ContainerConfig releated definitions.
 * TODO: Create a models folder for future definitions. After that we can leave "models" name from the file.
 */

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

export type CompleteContainerConfig = ExplicitContainerConfig & {
  name: string
  environment?: Record<string, string>
  capabilities?: Record<string, string>
  secrets?: Record<string, string>
}

export type ContainerConfig = {
  name: string
  capabilities: Capabilities
  environment: Environment
  config: ExplicitContainerConfig
  secrets: Secrets
}

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

export type InstanceContainerConfig = {
  name?: string
  capabilities: Capabilities
  environment: Environment
  secrets: UniqueKeySecretValue[]
  config: ExplicitContainerConfig
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
