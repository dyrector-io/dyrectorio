import { v4 as uuid } from 'uuid'
import {
  ConcreteContainerConfig,
  ContainerConfig,
  ContainerConfigContainer,
  ContainerConfigData,
  ContainerConfigExposeStrategy,
  ContainerConfigHealthCheck,
  ContainerConfigRouting,
  ContainerDeploymentStrategyType,
  ContainerLogDriverType,
  ContainerNetworkMode,
  ContainerPortRange,
  ContainerRestartPolicyType,
  ContainerStorage,
  ExpectedContainerState,
  HealthCheckCommandProbe,
  HealthCheckNetworkProbe,
  HealthCheckProbe,
  InitContainer,
  InitContainerVolumeLink,
  Metrics,
  Port,
  ResourceConfig,
  UniqueKey,
  UniqueKeyValue,
  UniqueSecretKey,
  Volume,
} from './container'

import { mergeBoolean, mergeNumber } from './container-merge'

export type JsonKeyValue = Record<string, string>

export type JsonInitContainer = {
  name: string
  image: string
  command?: string[]
  args?: string[]
  environment?: JsonKeyValue
  useParentConfig?: boolean
  volumes?: JsonInitContainerVolumeLink[]
}

export type JsonContainerConfigLog = {
  driver: ContainerLogDriverType
  options: JsonKeyValue
}

export type JsonMarker = {
  service: JsonKeyValue
  deployment: JsonKeyValue
  ingress: JsonKeyValue
}

export type JsonHealthCheckCommandProbe = {
  type: 'exec'
  command: string[]
}

export type JsonHealthCheckProbe = HealthCheckNetworkProbe | JsonHealthCheckCommandProbe

export type JsonHealthCheck = {
  liveness?: JsonHealthCheckProbe
  readiness?: JsonHealthCheckProbe
  startup?: JsonHealthCheckProbe
}

export type JsonInitContainerVolumeLink = Omit<InitContainerVolumeLink, 'id'>
export type JsonContainerConfigPortRange = Omit<ContainerPortRange, 'id'>
export type JsonContainerConfigPort = Omit<Port, 'id'>
export type JsonContainerConfigVolume = Omit<Volume, 'id'>
export type JsonContainerConfigSecretKey = Omit<UniqueSecretKey, 'id'>

export type JsonContainerConfig = {
  // common
  name?: string
  environment?: JsonKeyValue
  secrets?: JsonContainerConfigSecretKey[]
  routing?: ContainerConfigRouting
  expose?: ContainerConfigExposeStrategy
  user?: number
  workingDirectory?: string
  tty?: boolean
  configContainer?: ContainerConfigContainer
  ports?: JsonContainerConfigPort[]
  portRanges?: JsonContainerConfigPortRange[]
  volumes?: JsonContainerConfigVolume[]
  commands?: string[]
  args?: string[]
  initContainers?: JsonInitContainer[]
  capabilities?: JsonKeyValue
  storage?: ContainerStorage
  expectedState?: ExpectedContainerState
  experimental?: Record<string, any>

  // dagent
  logConfig?: JsonContainerConfigLog
  restartPolicy?: ContainerRestartPolicyType
  networkMode?: ContainerNetworkMode
  networks?: string[]
  dockerLabels?: JsonKeyValue

  // crane
  deploymentStrategy?: ContainerDeploymentStrategyType
  corsHeaders?: string[]
  proxyBuffering?: boolean
  proxyHeaders?: string[]
  useLoadBalancer?: boolean
  extraLBAnnotations?: JsonKeyValue
  healthCheckConfig?: JsonHealthCheck
  resourceConfig?: ResourceConfig
  annotations?: JsonMarker
  labels?: JsonMarker
  metrics?: Metrics
  replicas?: number
}

export type ConcreteJsonContainerConfig = Omit<JsonContainerConfig, 'secrets'>

const keyValueArrayToJson = (list: UniqueKeyValue[]): JsonKeyValue | null =>
  list?.reduce((prev, it) => ({ ...prev, [it.key]: it.value }), {}) ?? null

const keyArrayToJson = (list: UniqueKey[]): string[] | null => list?.map(it => it.key) ?? null

const healthCheckProbeToJson = (probe: HealthCheckProbe): JsonHealthCheckProbe => {
  if (probe?.type !== 'exec') {
    return probe ?? null
  }

  return {
    type: 'exec',
    command: keyArrayToJson(probe.command),
  }
}

const healthCheckConfigToJson = (healthCheck: ContainerConfigHealthCheck): JsonHealthCheck => {
  if (!healthCheck) {
    return null
  }

  return {
    liveness: healthCheckProbeToJson(healthCheck?.liveness),
    readiness: healthCheckProbeToJson(healthCheck?.readiness),
    startup: healthCheckProbeToJson(healthCheck?.startup),
  }
}

const booleanToJson = (value: boolean): boolean | null => {
  if (typeof value !== 'boolean') {
    return null
  }

  return value
}

const numberToJson = (value: number): number | null => {
  if (typeof value !== 'number') {
    return null
  }

  return value
}

const removeId = <T extends { id: string }>(item: T): Omit<T, 'id'> => {
  const newItem: T = { ...item }
  delete newItem.id

  return newItem
}

const removeIdFromItems = <T extends { id: string }>(items: T[] | null): Omit<T, 'id'>[] | null =>
  items?.map(it => removeId(it)) ?? null

export const containerConfigToJsonConfig = (config: ContainerConfigData): JsonContainerConfig => ({
  // common
  name: config.name ?? null,
  environment: keyValueArrayToJson(config.environment),
  // secrets are ommited
  routing: config.routing ?? null,
  expose: config.expose ?? null,
  user: numberToJson(config.user),
  workingDirectory: config.workingDirectory ?? null,
  tty: booleanToJson(config.tty),
  configContainer: config.configContainer ?? null,
  ports: removeIdFromItems(config.ports),
  portRanges: removeIdFromItems(config.portRanges),
  volumes: removeIdFromItems(config.volumes),
  commands: keyArrayToJson(config.commands),
  args: keyArrayToJson(config.args),
  initContainers:
    config.initContainers?.map(container => ({
      ...removeId(container),
      command: keyArrayToJson(container.command),
      args: keyArrayToJson(container.args),
      environment: keyValueArrayToJson(container.environment),
      volumes: removeIdFromItems(container.volumes) ?? [],
    })) ?? null,
  capabilities: keyValueArrayToJson(config.capabilities),
  storage: config.storage,

  // dagent
  logConfig: config.logConfig
    ? {
        driver: config.logConfig?.driver ?? null,
        options: keyValueArrayToJson(config.logConfig?.options),
      }
    : null,
  restartPolicy: config.restartPolicy ?? null,
  networkMode: config.networkMode ?? null,
  networks: keyArrayToJson(config.networks),
  dockerLabels: keyValueArrayToJson(config.dockerLabels),
  expectedState: config.expectedState ?? null,

  // crane
  deploymentStrategy: config.deploymentStrategy ?? null,
  corsHeaders: keyArrayToJson(config.corsHeaders),
  proxyBuffering: booleanToJson(config.proxyBuffering),
  proxyHeaders: keyArrayToJson(config.proxyHeaders),
  useLoadBalancer: booleanToJson(config.useLoadBalancer),
  extraLBAnnotations: keyValueArrayToJson(config.extraLBAnnotations),
  healthCheckConfig: healthCheckConfigToJson(config.healthCheckConfig),
  resourceConfig: config.resourceConfig ?? null,
  annotations: !config.annotations
    ? null
    : {
        deployment: keyValueArrayToJson(config.annotations.deployment),
        service: keyValueArrayToJson(config.annotations.service),
        ingress: keyValueArrayToJson(config.annotations.ingress),
      },
  labels: !config.labels
    ? null
    : {
        deployment: keyValueArrayToJson(config.labels.deployment),
        service: keyValueArrayToJson(config.labels.service),
        ingress: keyValueArrayToJson(config.labels.ingress),
      },
  metrics: config.metrics ?? null,
  replicas: config.replicas ?? null,
  experimental: config.experimental ?? null,
})

export const concreteContainerConfigToJsonConfig = (config: ConcreteContainerConfig): ConcreteJsonContainerConfig => {
  const json = containerConfigToJsonConfig(config)

  delete json.secrets

  return json
}

const mergeKeyValuesWithJson = (items: UniqueKeyValue[], json: JsonKeyValue): UniqueKeyValue[] => {
  if (!json) {
    return null
  }

  items = items ?? []

  if (Object.keys(json).length < 1) {
    return []
  }

  let modified = false
  const result = []
  const jsonKeys = Object.keys(json)

  jsonKeys.forEach(key => {
    const value = json[key]

    const byKey = items.find(it => it.key === key)
    if (!byKey) {
      const byValue = items.find(it => it.value === value)

      result.push({
        key,
        value,
        id: byValue?.id ?? uuid(),
      })

      modified = true
    } else {
      if (byKey.value !== value) {
        modified = true
      }

      result.push({
        key,
        value,
        id: byKey.id,
      })
    }
  })

  const removed = items.filter(it => !jsonKeys.includes(it.key))
  if (removed.length > 0) {
    modified = true
  }

  return modified ? result : items
}

const mergeKeysWithJson = (items: UniqueKey[], json: string[]): UniqueKey[] => {
  if (!json) {
    return null
  }

  items = items ?? []

  if (Object.entries(json).length < 1) {
    return []
  }

  let modified = false
  const result = []
  json.forEach(entry => {
    const byKey = items.find(it => it.key === entry)
    if (!byKey) {
      result.push({
        key: entry,
        id: uuid(),
      })

      modified = true
    } else {
      if (byKey.key !== entry) {
        modified = true
      }

      result.push({
        key: entry,
        id: byKey.id,
      })
    }
  })

  const jsonKeys = Object.keys(json)
  const removed = items.filter(it => !jsonKeys.includes(it.key))
  if (removed.length > 0) {
    modified = true
  }

  return modified ? result : items
}

const mergeSecretsWithJson = (secrets: UniqueSecretKey[], json: JsonContainerConfigSecretKey[]): UniqueSecretKey[] => {
  if (!json) {
    return null
  }

  secrets = secrets ?? []

  json?.forEach(it => {
    const index = secrets.findIndex(sec => sec.key === it.key)

    if (index > -1) {
      const sec = secrets[index]
      secrets[index] = {
        ...sec,
        ...it,
      }
    } else {
      secrets.push({
        ...it,
        id: uuid(),
      })
    }
  })

  return secrets
}

const mergeInitContainersWithJson = (containers: InitContainer[], json: JsonInitContainer[]): InitContainer[] => {
  if (!json) {
    return null
  }

  containers = containers ?? []

  json?.forEach(cont => {
    const contIndex = containers.findIndex(it => it.name === cont.name)

    if (contIndex > -1) {
      const current = containers[contIndex]

      containers[contIndex] = {
        ...current,
        args: mergeKeysWithJson(current.args, cont.args) ?? [],
        command: mergeKeysWithJson(current.command, cont.command) ?? [],
        environment: mergeKeyValuesWithJson(current.environment, cont.environment) ?? [],
        volumes:
          cont.volumes?.map(volume => {
            const currentVol = current.volumes?.find(it => it.name === volume.name)

            return {
              ...volume,
              id: currentVol?.id ?? uuid(),
            }
          }) ?? [],
      }
    } else {
      containers.push({
        ...cont,
        id: uuid(),
        command: cont.command?.map(it => ({ id: uuid(), key: it })) ?? [],
        args: cont.args?.map(it => ({ id: uuid(), key: it })) ?? [],
        environment:
          Object.keys(cont.environment ?? {}).map(it => ({
            key: it,
            value: cont.environment[it],
            id: uuid(),
          })) ?? [],
        useParentConfig: cont.useParentConfig ?? false,
        volumes: cont.volumes?.map(it => ({ ...it, id: uuid() })) ?? [],
      })
    }
  })

  return containers
}

const mergeHealthCheckProbeWithJson = (probe: HealthCheckProbe, json: JsonHealthCheckProbe): HealthCheckProbe => {
  if (!json) {
    return null
  }

  if (json.type !== 'exec') {
    return json
  }

  const commandProbe = probe as HealthCheckCommandProbe

  return {
    type: 'exec',
    command: mergeKeysWithJson(commandProbe?.command, json.command) ?? [],
  }
}

export const mergeJsonConfigToConcreteContainerConfig = (
  config: ConcreteContainerConfig,
  json: ConcreteJsonContainerConfig,
): ConcreteContainerConfig => {
  const result: ConcreteContainerConfig = {
    id: config.id,
    type: config.type,
    configContainer: json.configContainer ?? config.configContainer,
    deploymentStrategy: json.deploymentStrategy ?? config.deploymentStrategy,
    expectedState: json.expectedState ?? config.expectedState,
    expose: json.expose ?? config.expose,
    healthCheckConfig: !json.healthCheckConfig
      ? null
      : {
          liveness: mergeHealthCheckProbeWithJson(config.healthCheckConfig?.liveness, json.healthCheckConfig?.liveness),
          readiness: mergeHealthCheckProbeWithJson(
            config.healthCheckConfig?.readiness,
            json.healthCheckConfig?.readiness,
          ),
          startup: mergeHealthCheckProbeWithJson(config.healthCheckConfig?.startup, json.healthCheckConfig?.startup),
        },
    metrics: json.metrics ?? config.metrics,
    replicas: json.replicas ?? config.replicas,
    name: json.name ?? config.name,
    networkMode: json.networkMode ?? config.networkMode,
    proxyBuffering: mergeBoolean(json.proxyBuffering, config.proxyBuffering),
    proxyHeaders: mergeKeysWithJson(config.proxyHeaders, json.proxyHeaders),
    resourceConfig: json.resourceConfig ?? config.resourceConfig,
    restartPolicy: json.restartPolicy ?? config.restartPolicy,
    routing: json.routing ?? config.routing,
    secrets: config.secrets,
    storage: json.storage ?? config.storage,
    tty: mergeBoolean(json.tty, config.tty),
    useLoadBalancer: mergeBoolean(json.useLoadBalancer, config.useLoadBalancer),
    user: mergeNumber(json.user, config.user),
    workingDirectory: json.workingDirectory ?? config.workingDirectory,
    environment: mergeKeyValuesWithJson(config.environment, json.environment),
    extraLBAnnotations: mergeKeyValuesWithJson(config.extraLBAnnotations, json.extraLBAnnotations),
    capabilities: mergeKeyValuesWithJson(config.capabilities, json.capabilities),
    commands: mergeKeysWithJson(config.commands, json.commands),
    corsHeaders: mergeKeysWithJson(config.corsHeaders, json.corsHeaders),
    networks: mergeKeysWithJson(config.networks, json.networks),
    args: mergeKeysWithJson(config.args, json.args),
    logConfig: json.logConfig
      ? {
          driver: json.logConfig.driver ?? config.logConfig?.driver ?? null,
          options: mergeKeyValuesWithJson(config.logConfig?.options, json.logConfig?.options) ?? [],
        }
      : null,
    initContainers: mergeInitContainersWithJson(config.initContainers, json.initContainers),
    ports: !json.ports
      ? null
      : json.ports.map(it => ({
          ...it,
          id: uuid(),
        })),
    portRanges: !json.portRanges
      ? null
      : json.portRanges.map(it => ({
          ...it,
          id: uuid(),
        })),
    dockerLabels: mergeKeyValuesWithJson(config.dockerLabels, json.dockerLabels),
    labels: !json.labels
      ? null
      : {
          deployment: mergeKeyValuesWithJson(config.labels?.deployment, json.labels.deployment),
          service: mergeKeyValuesWithJson(config.labels?.service, json.labels.service),
          ingress: mergeKeyValuesWithJson(config.labels?.ingress, json.labels.ingress),
        },
    annotations: !json.annotations
      ? null
      : {
          deployment: mergeKeyValuesWithJson(config.annotations?.deployment, json.annotations.deployment),
          service: mergeKeyValuesWithJson(config.annotations?.service, json.annotations.service),
          ingress: mergeKeyValuesWithJson(config.annotations?.ingress, json.annotations.ingress),
        },
    volumes: !json.volumes
      ? null
      : json.volumes.map(volume => {
          const currentVol = config.volumes?.find(it => it.name === volume.name)

          return {
            ...volume,
            id: currentVol?.id ?? uuid(),
          }
        }),
    experimental: json.experimental ?? null,
  }

  return result
}

export const mergeJsonWithContainerConfig = (config: ContainerConfig, json: JsonContainerConfig): ContainerConfig => {
  const concreteConfig: ConcreteContainerConfig = {
    ...config,
    secrets: null,
  }

  const mergedConf = mergeJsonConfigToConcreteContainerConfig(concreteConfig, json)

  return {
    ...config,
    ...mergedConf,
    secrets: mergeSecretsWithJson(config.secrets, json.secrets),
  }
}
