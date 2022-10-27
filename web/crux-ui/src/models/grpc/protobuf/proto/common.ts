/* eslint-disable */
import Long from 'long'
import _m0 from 'protobufjs/minimal'
import { Timestamp } from '../../google/protobuf/timestamp'

export const protobufPackage = 'common'

/** Deployment */
export enum ContainerState {
  UNKNOWN_CONTAINER_STATE = 0,
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
    case 'UNKNOWN_CONTAINER_STATE':
      return ContainerState.UNKNOWN_CONTAINER_STATE
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
    case ContainerState.UNKNOWN_CONTAINER_STATE:
      return 'UNKNOWN_CONTAINER_STATE'
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
  UNKNOWN_DEPLOYMENT_STATUS = 0,
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
    case 'UNKNOWN_DEPLOYMENT_STATUS':
      return DeploymentStatus.UNKNOWN_DEPLOYMENT_STATUS
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
    case DeploymentStatus.UNKNOWN_DEPLOYMENT_STATUS:
      return 'UNKNOWN_DEPLOYMENT_STATUS'
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
  UNKNOWN_NETWORK_MODE = 0,
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
    case 'UNKNOWN_NETWORK_MODE':
      return NetworkMode.UNKNOWN_NETWORK_MODE
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
    case NetworkMode.UNKNOWN_NETWORK_MODE:
      return 'UNKNOWN_NETWORK_MODE'
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
  UNKNOWN_POLICY = 0,
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
    case 'UNKNOWN_POLICY':
      return RestartPolicy.UNKNOWN_POLICY
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
    case RestartPolicy.UNKNOWN_POLICY:
      return 'UNKNOWN_POLICY'
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
  UNKOWN_DEPLOYMENT_STRATEGY = 0,
  RECREATE = 1,
  ROLLING = 2,
  UNRECOGNIZED = -1,
}

export function deploymentStrategyFromJSON(object: any): DeploymentStrategy {
  switch (object) {
    case 0:
    case 'UNKOWN_DEPLOYMENT_STRATEGY':
      return DeploymentStrategy.UNKOWN_DEPLOYMENT_STRATEGY
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
    case DeploymentStrategy.UNKOWN_DEPLOYMENT_STRATEGY:
      return 'UNKOWN_DEPLOYMENT_STRATEGY'
    case DeploymentStrategy.RECREATE:
      return 'RECREATE'
    case DeploymentStrategy.ROLLING:
      return 'ROLLING'
    default:
      return 'UNKNOWN'
  }
}

export enum VolumeType {
  UNKNOWN_VOLUME_TYPE = 0,
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
    case 'UNKNOWN_VOLUME_TYPE':
      return VolumeType.UNKNOWN_VOLUME_TYPE
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
    case VolumeType.UNKNOWN_VOLUME_TYPE:
      return 'UNKNOWN_VOLUME_TYPE'
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
  UNKNOWN_DRIVER_TYPE = 0,
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
    case 'UNKNOWN_DRIVER_TYPE':
      return DriverType.UNKNOWN_DRIVER_TYPE
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
    case DriverType.UNKNOWN_DRIVER_TYPE:
      return 'UNKNOWN_DRIVER_TYPE'
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
  UNKNOWN_EXPOSE_STRATEGY = 0,
  NONE_ES = 1,
  EXPOSE = 2,
  EXPOSE_WITH_TLS = 3,
  UNRECOGNIZED = -1,
}

export function exposeStrategyFromJSON(object: any): ExposeStrategy {
  switch (object) {
    case 0:
    case 'UNKNOWN_EXPOSE_STRATEGY':
      return ExposeStrategy.UNKNOWN_EXPOSE_STRATEGY
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
    case ExposeStrategy.UNKNOWN_EXPOSE_STRATEGY:
      return 'UNKNOWN_EXPOSE_STRATEGY'
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

const baseEmpty: object = {}

export const Empty = {
  encode(_: Empty, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Empty {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseEmpty } as Empty
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(_: any): Empty {
    const message = { ...baseEmpty } as Empty
    return message
  },

  toJSON(_: Empty): unknown {
    const obj: any = {}
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<Empty>, I>>(_: I): Empty {
    const message = { ...baseEmpty } as Empty
    return message
  },
}

const baseInstanceDeploymentItem: object = { instanceId: '', state: 0 }

export const InstanceDeploymentItem = {
  encode(message: InstanceDeploymentItem, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.instanceId !== '') {
      writer.uint32(802).string(message.instanceId)
    }
    if (message.state !== 0) {
      writer.uint32(808).int32(message.state)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): InstanceDeploymentItem {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseInstanceDeploymentItem } as InstanceDeploymentItem
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 100:
          message.instanceId = reader.string()
          break
        case 101:
          message.state = reader.int32() as any
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

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

  fromPartial<I extends Exact<DeepPartial<InstanceDeploymentItem>, I>>(object: I): InstanceDeploymentItem {
    const message = { ...baseInstanceDeploymentItem } as InstanceDeploymentItem
    message.instanceId = object.instanceId ?? ''
    message.state = object.state ?? 0
    return message
  },
}

const baseDeploymentStatusMessage: object = { log: '' }

export const DeploymentStatusMessage = {
  encode(message: DeploymentStatusMessage, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.instance !== undefined) {
      InstanceDeploymentItem.encode(message.instance, writer.uint32(1602).fork()).ldelim()
    }
    if (message.deploymentStatus !== undefined) {
      writer.uint32(1608).int32(message.deploymentStatus)
    }
    for (const v of message.log) {
      writer.uint32(8002).string(v!)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DeploymentStatusMessage {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = {
      ...baseDeploymentStatusMessage,
    } as DeploymentStatusMessage
    message.log = []
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 200:
          message.instance = InstanceDeploymentItem.decode(reader, reader.uint32())
          break
        case 201:
          message.deploymentStatus = reader.int32() as any
          break
        case 1000:
          message.log.push(reader.string())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

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

  fromPartial<I extends Exact<DeepPartial<DeploymentStatusMessage>, I>>(object: I): DeploymentStatusMessage {
    const message = {
      ...baseDeploymentStatusMessage,
    } as DeploymentStatusMessage
    message.instance =
      object.instance !== undefined && object.instance !== null
        ? InstanceDeploymentItem.fromPartial(object.instance)
        : undefined
    message.deploymentStatus = object.deploymentStatus ?? undefined
    message.log = object.log?.map(e => e) || []
    return message
  },
}

const baseContainerStateItemPort: object = { internal: 0, external: 0 }

export const ContainerStateItemPort = {
  encode(message: ContainerStateItemPort, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.internal !== 0) {
      writer.uint32(800).int32(message.internal)
    }
    if (message.external !== 0) {
      writer.uint32(808).int32(message.external)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ContainerStateItemPort {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseContainerStateItemPort } as ContainerStateItemPort
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 100:
          message.internal = reader.int32()
          break
        case 101:
          message.external = reader.int32()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

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

  fromPartial<I extends Exact<DeepPartial<ContainerStateItemPort>, I>>(object: I): ContainerStateItemPort {
    const message = { ...baseContainerStateItemPort } as ContainerStateItemPort
    message.internal = object.internal ?? 0
    message.external = object.external ?? 0
    return message
  },
}

const baseContainerStateListMessage: object = {}

export const ContainerStateListMessage = {
  encode(message: ContainerStateListMessage, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.prefix !== undefined) {
      writer.uint32(802).string(message.prefix)
    }
    for (const v of message.data) {
      ContainerStateItem.encode(v!, writer.uint32(8002).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ContainerStateListMessage {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = {
      ...baseContainerStateListMessage,
    } as ContainerStateListMessage
    message.data = []
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 100:
          message.prefix = reader.string()
          break
        case 1000:
          message.data.push(ContainerStateItem.decode(reader, reader.uint32()))
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

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

  fromPartial<I extends Exact<DeepPartial<ContainerStateListMessage>, I>>(object: I): ContainerStateListMessage {
    const message = {
      ...baseContainerStateListMessage,
    } as ContainerStateListMessage
    message.prefix = object.prefix ?? undefined
    message.data = object.data?.map(e => ContainerStateItem.fromPartial(e)) || []
    return message
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
  encode(message: ContainerStateItem, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.containerId !== '') {
      writer.uint32(802).string(message.containerId)
    }
    if (message.name !== '') {
      writer.uint32(810).string(message.name)
    }
    if (message.command !== '') {
      writer.uint32(826).string(message.command)
    }
    if (message.createdAt !== undefined) {
      Timestamp.encode(message.createdAt, writer.uint32(834).fork()).ldelim()
    }
    if (message.state !== 0) {
      writer.uint32(840).int32(message.state)
    }
    if (message.status !== '') {
      writer.uint32(850).string(message.status)
    }
    if (message.imageName !== '') {
      writer.uint32(858).string(message.imageName)
    }
    if (message.imageTag !== '') {
      writer.uint32(866).string(message.imageTag)
    }
    for (const v of message.ports) {
      ContainerStateItemPort.encode(v!, writer.uint32(8002).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ContainerStateItem {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseContainerStateItem } as ContainerStateItem
    message.ports = []
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 100:
          message.containerId = reader.string()
          break
        case 101:
          message.name = reader.string()
          break
        case 103:
          message.command = reader.string()
          break
        case 104:
          message.createdAt = Timestamp.decode(reader, reader.uint32())
          break
        case 105:
          message.state = reader.int32() as any
          break
        case 106:
          message.status = reader.string()
          break
        case 107:
          message.imageName = reader.string()
          break
        case 108:
          message.imageTag = reader.string()
          break
        case 1000:
          message.ports.push(ContainerStateItemPort.decode(reader, reader.uint32()))
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

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

  fromPartial<I extends Exact<DeepPartial<ContainerStateItem>, I>>(object: I): ContainerStateItem {
    const message = { ...baseContainerStateItem } as ContainerStateItem
    message.containerId = object.containerId ?? ''
    message.name = object.name ?? ''
    message.command = object.command ?? ''
    message.createdAt =
      object.createdAt !== undefined && object.createdAt !== null ? Timestamp.fromPartial(object.createdAt) : undefined
    message.state = object.state ?? 0
    message.status = object.status ?? ''
    message.imageName = object.imageName ?? ''
    message.imageTag = object.imageTag ?? ''
    message.ports = object.ports?.map(e => ContainerStateItemPort.fromPartial(e)) || []
    return message
  },
}

const baseIngress: object = { name: '', host: '' }

export const Ingress = {
  encode(message: Ingress, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== '') {
      writer.uint32(802).string(message.name)
    }
    if (message.host !== '') {
      writer.uint32(810).string(message.host)
    }
    if (message.uploadLimit !== undefined) {
      writer.uint32(818).string(message.uploadLimit)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Ingress {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseIngress } as Ingress
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 100:
          message.name = reader.string()
          break
        case 101:
          message.host = reader.string()
          break
        case 102:
          message.uploadLimit = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

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

  fromPartial<I extends Exact<DeepPartial<Ingress>, I>>(object: I): Ingress {
    const message = { ...baseIngress } as Ingress
    message.name = object.name ?? ''
    message.host = object.host ?? ''
    message.uploadLimit = object.uploadLimit ?? undefined
    return message
  },
}

const baseConfigContainer: object = {
  image: '',
  volume: '',
  path: '',
  keepFiles: false,
}

export const ConfigContainer = {
  encode(message: ConfigContainer, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.image !== '') {
      writer.uint32(802).string(message.image)
    }
    if (message.volume !== '') {
      writer.uint32(810).string(message.volume)
    }
    if (message.path !== '') {
      writer.uint32(818).string(message.path)
    }
    if (message.keepFiles === true) {
      writer.uint32(824).bool(message.keepFiles)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ConfigContainer {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseConfigContainer } as ConfigContainer
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 100:
          message.image = reader.string()
          break
        case 101:
          message.volume = reader.string()
          break
        case 102:
          message.path = reader.string()
          break
        case 103:
          message.keepFiles = reader.bool()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

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

  fromPartial<I extends Exact<DeepPartial<ConfigContainer>, I>>(object: I): ConfigContainer {
    const message = { ...baseConfigContainer } as ConfigContainer
    message.image = object.image ?? ''
    message.volume = object.volume ?? ''
    message.path = object.path ?? ''
    message.keepFiles = object.keepFiles ?? false
    return message
  },
}

const baseHealthCheckConfig: object = {}

export const HealthCheckConfig = {
  encode(message: HealthCheckConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.port !== undefined) {
      writer.uint32(800).int32(message.port)
    }
    if (message.livenessProbe !== undefined) {
      writer.uint32(810).string(message.livenessProbe)
    }
    if (message.readinessProbe !== undefined) {
      writer.uint32(818).string(message.readinessProbe)
    }
    if (message.startupProbe !== undefined) {
      writer.uint32(826).string(message.startupProbe)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): HealthCheckConfig {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseHealthCheckConfig } as HealthCheckConfig
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 100:
          message.port = reader.int32()
          break
        case 101:
          message.livenessProbe = reader.string()
          break
        case 102:
          message.readinessProbe = reader.string()
          break
        case 103:
          message.startupProbe = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

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

  fromPartial<I extends Exact<DeepPartial<HealthCheckConfig>, I>>(object: I): HealthCheckConfig {
    const message = { ...baseHealthCheckConfig } as HealthCheckConfig
    message.port = object.port ?? undefined
    message.livenessProbe = object.livenessProbe ?? undefined
    message.readinessProbe = object.readinessProbe ?? undefined
    message.startupProbe = object.startupProbe ?? undefined
    return message
  },
}

const baseResource: object = {}

export const Resource = {
  encode(message: Resource, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.cpu !== undefined) {
      writer.uint32(802).string(message.cpu)
    }
    if (message.memory !== undefined) {
      writer.uint32(810).string(message.memory)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Resource {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseResource } as Resource
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 100:
          message.cpu = reader.string()
          break
        case 101:
          message.memory = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

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

  fromPartial<I extends Exact<DeepPartial<Resource>, I>>(object: I): Resource {
    const message = { ...baseResource } as Resource
    message.cpu = object.cpu ?? undefined
    message.memory = object.memory ?? undefined
    return message
  },
}

const baseResourceConfig: object = {}

export const ResourceConfig = {
  encode(message: ResourceConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.limits !== undefined) {
      Resource.encode(message.limits, writer.uint32(802).fork()).ldelim()
    }
    if (message.requests !== undefined) {
      Resource.encode(message.requests, writer.uint32(810).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ResourceConfig {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseResourceConfig } as ResourceConfig
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 100:
          message.limits = Resource.decode(reader, reader.uint32())
          break
        case 101:
          message.requests = Resource.decode(reader, reader.uint32())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

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

  fromPartial<I extends Exact<DeepPartial<ResourceConfig>, I>>(object: I): ResourceConfig {
    const message = { ...baseResourceConfig } as ResourceConfig
    message.limits =
      object.limits !== undefined && object.limits !== null ? Resource.fromPartial(object.limits) : undefined
    message.requests =
      object.requests !== undefined && object.requests !== null ? Resource.fromPartial(object.requests) : undefined
    return message
  },
}

const baseKeyValue: object = { key: '', value: '' }

export const KeyValue = {
  encode(message: KeyValue, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== '') {
      writer.uint32(802).string(message.key)
    }
    if (message.value !== '') {
      writer.uint32(810).string(message.value)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): KeyValue {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseKeyValue } as KeyValue
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 100:
          message.key = reader.string()
          break
        case 101:
          message.value = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

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

  fromPartial<I extends Exact<DeepPartial<KeyValue>, I>>(object: I): KeyValue {
    const message = { ...baseKeyValue } as KeyValue
    message.key = object.key ?? ''
    message.value = object.value ?? ''
    return message
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
  encode(message: ListSecretsResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.prefix !== '') {
      writer.uint32(10).string(message.prefix)
    }
    if (message.name !== '') {
      writer.uint32(18).string(message.name)
    }
    if (message.publicKey !== '') {
      writer.uint32(26).string(message.publicKey)
    }
    if (message.hasKeys === true) {
      writer.uint32(32).bool(message.hasKeys)
    }
    for (const v of message.keys) {
      writer.uint32(42).string(v!)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ListSecretsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseListSecretsResponse } as ListSecretsResponse
    message.keys = []
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.prefix = reader.string()
          break
        case 2:
          message.name = reader.string()
          break
        case 3:
          message.publicKey = reader.string()
          break
        case 4:
          message.hasKeys = reader.bool()
          break
        case 5:
          message.keys.push(reader.string())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

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

  fromPartial<I extends Exact<DeepPartial<ListSecretsResponse>, I>>(object: I): ListSecretsResponse {
    const message = { ...baseListSecretsResponse } as ListSecretsResponse
    message.prefix = object.prefix ?? ''
    message.name = object.name ?? ''
    message.publicKey = object.publicKey ?? ''
    message.hasKeys = object.hasKeys ?? false
    message.keys = object.keys?.map(e => e) || []
    return message
  },
}

const baseUniqueKey: object = { id: '', key: '' }

export const UniqueKey = {
  encode(message: UniqueKey, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(802).string(message.id)
    }
    if (message.key !== '') {
      writer.uint32(810).string(message.key)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UniqueKey {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseUniqueKey } as UniqueKey
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 100:
          message.id = reader.string()
          break
        case 101:
          message.key = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

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

  fromPartial<I extends Exact<DeepPartial<UniqueKey>, I>>(object: I): UniqueKey {
    const message = { ...baseUniqueKey } as UniqueKey
    message.id = object.id ?? ''
    message.key = object.key ?? ''
    return message
  },
}

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined

export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends {}
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>

type KeysOfUnion<T> = T extends T ? keyof T : never
export type Exact<P, I extends P> = P extends Builtin
  ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & Record<Exclude<keyof I, KeysOfUnion<P>>, never>

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

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any
  _m0.configure()
}
