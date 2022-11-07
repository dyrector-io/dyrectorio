/* eslint-disable */
import { util, configure } from 'protobufjs/minimal'
import * as Long from 'long'
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
    default:
      return 'UNKNOWN'
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
    default:
      return 'UNKNOWN'
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
    default:
      return 'UNKNOWN'
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
    default:
      return 'UNKNOWN'
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
    default:
      return 'UNKNOWN'
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
    default:
      return 'UNKNOWN'
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
    default:
      return 'UNKNOWN'
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
    default:
      return 'UNKNOWN'
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

const baseEmpty: object = {}

export const Empty = {
  fromJSON(_: any): Empty {
    const message = { ...baseEmpty } as Empty
    return message
  },

  toJSON(_: Empty): unknown {
    const obj: any = {}
    return obj
  },
}

const baseInstanceDeploymentItem: object = { instanceId: '', state: 0 }

export const InstanceDeploymentItem = {
  fromJSON(object: any): InstanceDeploymentItem {
    const message = { ...baseInstanceDeploymentItem } as InstanceDeploymentItem
    message.instanceId = object.instanceId !== undefined && object.instanceId !== null ? String(object.instanceId) : ''
    message.state = object.state !== undefined && object.state !== null ? containerStateFromJSON(object.state) : 0
    return message
  },

  toJSON(message: InstanceDeploymentItem): unknown {
    const obj: any = {}
    message.instanceId !== undefined && (obj.instanceId = message.instanceId)
    message.state !== undefined && (obj.state = containerStateToJSON(message.state))
    return obj
  },
}

const baseDeploymentStatusMessage: object = { log: '' }

export const DeploymentStatusMessage = {
  fromJSON(object: any): DeploymentStatusMessage {
    const message = {
      ...baseDeploymentStatusMessage,
    } as DeploymentStatusMessage
    message.instance =
      object.instance !== undefined && object.instance !== null
        ? InstanceDeploymentItem.fromJSON(object.instance)
        : undefined
    message.deploymentStatus =
      object.deploymentStatus !== undefined && object.deploymentStatus !== null
        ? deploymentStatusFromJSON(object.deploymentStatus)
        : undefined
    message.log = (object.log ?? []).map((e: any) => String(e))
    return message
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

const baseContainerStateItemPort: object = { internal: 0, external: 0 }

export const ContainerStateItemPort = {
  fromJSON(object: any): ContainerStateItemPort {
    const message = { ...baseContainerStateItemPort } as ContainerStateItemPort
    message.internal = object.internal !== undefined && object.internal !== null ? Number(object.internal) : 0
    message.external = object.external !== undefined && object.external !== null ? Number(object.external) : 0
    return message
  },

  toJSON(message: ContainerStateItemPort): unknown {
    const obj: any = {}
    message.internal !== undefined && (obj.internal = Math.round(message.internal))
    message.external !== undefined && (obj.external = Math.round(message.external))
    return obj
  },
}

const baseContainerStateListMessage: object = {}

export const ContainerStateListMessage = {
  fromJSON(object: any): ContainerStateListMessage {
    const message = {
      ...baseContainerStateListMessage,
    } as ContainerStateListMessage
    message.prefix = object.prefix !== undefined && object.prefix !== null ? String(object.prefix) : undefined
    message.data = (object.data ?? []).map((e: any) => ContainerStateItem.fromJSON(e))
    return message
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

const baseContainerStateItem: object = {
  containerId: '',
  name: '',
  command: '',
  state: 0,
  status: '',
  imageName: '',
  imageTag: '',
}

export const ContainerStateItem = {
  fromJSON(object: any): ContainerStateItem {
    const message = { ...baseContainerStateItem } as ContainerStateItem
    message.containerId =
      object.containerId !== undefined && object.containerId !== null ? String(object.containerId) : ''
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    message.command = object.command !== undefined && object.command !== null ? String(object.command) : ''
    message.createdAt =
      object.createdAt !== undefined && object.createdAt !== null ? fromJsonTimestamp(object.createdAt) : undefined
    message.state = object.state !== undefined && object.state !== null ? containerStateFromJSON(object.state) : 0
    message.status = object.status !== undefined && object.status !== null ? String(object.status) : ''
    message.imageName = object.imageName !== undefined && object.imageName !== null ? String(object.imageName) : ''
    message.imageTag = object.imageTag !== undefined && object.imageTag !== null ? String(object.imageTag) : ''
    message.ports = (object.ports ?? []).map((e: any) => ContainerStateItemPort.fromJSON(e))
    return message
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

const baseIngress: object = { name: '', host: '' }

export const Ingress = {
  fromJSON(object: any): Ingress {
    const message = { ...baseIngress } as Ingress
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    message.host = object.host !== undefined && object.host !== null ? String(object.host) : ''
    message.uploadLimit =
      object.uploadLimit !== undefined && object.uploadLimit !== null ? String(object.uploadLimit) : undefined
    return message
  },

  toJSON(message: Ingress): unknown {
    const obj: any = {}
    message.name !== undefined && (obj.name = message.name)
    message.host !== undefined && (obj.host = message.host)
    message.uploadLimit !== undefined && (obj.uploadLimit = message.uploadLimit)
    return obj
  },
}

const baseConfigContainer: object = {
  image: '',
  volume: '',
  path: '',
  keepFiles: false,
}

export const ConfigContainer = {
  fromJSON(object: any): ConfigContainer {
    const message = { ...baseConfigContainer } as ConfigContainer
    message.image = object.image !== undefined && object.image !== null ? String(object.image) : ''
    message.volume = object.volume !== undefined && object.volume !== null ? String(object.volume) : ''
    message.path = object.path !== undefined && object.path !== null ? String(object.path) : ''
    message.keepFiles = object.keepFiles !== undefined && object.keepFiles !== null ? Boolean(object.keepFiles) : false
    return message
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

const baseHealthCheckConfig: object = {}

export const HealthCheckConfig = {
  fromJSON(object: any): HealthCheckConfig {
    const message = { ...baseHealthCheckConfig } as HealthCheckConfig
    message.port = object.port !== undefined && object.port !== null ? Number(object.port) : undefined
    message.livenessProbe =
      object.livenessProbe !== undefined && object.livenessProbe !== null ? String(object.livenessProbe) : undefined
    message.readinessProbe =
      object.readinessProbe !== undefined && object.readinessProbe !== null ? String(object.readinessProbe) : undefined
    message.startupProbe =
      object.startupProbe !== undefined && object.startupProbe !== null ? String(object.startupProbe) : undefined
    return message
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

const baseResource: object = {}

export const Resource = {
  fromJSON(object: any): Resource {
    const message = { ...baseResource } as Resource
    message.cpu = object.cpu !== undefined && object.cpu !== null ? String(object.cpu) : undefined
    message.memory = object.memory !== undefined && object.memory !== null ? String(object.memory) : undefined
    return message
  },

  toJSON(message: Resource): unknown {
    const obj: any = {}
    message.cpu !== undefined && (obj.cpu = message.cpu)
    message.memory !== undefined && (obj.memory = message.memory)
    return obj
  },
}

const baseResourceConfig: object = {}

export const ResourceConfig = {
  fromJSON(object: any): ResourceConfig {
    const message = { ...baseResourceConfig } as ResourceConfig
    message.limits =
      object.limits !== undefined && object.limits !== null ? Resource.fromJSON(object.limits) : undefined
    message.requests =
      object.requests !== undefined && object.requests !== null ? Resource.fromJSON(object.requests) : undefined
    return message
  },

  toJSON(message: ResourceConfig): unknown {
    const obj: any = {}
    message.limits !== undefined && (obj.limits = message.limits ? Resource.toJSON(message.limits) : undefined)
    message.requests !== undefined && (obj.requests = message.requests ? Resource.toJSON(message.requests) : undefined)
    return obj
  },
}

const baseKeyValue: object = { key: '', value: '' }

export const KeyValue = {
  fromJSON(object: any): KeyValue {
    const message = { ...baseKeyValue } as KeyValue
    message.key = object.key !== undefined && object.key !== null ? String(object.key) : ''
    message.value = object.value !== undefined && object.value !== null ? String(object.value) : ''
    return message
  },

  toJSON(message: KeyValue): unknown {
    const obj: any = {}
    message.key !== undefined && (obj.key = message.key)
    message.value !== undefined && (obj.value = message.value)
    return obj
  },
}

const baseListSecretsResponse: object = {
  prefix: '',
  name: '',
  publicKey: '',
  hasKeys: false,
  keys: '',
}

export const ListSecretsResponse = {
  fromJSON(object: any): ListSecretsResponse {
    const message = { ...baseListSecretsResponse } as ListSecretsResponse
    message.prefix = object.prefix !== undefined && object.prefix !== null ? String(object.prefix) : ''
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    message.publicKey = object.publicKey !== undefined && object.publicKey !== null ? String(object.publicKey) : ''
    message.hasKeys = object.hasKeys !== undefined && object.hasKeys !== null ? Boolean(object.hasKeys) : false
    message.keys = (object.keys ?? []).map((e: any) => String(e))
    return message
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

const baseUniqueKey: object = { id: '', key: '' }

export const UniqueKey = {
  fromJSON(object: any): UniqueKey {
    const message = { ...baseUniqueKey } as UniqueKey
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.key = object.key !== undefined && object.key !== null ? String(object.key) : ''
    return message
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

// If you get a compile-error about 'Constructor<Long> and ... have no overlap',
// add '--ts_proto_opt=esModuleInterop=true' as a flag when calling 'protoc'.
if (util.Long !== Long) {
  util.Long = Long as any
  configure()
}
