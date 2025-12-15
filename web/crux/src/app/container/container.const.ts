export const COMMON_CONFIG_PROPERTIES = [
  'name',
  'environment',
  'secrets',
  'routing',
  'expose',
  'user',
  'tty',
  'configContainer',
  'ports',
  'portRanges',
  'volumes',
  'commands',
  'args',
  'initContainers',
  'storage',
  'experimental',
] as const

export const CRANE_CONFIG_PROPERTIES = [
  'deploymentStrategy',
  'corsHeaders',
  'proxyBuffering',
  'proxyHeaders',
  'useLoadBalancer',
  'extraLBAnnotations',
  'healthCheckConfig',
  'resourceConfig',
  'labels',
  'annotations',
  'replicas',
] as const

export const DAGENT_CONFIG_PROPERTIES = [
  'logConfig',
  'restartPolicy',
  'networkMode',
  'networks',
  'dockerLabels',
] as const

export const ALL_CONFIG_PROPERTIES = [
  ...COMMON_CONFIG_PROPERTIES,
  ...CRANE_CONFIG_PROPERTIES,
  ...DAGENT_CONFIG_PROPERTIES,
] as const

export type ContainerConfigProperty = (typeof ALL_CONFIG_PROPERTIES)[number]
