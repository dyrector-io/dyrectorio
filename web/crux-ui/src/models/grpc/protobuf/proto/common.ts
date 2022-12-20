/* eslint-disable */
import _m0 from 'protobufjs/minimal'
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

export enum ContainerOperation {
  CONTAINER_OPERATION_UNSPECIFIED = 0,
  START_CONTAINER = 1,
  STOP_CONTAINER = 2,
  RESTART_CONTAINER = 3,
  GET_LOGS = 4,
  UNRECOGNIZED = -1,
}

export function containerOperationFromJSON(object: any): ContainerOperation {
  switch (object) {
    case 0:
    case 'CONTAINER_OPERATION_UNSPECIFIED':
      return ContainerOperation.CONTAINER_OPERATION_UNSPECIFIED
    case 1:
    case 'START_CONTAINER':
      return ContainerOperation.START_CONTAINER
    case 2:
    case 'STOP_CONTAINER':
      return ContainerOperation.STOP_CONTAINER
    case 3:
    case 'RESTART_CONTAINER':
      return ContainerOperation.RESTART_CONTAINER
    case 4:
    case 'GET_LOGS':
      return ContainerOperation.GET_LOGS
    case -1:
    case 'UNRECOGNIZED':
    default:
      return ContainerOperation.UNRECOGNIZED
  }
}

export function containerOperationToJSON(object: ContainerOperation): string {
  switch (object) {
    case ContainerOperation.CONTAINER_OPERATION_UNSPECIFIED:
      return 'CONTAINER_OPERATION_UNSPECIFIED'
    case ContainerOperation.START_CONTAINER:
      return 'START_CONTAINER'
    case ContainerOperation.STOP_CONTAINER:
      return 'STOP_CONTAINER'
    case ContainerOperation.RESTART_CONTAINER:
      return 'RESTART_CONTAINER'
    case ContainerOperation.GET_LOGS:
      return 'GET_LOGS'
    case ContainerOperation.UNRECOGNIZED:
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
  id: string | undefined
  prefix: string | undefined
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

export interface ContainerLogMessage {
  containerId: string | undefined
  prefix: string | undefined
  log: string
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

export interface ContainerIdentifier {
  prefix: string
  name: string
}

export interface ContainerCommandRequest {
  id: string | undefined
  prefixName: ContainerIdentifier | undefined
  operation: ContainerOperation
}

export interface DeleteContainersRequest {
  containerId: string | undefined
  prefixName: ContainerIdentifier | undefined
  prefix: string | undefined
}

function createBaseEmpty(): Empty {
  return {}
}

export const Empty = {
  encode(_: Empty, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Empty {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseEmpty()
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
    return {}
  },

  toJSON(_: Empty): unknown {
    const obj: any = {}
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<Empty>, I>>(_: I): Empty {
    const message = createBaseEmpty()
    return message
  },
}

function createBaseInstanceDeploymentItem(): InstanceDeploymentItem {
  return { instanceId: '', state: 0 }
}

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
    const message = createBaseInstanceDeploymentItem()
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

  fromPartial<I extends Exact<DeepPartial<InstanceDeploymentItem>, I>>(object: I): InstanceDeploymentItem {
    const message = createBaseInstanceDeploymentItem()
    message.instanceId = object.instanceId ?? ''
    message.state = object.state ?? 0
    return message
  },
}

function createBaseDeploymentStatusMessage(): DeploymentStatusMessage {
  return { instance: undefined, deploymentStatus: undefined, log: [] }
}

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
    const message = createBaseDeploymentStatusMessage()
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

  fromPartial<I extends Exact<DeepPartial<DeploymentStatusMessage>, I>>(object: I): DeploymentStatusMessage {
    const message = createBaseDeploymentStatusMessage()
    message.instance =
      object.instance !== undefined && object.instance !== null
        ? InstanceDeploymentItem.fromPartial(object.instance)
        : undefined
    message.deploymentStatus = object.deploymentStatus ?? undefined
    message.log = object.log?.map(e => e) || []
    return message
  },
}

function createBaseContainerStateItemPort(): ContainerStateItemPort {
  return { internal: 0, external: 0 }
}

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
    const message = createBaseContainerStateItemPort()
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

  fromPartial<I extends Exact<DeepPartial<ContainerStateItemPort>, I>>(object: I): ContainerStateItemPort {
    const message = createBaseContainerStateItemPort()
    message.internal = object.internal ?? 0
    message.external = object.external ?? 0
    return message
  },
}

function createBaseContainerStateListMessage(): ContainerStateListMessage {
  return { data: [] }
}

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
    const message = createBaseContainerStateListMessage()
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

  fromPartial<I extends Exact<DeepPartial<ContainerStateListMessage>, I>>(object: I): ContainerStateListMessage {
    const message = createBaseContainerStateListMessage()
    message.prefix = object.prefix ?? undefined
    message.data = object.data?.map(e => ContainerStateItem.fromPartial(e)) || []
    return message
  },
}

function createBaseContainerStateItem(): ContainerStateItem {
  return {
    id: undefined,
    prefix: undefined,
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
  encode(message: ContainerStateItem, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== undefined) {
      writer.uint32(1602).string(message.id)
    }
    if (message.prefix !== undefined) {
      writer.uint32(1610).string(message.prefix)
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
    const message = createBaseContainerStateItem()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 200:
          message.id = reader.string()
          break
        case 201:
          message.prefix = reader.string()
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
    return {
      id: isSet(object.id) ? String(object.id) : undefined,
      prefix: isSet(object.prefix) ? String(object.prefix) : undefined,
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
    message.id !== undefined && (obj.id = message.id)
    message.prefix !== undefined && (obj.prefix = message.prefix)
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
    const message = createBaseContainerStateItem()
    message.id = object.id ?? undefined
    message.prefix = object.prefix ?? undefined
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

function createBaseContainerLogMessage(): ContainerLogMessage {
  return { containerId: undefined, prefix: undefined, log: '' }
}

export const ContainerLogMessage = {
  encode(message: ContainerLogMessage, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.containerId !== undefined) {
      writer.uint32(1602).string(message.containerId)
    }
    if (message.prefix !== undefined) {
      writer.uint32(1610).string(message.prefix)
    }
    if (message.log !== '') {
      writer.uint32(810).string(message.log)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ContainerLogMessage {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseContainerLogMessage()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 200:
          message.containerId = reader.string()
          break
        case 201:
          message.prefix = reader.string()
          break
        case 101:
          message.log = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): ContainerLogMessage {
    return {
      containerId: isSet(object.containerId) ? String(object.containerId) : undefined,
      prefix: isSet(object.prefix) ? String(object.prefix) : undefined,
      log: isSet(object.log) ? String(object.log) : '',
    }
  },

  toJSON(message: ContainerLogMessage): unknown {
    const obj: any = {}
    message.containerId !== undefined && (obj.containerId = message.containerId)
    message.prefix !== undefined && (obj.prefix = message.prefix)
    message.log !== undefined && (obj.log = message.log)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<ContainerLogMessage>, I>>(object: I): ContainerLogMessage {
    const message = createBaseContainerLogMessage()
    message.containerId = object.containerId ?? undefined
    message.prefix = object.prefix ?? undefined
    message.log = object.log ?? ''
    return message
  },
}

function createBaseIngress(): Ingress {
  return { name: '', host: '' }
}

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
    const message = createBaseIngress()
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

  fromPartial<I extends Exact<DeepPartial<Ingress>, I>>(object: I): Ingress {
    const message = createBaseIngress()
    message.name = object.name ?? ''
    message.host = object.host ?? ''
    message.uploadLimit = object.uploadLimit ?? undefined
    return message
  },
}

function createBaseConfigContainer(): ConfigContainer {
  return { image: '', volume: '', path: '', keepFiles: false }
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
    const message = createBaseConfigContainer()
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

  fromPartial<I extends Exact<DeepPartial<ConfigContainer>, I>>(object: I): ConfigContainer {
    const message = createBaseConfigContainer()
    message.image = object.image ?? ''
    message.volume = object.volume ?? ''
    message.path = object.path ?? ''
    message.keepFiles = object.keepFiles ?? false
    return message
  },
}

function createBaseHealthCheckConfig(): HealthCheckConfig {
  return {}
}

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
    const message = createBaseHealthCheckConfig()
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

  fromPartial<I extends Exact<DeepPartial<HealthCheckConfig>, I>>(object: I): HealthCheckConfig {
    const message = createBaseHealthCheckConfig()
    message.port = object.port ?? undefined
    message.livenessProbe = object.livenessProbe ?? undefined
    message.readinessProbe = object.readinessProbe ?? undefined
    message.startupProbe = object.startupProbe ?? undefined
    return message
  },
}

function createBaseResource(): Resource {
  return {}
}

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
    const message = createBaseResource()
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

  fromPartial<I extends Exact<DeepPartial<Resource>, I>>(object: I): Resource {
    const message = createBaseResource()
    message.cpu = object.cpu ?? undefined
    message.memory = object.memory ?? undefined
    return message
  },
}

function createBaseResourceConfig(): ResourceConfig {
  return {}
}

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
    const message = createBaseResourceConfig()
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

  fromPartial<I extends Exact<DeepPartial<ResourceConfig>, I>>(object: I): ResourceConfig {
    const message = createBaseResourceConfig()
    message.limits =
      object.limits !== undefined && object.limits !== null ? Resource.fromPartial(object.limits) : undefined
    message.requests =
      object.requests !== undefined && object.requests !== null ? Resource.fromPartial(object.requests) : undefined
    return message
  },
}

function createBaseKeyValue(): KeyValue {
  return { key: '', value: '' }
}

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
    const message = createBaseKeyValue()
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
    return { key: isSet(object.key) ? String(object.key) : '', value: isSet(object.value) ? String(object.value) : '' }
  },

  toJSON(message: KeyValue): unknown {
    const obj: any = {}
    message.key !== undefined && (obj.key = message.key)
    message.value !== undefined && (obj.value = message.value)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<KeyValue>, I>>(object: I): KeyValue {
    const message = createBaseKeyValue()
    message.key = object.key ?? ''
    message.value = object.value ?? ''
    return message
  },
}

function createBaseListSecretsResponse(): ListSecretsResponse {
  return { prefix: '', name: '', publicKey: '', hasKeys: false, keys: [] }
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
    const message = createBaseListSecretsResponse()
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

  fromPartial<I extends Exact<DeepPartial<ListSecretsResponse>, I>>(object: I): ListSecretsResponse {
    const message = createBaseListSecretsResponse()
    message.prefix = object.prefix ?? ''
    message.name = object.name ?? ''
    message.publicKey = object.publicKey ?? ''
    message.hasKeys = object.hasKeys ?? false
    message.keys = object.keys?.map(e => e) || []
    return message
  },
}

function createBaseUniqueKey(): UniqueKey {
  return { id: '', key: '' }
}

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
    const message = createBaseUniqueKey()
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
    return { id: isSet(object.id) ? String(object.id) : '', key: isSet(object.key) ? String(object.key) : '' }
  },

  toJSON(message: UniqueKey): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.key !== undefined && (obj.key = message.key)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<UniqueKey>, I>>(object: I): UniqueKey {
    const message = createBaseUniqueKey()
    message.id = object.id ?? ''
    message.key = object.key ?? ''
    return message
  },
}

function createBaseContainerIdentifier(): ContainerIdentifier {
  return { prefix: '', name: '' }
}

export const ContainerIdentifier = {
  encode(message: ContainerIdentifier, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.prefix !== '') {
      writer.uint32(10).string(message.prefix)
    }
    if (message.name !== '') {
      writer.uint32(18).string(message.name)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ContainerIdentifier {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseContainerIdentifier()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.prefix = reader.string()
          break
        case 2:
          message.name = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): ContainerIdentifier {
    return {
      prefix: isSet(object.prefix) ? String(object.prefix) : '',
      name: isSet(object.name) ? String(object.name) : '',
    }
  },

  toJSON(message: ContainerIdentifier): unknown {
    const obj: any = {}
    message.prefix !== undefined && (obj.prefix = message.prefix)
    message.name !== undefined && (obj.name = message.name)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<ContainerIdentifier>, I>>(object: I): ContainerIdentifier {
    const message = createBaseContainerIdentifier()
    message.prefix = object.prefix ?? ''
    message.name = object.name ?? ''
    return message
  },
}

function createBaseContainerCommandRequest(): ContainerCommandRequest {
  return { id: undefined, prefixName: undefined, operation: 0 }
}

export const ContainerCommandRequest = {
  encode(message: ContainerCommandRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== undefined) {
      writer.uint32(1602).string(message.id)
    }
    if (message.prefixName !== undefined) {
      ContainerIdentifier.encode(message.prefixName, writer.uint32(1610).fork()).ldelim()
    }
    if (message.operation !== 0) {
      writer.uint32(800).int32(message.operation)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ContainerCommandRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseContainerCommandRequest()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 200:
          message.id = reader.string()
          break
        case 201:
          message.prefixName = ContainerIdentifier.decode(reader, reader.uint32())
          break
        case 100:
          message.operation = reader.int32() as any
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): ContainerCommandRequest {
    return {
      id: isSet(object.id) ? String(object.id) : undefined,
      prefixName: isSet(object.prefixName) ? ContainerIdentifier.fromJSON(object.prefixName) : undefined,
      operation: isSet(object.operation) ? containerOperationFromJSON(object.operation) : 0,
    }
  },

  toJSON(message: ContainerCommandRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.prefixName !== undefined &&
      (obj.prefixName = message.prefixName ? ContainerIdentifier.toJSON(message.prefixName) : undefined)
    message.operation !== undefined && (obj.operation = containerOperationToJSON(message.operation))
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<ContainerCommandRequest>, I>>(object: I): ContainerCommandRequest {
    const message = createBaseContainerCommandRequest()
    message.id = object.id ?? undefined
    message.prefixName =
      object.prefixName !== undefined && object.prefixName !== null
        ? ContainerIdentifier.fromPartial(object.prefixName)
        : undefined
    message.operation = object.operation ?? 0
    return message
  },
}

function createBaseDeleteContainersRequest(): DeleteContainersRequest {
  return { containerId: undefined, prefixName: undefined, prefix: undefined }
}

export const DeleteContainersRequest = {
  encode(message: DeleteContainersRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.containerId !== undefined) {
      writer.uint32(1602).string(message.containerId)
    }
    if (message.prefixName !== undefined) {
      ContainerIdentifier.encode(message.prefixName, writer.uint32(1610).fork()).ldelim()
    }
    if (message.prefix !== undefined) {
      writer.uint32(1618).string(message.prefix)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DeleteContainersRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseDeleteContainersRequest()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 200:
          message.containerId = reader.string()
          break
        case 201:
          message.prefixName = ContainerIdentifier.decode(reader, reader.uint32())
          break
        case 202:
          message.prefix = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): DeleteContainersRequest {
    return {
      containerId: isSet(object.containerId) ? String(object.containerId) : undefined,
      prefixName: isSet(object.prefixName) ? ContainerIdentifier.fromJSON(object.prefixName) : undefined,
      prefix: isSet(object.prefix) ? String(object.prefix) : undefined,
    }
  },

  toJSON(message: DeleteContainersRequest): unknown {
    const obj: any = {}
    message.containerId !== undefined && (obj.containerId = message.containerId)
    message.prefixName !== undefined &&
      (obj.prefixName = message.prefixName ? ContainerIdentifier.toJSON(message.prefixName) : undefined)
    message.prefix !== undefined && (obj.prefix = message.prefix)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<DeleteContainersRequest>, I>>(object: I): DeleteContainersRequest {
    const message = createBaseDeleteContainersRequest()
    message.containerId = object.containerId ?? undefined
    message.prefixName =
      object.prefixName !== undefined && object.prefixName !== null
        ? ContainerIdentifier.fromPartial(object.prefixName)
        : undefined
    message.prefix = object.prefix ?? undefined
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
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never }

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
