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
  NONE = 1,
  HOST = 2,
  BRIDGE = 3,
  UNRECOGNIZED = -1,
}

export function networkModeFromJSON(object: any): NetworkMode {
  switch (object) {
    case 0:
    case 'UNKNOWN_NETWORK_MODE':
      return NetworkMode.UNKNOWN_NETWORK_MODE
    case 1:
    case 'NONE':
      return NetworkMode.NONE
    case 2:
    case 'HOST':
      return NetworkMode.HOST
    case 3:
    case 'BRIDGE':
      return NetworkMode.BRIDGE
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
    case NetworkMode.NONE:
      return 'NONE'
    case NetworkMode.HOST:
      return 'HOST'
    case NetworkMode.BRIDGE:
      return 'BRIDGE'
    default:
      return 'UNKNOWN'
  }
}

export enum RestartPolicy {
  UNKNOWN_POLICY = 0,
  EMPTY = 1,
  ALWAYS = 2,
  UNLESS_STOPPED = 3,
  NO = 4,
  ON_FAILURE = 5,
  UNRECOGNIZED = -1,
}

export function restartPolicyFromJSON(object: any): RestartPolicy {
  switch (object) {
    case 0:
    case 'UNKNOWN_POLICY':
      return RestartPolicy.UNKNOWN_POLICY
    case 1:
    case 'EMPTY':
      return RestartPolicy.EMPTY
    case 2:
    case 'ALWAYS':
      return RestartPolicy.ALWAYS
    case 3:
    case 'UNLESS_STOPPED':
      return RestartPolicy.UNLESS_STOPPED
    case 4:
    case 'NO':
      return RestartPolicy.NO
    case 5:
    case 'ON_FAILURE':
      return RestartPolicy.ON_FAILURE
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
    case RestartPolicy.EMPTY:
      return 'EMPTY'
    case RestartPolicy.ALWAYS:
      return 'ALWAYS'
    case RestartPolicy.UNLESS_STOPPED:
      return 'UNLESS_STOPPED'
    case RestartPolicy.NO:
      return 'NO'
    case RestartPolicy.ON_FAILURE:
      return 'ON_FAILURE'
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
  ports: Port[]
}

export interface ContainerStateListMessage {
  prefix?: string | undefined
  data: ContainerStateItem[]
}

export interface InstanceDeploymentItem {
  instanceId: string
  state: ContainerState
}

export interface DeploymentStatusMessage {
  instance: InstanceDeploymentItem | undefined
  deploymentStatus: DeploymentStatus | undefined
  log: string[]
}

export interface Port {
  internal: number
  external: number
}

export interface PortRange {
  from: number
  to: number
}

export interface PortRangeBinding {
  internal: PortRange | undefined
  external: PortRange | undefined
}

export interface Volume {
  name: string
  path: string
  size?: string | undefined
  type?: string | undefined
  class?: string | undefined
}

export interface Expose {
  /** if expose is needed */
  public: boolean
  /** if tls is needed */
  tls: boolean
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

export interface ImportContainer {
  environments: { [key: string]: string }
  volume: string
  command: string
}

export interface ImportContainer_EnvironmentsEntry {
  key: string
  value: string
}

export interface LogConfig {
  driver: string
  options: { [key: string]: string }
}

export interface LogConfig_OptionsEntry {
  key: string
  value: string
}

/**
 * volumes referred as VolumeLink
 * they won't get created if non-existent
 */
export interface VolumeLink {
  name: string
  path: string
}

export interface InitContainer {
  name: string
  image: string
  environments: { [key: string]: string }
  useParentConfig?: boolean | undefined
  volumes: VolumeLink[]
  command: string[]
  args: string[]
}

export interface InitContainer_EnvironmentsEntry {
  key: string
  value: string
}

export interface DagentContainerConfig {
  logConfig?: LogConfig | undefined
  restartPolicy?: RestartPolicy | undefined
  networkMode?: NetworkMode | undefined
  networks: string[]
}

export interface HealthCheckConfig {
  port: number
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

export interface CraneContainerConfig {
  deploymentStatregy?: DeploymentStrategy | undefined
  healthCheckConfig?: HealthCheckConfig | undefined
  resourceConfig?: ResourceConfig | undefined
  proxyHeaders?: boolean | undefined
  useLoadBalancer?: boolean | undefined
  extraLBAnnotations: { [key: string]: string }
  customHeaders: string[]
}

export interface CraneContainerConfig_ExtraLBAnnotationsEntry {
  key: string
  value: string
}

export interface ExplicitContainerConfig {
  dagent?: DagentContainerConfig | undefined
  crane?: CraneContainerConfig | undefined
  expose?: Expose | undefined
  ingress?: Ingress | undefined
  configContainer?: ConfigContainer | undefined
  importContainer?: ImportContainer | undefined
  user?: number | undefined
  TTY?: boolean | undefined
  ports: Port[]
  portRanges: PortRangeBinding[]
  volumes: Volume[]
  command: string[]
  args: string[]
  environments: string[]
  secrets?: KeyValueList | undefined
  initContainers: InitContainer[]
}

export interface UniqueKey {
  id: string
  key: string
}

export interface KeyList {
  data: UniqueKey[]
}

export interface UniqueKeyValue {
  id: string
  key: string
  value: string
}

export interface UniqueKeySecretValue {
  id: string
  key: string
  value: string
  encrypted?: boolean | undefined
}

export interface KeyValueList {
  data: UniqueKeyValue[]
}

export interface SecretList {
  data: UniqueKeySecretValue[]
}

export interface ListSecretsResponse {
  prefix: string
  name: string
  publicKey: string
  hasKeys: boolean
  keys: string[]
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
      Port.encode(v!, writer.uint32(8002).fork()).ldelim()
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
          message.ports.push(Port.decode(reader, reader.uint32()))
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
    message.ports = (object.ports ?? []).map((e: any) => Port.fromJSON(e))
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
      obj.ports = message.ports.map(e => (e ? Port.toJSON(e) : undefined))
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
    message.ports = object.ports?.map(e => Port.fromPartial(e)) || []
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

const basePort: object = { internal: 0, external: 0 }

export const Port = {
  encode(message: Port, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.internal !== 0) {
      writer.uint32(8).int32(message.internal)
    }
    if (message.external !== 0) {
      writer.uint32(16).int32(message.external)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Port {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...basePort } as Port
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.internal = reader.int32()
          break
        case 2:
          message.external = reader.int32()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): Port {
    const message = { ...basePort } as Port
    message.internal = object.internal !== undefined && object.internal !== null ? Number(object.internal) : 0
    message.external = object.external !== undefined && object.external !== null ? Number(object.external) : 0
    return message
  },

  toJSON(message: Port): unknown {
    const obj: any = {}
    message.internal !== undefined && (obj.internal = Math.round(message.internal))
    message.external !== undefined && (obj.external = Math.round(message.external))
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<Port>, I>>(object: I): Port {
    const message = { ...basePort } as Port
    message.internal = object.internal ?? 0
    message.external = object.external ?? 0
    return message
  },
}

const basePortRange: object = { from: 0, to: 0 }

export const PortRange = {
  encode(message: PortRange, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.from !== 0) {
      writer.uint32(8).int32(message.from)
    }
    if (message.to !== 0) {
      writer.uint32(16).int32(message.to)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PortRange {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...basePortRange } as PortRange
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.from = reader.int32()
          break
        case 2:
          message.to = reader.int32()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): PortRange {
    const message = { ...basePortRange } as PortRange
    message.from = object.from !== undefined && object.from !== null ? Number(object.from) : 0
    message.to = object.to !== undefined && object.to !== null ? Number(object.to) : 0
    return message
  },

  toJSON(message: PortRange): unknown {
    const obj: any = {}
    message.from !== undefined && (obj.from = Math.round(message.from))
    message.to !== undefined && (obj.to = Math.round(message.to))
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<PortRange>, I>>(object: I): PortRange {
    const message = { ...basePortRange } as PortRange
    message.from = object.from ?? 0
    message.to = object.to ?? 0
    return message
  },
}

const basePortRangeBinding: object = {}

export const PortRangeBinding = {
  encode(message: PortRangeBinding, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.internal !== undefined) {
      PortRange.encode(message.internal, writer.uint32(10).fork()).ldelim()
    }
    if (message.external !== undefined) {
      PortRange.encode(message.external, writer.uint32(18).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PortRangeBinding {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...basePortRangeBinding } as PortRangeBinding
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.internal = PortRange.decode(reader, reader.uint32())
          break
        case 2:
          message.external = PortRange.decode(reader, reader.uint32())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): PortRangeBinding {
    const message = { ...basePortRangeBinding } as PortRangeBinding
    message.internal =
      object.internal !== undefined && object.internal !== null ? PortRange.fromJSON(object.internal) : undefined
    message.external =
      object.external !== undefined && object.external !== null ? PortRange.fromJSON(object.external) : undefined
    return message
  },

  toJSON(message: PortRangeBinding): unknown {
    const obj: any = {}
    message.internal !== undefined && (obj.internal = message.internal ? PortRange.toJSON(message.internal) : undefined)
    message.external !== undefined && (obj.external = message.external ? PortRange.toJSON(message.external) : undefined)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<PortRangeBinding>, I>>(object: I): PortRangeBinding {
    const message = { ...basePortRangeBinding } as PortRangeBinding
    message.internal =
      object.internal !== undefined && object.internal !== null ? PortRange.fromPartial(object.internal) : undefined
    message.external =
      object.external !== undefined && object.external !== null ? PortRange.fromPartial(object.external) : undefined
    return message
  },
}

const baseVolume: object = { name: '', path: '' }

export const Volume = {
  encode(message: Volume, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== '') {
      writer.uint32(802).string(message.name)
    }
    if (message.path !== '') {
      writer.uint32(810).string(message.path)
    }
    if (message.size !== undefined) {
      writer.uint32(818).string(message.size)
    }
    if (message.type !== undefined) {
      writer.uint32(826).string(message.type)
    }
    if (message.class !== undefined) {
      writer.uint32(834).string(message.class)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Volume {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseVolume } as Volume
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 100:
          message.name = reader.string()
          break
        case 101:
          message.path = reader.string()
          break
        case 102:
          message.size = reader.string()
          break
        case 103:
          message.type = reader.string()
          break
        case 104:
          message.class = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): Volume {
    const message = { ...baseVolume } as Volume
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    message.path = object.path !== undefined && object.path !== null ? String(object.path) : ''
    message.size = object.size !== undefined && object.size !== null ? String(object.size) : undefined
    message.type = object.type !== undefined && object.type !== null ? String(object.type) : undefined
    message.class = object.class !== undefined && object.class !== null ? String(object.class) : undefined
    return message
  },

  toJSON(message: Volume): unknown {
    const obj: any = {}
    message.name !== undefined && (obj.name = message.name)
    message.path !== undefined && (obj.path = message.path)
    message.size !== undefined && (obj.size = message.size)
    message.type !== undefined && (obj.type = message.type)
    message.class !== undefined && (obj.class = message.class)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<Volume>, I>>(object: I): Volume {
    const message = { ...baseVolume } as Volume
    message.name = object.name ?? ''
    message.path = object.path ?? ''
    message.size = object.size ?? undefined
    message.type = object.type ?? undefined
    message.class = object.class ?? undefined
    return message
  },
}

const baseExpose: object = { public: false, tls: false }

export const Expose = {
  encode(message: Expose, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.public === true) {
      writer.uint32(800).bool(message.public)
    }
    if (message.tls === true) {
      writer.uint32(808).bool(message.tls)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Expose {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseExpose } as Expose
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 100:
          message.public = reader.bool()
          break
        case 101:
          message.tls = reader.bool()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): Expose {
    const message = { ...baseExpose } as Expose
    message.public = object.public !== undefined && object.public !== null ? Boolean(object.public) : false
    message.tls = object.tls !== undefined && object.tls !== null ? Boolean(object.tls) : false
    return message
  },

  toJSON(message: Expose): unknown {
    const obj: any = {}
    message.public !== undefined && (obj.public = message.public)
    message.tls !== undefined && (obj.tls = message.tls)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<Expose>, I>>(object: I): Expose {
    const message = { ...baseExpose } as Expose
    message.public = object.public ?? false
    message.tls = object.tls ?? false
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

const baseImportContainer: object = { volume: '', command: '' }

export const ImportContainer = {
  encode(message: ImportContainer, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    Object.entries(message.environments).forEach(([key, value]) => {
      ImportContainer_EnvironmentsEntry.encode({ key: key as any, value }, writer.uint32(802).fork()).ldelim()
    })
    if (message.volume !== '') {
      writer.uint32(810).string(message.volume)
    }
    if (message.command !== '') {
      writer.uint32(818).string(message.command)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ImportContainer {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseImportContainer } as ImportContainer
    message.environments = {}
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 100:
          const entry100 = ImportContainer_EnvironmentsEntry.decode(reader, reader.uint32())
          if (entry100.value !== undefined) {
            message.environments[entry100.key] = entry100.value
          }
          break
        case 101:
          message.volume = reader.string()
          break
        case 102:
          message.command = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): ImportContainer {
    const message = { ...baseImportContainer } as ImportContainer
    message.environments = Object.entries(object.environments ?? {}).reduce<{
      [key: string]: string
    }>((acc, [key, value]) => {
      acc[key] = String(value)
      return acc
    }, {})
    message.volume = object.volume !== undefined && object.volume !== null ? String(object.volume) : ''
    message.command = object.command !== undefined && object.command !== null ? String(object.command) : ''
    return message
  },

  toJSON(message: ImportContainer): unknown {
    const obj: any = {}
    obj.environments = {}
    if (message.environments) {
      Object.entries(message.environments).forEach(([k, v]) => {
        obj.environments[k] = v
      })
    }
    message.volume !== undefined && (obj.volume = message.volume)
    message.command !== undefined && (obj.command = message.command)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<ImportContainer>, I>>(object: I): ImportContainer {
    const message = { ...baseImportContainer } as ImportContainer
    message.environments = Object.entries(object.environments ?? {}).reduce<{
      [key: string]: string
    }>((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = String(value)
      }
      return acc
    }, {})
    message.volume = object.volume ?? ''
    message.command = object.command ?? ''
    return message
  },
}

const baseImportContainer_EnvironmentsEntry: object = { key: '', value: '' }

export const ImportContainer_EnvironmentsEntry = {
  encode(message: ImportContainer_EnvironmentsEntry, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== '') {
      writer.uint32(10).string(message.key)
    }
    if (message.value !== '') {
      writer.uint32(18).string(message.value)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ImportContainer_EnvironmentsEntry {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = {
      ...baseImportContainer_EnvironmentsEntry,
    } as ImportContainer_EnvironmentsEntry
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.key = reader.string()
          break
        case 2:
          message.value = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): ImportContainer_EnvironmentsEntry {
    const message = {
      ...baseImportContainer_EnvironmentsEntry,
    } as ImportContainer_EnvironmentsEntry
    message.key = object.key !== undefined && object.key !== null ? String(object.key) : ''
    message.value = object.value !== undefined && object.value !== null ? String(object.value) : ''
    return message
  },

  toJSON(message: ImportContainer_EnvironmentsEntry): unknown {
    const obj: any = {}
    message.key !== undefined && (obj.key = message.key)
    message.value !== undefined && (obj.value = message.value)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<ImportContainer_EnvironmentsEntry>, I>>(
    object: I,
  ): ImportContainer_EnvironmentsEntry {
    const message = {
      ...baseImportContainer_EnvironmentsEntry,
    } as ImportContainer_EnvironmentsEntry
    message.key = object.key ?? ''
    message.value = object.value ?? ''
    return message
  },
}

const baseLogConfig: object = { driver: '' }

export const LogConfig = {
  encode(message: LogConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.driver !== '') {
      writer.uint32(802).string(message.driver)
    }
    Object.entries(message.options).forEach(([key, value]) => {
      LogConfig_OptionsEntry.encode({ key: key as any, value }, writer.uint32(810).fork()).ldelim()
    })
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): LogConfig {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseLogConfig } as LogConfig
    message.options = {}
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 100:
          message.driver = reader.string()
          break
        case 101:
          const entry101 = LogConfig_OptionsEntry.decode(reader, reader.uint32())
          if (entry101.value !== undefined) {
            message.options[entry101.key] = entry101.value
          }
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): LogConfig {
    const message = { ...baseLogConfig } as LogConfig
    message.driver = object.driver !== undefined && object.driver !== null ? String(object.driver) : ''
    message.options = Object.entries(object.options ?? {}).reduce<{
      [key: string]: string
    }>((acc, [key, value]) => {
      acc[key] = String(value)
      return acc
    }, {})
    return message
  },

  toJSON(message: LogConfig): unknown {
    const obj: any = {}
    message.driver !== undefined && (obj.driver = message.driver)
    obj.options = {}
    if (message.options) {
      Object.entries(message.options).forEach(([k, v]) => {
        obj.options[k] = v
      })
    }
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<LogConfig>, I>>(object: I): LogConfig {
    const message = { ...baseLogConfig } as LogConfig
    message.driver = object.driver ?? ''
    message.options = Object.entries(object.options ?? {}).reduce<{
      [key: string]: string
    }>((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = String(value)
      }
      return acc
    }, {})
    return message
  },
}

const baseLogConfig_OptionsEntry: object = { key: '', value: '' }

export const LogConfig_OptionsEntry = {
  encode(message: LogConfig_OptionsEntry, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== '') {
      writer.uint32(10).string(message.key)
    }
    if (message.value !== '') {
      writer.uint32(18).string(message.value)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): LogConfig_OptionsEntry {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseLogConfig_OptionsEntry } as LogConfig_OptionsEntry
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.key = reader.string()
          break
        case 2:
          message.value = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): LogConfig_OptionsEntry {
    const message = { ...baseLogConfig_OptionsEntry } as LogConfig_OptionsEntry
    message.key = object.key !== undefined && object.key !== null ? String(object.key) : ''
    message.value = object.value !== undefined && object.value !== null ? String(object.value) : ''
    return message
  },

  toJSON(message: LogConfig_OptionsEntry): unknown {
    const obj: any = {}
    message.key !== undefined && (obj.key = message.key)
    message.value !== undefined && (obj.value = message.value)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<LogConfig_OptionsEntry>, I>>(object: I): LogConfig_OptionsEntry {
    const message = { ...baseLogConfig_OptionsEntry } as LogConfig_OptionsEntry
    message.key = object.key ?? ''
    message.value = object.value ?? ''
    return message
  },
}

const baseVolumeLink: object = { name: '', path: '' }

export const VolumeLink = {
  encode(message: VolumeLink, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== '') {
      writer.uint32(802).string(message.name)
    }
    if (message.path !== '') {
      writer.uint32(810).string(message.path)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): VolumeLink {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseVolumeLink } as VolumeLink
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 100:
          message.name = reader.string()
          break
        case 101:
          message.path = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): VolumeLink {
    const message = { ...baseVolumeLink } as VolumeLink
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    message.path = object.path !== undefined && object.path !== null ? String(object.path) : ''
    return message
  },

  toJSON(message: VolumeLink): unknown {
    const obj: any = {}
    message.name !== undefined && (obj.name = message.name)
    message.path !== undefined && (obj.path = message.path)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<VolumeLink>, I>>(object: I): VolumeLink {
    const message = { ...baseVolumeLink } as VolumeLink
    message.name = object.name ?? ''
    message.path = object.path ?? ''
    return message
  },
}

const baseInitContainer: object = {
  name: '',
  image: '',
  command: '',
  args: '',
}

export const InitContainer = {
  encode(message: InitContainer, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== '') {
      writer.uint32(802).string(message.name)
    }
    if (message.image !== '') {
      writer.uint32(810).string(message.image)
    }
    Object.entries(message.environments).forEach(([key, value]) => {
      InitContainer_EnvironmentsEntry.encode({ key: key as any, value }, writer.uint32(818).fork()).ldelim()
    })
    if (message.useParentConfig !== undefined) {
      writer.uint32(824).bool(message.useParentConfig)
    }
    for (const v of message.volumes) {
      VolumeLink.encode(v!, writer.uint32(8002).fork()).ldelim()
    }
    for (const v of message.command) {
      writer.uint32(8010).string(v!)
    }
    for (const v of message.args) {
      writer.uint32(8018).string(v!)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): InitContainer {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseInitContainer } as InitContainer
    message.environments = {}
    message.volumes = []
    message.command = []
    message.args = []
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 100:
          message.name = reader.string()
          break
        case 101:
          message.image = reader.string()
          break
        case 102:
          const entry102 = InitContainer_EnvironmentsEntry.decode(reader, reader.uint32())
          if (entry102.value !== undefined) {
            message.environments[entry102.key] = entry102.value
          }
          break
        case 103:
          message.useParentConfig = reader.bool()
          break
        case 1000:
          message.volumes.push(VolumeLink.decode(reader, reader.uint32()))
          break
        case 1001:
          message.command.push(reader.string())
          break
        case 1002:
          message.args.push(reader.string())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): InitContainer {
    const message = { ...baseInitContainer } as InitContainer
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    message.image = object.image !== undefined && object.image !== null ? String(object.image) : ''
    message.environments = Object.entries(object.environments ?? {}).reduce<{
      [key: string]: string
    }>((acc, [key, value]) => {
      acc[key] = String(value)
      return acc
    }, {})
    message.useParentConfig =
      object.useParentConfig !== undefined && object.useParentConfig !== null
        ? Boolean(object.useParentConfig)
        : undefined
    message.volumes = (object.volumes ?? []).map((e: any) => VolumeLink.fromJSON(e))
    message.command = (object.command ?? []).map((e: any) => String(e))
    message.args = (object.args ?? []).map((e: any) => String(e))
    return message
  },

  toJSON(message: InitContainer): unknown {
    const obj: any = {}
    message.name !== undefined && (obj.name = message.name)
    message.image !== undefined && (obj.image = message.image)
    obj.environments = {}
    if (message.environments) {
      Object.entries(message.environments).forEach(([k, v]) => {
        obj.environments[k] = v
      })
    }
    message.useParentConfig !== undefined && (obj.useParentConfig = message.useParentConfig)
    if (message.volumes) {
      obj.volumes = message.volumes.map(e => (e ? VolumeLink.toJSON(e) : undefined))
    } else {
      obj.volumes = []
    }
    if (message.command) {
      obj.command = message.command.map(e => e)
    } else {
      obj.command = []
    }
    if (message.args) {
      obj.args = message.args.map(e => e)
    } else {
      obj.args = []
    }
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<InitContainer>, I>>(object: I): InitContainer {
    const message = { ...baseInitContainer } as InitContainer
    message.name = object.name ?? ''
    message.image = object.image ?? ''
    message.environments = Object.entries(object.environments ?? {}).reduce<{
      [key: string]: string
    }>((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = String(value)
      }
      return acc
    }, {})
    message.useParentConfig = object.useParentConfig ?? undefined
    message.volumes = object.volumes?.map(e => VolumeLink.fromPartial(e)) || []
    message.command = object.command?.map(e => e) || []
    message.args = object.args?.map(e => e) || []
    return message
  },
}

const baseInitContainer_EnvironmentsEntry: object = { key: '', value: '' }

export const InitContainer_EnvironmentsEntry = {
  encode(message: InitContainer_EnvironmentsEntry, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== '') {
      writer.uint32(10).string(message.key)
    }
    if (message.value !== '') {
      writer.uint32(18).string(message.value)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): InitContainer_EnvironmentsEntry {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = {
      ...baseInitContainer_EnvironmentsEntry,
    } as InitContainer_EnvironmentsEntry
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.key = reader.string()
          break
        case 2:
          message.value = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): InitContainer_EnvironmentsEntry {
    const message = {
      ...baseInitContainer_EnvironmentsEntry,
    } as InitContainer_EnvironmentsEntry
    message.key = object.key !== undefined && object.key !== null ? String(object.key) : ''
    message.value = object.value !== undefined && object.value !== null ? String(object.value) : ''
    return message
  },

  toJSON(message: InitContainer_EnvironmentsEntry): unknown {
    const obj: any = {}
    message.key !== undefined && (obj.key = message.key)
    message.value !== undefined && (obj.value = message.value)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<InitContainer_EnvironmentsEntry>, I>>(
    object: I,
  ): InitContainer_EnvironmentsEntry {
    const message = {
      ...baseInitContainer_EnvironmentsEntry,
    } as InitContainer_EnvironmentsEntry
    message.key = object.key ?? ''
    message.value = object.value ?? ''
    return message
  },
}

const baseDagentContainerConfig: object = { networks: '' }

export const DagentContainerConfig = {
  encode(message: DagentContainerConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.logConfig !== undefined) {
      LogConfig.encode(message.logConfig, writer.uint32(802).fork()).ldelim()
    }
    if (message.restartPolicy !== undefined) {
      writer.uint32(808).int32(message.restartPolicy)
    }
    if (message.networkMode !== undefined) {
      writer.uint32(816).int32(message.networkMode)
    }
    for (const v of message.networks) {
      writer.uint32(8002).string(v!)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DagentContainerConfig {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseDagentContainerConfig } as DagentContainerConfig
    message.networks = []
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 100:
          message.logConfig = LogConfig.decode(reader, reader.uint32())
          break
        case 101:
          message.restartPolicy = reader.int32() as any
          break
        case 102:
          message.networkMode = reader.int32() as any
          break
        case 1000:
          message.networks.push(reader.string())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): DagentContainerConfig {
    const message = { ...baseDagentContainerConfig } as DagentContainerConfig
    message.logConfig =
      object.logConfig !== undefined && object.logConfig !== null ? LogConfig.fromJSON(object.logConfig) : undefined
    message.restartPolicy =
      object.restartPolicy !== undefined && object.restartPolicy !== null
        ? restartPolicyFromJSON(object.restartPolicy)
        : undefined
    message.networkMode =
      object.networkMode !== undefined && object.networkMode !== null
        ? networkModeFromJSON(object.networkMode)
        : undefined
    message.networks = (object.networks ?? []).map((e: any) => String(e))
    return message
  },

  toJSON(message: DagentContainerConfig): unknown {
    const obj: any = {}
    message.logConfig !== undefined &&
      (obj.logConfig = message.logConfig ? LogConfig.toJSON(message.logConfig) : undefined)
    message.restartPolicy !== undefined &&
      (obj.restartPolicy = message.restartPolicy !== undefined ? restartPolicyToJSON(message.restartPolicy) : undefined)
    message.networkMode !== undefined &&
      (obj.networkMode = message.networkMode !== undefined ? networkModeToJSON(message.networkMode) : undefined)
    if (message.networks) {
      obj.networks = message.networks.map(e => e)
    } else {
      obj.networks = []
    }
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<DagentContainerConfig>, I>>(object: I): DagentContainerConfig {
    const message = { ...baseDagentContainerConfig } as DagentContainerConfig
    message.logConfig =
      object.logConfig !== undefined && object.logConfig !== null ? LogConfig.fromPartial(object.logConfig) : undefined
    message.restartPolicy = object.restartPolicy ?? undefined
    message.networkMode = object.networkMode ?? undefined
    message.networks = object.networks?.map(e => e) || []
    return message
  },
}

const baseHealthCheckConfig: object = { port: 0 }

export const HealthCheckConfig = {
  encode(message: HealthCheckConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.port !== 0) {
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
    message.port = object.port !== undefined && object.port !== null ? Number(object.port) : 0
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
    message.port = object.port ?? 0
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

const baseCraneContainerConfig: object = { customHeaders: '' }

export const CraneContainerConfig = {
  encode(message: CraneContainerConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.deploymentStatregy !== undefined) {
      writer.uint32(800).int32(message.deploymentStatregy)
    }
    if (message.healthCheckConfig !== undefined) {
      HealthCheckConfig.encode(message.healthCheckConfig, writer.uint32(810).fork()).ldelim()
    }
    if (message.resourceConfig !== undefined) {
      ResourceConfig.encode(message.resourceConfig, writer.uint32(818).fork()).ldelim()
    }
    if (message.proxyHeaders !== undefined) {
      writer.uint32(824).bool(message.proxyHeaders)
    }
    if (message.useLoadBalancer !== undefined) {
      writer.uint32(832).bool(message.useLoadBalancer)
    }
    Object.entries(message.extraLBAnnotations).forEach(([key, value]) => {
      CraneContainerConfig_ExtraLBAnnotationsEntry.encode(
        { key: key as any, value },
        writer.uint32(842).fork(),
      ).ldelim()
    })
    for (const v of message.customHeaders) {
      writer.uint32(8002).string(v!)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CraneContainerConfig {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseCraneContainerConfig } as CraneContainerConfig
    message.extraLBAnnotations = {}
    message.customHeaders = []
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 100:
          message.deploymentStatregy = reader.int32() as any
          break
        case 101:
          message.healthCheckConfig = HealthCheckConfig.decode(reader, reader.uint32())
          break
        case 102:
          message.resourceConfig = ResourceConfig.decode(reader, reader.uint32())
          break
        case 103:
          message.proxyHeaders = reader.bool()
          break
        case 104:
          message.useLoadBalancer = reader.bool()
          break
        case 105:
          const entry105 = CraneContainerConfig_ExtraLBAnnotationsEntry.decode(reader, reader.uint32())
          if (entry105.value !== undefined) {
            message.extraLBAnnotations[entry105.key] = entry105.value
          }
          break
        case 1000:
          message.customHeaders.push(reader.string())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): CraneContainerConfig {
    const message = { ...baseCraneContainerConfig } as CraneContainerConfig
    message.deploymentStatregy =
      object.deploymentStatregy !== undefined && object.deploymentStatregy !== null
        ? deploymentStrategyFromJSON(object.deploymentStatregy)
        : undefined
    message.healthCheckConfig =
      object.healthCheckConfig !== undefined && object.healthCheckConfig !== null
        ? HealthCheckConfig.fromJSON(object.healthCheckConfig)
        : undefined
    message.resourceConfig =
      object.resourceConfig !== undefined && object.resourceConfig !== null
        ? ResourceConfig.fromJSON(object.resourceConfig)
        : undefined
    message.proxyHeaders =
      object.proxyHeaders !== undefined && object.proxyHeaders !== null ? Boolean(object.proxyHeaders) : undefined
    message.useLoadBalancer =
      object.useLoadBalancer !== undefined && object.useLoadBalancer !== null
        ? Boolean(object.useLoadBalancer)
        : undefined
    message.extraLBAnnotations = Object.entries(object.extraLBAnnotations ?? {}).reduce<{ [key: string]: string }>(
      (acc, [key, value]) => {
        acc[key] = String(value)
        return acc
      },
      {},
    )
    message.customHeaders = (object.customHeaders ?? []).map((e: any) => String(e))
    return message
  },

  toJSON(message: CraneContainerConfig): unknown {
    const obj: any = {}
    message.deploymentStatregy !== undefined &&
      (obj.deploymentStatregy =
        message.deploymentStatregy !== undefined ? deploymentStrategyToJSON(message.deploymentStatregy) : undefined)
    message.healthCheckConfig !== undefined &&
      (obj.healthCheckConfig = message.healthCheckConfig
        ? HealthCheckConfig.toJSON(message.healthCheckConfig)
        : undefined)
    message.resourceConfig !== undefined &&
      (obj.resourceConfig = message.resourceConfig ? ResourceConfig.toJSON(message.resourceConfig) : undefined)
    message.proxyHeaders !== undefined && (obj.proxyHeaders = message.proxyHeaders)
    message.useLoadBalancer !== undefined && (obj.useLoadBalancer = message.useLoadBalancer)
    obj.extraLBAnnotations = {}
    if (message.extraLBAnnotations) {
      Object.entries(message.extraLBAnnotations).forEach(([k, v]) => {
        obj.extraLBAnnotations[k] = v
      })
    }
    if (message.customHeaders) {
      obj.customHeaders = message.customHeaders.map(e => e)
    } else {
      obj.customHeaders = []
    }
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<CraneContainerConfig>, I>>(object: I): CraneContainerConfig {
    const message = { ...baseCraneContainerConfig } as CraneContainerConfig
    message.deploymentStatregy = object.deploymentStatregy ?? undefined
    message.healthCheckConfig =
      object.healthCheckConfig !== undefined && object.healthCheckConfig !== null
        ? HealthCheckConfig.fromPartial(object.healthCheckConfig)
        : undefined
    message.resourceConfig =
      object.resourceConfig !== undefined && object.resourceConfig !== null
        ? ResourceConfig.fromPartial(object.resourceConfig)
        : undefined
    message.proxyHeaders = object.proxyHeaders ?? undefined
    message.useLoadBalancer = object.useLoadBalancer ?? undefined
    message.extraLBAnnotations = Object.entries(object.extraLBAnnotations ?? {}).reduce<{ [key: string]: string }>(
      (acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = String(value)
        }
        return acc
      },
      {},
    )
    message.customHeaders = object.customHeaders?.map(e => e) || []
    return message
  },
}

const baseCraneContainerConfig_ExtraLBAnnotationsEntry: object = {
  key: '',
  value: '',
}

export const CraneContainerConfig_ExtraLBAnnotationsEntry = {
  encode(message: CraneContainerConfig_ExtraLBAnnotationsEntry, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== '') {
      writer.uint32(10).string(message.key)
    }
    if (message.value !== '') {
      writer.uint32(18).string(message.value)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CraneContainerConfig_ExtraLBAnnotationsEntry {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = {
      ...baseCraneContainerConfig_ExtraLBAnnotationsEntry,
    } as CraneContainerConfig_ExtraLBAnnotationsEntry
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.key = reader.string()
          break
        case 2:
          message.value = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): CraneContainerConfig_ExtraLBAnnotationsEntry {
    const message = {
      ...baseCraneContainerConfig_ExtraLBAnnotationsEntry,
    } as CraneContainerConfig_ExtraLBAnnotationsEntry
    message.key = object.key !== undefined && object.key !== null ? String(object.key) : ''
    message.value = object.value !== undefined && object.value !== null ? String(object.value) : ''
    return message
  },

  toJSON(message: CraneContainerConfig_ExtraLBAnnotationsEntry): unknown {
    const obj: any = {}
    message.key !== undefined && (obj.key = message.key)
    message.value !== undefined && (obj.value = message.value)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<CraneContainerConfig_ExtraLBAnnotationsEntry>, I>>(
    object: I,
  ): CraneContainerConfig_ExtraLBAnnotationsEntry {
    const message = {
      ...baseCraneContainerConfig_ExtraLBAnnotationsEntry,
    } as CraneContainerConfig_ExtraLBAnnotationsEntry
    message.key = object.key ?? ''
    message.value = object.value ?? ''
    return message
  },
}

const baseExplicitContainerConfig: object = {
  command: '',
  args: '',
  environments: '',
}

export const ExplicitContainerConfig = {
  encode(message: ExplicitContainerConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.dagent !== undefined) {
      DagentContainerConfig.encode(message.dagent, writer.uint32(802).fork()).ldelim()
    }
    if (message.crane !== undefined) {
      CraneContainerConfig.encode(message.crane, writer.uint32(810).fork()).ldelim()
    }
    if (message.expose !== undefined) {
      Expose.encode(message.expose, writer.uint32(818).fork()).ldelim()
    }
    if (message.ingress !== undefined) {
      Ingress.encode(message.ingress, writer.uint32(826).fork()).ldelim()
    }
    if (message.configContainer !== undefined) {
      ConfigContainer.encode(message.configContainer, writer.uint32(834).fork()).ldelim()
    }
    if (message.importContainer !== undefined) {
      ImportContainer.encode(message.importContainer, writer.uint32(842).fork()).ldelim()
    }
    if (message.user !== undefined) {
      writer.uint32(848).int64(message.user)
    }
    if (message.TTY !== undefined) {
      writer.uint32(856).bool(message.TTY)
    }
    for (const v of message.ports) {
      Port.encode(v!, writer.uint32(8002).fork()).ldelim()
    }
    for (const v of message.portRanges) {
      PortRangeBinding.encode(v!, writer.uint32(8010).fork()).ldelim()
    }
    for (const v of message.volumes) {
      Volume.encode(v!, writer.uint32(8018).fork()).ldelim()
    }
    for (const v of message.command) {
      writer.uint32(8026).string(v!)
    }
    for (const v of message.args) {
      writer.uint32(8034).string(v!)
    }
    for (const v of message.environments) {
      writer.uint32(8042).string(v!)
    }
    if (message.secrets !== undefined) {
      KeyValueList.encode(message.secrets, writer.uint32(8050).fork()).ldelim()
    }
    for (const v of message.initContainers) {
      InitContainer.encode(v!, writer.uint32(8058).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ExplicitContainerConfig {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = {
      ...baseExplicitContainerConfig,
    } as ExplicitContainerConfig
    message.ports = []
    message.portRanges = []
    message.volumes = []
    message.command = []
    message.args = []
    message.environments = []
    message.initContainers = []
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 100:
          message.dagent = DagentContainerConfig.decode(reader, reader.uint32())
          break
        case 101:
          message.crane = CraneContainerConfig.decode(reader, reader.uint32())
          break
        case 102:
          message.expose = Expose.decode(reader, reader.uint32())
          break
        case 103:
          message.ingress = Ingress.decode(reader, reader.uint32())
          break
        case 104:
          message.configContainer = ConfigContainer.decode(reader, reader.uint32())
          break
        case 105:
          message.importContainer = ImportContainer.decode(reader, reader.uint32())
          break
        case 106:
          message.user = longToNumber(reader.int64() as Long)
          break
        case 107:
          message.TTY = reader.bool()
          break
        case 1000:
          message.ports.push(Port.decode(reader, reader.uint32()))
          break
        case 1001:
          message.portRanges.push(PortRangeBinding.decode(reader, reader.uint32()))
          break
        case 1002:
          message.volumes.push(Volume.decode(reader, reader.uint32()))
          break
        case 1003:
          message.command.push(reader.string())
          break
        case 1004:
          message.args.push(reader.string())
          break
        case 1005:
          message.environments.push(reader.string())
          break
        case 1006:
          message.secrets = KeyValueList.decode(reader, reader.uint32())
          break
        case 1007:
          message.initContainers.push(InitContainer.decode(reader, reader.uint32()))
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): ExplicitContainerConfig {
    const message = {
      ...baseExplicitContainerConfig,
    } as ExplicitContainerConfig
    message.dagent =
      object.dagent !== undefined && object.dagent !== null ? DagentContainerConfig.fromJSON(object.dagent) : undefined
    message.crane =
      object.crane !== undefined && object.crane !== null ? CraneContainerConfig.fromJSON(object.crane) : undefined
    message.expose = object.expose !== undefined && object.expose !== null ? Expose.fromJSON(object.expose) : undefined
    message.ingress =
      object.ingress !== undefined && object.ingress !== null ? Ingress.fromJSON(object.ingress) : undefined
    message.configContainer =
      object.configContainer !== undefined && object.configContainer !== null
        ? ConfigContainer.fromJSON(object.configContainer)
        : undefined
    message.importContainer =
      object.importContainer !== undefined && object.importContainer !== null
        ? ImportContainer.fromJSON(object.importContainer)
        : undefined
    message.user = object.user !== undefined && object.user !== null ? Number(object.user) : undefined
    message.TTY = object.TTY !== undefined && object.TTY !== null ? Boolean(object.TTY) : undefined
    message.ports = (object.ports ?? []).map((e: any) => Port.fromJSON(e))
    message.portRanges = (object.portRanges ?? []).map((e: any) => PortRangeBinding.fromJSON(e))
    message.volumes = (object.volumes ?? []).map((e: any) => Volume.fromJSON(e))
    message.command = (object.command ?? []).map((e: any) => String(e))
    message.args = (object.args ?? []).map((e: any) => String(e))
    message.environments = (object.environments ?? []).map((e: any) => String(e))
    message.secrets =
      object.secrets !== undefined && object.secrets !== null ? KeyValueList.fromJSON(object.secrets) : undefined
    message.initContainers = (object.initContainers ?? []).map((e: any) => InitContainer.fromJSON(e))
    return message
  },

  toJSON(message: ExplicitContainerConfig): unknown {
    const obj: any = {}
    message.dagent !== undefined &&
      (obj.dagent = message.dagent ? DagentContainerConfig.toJSON(message.dagent) : undefined)
    message.crane !== undefined && (obj.crane = message.crane ? CraneContainerConfig.toJSON(message.crane) : undefined)
    message.expose !== undefined && (obj.expose = message.expose ? Expose.toJSON(message.expose) : undefined)
    message.ingress !== undefined && (obj.ingress = message.ingress ? Ingress.toJSON(message.ingress) : undefined)
    message.configContainer !== undefined &&
      (obj.configContainer = message.configContainer ? ConfigContainer.toJSON(message.configContainer) : undefined)
    message.importContainer !== undefined &&
      (obj.importContainer = message.importContainer ? ImportContainer.toJSON(message.importContainer) : undefined)
    message.user !== undefined && (obj.user = Math.round(message.user))
    message.TTY !== undefined && (obj.TTY = message.TTY)
    if (message.ports) {
      obj.ports = message.ports.map(e => (e ? Port.toJSON(e) : undefined))
    } else {
      obj.ports = []
    }
    if (message.portRanges) {
      obj.portRanges = message.portRanges.map(e => (e ? PortRangeBinding.toJSON(e) : undefined))
    } else {
      obj.portRanges = []
    }
    if (message.volumes) {
      obj.volumes = message.volumes.map(e => (e ? Volume.toJSON(e) : undefined))
    } else {
      obj.volumes = []
    }
    if (message.command) {
      obj.command = message.command.map(e => e)
    } else {
      obj.command = []
    }
    if (message.args) {
      obj.args = message.args.map(e => e)
    } else {
      obj.args = []
    }
    if (message.environments) {
      obj.environments = message.environments.map(e => e)
    } else {
      obj.environments = []
    }
    message.secrets !== undefined && (obj.secrets = message.secrets ? KeyValueList.toJSON(message.secrets) : undefined)
    if (message.initContainers) {
      obj.initContainers = message.initContainers.map(e => (e ? InitContainer.toJSON(e) : undefined))
    } else {
      obj.initContainers = []
    }
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<ExplicitContainerConfig>, I>>(object: I): ExplicitContainerConfig {
    const message = {
      ...baseExplicitContainerConfig,
    } as ExplicitContainerConfig
    message.dagent =
      object.dagent !== undefined && object.dagent !== null
        ? DagentContainerConfig.fromPartial(object.dagent)
        : undefined
    message.crane =
      object.crane !== undefined && object.crane !== null ? CraneContainerConfig.fromPartial(object.crane) : undefined
    message.expose =
      object.expose !== undefined && object.expose !== null ? Expose.fromPartial(object.expose) : undefined
    message.ingress =
      object.ingress !== undefined && object.ingress !== null ? Ingress.fromPartial(object.ingress) : undefined
    message.configContainer =
      object.configContainer !== undefined && object.configContainer !== null
        ? ConfigContainer.fromPartial(object.configContainer)
        : undefined
    message.importContainer =
      object.importContainer !== undefined && object.importContainer !== null
        ? ImportContainer.fromPartial(object.importContainer)
        : undefined
    message.user = object.user ?? undefined
    message.TTY = object.TTY ?? undefined
    message.ports = object.ports?.map(e => Port.fromPartial(e)) || []
    message.portRanges = object.portRanges?.map(e => PortRangeBinding.fromPartial(e)) || []
    message.volumes = object.volumes?.map(e => Volume.fromPartial(e)) || []
    message.command = object.command?.map(e => e) || []
    message.args = object.args?.map(e => e) || []
    message.environments = object.environments?.map(e => e) || []
    message.secrets =
      object.secrets !== undefined && object.secrets !== null ? KeyValueList.fromPartial(object.secrets) : undefined
    message.initContainers = object.initContainers?.map(e => InitContainer.fromPartial(e)) || []
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

const baseKeyList: object = {}

export const KeyList = {
  encode(message: KeyList, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.data) {
      UniqueKey.encode(v!, writer.uint32(8002).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): KeyList {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseKeyList } as KeyList
    message.data = []
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1000:
          message.data.push(UniqueKey.decode(reader, reader.uint32()))
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): KeyList {
    const message = { ...baseKeyList } as KeyList
    message.data = (object.data ?? []).map((e: any) => UniqueKey.fromJSON(e))
    return message
  },

  toJSON(message: KeyList): unknown {
    const obj: any = {}
    if (message.data) {
      obj.data = message.data.map(e => (e ? UniqueKey.toJSON(e) : undefined))
    } else {
      obj.data = []
    }
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<KeyList>, I>>(object: I): KeyList {
    const message = { ...baseKeyList } as KeyList
    message.data = object.data?.map(e => UniqueKey.fromPartial(e)) || []
    return message
  },
}

const baseUniqueKeyValue: object = { id: '', key: '', value: '' }

export const UniqueKeyValue = {
  encode(message: UniqueKeyValue, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(802).string(message.id)
    }
    if (message.key !== '') {
      writer.uint32(810).string(message.key)
    }
    if (message.value !== '') {
      writer.uint32(818).string(message.value)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UniqueKeyValue {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseUniqueKeyValue } as UniqueKeyValue
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 100:
          message.id = reader.string()
          break
        case 101:
          message.key = reader.string()
          break
        case 102:
          message.value = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): UniqueKeyValue {
    const message = { ...baseUniqueKeyValue } as UniqueKeyValue
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.key = object.key !== undefined && object.key !== null ? String(object.key) : ''
    message.value = object.value !== undefined && object.value !== null ? String(object.value) : ''
    return message
  },

  toJSON(message: UniqueKeyValue): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.key !== undefined && (obj.key = message.key)
    message.value !== undefined && (obj.value = message.value)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<UniqueKeyValue>, I>>(object: I): UniqueKeyValue {
    const message = { ...baseUniqueKeyValue } as UniqueKeyValue
    message.id = object.id ?? ''
    message.key = object.key ?? ''
    message.value = object.value ?? ''
    return message
  },
}

const baseUniqueKeySecretValue: object = { id: '', key: '', value: '' }

export const UniqueKeySecretValue = {
  encode(message: UniqueKeySecretValue, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(802).string(message.id)
    }
    if (message.key !== '') {
      writer.uint32(810).string(message.key)
    }
    if (message.value !== '') {
      writer.uint32(826).string(message.value)
    }
    if (message.encrypted !== undefined) {
      writer.uint32(832).bool(message.encrypted)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UniqueKeySecretValue {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseUniqueKeySecretValue } as UniqueKeySecretValue
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 100:
          message.id = reader.string()
          break
        case 101:
          message.key = reader.string()
          break
        case 103:
          message.value = reader.string()
          break
        case 104:
          message.encrypted = reader.bool()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): UniqueKeySecretValue {
    const message = { ...baseUniqueKeySecretValue } as UniqueKeySecretValue
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.key = object.key !== undefined && object.key !== null ? String(object.key) : ''
    message.value = object.value !== undefined && object.value !== null ? String(object.value) : ''
    message.encrypted =
      object.encrypted !== undefined && object.encrypted !== null ? Boolean(object.encrypted) : undefined
    return message
  },

  toJSON(message: UniqueKeySecretValue): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.key !== undefined && (obj.key = message.key)
    message.value !== undefined && (obj.value = message.value)
    message.encrypted !== undefined && (obj.encrypted = message.encrypted)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<UniqueKeySecretValue>, I>>(object: I): UniqueKeySecretValue {
    const message = { ...baseUniqueKeySecretValue } as UniqueKeySecretValue
    message.id = object.id ?? ''
    message.key = object.key ?? ''
    message.value = object.value ?? ''
    message.encrypted = object.encrypted ?? undefined
    return message
  },
}

const baseKeyValueList: object = {}

export const KeyValueList = {
  encode(message: KeyValueList, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.data) {
      UniqueKeyValue.encode(v!, writer.uint32(8002).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): KeyValueList {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseKeyValueList } as KeyValueList
    message.data = []
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1000:
          message.data.push(UniqueKeyValue.decode(reader, reader.uint32()))
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): KeyValueList {
    const message = { ...baseKeyValueList } as KeyValueList
    message.data = (object.data ?? []).map((e: any) => UniqueKeyValue.fromJSON(e))
    return message
  },

  toJSON(message: KeyValueList): unknown {
    const obj: any = {}
    if (message.data) {
      obj.data = message.data.map(e => (e ? UniqueKeyValue.toJSON(e) : undefined))
    } else {
      obj.data = []
    }
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<KeyValueList>, I>>(object: I): KeyValueList {
    const message = { ...baseKeyValueList } as KeyValueList
    message.data = object.data?.map(e => UniqueKeyValue.fromPartial(e)) || []
    return message
  },
}

const baseSecretList: object = {}

export const SecretList = {
  encode(message: SecretList, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.data) {
      UniqueKeySecretValue.encode(v!, writer.uint32(8002).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SecretList {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseSecretList } as SecretList
    message.data = []
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1000:
          message.data.push(UniqueKeySecretValue.decode(reader, reader.uint32()))
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): SecretList {
    const message = { ...baseSecretList } as SecretList
    message.data = (object.data ?? []).map((e: any) => UniqueKeySecretValue.fromJSON(e))
    return message
  },

  toJSON(message: SecretList): unknown {
    const obj: any = {}
    if (message.data) {
      obj.data = message.data.map(e => (e ? UniqueKeySecretValue.toJSON(e) : undefined))
    } else {
      obj.data = []
    }
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<SecretList>, I>>(object: I): SecretList {
    const message = { ...baseSecretList } as SecretList
    message.data = object.data?.map(e => UniqueKeySecretValue.fromPartial(e)) || []
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

declare var self: any | undefined
declare var window: any | undefined
declare var global: any | undefined
var globalThis: any = (() => {
  if (typeof globalThis !== 'undefined') return globalThis
  if (typeof self !== 'undefined') return self
  if (typeof window !== 'undefined') return window
  if (typeof global !== 'undefined') return global
  throw 'Unable to locate global object'
})()

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

function longToNumber(long: Long): number {
  if (long.gt(Number.MAX_SAFE_INTEGER)) {
    throw new globalThis.Error('Value is larger than Number.MAX_SAFE_INTEGER')
  }
  return long.toNumber()
}

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any
  _m0.configure()
}
