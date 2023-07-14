import { v4 as uuid } from 'uuid'

export type ContainerState = 'created' | 'restarting' | 'running' | 'removing' | 'paused' | 'exited' | 'dead'

export type ContainerPort = {
  internal: number
  external: number
}

export type ContainerIdentifier = {
  prefix?: string
  name: string
}

export type Container = {
  id: ContainerIdentifier
  imageName: string
  imageTag: string
  createdAt: string
  state: ContainerState
  reason: string // kubernetes reason (like crashloop backoff) or docker state
  ports: ContainerPort[]
}

export type ContainerOperation = 'start' | 'stop' | 'restart'

export type ContainerCommand = {
  container: ContainerIdentifier
  operation: ContainerOperation
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

export type KeyValue = {
  key: string
  value: string
}

export type UniqueSecretKey = UniqueKey & {
  required: boolean
}

export type UniqueSecretKeyValue = UniqueSecretKey &
  UniqueKeyValue & {
    publicKey?: string
    encrypted: boolean
  }

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

export type ContainerStorage = {
  storageId?: string
  path?: string
  bucket?: string
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
  configContainer?: ContainerConfigContainer
  ports?: ContainerConfigPort[]
  portRanges?: ContainerConfigPortRange[]
  volumes?: ContainerConfigVolume[]
  commands?: UniqueKey[]
  args?: UniqueKey[]
  initContainers?: InitContainer[]
  capabilities: UniqueKeyValue[]
  storage?: ContainerStorage

  // dagent
  logConfig?: ContainerConfigLog
  restartPolicy: ContainerRestartPolicyType
  networkMode: ContainerNetworkMode
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

export type InstanceDagentConfigDetails = Pick<InstanceContainerConfigData, DagentSpecificConfig>
export type InstanceCraneConfigDetails = Pick<InstanceContainerConfigData, CraneSpecificConfig>
export type InstanceCommonConfigDetails = Omit<InstanceContainerConfigData, DagentSpecificConfig | CraneSpecificConfig>

export type MergedContainerConfigData = Omit<ContainerConfigData, 'secrets'> & {
  secrets: UniqueSecretKeyValue[]
}

export type InstanceContainerConfigData = Partial<MergedContainerConfigData>
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

export type JsonInitContainerVolumeLink = Omit<InitContainerVolumeLink, 'id'>
export type JsonContainerConfigPortRange = Omit<ContainerConfigPortRange, 'id'>
export type JsonContainerConfigPort = Omit<ContainerConfigPort, 'id'>
export type JsonContainerConfigVolume = Omit<ContainerConfigVolume, 'id'>
export type JsonContainerConfigSecretKey = Omit<UniqueSecretKey, 'id'>

export type JsonContainerConfig = {
  // common
  name?: string
  environment?: JsonKeyValue
  secrets?: JsonContainerConfigSecretKey[]
  ingress?: ContainerConfigIngress
  expose?: ContainerConfigExposeStrategy
  user?: number
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

  // dagent
  logConfig?: JsonContainerConfigLog
  restartPolicy?: ContainerRestartPolicyType
  networkMode?: ContainerNetworkMode
  networks?: string[]
  dockerLabels: JsonKeyValue

  // crane
  deploymentStrategy?: ContainerDeploymentStrategyType
  customHeaders?: string[]
  proxyHeaders?: boolean
  useLoadBalancer?: boolean
  extraLBAnnotations?: JsonKeyValue
  healthCheckConfig?: ContainerConfigHealthCheck
  resourceConfig?: ContainerConfigResourceConfig
  annotations: JsonMarker
  labels: JsonMarker
}

export type InstanceJsonContainerConfig = Omit<JsonContainerConfig, 'secrets'>

const mergeSecrets = (
  imageSecrets: UniqueSecretKey[],
  instanceSecrets: UniqueSecretKeyValue[],
): UniqueSecretKeyValue[] => {
  imageSecrets = imageSecrets ?? []
  instanceSecrets = instanceSecrets ?? []

  const overriddenIds: Set<string> = new Set(instanceSecrets?.map(it => it.id))

  const missing: UniqueSecretKeyValue[] = imageSecrets
    .filter(it => !overriddenIds.has(it.id))
    .map(it => ({
      ...it,
      value: '',
      encrypted: false,
      publicKey: null,
    }))

  return [...missing, ...instanceSecrets]
}

const mergeMarker = (image: Marker, instance: Marker): Marker => {
  if (!instance) {
    return image
  }

  if (!image) {
    return null
  }

  return {
    deployment: instance.deployment ?? image.deployment,
    ingress: instance.ingress ?? image.ingress,
    service: instance.service ?? image.service,
  }
}

export const mergeConfigs = (
  image: ContainerConfigData,
  instance: InstanceContainerConfigData,
): MergedContainerConfigData => {
  instance = instance ?? {}

  return {
    name: instance.name ?? image.name,
    environment: instance.environment ?? image.environment,
    secrets: mergeSecrets(image.secrets, instance.secrets),
    ports: instance.ports ?? image.ports,
    user: instance.user ?? image.user,
    tty: instance.tty ?? image.tty,
    portRanges: instance.portRanges ?? image.portRanges,
    args: instance.args ?? image.args,
    commands: instance.commands ?? image.commands,
    expose: instance.expose ?? image.expose,
    configContainer: instance.configContainer ?? image.configContainer,
    ingress: instance.ingress ?? image.ingress,
    volumes: instance.volumes ?? image.volumes,
    initContainers: instance.initContainers ?? image.initContainers,
    capabilities: null,
    storage: instance.storage ?? image.storage,

    // crane
    customHeaders: instance.customHeaders ?? image.customHeaders,
    proxyHeaders: instance.proxyHeaders ?? image.proxyHeaders,
    extraLBAnnotations: instance.extraLBAnnotations ?? image.extraLBAnnotations,
    healthCheckConfig: instance.healthCheckConfig ?? image.healthCheckConfig,
    resourceConfig: instance.resourceConfig ?? image.resourceConfig,
    useLoadBalancer: instance.useLoadBalancer ?? image.useLoadBalancer,
    deploymentStrategy: instance.deploymentStrategy ?? instance.deploymentStrategy ?? 'recreate',
    labels: mergeMarker(image.labels, instance.labels),
    annotations: mergeMarker(image.annotations, instance.annotations),

    // dagent
    logConfig: instance.logConfig ?? image.logConfig,
    networkMode: instance.networkMode ?? image.networkMode ?? 'none',
    restartPolicy: instance.restartPolicy ?? image.restartPolicy ?? 'unlessStopped',
    networks: instance.networks ?? image.networks,
    dockerLabels: instance.dockerLabels ?? image.dockerLabels,
  }
}

const keyValueArrayToJson = (list: UniqueKeyValue[]): JsonKeyValue =>
  list?.reduce((prev, it) => ({ ...prev, [it.key]: it.value }), {})

const keyArrayToJson = (list: UniqueKey[]): string[] => list?.map(it => it.key)

const removeId = <T extends { id: string }>(item: T): Omit<T, 'id'> => {
  const newItem: T = { ...item }
  delete newItem.id

  return newItem
}

export const imageConfigToJsonContainerConfig = (config: Partial<ContainerConfigData>): JsonContainerConfig => {
  const jsonConfig = {
    ...config,
    commands: keyArrayToJson(config.commands),
    args: keyArrayToJson(config.args),
    networks: keyArrayToJson(config.networks),
    customHeaders: keyArrayToJson(config.customHeaders),
    extraLBAnnotations: keyValueArrayToJson(config.extraLBAnnotations),
    environment: keyValueArrayToJson(config.environment),
    capabilities: keyValueArrayToJson(config.capabilities),
    secrets: config.secrets?.map(it => ({ key: it.key, required: it.required })),
    portRanges: config.portRanges?.map(it => removeId(it)),
    ports: config.ports?.map(it => removeId(it)),
    storage: config.storage,
    logConfig: config.logConfig
      ? {
          ...config.logConfig,
          options: keyValueArrayToJson(config.logConfig?.options),
        }
      : null,
    initContainers: config.initContainers?.map(container => ({
      ...removeId(container),
      command: keyArrayToJson(container.command),
      args: keyArrayToJson(container.args),
      environment: keyValueArrayToJson(container.environment),
      volumes: container.volumes?.map(vit => removeId(vit)),
    })),
    volumes: config.volumes?.map(it => removeId(it)),
    dockerLabels: keyValueArrayToJson(config.dockerLabels),
    annotations: config.annotations
      ? {
          deployment: keyValueArrayToJson(config.annotations.deployment),
          service: keyValueArrayToJson(config.annotations.service),
          ingress: keyValueArrayToJson(config.annotations.ingress),
        }
      : null,
    labels: config.labels
      ? {
          deployment: keyValueArrayToJson(config.labels.deployment),
          service: keyValueArrayToJson(config.labels.service),
          ingress: keyValueArrayToJson(config.labels.ingress),
        }
      : null,
  }

  const configObject = jsonConfig as any
  delete configObject.id
  delete configObject.imageId

  return jsonConfig
}

export const instanceConfigToJsonInstanceConfig = (
  config: InstanceContainerConfigData,
): InstanceJsonContainerConfig => {
  const json = imageConfigToJsonContainerConfig(config)

  delete json.secrets

  return json
}

const mergeKeyValuesWithJson = (items: UniqueKeyValue[], json: JsonKeyValue): UniqueKeyValue[] => {
  items = items ?? []

  if (!json || Object.keys(json).length < 1) {
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
  items = items ?? []

  if (!json || Object.entries(json).length < 1) {
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
    return containers ?? []
  }

  containers = containers ?? []

  json?.forEach(cont => {
    const contIndex = containers.findIndex(it => it.name === cont.name)

    if (contIndex > -1) {
      const current = containers[contIndex]

      containers[contIndex] = {
        ...current,
        args: mergeKeysWithJson(current.args, cont.args),
        command: mergeKeysWithJson(current.command, cont.command),
        environment: mergeKeyValuesWithJson(current.environment, cont.environment),
        volumes: cont.volumes?.map(volume => {
          const currentVol = current.volumes?.find(it => it.name === volume.name)

          return {
            ...volume,
            id: currentVol?.id ?? uuid(),
          }
        }),
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

export const mergeJsonConfigToInstanceContainerConfig = (
  config: InstanceContainerConfigData,
  json: InstanceJsonContainerConfig,
): InstanceContainerConfigData => {
  const result: InstanceContainerConfigData = {
    ...config,
    ...json,
    environment: mergeKeyValuesWithJson(config.environment, json.environment),
    extraLBAnnotations: mergeKeyValuesWithJson(config.extraLBAnnotations, json.extraLBAnnotations),
    capabilities: mergeKeyValuesWithJson(config.capabilities, json.capabilities),
    commands: mergeKeysWithJson(config.commands, json.commands),
    customHeaders: mergeKeysWithJson(config.customHeaders, json.customHeaders),
    networks: mergeKeysWithJson(config.networks, json.networks),
    args: mergeKeysWithJson(config.args, json.args),
    logConfig: json.logConfig
      ? {
          ...config.logConfig,
          ...json.logConfig,
          options: mergeKeyValuesWithJson(config.logConfig?.options, json.logConfig?.options),
        }
      : null,
    initContainers: mergeInitContainersWithJson(config.initContainers, json.initContainers),
    ports: !json.ports
      ? []
      : json.ports.map(it => ({
          ...it,
          id: uuid(),
        })),
    portRanges: !json.portRanges
      ? []
      : json.portRanges.map(it => ({
          ...it,
          id: uuid(),
        })),
    dockerLabels: mergeKeyValuesWithJson(config.dockerLabels, json.dockerLabels),
    labels: json.labels
      ? {
          deployment: mergeKeyValuesWithJson(config.labels.deployment, json.labels.deployment),
          service: mergeKeyValuesWithJson(config.labels.service, json.labels.service),
          ingress: mergeKeyValuesWithJson(config.labels.ingress, json.labels.ingress),
        }
      : null,
    annotations: json.annotations
      ? {
          deployment: mergeKeyValuesWithJson(config.annotations.deployment, json.annotations.deployment),
          service: mergeKeyValuesWithJson(config.annotations.service, json.annotations.service),
          ingress: mergeKeyValuesWithJson(config.annotations.ingress, json.annotations.ingress),
        }
      : null,
    volumes: json.volumes
      ? json.volumes.map(volume => {
          const currentVol = config.volumes?.find(it => it.name === volume.name)

          return {
            ...volume,
            id: currentVol?.id ?? uuid(),
          }
        })
      : null,
  }

  return result
}

export const mergeJsonConfigToImageContainerConfig = (
  config: ContainerConfigData,
  json: JsonContainerConfig,
): ContainerConfigData => {
  const asInstanceConfig = {
    ...config,
    secrets: null,
  }

  const instanceConf = mergeJsonConfigToInstanceContainerConfig(asInstanceConfig, json)
  return {
    ...config,
    ...instanceConf,
    secrets: mergeSecretsWithJson(config.secrets, json.secrets),
  }
}

export const portToString = (port: ContainerPort): string => {
  const { internal, external } = port

  if (internal && external) {
    return `${external}->${internal}`
  }

  if (internal) {
    return `None->${internal}`
  }

  if (external) {
    return `${external}->None`
  }

  throw new Error('Missing Port Information, provide either an internal or external port number.')
}

export const containerPortsToString = (ports: ContainerPort[], truncateAfter: number = 2): string => {
  ports = ports.sort((one, other) => one.internal - other.internal)

  const result: string[] = []

  truncateAfter = Math.min(ports.length, truncateAfter + 1)

  let start: ContainerPort = null
  let end: ContainerPort = null
  let next: string = null
  for (let index = 0; index < truncateAfter && result.length < truncateAfter; index++) {
    const port = ports[index]

    if (!start) {
      start = port
      end = port
      next = portToString(start)
    } else if (port.internal - 1 === end.internal) {
      end = port
      next = `${portToString(start)}-${portToString(end)}`
    } else {
      result.push(next)

      start = port
      end = port
      next = portToString(start)
    }
  }

  if (next && result.length < truncateAfter) {
    result.push(next)
  }

  return result.join(', ')
}

export const containerPrefixNameOf = (id: ContainerIdentifier): string =>
  !id.prefix ? id.name : `${id.prefix}-${id.name}`

export const containerIsStartable = (state: ContainerState) => state !== 'running' && state !== 'removing'
export const containerIsStopable = (state: ContainerState) => state === 'running' || state === 'paused'
export const containerIsRestartable = (state: ContainerState) => state === 'running'
