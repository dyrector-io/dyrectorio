// TODO: move this to the container domain

export const COMMON_CONFIG_PROPERTIES = [
  'name',
  'environment',
  'secrets',
  'ingress',
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
] as const

export const CRANE_CONFIG_PROPERTIES = [
  'deploymentStrategy',
  'customHeaders',
  'proxyHeaders',
  'useLoadBalancer',
  'extraLBAnnotations',
  'healthCheckConfig',
  'resourceConfig',
  'labels',
  'annotations',
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

export type ImageConfigProperty = (typeof ALL_CONFIG_PROPERTIES)[number]
