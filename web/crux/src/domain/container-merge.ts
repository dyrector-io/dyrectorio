import {
  ConcreteContainerConfigData,
  ContainerConfigData,
  ContainerPortRange,
  Marker,
  Port,
  UniqueKey,
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

type StorageProperties = Pick<ContainerConfigData, 'storageSet' | 'storageId' | 'storageConfig'>
const mergeStorage = (strong: StorageProperties, weak: StorageProperties): StorageProperties => {
  const set = mergeBoolean(strong.storageSet, weak.storageSet)
  if (!set) {
    // neither of them are set

    return {
      storageSet: false,
      storageId: null,
      storageConfig: null,
    }
  }

  if (typeof strong.storageSet === 'boolean') {
    // strong is set

    return {
      storageSet: true,
      storageId: strong.storageId,
      storageConfig: strong.storageConfig,
    }
  }

  return {
    storageSet: true,
    storageId: weak.storageId,
    storageConfig: weak.storageConfig,
  }
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

const squashSecrets = (one: UniqueSecretKey[], other: UniqueSecretKey[]): UniqueSecretKey[] => {
  if (!one) {
    return other
  }

  if (!other) {
    return one
  }

  return [...one, ...other.filter(it => !one.includes(it))]
}

const squashConfigs = (configs: ContainerConfigData[]): ContainerConfigData =>
  configs.reduce((result, conf) => {
    if ('secrets' in conf) {
      conf.secrets = squashSecrets(result.secrets, conf.secrets)
    }

    return {
      ...result,
      ...conf,
    }
  }, {} as ContainerConfigData)

export const mergeSecrets = (strong: UniqueSecretKeyValue[], weak: UniqueSecretKey[]): UniqueSecretKeyValue[] => {
  weak = weak ?? []
  strong = strong ?? []

  const overriddenIds: Set<string> = new Set(strong?.map(it => it.id))

  const missing: UniqueSecretKeyValue[] = weak
    .filter(it => !overriddenIds.has(it.id))
    .map(it => ({
      ...it,
      value: '',
      encrypted: false,
      publicKey: null,
    }))

  return [...missing, ...strong]
}

// this assumes that the concrete config takes care of any conflict between the other configs
export const mergeConfigsWithConcreteConfig = (
  configs: ContainerConfigData[],
  concrete: ConcreteContainerConfigData,
): ConcreteContainerConfigData => {
  const squashed = squashConfigs(configs.filter(it => !!it))
  concrete = concrete ?? {}

  return {
    // common
    name: concrete.name ?? squashed.name,
    environment: concrete.environment ?? squashed.environment,
    secrets: mergeSecrets(concrete.secrets, squashed.secrets),
    user: mergeNumber(concrete.user, squashed.user),
    workingDirectory: concrete.workingDirectory ?? squashed.workingDirectory,
    tty: mergeBoolean(concrete.tty, squashed.tty),
    portRanges: concrete.portRanges ?? squashed.portRanges,
    args: concrete.args ?? squashed.args,
    commands: concrete.commands ?? squashed.commands,
    expose: concrete.expose ?? squashed.expose,
    configContainer: concrete.configContainer ?? squashed.configContainer,
    routing: concrete.routing ?? squashed.routing,
    volumes: concrete.volumes ?? squashed.volumes,
    initContainers: concrete.initContainers ?? squashed.initContainers,
    capabilities: [], // TODO (@m8vago, @nandor-magyar): capabilities feature is still missing
    ports: concrete.ports ?? squashed.ports,
    ...mergeStorage(concrete, squashed),

    // crane
    customHeaders: concrete.customHeaders ?? squashed.customHeaders,
    proxyHeaders: mergeBoolean(concrete.proxyHeaders, squashed.proxyHeaders),
    extraLBAnnotations: concrete.extraLBAnnotations ?? squashed.extraLBAnnotations,
    healthCheckConfig: concrete.healthCheckConfig ?? squashed.healthCheckConfig,
    resourceConfig: concrete.resourceConfig ?? squashed.resourceConfig,
    useLoadBalancer: mergeBoolean(concrete.useLoadBalancer, squashed.useLoadBalancer),
    deploymentStrategy: concrete.deploymentStrategy ?? squashed.deploymentStrategy,
    labels: mergeMarkers(concrete.labels, squashed.labels),
    annotations: mergeMarkers(concrete.annotations, squashed.annotations),
    metrics: concrete.metrics ?? squashed.metrics,

    // dagent
    logConfig: concrete.logConfig ?? squashed.logConfig,
    networkMode: concrete.networkMode ?? squashed.networkMode,
    restartPolicy: concrete.restartPolicy ?? squashed.restartPolicy,
    networks: concrete.networks ?? squashed.networks,
    dockerLabels: concrete.dockerLabels ?? squashed.dockerLabels,
    expectedState: concrete.expectedState ?? squashed.expectedState,
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

  const missing = weak.filter(w => !strong.find(it => it.path === w.path || it.name === w.path))
  return [...strong, ...missing]
}

export const mergeInstanceConfigWithDeploymentConfig = (
  deployment: ConcreteContainerConfigData,
  instance: ConcreteContainerConfigData,
): ConcreteContainerConfigData => ({
  // common
  name: instance.name ?? deployment.name ?? null,
  environment: mergeUniqueKeys(instance.environment, deployment.environment),
  secrets: mergeUniqueKeys(instance.secrets, deployment.secrets),
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
  ...mergeStorage(instance, deployment),

  // crane
  customHeaders: mergeUniqueKeys(deployment.customHeaders, instance.customHeaders),
  proxyHeaders: mergeBoolean(instance.proxyHeaders, deployment.proxyHeaders),
  extraLBAnnotations: mergeUniqueKeys(instance.extraLBAnnotations, deployment.extraLBAnnotations),
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
  dockerLabels: mergeUniqueKeys(instance.dockerLabels, deployment.dockerLabels),
  expectedState: instance.expectedState ?? deployment.expectedState ?? null,
})
