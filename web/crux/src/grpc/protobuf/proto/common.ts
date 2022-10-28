/* eslint-disable */
import { Timestamp } from '../../google/protobuf/timestamp'

export const protobufPackage = 'common'

/** Deployment */
export enum ContainerState {
  CONTAINER_STATE_UNSPECIFIED = 0,
  CREATED = 1,
  RESTARTING = 2,
  RUNNING = 3,
  REMOVING = 4,
  PAUSED = 5,
  EXITED = 6,
  DEAD = 7,
  UNRECOGNIZED = -1,
}

export function containerStateFromJSON(object: any): ContainerState {
  switch (object) {
    case 0:
    case 'CONTAINER_STATE_UNSPECIFIED':
      return ContainerState.CONTAINER_STATE_UNSPECIFIED
    case 1:
    case 'CREATED':
      return ContainerState.CREATED
    case 2:
    case 'RESTARTING':
      return ContainerState.RESTARTING
    case 3:
    case 'RUNNING':
      return ContainerState.RUNNING
    case 4:
    case 'REMOVING':
      return ContainerState.REMOVING
    case 5:
    case 'PAUSED':
      return ContainerState.PAUSED
    case 6:
    case 'EXITED':
      return ContainerState.EXITED
    case 7:
    case 'DEAD':
      return ContainerState.DEAD
    case -1:
    case 'UNRECOGNIZED':
    default:
      return ContainerState.UNRECOGNIZED
  }
}

export function containerStateToJSON(object: ContainerState): string {
  switch (object) {
    case ContainerState.CONTAINER_STATE_UNSPECIFIED:
      return 'CONTAINER_STATE_UNSPECIFIED'
    case ContainerState.CREATED:
      return 'CREATED'
    case ContainerState.RESTARTING:
      return 'RESTARTING'
    case ContainerState.RUNNING:
      return 'RUNNING'
    case ContainerState.REMOVING:
      return 'REMOVING'
    case ContainerState.PAUSED:
      return 'PAUSED'
    case ContainerState.EXITED:
      return 'EXITED'
    case ContainerState.DEAD:
      return 'DEAD'
    case ContainerState.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED'
  }
}

export enum DeploymentStatus {
  DEPLOYMENT_STATUS_UNSPECIFIED = 0,
  PREPARING = 1,
  IN_PROGRESS = 2,
  SUCCESSFUL = 3,
  FAILED = 4,
  OBSOLATE = 5,
  DOWNGRADED = 6,
  UNRECOGNIZED = -1,
}

export function deploymentStatusFromJSON(object: any): DeploymentStatus {
  switch (object) {
    case 0:
    case 'DEPLOYMENT_STATUS_UNSPECIFIED':
      return DeploymentStatus.DEPLOYMENT_STATUS_UNSPECIFIED
    case 1:
    case 'PREPARING':
      return DeploymentStatus.PREPARING
    case 2:
    case 'IN_PROGRESS':
      return DeploymentStatus.IN_PROGRESS
    case 3:
    case 'SUCCESSFUL':
      return DeploymentStatus.SUCCESSFUL
    case 4:
    case 'FAILED':
      return DeploymentStatus.FAILED
    case 5:
    case 'OBSOLATE':
      return DeploymentStatus.OBSOLATE
    case 6:
    case 'DOWNGRADED':
      return DeploymentStatus.DOWNGRADED
    case -1:
    case 'UNRECOGNIZED':
    default:
      return DeploymentStatus.UNRECOGNIZED
  }
}

export function deploymentStatusToJSON(object: DeploymentStatus): string {
  switch (object) {
    case DeploymentStatus.DEPLOYMENT_STATUS_UNSPECIFIED:
      return 'DEPLOYMENT_STATUS_UNSPECIFIED'
    case DeploymentStatus.PREPARING:
      return 'PREPARING'
    case DeploymentStatus.IN_PROGRESS:
      return 'IN_PROGRESS'
    case DeploymentStatus.SUCCESSFUL:
      return 'SUCCESSFUL'
    case DeploymentStatus.FAILED:
      return 'FAILED'
    case DeploymentStatus.OBSOLATE:
      return 'OBSOLATE'
    case DeploymentStatus.DOWNGRADED:
      return 'DOWNGRADED'
    case DeploymentStatus.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED'
  }
}

export enum NetworkMode {
  NETWORK_MODE_UNSPECIFIED = 0,
  BRIDGE = 1,
  HOST = 2,
  OVERLAY = 3,
  IPVLAN = 4,
  MACVLAN = 5,
  NONE = 6,
  UNRECOGNIZED = -1,
}

export function networkModeFromJSON(object: any): NetworkMode {
  switch (object) {
    case 0:
    case 'NETWORK_MODE_UNSPECIFIED':
      return NetworkMode.NETWORK_MODE_UNSPECIFIED
    case 1:
    case 'BRIDGE':
      return NetworkMode.BRIDGE
    case 2:
    case 'HOST':
      return NetworkMode.HOST
    case 3:
    case 'OVERLAY':
      return NetworkMode.OVERLAY
    case 4:
    case 'IPVLAN':
      return NetworkMode.IPVLAN
    case 5:
    case 'MACVLAN':
      return NetworkMode.MACVLAN
    case 6:
    case 'NONE':
      return NetworkMode.NONE
    case -1:
    case 'UNRECOGNIZED':
    default:
      return NetworkMode.UNRECOGNIZED
  }
}

export function networkModeToJSON(object: NetworkMode): string {
  switch (object) {
    case NetworkMode.NETWORK_MODE_UNSPECIFIED:
      return 'NETWORK_MODE_UNSPECIFIED'
    case NetworkMode.BRIDGE:
      return 'BRIDGE'
    case NetworkMode.HOST:
      return 'HOST'
    case NetworkMode.OVERLAY:
      return 'OVERLAY'
    case NetworkMode.IPVLAN:
      return 'IPVLAN'
    case NetworkMode.MACVLAN:
      return 'MACVLAN'
    case NetworkMode.NONE:
      return 'NONE'
    case NetworkMode.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED'
  }
}

export enum RestartPolicy {
  POLICY_UNSPECIFIED = 0,
  UNDEFINED = 1,
  NO = 2,
  ON_FAILURE = 3,
  ALWAYS = 4,
  UNLESS_STOPPED = 5,
  UNRECOGNIZED = -1,
}

export function restartPolicyFromJSON(object: any): RestartPolicy {
  switch (object) {
    case 0:
    case 'POLICY_UNSPECIFIED':
      return RestartPolicy.POLICY_UNSPECIFIED
    case 1:
    case 'UNDEFINED':
      return RestartPolicy.UNDEFINED
    case 2:
    case 'NO':
      return RestartPolicy.NO
    case 3:
    case 'ON_FAILURE':
      return RestartPolicy.ON_FAILURE
    case 4:
    case 'ALWAYS':
      return RestartPolicy.ALWAYS
    case 5:
    case 'UNLESS_STOPPED':
      return RestartPolicy.UNLESS_STOPPED
    case -1:
    case 'UNRECOGNIZED':
    default:
      return RestartPolicy.UNRECOGNIZED
  }
}

export function restartPolicyToJSON(object: RestartPolicy): string {
  switch (object) {
    case RestartPolicy.POLICY_UNSPECIFIED:
      return 'POLICY_UNSPECIFIED'
    case RestartPolicy.UNDEFINED:
      return 'UNDEFINED'
    case RestartPolicy.NO:
      return 'NO'
    case RestartPolicy.ON_FAILURE:
      return 'ON_FAILURE'
    case RestartPolicy.ALWAYS:
      return 'ALWAYS'
    case RestartPolicy.UNLESS_STOPPED:
      return 'UNLESS_STOPPED'
    case RestartPolicy.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED'
  }
}

export enum DeploymentStrategy {
  DEPLOYMENT_STRATEGY_UNSPECIFIED = 0,
  RECREATE = 1,
  ROLLING = 2,
  UNRECOGNIZED = -1,
}

export function deploymentStrategyFromJSON(object: any): DeploymentStrategy {
  switch (object) {
    case 0:
    case 'DEPLOYMENT_STRATEGY_UNSPECIFIED':
      return DeploymentStrategy.DEPLOYMENT_STRATEGY_UNSPECIFIED
    case 1:
    case 'RECREATE':
      return DeploymentStrategy.RECREATE
    case 2:
    case 'ROLLING':
      return DeploymentStrategy.ROLLING
    case -1:
    case 'UNRECOGNIZED':
    default:
      return DeploymentStrategy.UNRECOGNIZED
  }
}

export function deploymentStrategyToJSON(object: DeploymentStrategy): string {
  switch (object) {
    case DeploymentStrategy.DEPLOYMENT_STRATEGY_UNSPECIFIED:
      return 'DEPLOYMENT_STRATEGY_UNSPECIFIED'
    case DeploymentStrategy.RECREATE:
      return 'RECREATE'
    case DeploymentStrategy.ROLLING:
      return 'ROLLING'
    case DeploymentStrategy.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED'
  }
}

export enum VolumeType {
  VOLUME_TYPE_UNSPECIFIED = 0,
  RO = 1,
  RW = 2,
  RWX = 3,
  MEM = 4,
  TMP = 5,
  UNRECOGNIZED = -1,
}

export function volumeTypeFromJSON(object: any): VolumeType {
  switch (object) {
    case 0:
    case 'VOLUME_TYPE_UNSPECIFIED':
      return VolumeType.VOLUME_TYPE_UNSPECIFIED
    case 1:
    case 'RO':
      return VolumeType.RO
    case 2:
    case 'RW':
      return VolumeType.RW
    case 3:
    case 'RWX':
      return VolumeType.RWX
    case 4:
    case 'MEM':
      return VolumeType.MEM
    case 5:
    case 'TMP':
      return VolumeType.TMP
    case -1:
    case 'UNRECOGNIZED':
    default:
      return VolumeType.UNRECOGNIZED
  }
}

export function volumeTypeToJSON(object: VolumeType): string {
  switch (object) {
    case VolumeType.VOLUME_TYPE_UNSPECIFIED:
      return 'VOLUME_TYPE_UNSPECIFIED'
    case VolumeType.RO:
      return 'RO'
    case VolumeType.RW:
      return 'RW'
    case VolumeType.RWX:
      return 'RWX'
    case VolumeType.MEM:
      return 'MEM'
    case VolumeType.TMP:
      return 'TMP'
    case VolumeType.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED'
  }
}

export enum DriverType {
  DRIVER_TYPE_UNSPECIFIED = 0,
  DRIVER_TYPE_NONE = 1,
  GCPLOGS = 2,
  LOCAL = 3,
  JSON_FILE = 4,
  SYSLOG = 5,
  JOURNALD = 6,
  GELF = 7,
  FLUENTD = 8,
  AWSLOGS = 9,
  SPLUNK = 10,
  ETWLOGS = 11,
  LOGENTRIES = 12,
  UNRECOGNIZED = -1,
}

export function driverTypeFromJSON(object: any): DriverType {
  switch (object) {
    case 0:
    case 'DRIVER_TYPE_UNSPECIFIED':
      return DriverType.DRIVER_TYPE_UNSPECIFIED
    case 1:
    case 'DRIVER_TYPE_NONE':
      return DriverType.DRIVER_TYPE_NONE
    case 2:
    case 'GCPLOGS':
      return DriverType.GCPLOGS
    case 3:
    case 'LOCAL':
      return DriverType.LOCAL
    case 4:
    case 'JSON_FILE':
      return DriverType.JSON_FILE
    case 5:
    case 'SYSLOG':
      return DriverType.SYSLOG
    case 6:
    case 'JOURNALD':
      return DriverType.JOURNALD
    case 7:
    case 'GELF':
      return DriverType.GELF
    case 8:
    case 'FLUENTD':
      return DriverType.FLUENTD
    case 9:
    case 'AWSLOGS':
      return DriverType.AWSLOGS
    case 10:
    case 'SPLUNK':
      return DriverType.SPLUNK
    case 11:
    case 'ETWLOGS':
      return DriverType.ETWLOGS
    case 12:
    case 'LOGENTRIES':
      return DriverType.LOGENTRIES
    case -1:
    case 'UNRECOGNIZED':
    default:
      return DriverType.UNRECOGNIZED
  }
}

export function driverTypeToJSON(object: DriverType): string {
  switch (object) {
    case DriverType.DRIVER_TYPE_UNSPECIFIED:
      return 'DRIVER_TYPE_UNSPECIFIED'
    case DriverType.DRIVER_TYPE_NONE:
      return 'DRIVER_TYPE_NONE'
    case DriverType.GCPLOGS:
      return 'GCPLOGS'
    case DriverType.LOCAL:
      return 'LOCAL'
    case DriverType.JSON_FILE:
      return 'JSON_FILE'
    case DriverType.SYSLOG:
      return 'SYSLOG'
    case DriverType.JOURNALD:
      return 'JOURNALD'
    case DriverType.GELF:
      return 'GELF'
    case DriverType.FLUENTD:
      return 'FLUENTD'
    case DriverType.AWSLOGS:
      return 'AWSLOGS'
    case DriverType.SPLUNK:
      return 'SPLUNK'
    case DriverType.ETWLOGS:
      return 'ETWLOGS'
    case DriverType.LOGENTRIES:
      return 'LOGENTRIES'
    case DriverType.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED'
  }
}

export enum ExposeStrategy {
  EXPOSE_STRATEGY_UNSPECIFIED = 0,
  NONE_ES = 1,
  EXPOSE = 2,
  EXPOSE_WITH_TLS = 3,
  UNRECOGNIZED = -1,
}

export function exposeStrategyFromJSON(object: any): ExposeStrategy {
  switch (object) {
    case 0:
    case 'EXPOSE_STRATEGY_UNSPECIFIED':
      return ExposeStrategy.EXPOSE_STRATEGY_UNSPECIFIED
    case 1:
    case 'NONE_ES':
      return ExposeStrategy.NONE_ES
    case 2:
    case 'EXPOSE':
      return ExposeStrategy.EXPOSE
    case 3:
    case 'EXPOSE_WITH_TLS':
      return ExposeStrategy.EXPOSE_WITH_TLS
    case -1:
    case 'UNRECOGNIZED':
    default:
      return ExposeStrategy.UNRECOGNIZED
  }
}

export function exposeStrategyToJSON(object: ExposeStrategy): string {
  switch (object) {
    case ExposeStrategy.EXPOSE_STRATEGY_UNSPECIFIED:
      return 'EXPOSE_STRATEGY_UNSPECIFIED'
    case ExposeStrategy.NONE_ES:
      return 'NONE_ES'
    case ExposeStrategy.EXPOSE:
      return 'EXPOSE'
    case ExposeStrategy.EXPOSE_WITH_TLS:
      return 'EXPOSE_WITH_TLS'
    case ExposeStrategy.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED'
  }
}

export interface Empty {}

export interface InstanceDeploymentItem {
  instanceId: string
  state: ContainerState
}

export interface DeploymentStatusMessage {
  instance: InstanceDeploymentItem | undefined
  deploymentStatus: DeploymentStatus | undefined
  log: string[]
}

export interface ContainerStateItemPort {
  internal: number
  external: number
}

export interface ContainerStateListMessage {
  prefix?: string | undefined
  data: ContainerStateItem[]
}

export interface ContainerStateItem {
  containerId: string
  name: string
  command: string
  createdAt: Timestamp | undefined
  /** The 'State' of the container (Created, Running, etc) */
  state: ContainerState
  /**
   * The 'Status' of the container ("Created 1min ago", "Exited with code 123",
   * etc). Unused but left here for reverse compatibility with the legacy
   * version.
   */
  status: string
  imageName: string
  imageTag: string
  ports: ContainerStateItemPort[]
}

export interface Ingress {
  name: string
  host: string
  uploadLimit?: string | undefined
}

export interface ConfigContainer {
  image: string
  volume: string
  path: string
  keepFiles: boolean
}

export interface HealthCheckConfig {
  port?: number | undefined
  livenessProbe?: string | undefined
  readinessProbe?: string | undefined
  startupProbe?: string | undefined
}

export interface Resource {
  cpu?: string | undefined
  memory?: string | undefined
}

export interface ResourceConfig {
  limits?: Resource | undefined
  requests?: Resource | undefined
}

export interface KeyValue {
  key: string
  value: string
}

export interface ListSecretsResponse {
  prefix: string
  name: string
  publicKey: string
  hasKeys: boolean
  keys: string[]
}

export interface UniqueKey {
  id: string
  key: string
}

export const COMMON_PACKAGE_NAME = 'common'

function createBaseEmpty(): Empty {
  return {}
}

export const Empty = {
  fromJSON(_: any): Empty {
    return {}
  },

  toJSON(_: Empty): unknown {
    const obj: any = {}
    return obj
  },
}

function createBaseInstanceDeploymentItem(): InstanceDeploymentItem {
  return { instanceId: '', state: 0 }
}

export const InstanceDeploymentItem = {
  fromJSON(object: any): InstanceDeploymentItem {
    return {
      instanceId: isSet(object.instanceId) ? String(object.instanceId) : '',
      state: isSet(object.state) ? containerStateFromJSON(object.state) : 0,
    }
  },

  toJSON(message: InstanceDeploymentItem): unknown {
    const obj: any = {}
    message.instanceId !== undefined && (obj.instanceId = message.instanceId)
    message.state !== undefined && (obj.state = containerStateToJSON(message.state))
    return obj
  },
}

function createBaseDeploymentStatusMessage(): DeploymentStatusMessage {
  return { instance: undefined, deploymentStatus: undefined, log: [] }
}

export const DeploymentStatusMessage = {
  fromJSON(object: any): DeploymentStatusMessage {
    return {
      instance: isSet(object.instance) ? InstanceDeploymentItem.fromJSON(object.instance) : undefined,
      deploymentStatus: isSet(object.deploymentStatus) ? deploymentStatusFromJSON(object.deploymentStatus) : undefined,
      log: Array.isArray(object?.log) ? object.log.map((e: any) => String(e)) : [],
    }
  },

  toJSON(message: DeploymentStatusMessage): unknown {
    const obj: any = {}
    message.instance !== undefined &&
      (obj.instance = message.instance ? InstanceDeploymentItem.toJSON(message.instance) : undefined)
    message.deploymentStatus !== undefined &&
      (obj.deploymentStatus =
        message.deploymentStatus !== undefined ? deploymentStatusToJSON(message.deploymentStatus) : undefined)
    if (message.log) {
      obj.log = message.log.map(e => e)
    } else {
      obj.log = []
    }
    return obj
  },
}

function createBaseContainerStateItemPort(): ContainerStateItemPort {
  return { internal: 0, external: 0 }
}

export const ContainerStateItemPort = {
  fromJSON(object: any): ContainerStateItemPort {
    return {
      internal: isSet(object.internal) ? Number(object.internal) : 0,
      external: isSet(object.external) ? Number(object.external) : 0,
    }
  },

  toJSON(message: ContainerStateItemPort): unknown {
    const obj: any = {}
    message.internal !== undefined && (obj.internal = Math.round(message.internal))
    message.external !== undefined && (obj.external = Math.round(message.external))
    return obj
  },
}

function createBaseContainerStateListMessage(): ContainerStateListMessage {
  return { data: [] }
}

export const ContainerStateListMessage = {
  fromJSON(object: any): ContainerStateListMessage {
    return {
      prefix: isSet(object.prefix) ? String(object.prefix) : undefined,
      data: Array.isArray(object?.data) ? object.data.map((e: any) => ContainerStateItem.fromJSON(e)) : [],
    }
  },

  toJSON(message: ContainerStateListMessage): unknown {
    const obj: any = {}
    message.prefix !== undefined && (obj.prefix = message.prefix)
    if (message.data) {
      obj.data = message.data.map(e => (e ? ContainerStateItem.toJSON(e) : undefined))
    } else {
      obj.data = []
    }
    return obj
  },
}

function createBaseContainerStateItem(): ContainerStateItem {
  return {
    containerId: '',
    name: '',
    command: '',
    createdAt: undefined,
    state: 0,
    status: '',
    imageName: '',
    imageTag: '',
    ports: [],
  }
}

export const ContainerStateItem = {
  fromJSON(object: any): ContainerStateItem {
    return {
      containerId: isSet(object.containerId) ? String(object.containerId) : '',
      name: isSet(object.name) ? String(object.name) : '',
      command: isSet(object.command) ? String(object.command) : '',
      createdAt: isSet(object.createdAt) ? fromJsonTimestamp(object.createdAt) : undefined,
      state: isSet(object.state) ? containerStateFromJSON(object.state) : 0,
      status: isSet(object.status) ? String(object.status) : '',
      imageName: isSet(object.imageName) ? String(object.imageName) : '',
      imageTag: isSet(object.imageTag) ? String(object.imageTag) : '',
      ports: Array.isArray(object?.ports) ? object.ports.map((e: any) => ContainerStateItemPort.fromJSON(e)) : [],
    }
  },

  toJSON(message: ContainerStateItem): unknown {
    const obj: any = {}
    message.containerId !== undefined && (obj.containerId = message.containerId)
    message.name !== undefined && (obj.name = message.name)
    message.command !== undefined && (obj.command = message.command)
    message.createdAt !== undefined && (obj.createdAt = fromTimestamp(message.createdAt).toISOString())
    message.state !== undefined && (obj.state = containerStateToJSON(message.state))
    message.status !== undefined && (obj.status = message.status)
    message.imageName !== undefined && (obj.imageName = message.imageName)
    message.imageTag !== undefined && (obj.imageTag = message.imageTag)
    if (message.ports) {
      obj.ports = message.ports.map(e => (e ? ContainerStateItemPort.toJSON(e) : undefined))
    } else {
      obj.ports = []
    }
    return obj
  },
}

function createBaseIngress(): Ingress {
  return { name: '', host: '' }
}

export const Ingress = {
  fromJSON(object: any): Ingress {
    return {
      name: isSet(object.name) ? String(object.name) : '',
      host: isSet(object.host) ? String(object.host) : '',
      uploadLimit: isSet(object.uploadLimit) ? String(object.uploadLimit) : undefined,
    }
  },

  toJSON(message: Ingress): unknown {
    const obj: any = {}
    message.name !== undefined && (obj.name = message.name)
    message.host !== undefined && (obj.host = message.host)
    message.uploadLimit !== undefined && (obj.uploadLimit = message.uploadLimit)
    return obj
  },
}

function createBaseConfigContainer(): ConfigContainer {
  return { image: '', volume: '', path: '', keepFiles: false }
}

export const ConfigContainer = {
  fromJSON(object: any): ConfigContainer {
    return {
      image: isSet(object.image) ? String(object.image) : '',
      volume: isSet(object.volume) ? String(object.volume) : '',
      path: isSet(object.path) ? String(object.path) : '',
      keepFiles: isSet(object.keepFiles) ? Boolean(object.keepFiles) : false,
    }
  },

  toJSON(message: ConfigContainer): unknown {
    const obj: any = {}
    message.image !== undefined && (obj.image = message.image)
    message.volume !== undefined && (obj.volume = message.volume)
    message.path !== undefined && (obj.path = message.path)
    message.keepFiles !== undefined && (obj.keepFiles = message.keepFiles)
    return obj
  },
}

function createBaseHealthCheckConfig(): HealthCheckConfig {
  return {}
}

export const HealthCheckConfig = {
  fromJSON(object: any): HealthCheckConfig {
    return {
      port: isSet(object.port) ? Number(object.port) : undefined,
      livenessProbe: isSet(object.livenessProbe) ? String(object.livenessProbe) : undefined,
      readinessProbe: isSet(object.readinessProbe) ? String(object.readinessProbe) : undefined,
      startupProbe: isSet(object.startupProbe) ? String(object.startupProbe) : undefined,
    }
  },

  toJSON(message: HealthCheckConfig): unknown {
    const obj: any = {}
    message.port !== undefined && (obj.port = Math.round(message.port))
    message.livenessProbe !== undefined && (obj.livenessProbe = message.livenessProbe)
    message.readinessProbe !== undefined && (obj.readinessProbe = message.readinessProbe)
    message.startupProbe !== undefined && (obj.startupProbe = message.startupProbe)
    return obj
  },
}

function createBaseResource(): Resource {
  return {}
}

export const Resource = {
  fromJSON(object: any): Resource {
    return {
      cpu: isSet(object.cpu) ? String(object.cpu) : undefined,
      memory: isSet(object.memory) ? String(object.memory) : undefined,
    }
  },

  toJSON(message: Resource): unknown {
    const obj: any = {}
    message.cpu !== undefined && (obj.cpu = message.cpu)
    message.memory !== undefined && (obj.memory = message.memory)
    return obj
  },
}

function createBaseResourceConfig(): ResourceConfig {
  return {}
}

export const ResourceConfig = {
  fromJSON(object: any): ResourceConfig {
    return {
      limits: isSet(object.limits) ? Resource.fromJSON(object.limits) : undefined,
      requests: isSet(object.requests) ? Resource.fromJSON(object.requests) : undefined,
    }
  },

  toJSON(message: ResourceConfig): unknown {
    const obj: any = {}
    message.limits !== undefined && (obj.limits = message.limits ? Resource.toJSON(message.limits) : undefined)
    message.requests !== undefined && (obj.requests = message.requests ? Resource.toJSON(message.requests) : undefined)
    return obj
  },
}

function createBaseKeyValue(): KeyValue {
  return { key: '', value: '' }
}

export const KeyValue = {
  fromJSON(object: any): KeyValue {
    return { key: isSet(object.key) ? String(object.key) : '', value: isSet(object.value) ? String(object.value) : '' }
  },

  toJSON(message: KeyValue): unknown {
    const obj: any = {}
    message.key !== undefined && (obj.key = message.key)
    message.value !== undefined && (obj.value = message.value)
    return obj
  },
}

function createBaseListSecretsResponse(): ListSecretsResponse {
  return { prefix: '', name: '', publicKey: '', hasKeys: false, keys: [] }
}

export const ListSecretsResponse = {
  fromJSON(object: any): ListSecretsResponse {
    return {
      prefix: isSet(object.prefix) ? String(object.prefix) : '',
      name: isSet(object.name) ? String(object.name) : '',
      publicKey: isSet(object.publicKey) ? String(object.publicKey) : '',
      hasKeys: isSet(object.hasKeys) ? Boolean(object.hasKeys) : false,
      keys: Array.isArray(object?.keys) ? object.keys.map((e: any) => String(e)) : [],
    }
  },

  toJSON(message: ListSecretsResponse): unknown {
    const obj: any = {}
    message.prefix !== undefined && (obj.prefix = message.prefix)
    message.name !== undefined && (obj.name = message.name)
    message.publicKey !== undefined && (obj.publicKey = message.publicKey)
    message.hasKeys !== undefined && (obj.hasKeys = message.hasKeys)
    if (message.keys) {
      obj.keys = message.keys.map(e => e)
    } else {
      obj.keys = []
    }
    return obj
  },
}

function createBaseUniqueKey(): UniqueKey {
  return { id: '', key: '' }
}

export const UniqueKey = {
  fromJSON(object: any): UniqueKey {
    return { id: isSet(object.id) ? String(object.id) : '', key: isSet(object.key) ? String(object.key) : '' }
  },

  toJSON(message: UniqueKey): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.key !== undefined && (obj.key = message.key)
    return obj
  },
}

function toTimestamp(date: Date): Timestamp {
  const seconds = date.getTime() / 1_000
  const nanos = (date.getTime() % 1_000) * 1_000_000
  return { seconds, nanos }
}

function fromTimestamp(t: Timestamp): Date {
  let millis = t.seconds * 1_000
  millis += t.nanos / 1_000_000
  return new Date(millis)
}

function fromJsonTimestamp(o: any): Timestamp {
  if (o instanceof Date) {
    return toTimestamp(o)
  } else if (typeof o === 'string') {
    return toTimestamp(new Date(o))
  } else {
    return Timestamp.fromJSON(o)
  }
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined
}
