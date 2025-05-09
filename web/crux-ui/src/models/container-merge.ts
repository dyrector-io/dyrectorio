import {
  ConcreteContainerConfigData,
  ContainerConfigData,
  ContainerPortRange,
  Marker,
  Port,
  UniqueKey,
  UniqueKeyValue,
  UniqueSecretKey,
  UniqueSecretKeyValue,
  Volume,
} from './container'
import { rangesOverlap } from './container-conflict'

const mergeNumber = (strong: number, weak: number): number => {
  if (typeof strong === 'number') {
    return strong
  }

  if (typeof weak === 'number') {
    return weak
  }

  return null
}

const mergeBoolean = (strong: boolean, weak: boolean): boolean => {
  if (typeof strong === 'boolean') {
    return strong
  }

  if (typeof weak === 'boolean') {
    return weak
  }

  return null
}

export const mergeMarkers = (strong: Marker, weak: Marker): Marker => {
  if (!strong) {
    return weak ?? null
  }

  if (!weak) {
    return strong
  }

  return {
    deployment: strong.deployment ?? weak.deployment ?? [],
    ingress: strong.ingress ?? weak.ingress ?? [],
    service: strong.service ?? weak.service ?? [],
  }
}

const mergeSecretKeys = (one: UniqueSecretKey[], other: UniqueSecretKey[]): UniqueSecretKey[] => {
  if (!one) {
    return other
  }

  if (!other) {
    return one
  }

  return [...one, ...other.filter(it => !one.includes(it))]
}

export const mergeSecrets = (strong: UniqueSecretKeyValue[], weak: UniqueSecretKey[]): UniqueSecretKeyValue[] => {
  weak = weak ?? []
  strong = strong ?? []

  const overriddenKeys: Set<string> = new Set(strong.map(it => it.key))

  // removes non required secrets, when they are not present in the concrete config
  const missing: UniqueSecretKeyValue[] = weak
    .filter(it => !overriddenKeys.has(it.key) || it.required)
    .map(it => ({
      ...it,
      value: '',
      encrypted: false,
      publicKey: null,
    }))

  return [...missing, ...strong]
}

const mergeConfigs = (strong: ContainerConfigData, weak: ContainerConfigData): ContainerConfigData => ({
  // common
  name: strong.name ?? weak.name,
  environment: strong.environment ?? weak.environment,
  secrets: mergeSecretKeys(strong.secrets, weak.secrets),
  user: mergeNumber(strong.user, weak.user),
  workingDirectory: strong.workingDirectory ?? weak.workingDirectory,
  tty: mergeBoolean(strong.tty, weak.tty),
  portRanges: strong.portRanges ?? weak.portRanges,
  args: strong.args ?? weak.args,
  commands: strong.commands ?? weak.commands,
  expose: strong.expose ?? weak.expose,
  configContainer: strong.configContainer ?? weak.configContainer,
  routing: strong.routing ?? weak.routing,
  volumes: strong.volumes ?? weak.volumes,
  initContainers: strong.initContainers ?? weak.initContainers,
  capabilities: [], // TODO (@m8vago, @nandor-magyar): capabilities feature is still missing
  ports: strong.ports ?? weak.ports,
  storage: strong.storage ?? weak.storage,

  // crane
  customHeaders: strong.customHeaders ?? weak.customHeaders,
  proxyHeaders: mergeBoolean(strong.proxyHeaders, weak.proxyHeaders),
  extraLBAnnotations: strong.extraLBAnnotations ?? weak.extraLBAnnotations,
  healthCheckConfig: strong.healthCheckConfig ?? weak.healthCheckConfig,
  resourceConfig: strong.resourceConfig ?? weak.resourceConfig,
  useLoadBalancer: mergeBoolean(strong.useLoadBalancer, weak.useLoadBalancer),
  deploymentStrategy: strong.deploymentStrategy ?? weak.deploymentStrategy,
  labels: mergeMarkers(strong.labels, weak.labels),
  annotations: mergeMarkers(strong.annotations, weak.annotations),
  metrics: strong.metrics ?? weak.metrics,

  // dagent
  logConfig: strong.logConfig ?? weak.logConfig,
  networkMode: strong.networkMode ?? weak.networkMode,
  restartPolicy: strong.restartPolicy ?? weak.restartPolicy,
  networks: strong.networks ?? weak.networks,
  dockerLabels: strong.dockerLabels ?? weak.dockerLabels,
  expectedState: strong.expectedState ?? weak.expectedState,
})

const squashConfigs = (configs: ContainerConfigData[]): ContainerConfigData =>
  configs.reduce((result, conf) => mergeConfigs(conf, result), {} as ContainerConfigData)

// this assumes that the concrete config takes care of any conflict between the other configs
export const mergeConfigsWithConcreteConfig = (
  configs: ContainerConfigData[],
  concrete: ConcreteContainerConfigData,
): ConcreteContainerConfigData => {
  const squashed = squashConfigs(configs.filter(it => !!it))
  concrete = concrete ?? {}

  const baseConfig = mergeConfigs(concrete, squashed)

  return {
    ...baseConfig,
    secrets: mergeSecrets(concrete.secrets, squashed.secrets),
  }
}

const mergeUniqueKeys = <T extends UniqueKey>(strong: T[], weak: T[]): T[] => {
  if (!strong) {
    return weak ?? null
  }

  if (!weak) {
    return strong
  }

  const missing = weak.filter(w => !strong.find(it => it.key === w.key))
  return [...strong, ...missing]
}

const mergeUniqueKeyValues = <T extends UniqueKeyValue>(strong: T[], weak: T[]): T[] => {
  if (!strong) {
    return weak ?? null
  }

  if (!weak) {
    return strong
  }

  const overriddenKeys = new Set(strong.map(it => it.key))
  const overriddenValues = new Set(strong.filter(it => it.value).map(it => it.key))
  const weakValues = new Set(
    weak.filter(it => it.value && !overriddenValues.has(it.key) && overriddenKeys.has(it.key)).map(it => it.key),
  )

  const missing = weak.filter(it => weakValues.has(it.key) || !overriddenKeys.has(it.key))
  const overriden = strong.filter(it => !weakValues.has(it.key))

  return [...overriden, ...missing]
}

const mergePorts = (strong: Port[], weak: Port[]): Port[] => {
  if (!strong) {
    return weak ?? null
  }

  if (!weak) {
    return strong
  }

  const missing = weak.filter(w => !strong.find(it => it.internal === w.internal))
  return [...strong, ...missing]
}

const mergePortRanges = (strong: ContainerPortRange[], weak: ContainerPortRange[]): ContainerPortRange[] => {
  if (!strong) {
    return weak ?? null
  }

  if (!weak) {
    return strong
  }

  const missing = weak.filter(
    w => !strong.find(it => rangesOverlap(w.internal, it.internal) || rangesOverlap(w.external, it.external)),
  )
  return [...strong, ...missing]
}

const mergeVolumes = (strong: Volume[], weak: Volume[]): Volume[] => {
  if (!strong) {
    return weak ?? null
  }

  if (!weak) {
    return strong
  }

  const missing = weak.filter(w => !strong.find(it => it.path === w.path || it.name === w.name))
  return [...strong, ...missing]
}

export const mergeInstanceConfigWithDeploymentConfig = (
  instance: ConcreteContainerConfigData,
  deployment: ConcreteContainerConfigData,
): ConcreteContainerConfigData => ({
  // common
  name: instance.name ?? deployment.name ?? null,
  environment: mergeUniqueKeyValues(instance.environment, deployment.environment),
  secrets: mergeUniqueKeyValues(instance.secrets, deployment.secrets),
  user: mergeNumber(instance.user, deployment.user),
  workingDirectory: instance.workingDirectory ?? deployment.workingDirectory ?? null,
  tty: mergeBoolean(instance.tty, deployment.tty),
  ports: mergePorts(instance.ports, deployment.ports),
  portRanges: mergePortRanges(instance.portRanges, deployment.portRanges),
  args: mergeUniqueKeys(instance.args, deployment.args),
  commands: mergeUniqueKeys(instance.commands, deployment.commands),
  expose: instance.expose ?? deployment.expose ?? null,
  configContainer: instance.configContainer ?? deployment.configContainer ?? null,
  routing: instance.routing ?? deployment.routing ?? null,
  volumes: mergeVolumes(instance.volumes, deployment.volumes),
  initContainers: instance.initContainers ?? deployment.initContainers ?? null, // TODO (@m8vago): merge them correctly after the init container rework
  capabilities: [], // TODO (@m8vago, @nandor-magyar): capabilities feature is still missing
  storage: instance.storage ?? deployment.storage,

  // crane
  customHeaders: mergeUniqueKeys(instance.customHeaders, deployment.customHeaders),
  proxyHeaders: mergeBoolean(instance.proxyHeaders, deployment.proxyHeaders),
  extraLBAnnotations: mergeUniqueKeyValues(instance.extraLBAnnotations, deployment.extraLBAnnotations),
  healthCheckConfig: instance.healthCheckConfig ?? deployment.healthCheckConfig ?? null,
  resourceConfig: instance.resourceConfig ?? deployment.resourceConfig ?? null,
  useLoadBalancer: mergeBoolean(instance.useLoadBalancer, deployment.useLoadBalancer),
  deploymentStrategy: instance.deploymentStrategy ?? deployment.deploymentStrategy ?? null,
  labels: mergeMarkers(instance.labels, deployment.labels),
  annotations: mergeMarkers(instance.annotations, deployment.annotations),
  metrics: instance.metrics ?? deployment.metrics ?? null,

  // dagent
  logConfig: instance.logConfig ?? deployment.logConfig ?? null,
  networkMode: instance.networkMode ?? deployment.networkMode ?? null,
  restartPolicy: instance.restartPolicy ?? deployment.restartPolicy ?? null,
  networks: mergeUniqueKeys(instance.networks, deployment.networks),
  dockerLabels: mergeUniqueKeyValues(instance.dockerLabels, deployment.dockerLabels),
  expectedState: instance.expectedState ?? deployment.expectedState ?? null,
})
