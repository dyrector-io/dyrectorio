/* eslint-disable */
import {
  CallOptions,
  ChannelCredentials,
  Client,
  ClientOptions,
  ClientReadableStream,
  ClientUnaryCall,
  handleServerStreamingCall,
  handleUnaryCall,
  makeGenericClientConstructor,
  Metadata,
  ServiceError,
  UntypedServiceImplementation,
} from '@grpc/grpc-js'
import Long from 'long'
import _m0 from 'protobufjs/minimal'
import { Timestamp } from '../../google/protobuf/timestamp'
import {
  ConfigContainer,
  ContainerCommandRequest,
  ContainerIdentifier,
  ContainerLogMessage,
  ContainerState,
  containerStateFromJSON,
  ContainerStateListMessage,
  containerStateToJSON,
  DeleteContainersRequest,
  DeploymentStatus,
  deploymentStatusFromJSON,
  deploymentStatusToJSON,
  DeploymentStrategy,
  deploymentStrategyFromJSON,
  deploymentStrategyToJSON,
  DriverType,
  driverTypeFromJSON,
  driverTypeToJSON,
  Empty,
  ExposeStrategy,
  exposeStrategyFromJSON,
  exposeStrategyToJSON,
  HealthCheckConfig,
  Ingress,
  InstanceDeploymentItem,
  NetworkMode,
  networkModeFromJSON,
  networkModeToJSON,
  ResourceConfig,
  RestartPolicy,
  restartPolicyFromJSON,
  restartPolicyToJSON,
  UniqueKey,
  VolumeType,
  volumeTypeFromJSON,
  volumeTypeToJSON,
} from './common'

export const protobufPackage = 'crux'

/** CRUX Protobuf definitions */

export enum UserRole {
  USER_ROLE_UNSPECIFIED = 0,
  USER = 1,
  OWNER = 2,
  ADMIN = 3,
  UNRECOGNIZED = -1,
}

export function userRoleFromJSON(object: any): UserRole {
  switch (object) {
    case 0:
    case 'USER_ROLE_UNSPECIFIED':
      return UserRole.USER_ROLE_UNSPECIFIED
    case 1:
    case 'USER':
      return UserRole.USER
    case 2:
    case 'OWNER':
      return UserRole.OWNER
    case 3:
    case 'ADMIN':
      return UserRole.ADMIN
    case -1:
    case 'UNRECOGNIZED':
    default:
      return UserRole.UNRECOGNIZED
  }
}

export function userRoleToJSON(object: UserRole): string {
  switch (object) {
    case UserRole.USER_ROLE_UNSPECIFIED:
      return 'USER_ROLE_UNSPECIFIED'
    case UserRole.USER:
      return 'USER'
    case UserRole.OWNER:
      return 'OWNER'
    case UserRole.ADMIN:
      return 'ADMIN'
    case UserRole.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED'
  }
}

export enum UserStatus {
  USER_STATUS_UNSPECIFIED = 0,
  PENDING = 1,
  VERIFIED = 2,
  EXPIRED = 3,
  DECLINED = 4,
  UNRECOGNIZED = -1,
}

export function userStatusFromJSON(object: any): UserStatus {
  switch (object) {
    case 0:
    case 'USER_STATUS_UNSPECIFIED':
      return UserStatus.USER_STATUS_UNSPECIFIED
    case 1:
    case 'PENDING':
      return UserStatus.PENDING
    case 2:
    case 'VERIFIED':
      return UserStatus.VERIFIED
    case 3:
    case 'EXPIRED':
      return UserStatus.EXPIRED
    case 4:
    case 'DECLINED':
      return UserStatus.DECLINED
    case -1:
    case 'UNRECOGNIZED':
    default:
      return UserStatus.UNRECOGNIZED
  }
}

export function userStatusToJSON(object: UserStatus): string {
  switch (object) {
    case UserStatus.USER_STATUS_UNSPECIFIED:
      return 'USER_STATUS_UNSPECIFIED'
    case UserStatus.PENDING:
      return 'PENDING'
    case UserStatus.VERIFIED:
      return 'VERIFIED'
    case UserStatus.EXPIRED:
      return 'EXPIRED'
    case UserStatus.DECLINED:
      return 'DECLINED'
    case UserStatus.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED'
  }
}

export enum RegistryType {
  REGISTRY_TYPE_UNSPECIFIED = 0,
  V2 = 1,
  HUB = 2,
  GITLAB = 3,
  GITHUB = 4,
  GOOGLE = 5,
  UNCHECKED = 6,
  UNRECOGNIZED = -1,
}

export function registryTypeFromJSON(object: any): RegistryType {
  switch (object) {
    case 0:
    case 'REGISTRY_TYPE_UNSPECIFIED':
      return RegistryType.REGISTRY_TYPE_UNSPECIFIED
    case 1:
    case 'V2':
      return RegistryType.V2
    case 2:
    case 'HUB':
      return RegistryType.HUB
    case 3:
    case 'GITLAB':
      return RegistryType.GITLAB
    case 4:
    case 'GITHUB':
      return RegistryType.GITHUB
    case 5:
    case 'GOOGLE':
      return RegistryType.GOOGLE
    case 6:
    case 'UNCHECKED':
      return RegistryType.UNCHECKED
    case -1:
    case 'UNRECOGNIZED':
    default:
      return RegistryType.UNRECOGNIZED
  }
}

export function registryTypeToJSON(object: RegistryType): string {
  switch (object) {
    case RegistryType.REGISTRY_TYPE_UNSPECIFIED:
      return 'REGISTRY_TYPE_UNSPECIFIED'
    case RegistryType.V2:
      return 'V2'
    case RegistryType.HUB:
      return 'HUB'
    case RegistryType.GITLAB:
      return 'GITLAB'
    case RegistryType.GITHUB:
      return 'GITHUB'
    case RegistryType.GOOGLE:
      return 'GOOGLE'
    case RegistryType.UNCHECKED:
      return 'UNCHECKED'
    case RegistryType.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED'
  }
}

/**
 * Lifecycle:
 * When a node connection is alive, the status is CONNECTED.
 * If it disconnects, the status will be UNREACHABLE.
 * When a node created, it is UNREACHEABLE until the user completes
 * the install process.
 */
export enum NodeConnectionStatus {
  CONNECTION_STATUS_UNSPECIFIED = 0,
  /** UNREACHABLE - Node was not yet connected or became unreachable */
  UNREACHABLE = 1,
  /** CONNECTED - Node is running and connected */
  CONNECTED = 2,
  UNRECOGNIZED = -1,
}

export function nodeConnectionStatusFromJSON(object: any): NodeConnectionStatus {
  switch (object) {
    case 0:
    case 'CONNECTION_STATUS_UNSPECIFIED':
      return NodeConnectionStatus.CONNECTION_STATUS_UNSPECIFIED
    case 1:
    case 'UNREACHABLE':
      return NodeConnectionStatus.UNREACHABLE
    case 2:
    case 'CONNECTED':
      return NodeConnectionStatus.CONNECTED
    case -1:
    case 'UNRECOGNIZED':
    default:
      return NodeConnectionStatus.UNRECOGNIZED
  }
}

export function nodeConnectionStatusToJSON(object: NodeConnectionStatus): string {
  switch (object) {
    case NodeConnectionStatus.CONNECTION_STATUS_UNSPECIFIED:
      return 'CONNECTION_STATUS_UNSPECIFIED'
    case NodeConnectionStatus.UNREACHABLE:
      return 'UNREACHABLE'
    case NodeConnectionStatus.CONNECTED:
      return 'CONNECTED'
    case NodeConnectionStatus.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED'
  }
}

export enum NodeType {
  NODE_TYPE_UNSPECIFIED = 0,
  DOCKER = 1,
  K8S = 2,
  UNRECOGNIZED = -1,
}

export function nodeTypeFromJSON(object: any): NodeType {
  switch (object) {
    case 0:
    case 'NODE_TYPE_UNSPECIFIED':
      return NodeType.NODE_TYPE_UNSPECIFIED
    case 1:
    case 'DOCKER':
      return NodeType.DOCKER
    case 2:
    case 'K8S':
      return NodeType.K8S
    case -1:
    case 'UNRECOGNIZED':
    default:
      return NodeType.UNRECOGNIZED
  }
}

export function nodeTypeToJSON(object: NodeType): string {
  switch (object) {
    case NodeType.NODE_TYPE_UNSPECIFIED:
      return 'NODE_TYPE_UNSPECIFIED'
    case NodeType.DOCKER:
      return 'DOCKER'
    case NodeType.K8S:
      return 'K8S'
    case NodeType.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED'
  }
}

export enum NodeScriptType {
  NODE_SCRIPT_TYPE_UNSPECIFIED = 0,
  SHELL = 1,
  POWERSHELL = 2,
  UNRECOGNIZED = -1,
}

export function nodeScriptTypeFromJSON(object: any): NodeScriptType {
  switch (object) {
    case 0:
    case 'NODE_SCRIPT_TYPE_UNSPECIFIED':
      return NodeScriptType.NODE_SCRIPT_TYPE_UNSPECIFIED
    case 1:
    case 'SHELL':
      return NodeScriptType.SHELL
    case 2:
    case 'POWERSHELL':
      return NodeScriptType.POWERSHELL
    case -1:
    case 'UNRECOGNIZED':
    default:
      return NodeScriptType.UNRECOGNIZED
  }
}

export function nodeScriptTypeToJSON(object: NodeScriptType): string {
  switch (object) {
    case NodeScriptType.NODE_SCRIPT_TYPE_UNSPECIFIED:
      return 'NODE_SCRIPT_TYPE_UNSPECIFIED'
    case NodeScriptType.SHELL:
      return 'SHELL'
    case NodeScriptType.POWERSHELL:
      return 'POWERSHELL'
    case NodeScriptType.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED'
  }
}

export enum VersionType {
  VERSION_TYPE_UNSPECIFIED = 0,
  INCREMENTAL = 1,
  ROLLING = 2,
  UNRECOGNIZED = -1,
}

export function versionTypeFromJSON(object: any): VersionType {
  switch (object) {
    case 0:
    case 'VERSION_TYPE_UNSPECIFIED':
      return VersionType.VERSION_TYPE_UNSPECIFIED
    case 1:
    case 'INCREMENTAL':
      return VersionType.INCREMENTAL
    case 2:
    case 'ROLLING':
      return VersionType.ROLLING
    case -1:
    case 'UNRECOGNIZED':
    default:
      return VersionType.UNRECOGNIZED
  }
}

export function versionTypeToJSON(object: VersionType): string {
  switch (object) {
    case VersionType.VERSION_TYPE_UNSPECIFIED:
      return 'VERSION_TYPE_UNSPECIFIED'
    case VersionType.INCREMENTAL:
      return 'INCREMENTAL'
    case VersionType.ROLLING:
      return 'ROLLING'
    case VersionType.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED'
  }
}

export enum DeploymentEventType {
  DEPLOYMENT_EVENT_TYPE_UNSPECIFIED = 0,
  DEPLOYMENT_LOG = 1,
  DEPLOYMENT_STATUS = 2,
  CONTAINER_STATUS = 3,
  UNRECOGNIZED = -1,
}

export function deploymentEventTypeFromJSON(object: any): DeploymentEventType {
  switch (object) {
    case 0:
    case 'DEPLOYMENT_EVENT_TYPE_UNSPECIFIED':
      return DeploymentEventType.DEPLOYMENT_EVENT_TYPE_UNSPECIFIED
    case 1:
    case 'DEPLOYMENT_LOG':
      return DeploymentEventType.DEPLOYMENT_LOG
    case 2:
    case 'DEPLOYMENT_STATUS':
      return DeploymentEventType.DEPLOYMENT_STATUS
    case 3:
    case 'CONTAINER_STATUS':
      return DeploymentEventType.CONTAINER_STATUS
    case -1:
    case 'UNRECOGNIZED':
    default:
      return DeploymentEventType.UNRECOGNIZED
  }
}

export function deploymentEventTypeToJSON(object: DeploymentEventType): string {
  switch (object) {
    case DeploymentEventType.DEPLOYMENT_EVENT_TYPE_UNSPECIFIED:
      return 'DEPLOYMENT_EVENT_TYPE_UNSPECIFIED'
    case DeploymentEventType.DEPLOYMENT_LOG:
      return 'DEPLOYMENT_LOG'
    case DeploymentEventType.DEPLOYMENT_STATUS:
      return 'DEPLOYMENT_STATUS'
    case DeploymentEventType.CONTAINER_STATUS:
      return 'CONTAINER_STATUS'
    case DeploymentEventType.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED'
  }
}

export enum ServiceStatus {
  SERVICE_STATUS_UNSPECIFIED = 0,
  UNAVAILABLE = 1,
  DISRUPTED = 2,
  OPERATIONAL = 3,
  UNRECOGNIZED = -1,
}

export function serviceStatusFromJSON(object: any): ServiceStatus {
  switch (object) {
    case 0:
    case 'SERVICE_STATUS_UNSPECIFIED':
      return ServiceStatus.SERVICE_STATUS_UNSPECIFIED
    case 1:
    case 'UNAVAILABLE':
      return ServiceStatus.UNAVAILABLE
    case 2:
    case 'DISRUPTED':
      return ServiceStatus.DISRUPTED
    case 3:
    case 'OPERATIONAL':
      return ServiceStatus.OPERATIONAL
    case -1:
    case 'UNRECOGNIZED':
    default:
      return ServiceStatus.UNRECOGNIZED
  }
}

export function serviceStatusToJSON(object: ServiceStatus): string {
  switch (object) {
    case ServiceStatus.SERVICE_STATUS_UNSPECIFIED:
      return 'SERVICE_STATUS_UNSPECIFIED'
    case ServiceStatus.UNAVAILABLE:
      return 'UNAVAILABLE'
    case ServiceStatus.DISRUPTED:
      return 'DISRUPTED'
    case ServiceStatus.OPERATIONAL:
      return 'OPERATIONAL'
    case ServiceStatus.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED'
  }
}

export interface ServiceIdRequest {
  id: string
}

export interface IdRequest {
  id: string
}

export interface AuditResponse {
  createdBy: string
  createdAt: Timestamp | undefined
  updatedBy?: string | undefined
  updatedAt?: Timestamp | undefined
}

export interface CreateEntityResponse {
  id: string
  createdAt: Timestamp | undefined
}

export interface UpdateEntityResponse {
  updatedAt: Timestamp | undefined
}

/** TEAM */
export interface CreateTeamRequest {
  name: string
}

export interface UpdateTeamRequest {
  id: string
  name: string
}

export interface UpdateUserRoleInTeamRequest {
  id: string
  userId: string
  role: UserRole
}

export interface InviteUserRequest {
  id: string
  email: string
  firstName: string
  lastName?: string | undefined
}

export interface ReinviteUserRequest {
  id: string
  userId: string
}

export interface DeleteUserFromTeamRequest {
  id: string
  userId: string
}

export interface UserMetaResponse {
  user: ActiveTeamUser | undefined
  teams: TeamResponse[]
  invitations: TeamResponse[]
}

export interface ActiveTeamUser {
  activeTeamId: string
  role: UserRole
  status: UserStatus
}

export interface TeamResponse {
  id: string
  name: string
}

export interface ActiveTeamDetailsResponse {
  id: string
  name: string
  users: UserResponse[]
}

export interface TeamStatistics {
  users: number
  products: number
  nodes: number
  versions: number
  deployments: number
}

export interface TeamWithStatsResponse {
  id: string
  name: string
  statistics: TeamStatistics | undefined
}

export interface TeamDetailsResponse {
  id: string
  name: string
  statistics: TeamStatistics | undefined
  users: UserResponse[]
}

export interface AllTeamsResponse {
  data: TeamWithStatsResponse[]
}

export interface UserResponse {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  lastLogin?: Timestamp | undefined
}

export interface VolumeLink {
  id: string
  name: string
  path: string
}

export interface InitContainer {
  id: string
  name: string
  image: string
  useParentConfig: boolean
  volumes: VolumeLink[]
  command: UniqueKey[]
  args: UniqueKey[]
  environment: UniqueKeyValue[]
}

export interface InitContainerList {
  data: InitContainer[]
}

export interface LogConfig {
  driver: DriverType
  options: UniqueKeyValue[]
}

export interface Port {
  id: string
  internal: number
  external?: number | undefined
}

export interface PortList {
  data: Port[]
}

export interface PortRange {
  from: number
  to: number
}

export interface PortRangeBinding {
  id: string
  internal: PortRange | undefined
  external: PortRange | undefined
}

export interface PortRangeBindingList {
  data: PortRangeBinding[]
}

export interface Volume {
  id: string
  name: string
  path: string
  size?: string | undefined
  type?: VolumeType | undefined
  class?: string | undefined
}

export interface VolumeList {
  data: Volume[]
}

export interface UniqueKeyList {
  data: UniqueKey[]
}

export interface UniqueKeyValue {
  id: string
  key: string
  value: string
}

export interface UniqueKeyValueList {
  data: UniqueKeyValue[]
}

export interface UniqueSecretKey {
  id: string
  key: string
  required: boolean
}

export interface UniqueSecretKeyList {
  data: UniqueSecretKey[]
}

export interface UniqueSecretKeyValue {
  id: string
  key: string
  value: string
  required: boolean
  encrypted: boolean
  publicKey?: string | undefined
}

export interface UniqueSecretKeyValueList {
  data: UniqueSecretKeyValue[]
}

export interface Marker {
  deployment: UniqueKeyValue[]
  service: UniqueKeyValue[]
  ingress: UniqueKeyValue[]
}

export interface ContainerStorage {
  storageId?: string | undefined
  path?: string | undefined
  bucket?: string | undefined
}

export interface DagentContainerConfig {
  logConfig?: LogConfig | undefined
  restartPolicy?: RestartPolicy | undefined
  networkMode?: NetworkMode | undefined
  networks?: UniqueKeyList | undefined
  labels?: UniqueKeyValueList | undefined
}

export interface CraneContainerConfig {
  deploymentStatregy?: DeploymentStrategy | undefined
  healthCheckConfig?: HealthCheckConfig | undefined
  resourceConfig?: ResourceConfig | undefined
  proxyHeaders?: boolean | undefined
  useLoadBalancer?: boolean | undefined
  annotations?: Marker | undefined
  labels?: Marker | undefined
  customHeaders?: UniqueKeyList | undefined
  extraLBAnnotations?: UniqueKeyValueList | undefined
}

export interface CommonContainerConfig {
  name?: string | undefined
  expose?: ExposeStrategy | undefined
  ingress?: Ingress | undefined
  configContainer?: ConfigContainer | undefined
  user?: number | undefined
  TTY?: boolean | undefined
  storage?: ContainerStorage | undefined
  ports?: PortList | undefined
  portRanges?: PortRangeBindingList | undefined
  volumes?: VolumeList | undefined
  commands?: UniqueKeyList | undefined
  args?: UniqueKeyList | undefined
  environment?: UniqueKeyValueList | undefined
  initContainers?: InitContainerList | undefined
}

export interface ImageContainerConfig {
  common?: CommonContainerConfig | undefined
  dagent?: DagentContainerConfig | undefined
  crane?: CraneContainerConfig | undefined
  secrets?: UniqueSecretKeyList | undefined
}

export interface InstanceContainerConfig {
  common?: CommonContainerConfig | undefined
  dagent?: DagentContainerConfig | undefined
  crane?: CraneContainerConfig | undefined
  secrets?: UniqueSecretKeyValueList | undefined
}

export interface ImageResponse {
  id: string
  name: string
  tag: string
  order: number
  registryId: string
  config: ImageContainerConfig | undefined
  createdAt: Timestamp | undefined
  registryName: string
  registryType: RegistryType
}

export interface NodeResponse {
  id: string
  audit: AuditResponse | undefined
  name: string
  description?: string | undefined
  icon?: string | undefined
  address?: string | undefined
  status: NodeConnectionStatus
  connectedAt?: Timestamp | undefined
  version?: string | undefined
  type: NodeType
  updating: boolean
}

export interface NodeDetailsResponse {
  id: string
  audit: AuditResponse | undefined
  name: string
  description?: string | undefined
  icon?: string | undefined
  address?: string | undefined
  status: NodeConnectionStatus
  hasToken: boolean
  connectedAt?: Timestamp | undefined
  install?: NodeInstallResponse | undefined
  script?: NodeScriptResponse | undefined
  version?: string | undefined
  type: NodeType
  updating: boolean
}

export interface NodeListResponse {
  data: NodeResponse[]
}

export interface CreateNodeRequest {
  name: string
  description?: string | undefined
  icon?: string | undefined
}

export interface UpdateNodeRequest {
  id: string
  name: string
  description?: string | undefined
  icon?: string | undefined
}

export interface DagentTraefikOptions {
  acmeEmail: string
}

export interface GenerateScriptRequest {
  id: string
  type: NodeType
  rootPath?: string | undefined
  scriptType: NodeScriptType
  dagentTraefik?: DagentTraefikOptions | undefined
}

export interface NodeInstallResponse {
  command: string
  expireAt: Timestamp | undefined
}

export interface NodeScriptResponse {
  content: string
}

export interface NodeContainerCommandRequest {
  id: string
  command: ContainerCommandRequest | undefined
}

export interface NodeDeleteContainersRequest {
  id: string
  containers: DeleteContainersRequest | undefined
}

export interface NodeEventMessage {
  id: string
  status: NodeConnectionStatus
  address?: string | undefined
  version?: string | undefined
  connectedAt?: Timestamp | undefined
  error?: string | undefined
  updating?: boolean | undefined
}

export interface WatchContainerStateRequest {
  nodeId: string
  prefix?: string | undefined
}

export interface WatchContainerLogRequest {
  nodeId: string
  container: ContainerIdentifier | undefined
}

export interface DeploymentProgressMessage {
  id: string
  status?: DeploymentStatus | undefined
  instance?: InstanceDeploymentItem | undefined
  log: string[]
}

export interface InstancesCreatedEventList {
  data: InstanceResponse[]
}

export interface DeploymentEditEventMessage {
  instancesCreated?: InstancesCreatedEventList | undefined
  imageIdDeleted?: string | undefined
}

export interface InstanceResponse {
  id: string
  audit: AuditResponse | undefined
  image: ImageResponse | undefined
  state?: ContainerState | undefined
  config?: InstanceContainerConfig | undefined
}

export interface PatchInstanceRequest {
  id: string
  config?: InstanceContainerConfig | undefined
  resetSection?: string | undefined
}

export interface DeploymentEventContainerState {
  instanceId: string
  state: ContainerState
}

export interface DeploymentEventLog {
  log: string[]
}

export interface HealthResponse {
  status: ServiceStatus
  cruxVersion: string
  lastMigration?: string | undefined
}

function createBaseServiceIdRequest(): ServiceIdRequest {
  return { id: '' }
}

export const ServiceIdRequest = {
  encode(message: ServiceIdRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ServiceIdRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseServiceIdRequest()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): ServiceIdRequest {
    return { id: isSet(object.id) ? String(object.id) : '' }
  },

  toJSON(message: ServiceIdRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    return obj
  },

  create<I extends Exact<DeepPartial<ServiceIdRequest>, I>>(base?: I): ServiceIdRequest {
    return ServiceIdRequest.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<ServiceIdRequest>, I>>(object: I): ServiceIdRequest {
    const message = createBaseServiceIdRequest()
    message.id = object.id ?? ''
    return message
  },
}

function createBaseIdRequest(): IdRequest {
  return { id: '' }
}

export const IdRequest = {
  encode(message: IdRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): IdRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseIdRequest()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): IdRequest {
    return { id: isSet(object.id) ? String(object.id) : '' }
  },

  toJSON(message: IdRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    return obj
  },

  create<I extends Exact<DeepPartial<IdRequest>, I>>(base?: I): IdRequest {
    return IdRequest.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<IdRequest>, I>>(object: I): IdRequest {
    const message = createBaseIdRequest()
    message.id = object.id ?? ''
    return message
  },
}

function createBaseAuditResponse(): AuditResponse {
  return { createdBy: '', createdAt: undefined }
}

export const AuditResponse = {
  encode(message: AuditResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.createdBy !== '') {
      writer.uint32(802).string(message.createdBy)
    }
    if (message.createdAt !== undefined) {
      Timestamp.encode(message.createdAt, writer.uint32(810).fork()).ldelim()
    }
    if (message.updatedBy !== undefined) {
      writer.uint32(818).string(message.updatedBy)
    }
    if (message.updatedAt !== undefined) {
      Timestamp.encode(message.updatedAt, writer.uint32(826).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AuditResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseAuditResponse()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 100:
          message.createdBy = reader.string()
          break
        case 101:
          message.createdAt = Timestamp.decode(reader, reader.uint32())
          break
        case 102:
          message.updatedBy = reader.string()
          break
        case 103:
          message.updatedAt = Timestamp.decode(reader, reader.uint32())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): AuditResponse {
    return {
      createdBy: isSet(object.createdBy) ? String(object.createdBy) : '',
      createdAt: isSet(object.createdAt) ? fromJsonTimestamp(object.createdAt) : undefined,
      updatedBy: isSet(object.updatedBy) ? String(object.updatedBy) : undefined,
      updatedAt: isSet(object.updatedAt) ? fromJsonTimestamp(object.updatedAt) : undefined,
    }
  },

  toJSON(message: AuditResponse): unknown {
    const obj: any = {}
    message.createdBy !== undefined && (obj.createdBy = message.createdBy)
    message.createdAt !== undefined && (obj.createdAt = fromTimestamp(message.createdAt).toISOString())
    message.updatedBy !== undefined && (obj.updatedBy = message.updatedBy)
    message.updatedAt !== undefined && (obj.updatedAt = fromTimestamp(message.updatedAt).toISOString())
    return obj
  },

  create<I extends Exact<DeepPartial<AuditResponse>, I>>(base?: I): AuditResponse {
    return AuditResponse.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<AuditResponse>, I>>(object: I): AuditResponse {
    const message = createBaseAuditResponse()
    message.createdBy = object.createdBy ?? ''
    message.createdAt =
      object.createdAt !== undefined && object.createdAt !== null ? Timestamp.fromPartial(object.createdAt) : undefined
    message.updatedBy = object.updatedBy ?? undefined
    message.updatedAt =
      object.updatedAt !== undefined && object.updatedAt !== null ? Timestamp.fromPartial(object.updatedAt) : undefined
    return message
  },
}

function createBaseCreateEntityResponse(): CreateEntityResponse {
  return { id: '', createdAt: undefined }
}

export const CreateEntityResponse = {
  encode(message: CreateEntityResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id)
    }
    if (message.createdAt !== undefined) {
      Timestamp.encode(message.createdAt, writer.uint32(802).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CreateEntityResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseCreateEntityResponse()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string()
          break
        case 100:
          message.createdAt = Timestamp.decode(reader, reader.uint32())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): CreateEntityResponse {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      createdAt: isSet(object.createdAt) ? fromJsonTimestamp(object.createdAt) : undefined,
    }
  },

  toJSON(message: CreateEntityResponse): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.createdAt !== undefined && (obj.createdAt = fromTimestamp(message.createdAt).toISOString())
    return obj
  },

  create<I extends Exact<DeepPartial<CreateEntityResponse>, I>>(base?: I): CreateEntityResponse {
    return CreateEntityResponse.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<CreateEntityResponse>, I>>(object: I): CreateEntityResponse {
    const message = createBaseCreateEntityResponse()
    message.id = object.id ?? ''
    message.createdAt =
      object.createdAt !== undefined && object.createdAt !== null ? Timestamp.fromPartial(object.createdAt) : undefined
    return message
  },
}

function createBaseUpdateEntityResponse(): UpdateEntityResponse {
  return { updatedAt: undefined }
}

export const UpdateEntityResponse = {
  encode(message: UpdateEntityResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.updatedAt !== undefined) {
      Timestamp.encode(message.updatedAt, writer.uint32(802).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UpdateEntityResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseUpdateEntityResponse()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 100:
          message.updatedAt = Timestamp.decode(reader, reader.uint32())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): UpdateEntityResponse {
    return { updatedAt: isSet(object.updatedAt) ? fromJsonTimestamp(object.updatedAt) : undefined }
  },

  toJSON(message: UpdateEntityResponse): unknown {
    const obj: any = {}
    message.updatedAt !== undefined && (obj.updatedAt = fromTimestamp(message.updatedAt).toISOString())
    return obj
  },

  create<I extends Exact<DeepPartial<UpdateEntityResponse>, I>>(base?: I): UpdateEntityResponse {
    return UpdateEntityResponse.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<UpdateEntityResponse>, I>>(object: I): UpdateEntityResponse {
    const message = createBaseUpdateEntityResponse()
    message.updatedAt =
      object.updatedAt !== undefined && object.updatedAt !== null ? Timestamp.fromPartial(object.updatedAt) : undefined
    return message
  },
}

function createBaseCreateTeamRequest(): CreateTeamRequest {
  return { name: '' }
}

export const CreateTeamRequest = {
  encode(message: CreateTeamRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== '') {
      writer.uint32(802).string(message.name)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CreateTeamRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseCreateTeamRequest()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 100:
          message.name = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): CreateTeamRequest {
    return { name: isSet(object.name) ? String(object.name) : '' }
  },

  toJSON(message: CreateTeamRequest): unknown {
    const obj: any = {}
    message.name !== undefined && (obj.name = message.name)
    return obj
  },

  create<I extends Exact<DeepPartial<CreateTeamRequest>, I>>(base?: I): CreateTeamRequest {
    return CreateTeamRequest.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<CreateTeamRequest>, I>>(object: I): CreateTeamRequest {
    const message = createBaseCreateTeamRequest()
    message.name = object.name ?? ''
    return message
  },
}

function createBaseUpdateTeamRequest(): UpdateTeamRequest {
  return { id: '', name: '' }
}

export const UpdateTeamRequest = {
  encode(message: UpdateTeamRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id)
    }
    if (message.name !== '') {
      writer.uint32(802).string(message.name)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UpdateTeamRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseUpdateTeamRequest()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string()
          break
        case 100:
          message.name = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): UpdateTeamRequest {
    return { id: isSet(object.id) ? String(object.id) : '', name: isSet(object.name) ? String(object.name) : '' }
  },

  toJSON(message: UpdateTeamRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.name !== undefined && (obj.name = message.name)
    return obj
  },

  create<I extends Exact<DeepPartial<UpdateTeamRequest>, I>>(base?: I): UpdateTeamRequest {
    return UpdateTeamRequest.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<UpdateTeamRequest>, I>>(object: I): UpdateTeamRequest {
    const message = createBaseUpdateTeamRequest()
    message.id = object.id ?? ''
    message.name = object.name ?? ''
    return message
  },
}

function createBaseUpdateUserRoleInTeamRequest(): UpdateUserRoleInTeamRequest {
  return { id: '', userId: '', role: 0 }
}

export const UpdateUserRoleInTeamRequest = {
  encode(message: UpdateUserRoleInTeamRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id)
    }
    if (message.userId !== '') {
      writer.uint32(802).string(message.userId)
    }
    if (message.role !== 0) {
      writer.uint32(808).int32(message.role)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UpdateUserRoleInTeamRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseUpdateUserRoleInTeamRequest()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string()
          break
        case 100:
          message.userId = reader.string()
          break
        case 101:
          message.role = reader.int32() as any
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): UpdateUserRoleInTeamRequest {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      userId: isSet(object.userId) ? String(object.userId) : '',
      role: isSet(object.role) ? userRoleFromJSON(object.role) : 0,
    }
  },

  toJSON(message: UpdateUserRoleInTeamRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.userId !== undefined && (obj.userId = message.userId)
    message.role !== undefined && (obj.role = userRoleToJSON(message.role))
    return obj
  },

  create<I extends Exact<DeepPartial<UpdateUserRoleInTeamRequest>, I>>(base?: I): UpdateUserRoleInTeamRequest {
    return UpdateUserRoleInTeamRequest.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<UpdateUserRoleInTeamRequest>, I>>(object: I): UpdateUserRoleInTeamRequest {
    const message = createBaseUpdateUserRoleInTeamRequest()
    message.id = object.id ?? ''
    message.userId = object.userId ?? ''
    message.role = object.role ?? 0
    return message
  },
}

function createBaseInviteUserRequest(): InviteUserRequest {
  return { id: '', email: '', firstName: '' }
}

export const InviteUserRequest = {
  encode(message: InviteUserRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id)
    }
    if (message.email !== '') {
      writer.uint32(802).string(message.email)
    }
    if (message.firstName !== '') {
      writer.uint32(810).string(message.firstName)
    }
    if (message.lastName !== undefined) {
      writer.uint32(818).string(message.lastName)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): InviteUserRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseInviteUserRequest()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string()
          break
        case 100:
          message.email = reader.string()
          break
        case 101:
          message.firstName = reader.string()
          break
        case 102:
          message.lastName = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): InviteUserRequest {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      email: isSet(object.email) ? String(object.email) : '',
      firstName: isSet(object.firstName) ? String(object.firstName) : '',
      lastName: isSet(object.lastName) ? String(object.lastName) : undefined,
    }
  },

  toJSON(message: InviteUserRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.email !== undefined && (obj.email = message.email)
    message.firstName !== undefined && (obj.firstName = message.firstName)
    message.lastName !== undefined && (obj.lastName = message.lastName)
    return obj
  },

  create<I extends Exact<DeepPartial<InviteUserRequest>, I>>(base?: I): InviteUserRequest {
    return InviteUserRequest.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<InviteUserRequest>, I>>(object: I): InviteUserRequest {
    const message = createBaseInviteUserRequest()
    message.id = object.id ?? ''
    message.email = object.email ?? ''
    message.firstName = object.firstName ?? ''
    message.lastName = object.lastName ?? undefined
    return message
  },
}

function createBaseReinviteUserRequest(): ReinviteUserRequest {
  return { id: '', userId: '' }
}

export const ReinviteUserRequest = {
  encode(message: ReinviteUserRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id)
    }
    if (message.userId !== '') {
      writer.uint32(802).string(message.userId)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ReinviteUserRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseReinviteUserRequest()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string()
          break
        case 100:
          message.userId = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): ReinviteUserRequest {
    return { id: isSet(object.id) ? String(object.id) : '', userId: isSet(object.userId) ? String(object.userId) : '' }
  },

  toJSON(message: ReinviteUserRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.userId !== undefined && (obj.userId = message.userId)
    return obj
  },

  create<I extends Exact<DeepPartial<ReinviteUserRequest>, I>>(base?: I): ReinviteUserRequest {
    return ReinviteUserRequest.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<ReinviteUserRequest>, I>>(object: I): ReinviteUserRequest {
    const message = createBaseReinviteUserRequest()
    message.id = object.id ?? ''
    message.userId = object.userId ?? ''
    return message
  },
}

function createBaseDeleteUserFromTeamRequest(): DeleteUserFromTeamRequest {
  return { id: '', userId: '' }
}

export const DeleteUserFromTeamRequest = {
  encode(message: DeleteUserFromTeamRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id)
    }
    if (message.userId !== '') {
      writer.uint32(802).string(message.userId)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DeleteUserFromTeamRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseDeleteUserFromTeamRequest()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string()
          break
        case 100:
          message.userId = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): DeleteUserFromTeamRequest {
    return { id: isSet(object.id) ? String(object.id) : '', userId: isSet(object.userId) ? String(object.userId) : '' }
  },

  toJSON(message: DeleteUserFromTeamRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.userId !== undefined && (obj.userId = message.userId)
    return obj
  },

  create<I extends Exact<DeepPartial<DeleteUserFromTeamRequest>, I>>(base?: I): DeleteUserFromTeamRequest {
    return DeleteUserFromTeamRequest.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<DeleteUserFromTeamRequest>, I>>(object: I): DeleteUserFromTeamRequest {
    const message = createBaseDeleteUserFromTeamRequest()
    message.id = object.id ?? ''
    message.userId = object.userId ?? ''
    return message
  },
}

function createBaseUserMetaResponse(): UserMetaResponse {
  return { user: undefined, teams: [], invitations: [] }
}

export const UserMetaResponse = {
  encode(message: UserMetaResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.user !== undefined) {
      ActiveTeamUser.encode(message.user, writer.uint32(802).fork()).ldelim()
    }
    for (const v of message.teams) {
      TeamResponse.encode(v!, writer.uint32(8002).fork()).ldelim()
    }
    for (const v of message.invitations) {
      TeamResponse.encode(v!, writer.uint32(8010).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UserMetaResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseUserMetaResponse()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 100:
          message.user = ActiveTeamUser.decode(reader, reader.uint32())
          break
        case 1000:
          message.teams.push(TeamResponse.decode(reader, reader.uint32()))
          break
        case 1001:
          message.invitations.push(TeamResponse.decode(reader, reader.uint32()))
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): UserMetaResponse {
    return {
      user: isSet(object.user) ? ActiveTeamUser.fromJSON(object.user) : undefined,
      teams: Array.isArray(object?.teams) ? object.teams.map((e: any) => TeamResponse.fromJSON(e)) : [],
      invitations: Array.isArray(object?.invitations)
        ? object.invitations.map((e: any) => TeamResponse.fromJSON(e))
        : [],
    }
  },

  toJSON(message: UserMetaResponse): unknown {
    const obj: any = {}
    message.user !== undefined && (obj.user = message.user ? ActiveTeamUser.toJSON(message.user) : undefined)
    if (message.teams) {
      obj.teams = message.teams.map(e => (e ? TeamResponse.toJSON(e) : undefined))
    } else {
      obj.teams = []
    }
    if (message.invitations) {
      obj.invitations = message.invitations.map(e => (e ? TeamResponse.toJSON(e) : undefined))
    } else {
      obj.invitations = []
    }
    return obj
  },

  create<I extends Exact<DeepPartial<UserMetaResponse>, I>>(base?: I): UserMetaResponse {
    return UserMetaResponse.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<UserMetaResponse>, I>>(object: I): UserMetaResponse {
    const message = createBaseUserMetaResponse()
    message.user =
      object.user !== undefined && object.user !== null ? ActiveTeamUser.fromPartial(object.user) : undefined
    message.teams = object.teams?.map(e => TeamResponse.fromPartial(e)) || []
    message.invitations = object.invitations?.map(e => TeamResponse.fromPartial(e)) || []
    return message
  },
}

function createBaseActiveTeamUser(): ActiveTeamUser {
  return { activeTeamId: '', role: 0, status: 0 }
}

export const ActiveTeamUser = {
  encode(message: ActiveTeamUser, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.activeTeamId !== '') {
      writer.uint32(802).string(message.activeTeamId)
    }
    if (message.role !== 0) {
      writer.uint32(808).int32(message.role)
    }
    if (message.status !== 0) {
      writer.uint32(816).int32(message.status)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ActiveTeamUser {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseActiveTeamUser()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 100:
          message.activeTeamId = reader.string()
          break
        case 101:
          message.role = reader.int32() as any
          break
        case 102:
          message.status = reader.int32() as any
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): ActiveTeamUser {
    return {
      activeTeamId: isSet(object.activeTeamId) ? String(object.activeTeamId) : '',
      role: isSet(object.role) ? userRoleFromJSON(object.role) : 0,
      status: isSet(object.status) ? userStatusFromJSON(object.status) : 0,
    }
  },

  toJSON(message: ActiveTeamUser): unknown {
    const obj: any = {}
    message.activeTeamId !== undefined && (obj.activeTeamId = message.activeTeamId)
    message.role !== undefined && (obj.role = userRoleToJSON(message.role))
    message.status !== undefined && (obj.status = userStatusToJSON(message.status))
    return obj
  },

  create<I extends Exact<DeepPartial<ActiveTeamUser>, I>>(base?: I): ActiveTeamUser {
    return ActiveTeamUser.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<ActiveTeamUser>, I>>(object: I): ActiveTeamUser {
    const message = createBaseActiveTeamUser()
    message.activeTeamId = object.activeTeamId ?? ''
    message.role = object.role ?? 0
    message.status = object.status ?? 0
    return message
  },
}

function createBaseTeamResponse(): TeamResponse {
  return { id: '', name: '' }
}

export const TeamResponse = {
  encode(message: TeamResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id)
    }
    if (message.name !== '') {
      writer.uint32(802).string(message.name)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TeamResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseTeamResponse()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string()
          break
        case 100:
          message.name = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): TeamResponse {
    return { id: isSet(object.id) ? String(object.id) : '', name: isSet(object.name) ? String(object.name) : '' }
  },

  toJSON(message: TeamResponse): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.name !== undefined && (obj.name = message.name)
    return obj
  },

  create<I extends Exact<DeepPartial<TeamResponse>, I>>(base?: I): TeamResponse {
    return TeamResponse.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<TeamResponse>, I>>(object: I): TeamResponse {
    const message = createBaseTeamResponse()
    message.id = object.id ?? ''
    message.name = object.name ?? ''
    return message
  },
}

function createBaseActiveTeamDetailsResponse(): ActiveTeamDetailsResponse {
  return { id: '', name: '', users: [] }
}

export const ActiveTeamDetailsResponse = {
  encode(message: ActiveTeamDetailsResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id)
    }
    if (message.name !== '') {
      writer.uint32(802).string(message.name)
    }
    for (const v of message.users) {
      UserResponse.encode(v!, writer.uint32(8002).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ActiveTeamDetailsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseActiveTeamDetailsResponse()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string()
          break
        case 100:
          message.name = reader.string()
          break
        case 1000:
          message.users.push(UserResponse.decode(reader, reader.uint32()))
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): ActiveTeamDetailsResponse {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      name: isSet(object.name) ? String(object.name) : '',
      users: Array.isArray(object?.users) ? object.users.map((e: any) => UserResponse.fromJSON(e)) : [],
    }
  },

  toJSON(message: ActiveTeamDetailsResponse): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.name !== undefined && (obj.name = message.name)
    if (message.users) {
      obj.users = message.users.map(e => (e ? UserResponse.toJSON(e) : undefined))
    } else {
      obj.users = []
    }
    return obj
  },

  create<I extends Exact<DeepPartial<ActiveTeamDetailsResponse>, I>>(base?: I): ActiveTeamDetailsResponse {
    return ActiveTeamDetailsResponse.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<ActiveTeamDetailsResponse>, I>>(object: I): ActiveTeamDetailsResponse {
    const message = createBaseActiveTeamDetailsResponse()
    message.id = object.id ?? ''
    message.name = object.name ?? ''
    message.users = object.users?.map(e => UserResponse.fromPartial(e)) || []
    return message
  },
}

function createBaseTeamStatistics(): TeamStatistics {
  return { users: 0, products: 0, nodes: 0, versions: 0, deployments: 0 }
}

export const TeamStatistics = {
  encode(message: TeamStatistics, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.users !== 0) {
      writer.uint32(800).uint32(message.users)
    }
    if (message.products !== 0) {
      writer.uint32(808).uint32(message.products)
    }
    if (message.nodes !== 0) {
      writer.uint32(816).uint32(message.nodes)
    }
    if (message.versions !== 0) {
      writer.uint32(824).uint32(message.versions)
    }
    if (message.deployments !== 0) {
      writer.uint32(832).uint32(message.deployments)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TeamStatistics {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseTeamStatistics()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 100:
          message.users = reader.uint32()
          break
        case 101:
          message.products = reader.uint32()
          break
        case 102:
          message.nodes = reader.uint32()
          break
        case 103:
          message.versions = reader.uint32()
          break
        case 104:
          message.deployments = reader.uint32()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): TeamStatistics {
    return {
      users: isSet(object.users) ? Number(object.users) : 0,
      products: isSet(object.products) ? Number(object.products) : 0,
      nodes: isSet(object.nodes) ? Number(object.nodes) : 0,
      versions: isSet(object.versions) ? Number(object.versions) : 0,
      deployments: isSet(object.deployments) ? Number(object.deployments) : 0,
    }
  },

  toJSON(message: TeamStatistics): unknown {
    const obj: any = {}
    message.users !== undefined && (obj.users = Math.round(message.users))
    message.products !== undefined && (obj.products = Math.round(message.products))
    message.nodes !== undefined && (obj.nodes = Math.round(message.nodes))
    message.versions !== undefined && (obj.versions = Math.round(message.versions))
    message.deployments !== undefined && (obj.deployments = Math.round(message.deployments))
    return obj
  },

  create<I extends Exact<DeepPartial<TeamStatistics>, I>>(base?: I): TeamStatistics {
    return TeamStatistics.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<TeamStatistics>, I>>(object: I): TeamStatistics {
    const message = createBaseTeamStatistics()
    message.users = object.users ?? 0
    message.products = object.products ?? 0
    message.nodes = object.nodes ?? 0
    message.versions = object.versions ?? 0
    message.deployments = object.deployments ?? 0
    return message
  },
}

function createBaseTeamWithStatsResponse(): TeamWithStatsResponse {
  return { id: '', name: '', statistics: undefined }
}

export const TeamWithStatsResponse = {
  encode(message: TeamWithStatsResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id)
    }
    if (message.name !== '') {
      writer.uint32(802).string(message.name)
    }
    if (message.statistics !== undefined) {
      TeamStatistics.encode(message.statistics, writer.uint32(810).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TeamWithStatsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseTeamWithStatsResponse()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string()
          break
        case 100:
          message.name = reader.string()
          break
        case 101:
          message.statistics = TeamStatistics.decode(reader, reader.uint32())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): TeamWithStatsResponse {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      name: isSet(object.name) ? String(object.name) : '',
      statistics: isSet(object.statistics) ? TeamStatistics.fromJSON(object.statistics) : undefined,
    }
  },

  toJSON(message: TeamWithStatsResponse): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.name !== undefined && (obj.name = message.name)
    message.statistics !== undefined &&
      (obj.statistics = message.statistics ? TeamStatistics.toJSON(message.statistics) : undefined)
    return obj
  },

  create<I extends Exact<DeepPartial<TeamWithStatsResponse>, I>>(base?: I): TeamWithStatsResponse {
    return TeamWithStatsResponse.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<TeamWithStatsResponse>, I>>(object: I): TeamWithStatsResponse {
    const message = createBaseTeamWithStatsResponse()
    message.id = object.id ?? ''
    message.name = object.name ?? ''
    message.statistics =
      object.statistics !== undefined && object.statistics !== null
        ? TeamStatistics.fromPartial(object.statistics)
        : undefined
    return message
  },
}

function createBaseTeamDetailsResponse(): TeamDetailsResponse {
  return { id: '', name: '', statistics: undefined, users: [] }
}

export const TeamDetailsResponse = {
  encode(message: TeamDetailsResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id)
    }
    if (message.name !== '') {
      writer.uint32(802).string(message.name)
    }
    if (message.statistics !== undefined) {
      TeamStatistics.encode(message.statistics, writer.uint32(810).fork()).ldelim()
    }
    for (const v of message.users) {
      UserResponse.encode(v!, writer.uint32(8002).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TeamDetailsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseTeamDetailsResponse()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string()
          break
        case 100:
          message.name = reader.string()
          break
        case 101:
          message.statistics = TeamStatistics.decode(reader, reader.uint32())
          break
        case 1000:
          message.users.push(UserResponse.decode(reader, reader.uint32()))
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): TeamDetailsResponse {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      name: isSet(object.name) ? String(object.name) : '',
      statistics: isSet(object.statistics) ? TeamStatistics.fromJSON(object.statistics) : undefined,
      users: Array.isArray(object?.users) ? object.users.map((e: any) => UserResponse.fromJSON(e)) : [],
    }
  },

  toJSON(message: TeamDetailsResponse): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.name !== undefined && (obj.name = message.name)
    message.statistics !== undefined &&
      (obj.statistics = message.statistics ? TeamStatistics.toJSON(message.statistics) : undefined)
    if (message.users) {
      obj.users = message.users.map(e => (e ? UserResponse.toJSON(e) : undefined))
    } else {
      obj.users = []
    }
    return obj
  },

  create<I extends Exact<DeepPartial<TeamDetailsResponse>, I>>(base?: I): TeamDetailsResponse {
    return TeamDetailsResponse.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<TeamDetailsResponse>, I>>(object: I): TeamDetailsResponse {
    const message = createBaseTeamDetailsResponse()
    message.id = object.id ?? ''
    message.name = object.name ?? ''
    message.statistics =
      object.statistics !== undefined && object.statistics !== null
        ? TeamStatistics.fromPartial(object.statistics)
        : undefined
    message.users = object.users?.map(e => UserResponse.fromPartial(e)) || []
    return message
  },
}

function createBaseAllTeamsResponse(): AllTeamsResponse {
  return { data: [] }
}

export const AllTeamsResponse = {
  encode(message: AllTeamsResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.data) {
      TeamWithStatsResponse.encode(v!, writer.uint32(8002).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AllTeamsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseAllTeamsResponse()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1000:
          message.data.push(TeamWithStatsResponse.decode(reader, reader.uint32()))
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): AllTeamsResponse {
    return { data: Array.isArray(object?.data) ? object.data.map((e: any) => TeamWithStatsResponse.fromJSON(e)) : [] }
  },

  toJSON(message: AllTeamsResponse): unknown {
    const obj: any = {}
    if (message.data) {
      obj.data = message.data.map(e => (e ? TeamWithStatsResponse.toJSON(e) : undefined))
    } else {
      obj.data = []
    }
    return obj
  },

  create<I extends Exact<DeepPartial<AllTeamsResponse>, I>>(base?: I): AllTeamsResponse {
    return AllTeamsResponse.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<AllTeamsResponse>, I>>(object: I): AllTeamsResponse {
    const message = createBaseAllTeamsResponse()
    message.data = object.data?.map(e => TeamWithStatsResponse.fromPartial(e)) || []
    return message
  },
}

function createBaseUserResponse(): UserResponse {
  return { id: '', name: '', email: '', role: 0, status: 0 }
}

export const UserResponse = {
  encode(message: UserResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id)
    }
    if (message.name !== '') {
      writer.uint32(802).string(message.name)
    }
    if (message.email !== '') {
      writer.uint32(810).string(message.email)
    }
    if (message.role !== 0) {
      writer.uint32(816).int32(message.role)
    }
    if (message.status !== 0) {
      writer.uint32(824).int32(message.status)
    }
    if (message.lastLogin !== undefined) {
      Timestamp.encode(message.lastLogin, writer.uint32(834).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UserResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseUserResponse()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string()
          break
        case 100:
          message.name = reader.string()
          break
        case 101:
          message.email = reader.string()
          break
        case 102:
          message.role = reader.int32() as any
          break
        case 103:
          message.status = reader.int32() as any
          break
        case 104:
          message.lastLogin = Timestamp.decode(reader, reader.uint32())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): UserResponse {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      name: isSet(object.name) ? String(object.name) : '',
      email: isSet(object.email) ? String(object.email) : '',
      role: isSet(object.role) ? userRoleFromJSON(object.role) : 0,
      status: isSet(object.status) ? userStatusFromJSON(object.status) : 0,
      lastLogin: isSet(object.lastLogin) ? fromJsonTimestamp(object.lastLogin) : undefined,
    }
  },

  toJSON(message: UserResponse): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.name !== undefined && (obj.name = message.name)
    message.email !== undefined && (obj.email = message.email)
    message.role !== undefined && (obj.role = userRoleToJSON(message.role))
    message.status !== undefined && (obj.status = userStatusToJSON(message.status))
    message.lastLogin !== undefined && (obj.lastLogin = fromTimestamp(message.lastLogin).toISOString())
    return obj
  },

  create<I extends Exact<DeepPartial<UserResponse>, I>>(base?: I): UserResponse {
    return UserResponse.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<UserResponse>, I>>(object: I): UserResponse {
    const message = createBaseUserResponse()
    message.id = object.id ?? ''
    message.name = object.name ?? ''
    message.email = object.email ?? ''
    message.role = object.role ?? 0
    message.status = object.status ?? 0
    message.lastLogin =
      object.lastLogin !== undefined && object.lastLogin !== null ? Timestamp.fromPartial(object.lastLogin) : undefined
    return message
  },
}

function createBaseVolumeLink(): VolumeLink {
  return { id: '', name: '', path: '' }
}

export const VolumeLink = {
  encode(message: VolumeLink, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(802).string(message.id)
    }
    if (message.name !== '') {
      writer.uint32(810).string(message.name)
    }
    if (message.path !== '') {
      writer.uint32(818).string(message.path)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): VolumeLink {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseVolumeLink()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 100:
          message.id = reader.string()
          break
        case 101:
          message.name = reader.string()
          break
        case 102:
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
    return {
      id: isSet(object.id) ? String(object.id) : '',
      name: isSet(object.name) ? String(object.name) : '',
      path: isSet(object.path) ? String(object.path) : '',
    }
  },

  toJSON(message: VolumeLink): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.name !== undefined && (obj.name = message.name)
    message.path !== undefined && (obj.path = message.path)
    return obj
  },

  create<I extends Exact<DeepPartial<VolumeLink>, I>>(base?: I): VolumeLink {
    return VolumeLink.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<VolumeLink>, I>>(object: I): VolumeLink {
    const message = createBaseVolumeLink()
    message.id = object.id ?? ''
    message.name = object.name ?? ''
    message.path = object.path ?? ''
    return message
  },
}

function createBaseInitContainer(): InitContainer {
  return { id: '', name: '', image: '', useParentConfig: false, volumes: [], command: [], args: [], environment: [] }
}

export const InitContainer = {
  encode(message: InitContainer, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(802).string(message.id)
    }
    if (message.name !== '') {
      writer.uint32(810).string(message.name)
    }
    if (message.image !== '') {
      writer.uint32(818).string(message.image)
    }
    if (message.useParentConfig === true) {
      writer.uint32(824).bool(message.useParentConfig)
    }
    for (const v of message.volumes) {
      VolumeLink.encode(v!, writer.uint32(8002).fork()).ldelim()
    }
    for (const v of message.command) {
      UniqueKey.encode(v!, writer.uint32(8010).fork()).ldelim()
    }
    for (const v of message.args) {
      UniqueKey.encode(v!, writer.uint32(8018).fork()).ldelim()
    }
    for (const v of message.environment) {
      UniqueKeyValue.encode(v!, writer.uint32(8026).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): InitContainer {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseInitContainer()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 100:
          message.id = reader.string()
          break
        case 101:
          message.name = reader.string()
          break
        case 102:
          message.image = reader.string()
          break
        case 103:
          message.useParentConfig = reader.bool()
          break
        case 1000:
          message.volumes.push(VolumeLink.decode(reader, reader.uint32()))
          break
        case 1001:
          message.command.push(UniqueKey.decode(reader, reader.uint32()))
          break
        case 1002:
          message.args.push(UniqueKey.decode(reader, reader.uint32()))
          break
        case 1003:
          message.environment.push(UniqueKeyValue.decode(reader, reader.uint32()))
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): InitContainer {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      name: isSet(object.name) ? String(object.name) : '',
      image: isSet(object.image) ? String(object.image) : '',
      useParentConfig: isSet(object.useParentConfig) ? Boolean(object.useParentConfig) : false,
      volumes: Array.isArray(object?.volumes) ? object.volumes.map((e: any) => VolumeLink.fromJSON(e)) : [],
      command: Array.isArray(object?.command) ? object.command.map((e: any) => UniqueKey.fromJSON(e)) : [],
      args: Array.isArray(object?.args) ? object.args.map((e: any) => UniqueKey.fromJSON(e)) : [],
      environment: Array.isArray(object?.environment)
        ? object.environment.map((e: any) => UniqueKeyValue.fromJSON(e))
        : [],
    }
  },

  toJSON(message: InitContainer): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.name !== undefined && (obj.name = message.name)
    message.image !== undefined && (obj.image = message.image)
    message.useParentConfig !== undefined && (obj.useParentConfig = message.useParentConfig)
    if (message.volumes) {
      obj.volumes = message.volumes.map(e => (e ? VolumeLink.toJSON(e) : undefined))
    } else {
      obj.volumes = []
    }
    if (message.command) {
      obj.command = message.command.map(e => (e ? UniqueKey.toJSON(e) : undefined))
    } else {
      obj.command = []
    }
    if (message.args) {
      obj.args = message.args.map(e => (e ? UniqueKey.toJSON(e) : undefined))
    } else {
      obj.args = []
    }
    if (message.environment) {
      obj.environment = message.environment.map(e => (e ? UniqueKeyValue.toJSON(e) : undefined))
    } else {
      obj.environment = []
    }
    return obj
  },

  create<I extends Exact<DeepPartial<InitContainer>, I>>(base?: I): InitContainer {
    return InitContainer.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<InitContainer>, I>>(object: I): InitContainer {
    const message = createBaseInitContainer()
    message.id = object.id ?? ''
    message.name = object.name ?? ''
    message.image = object.image ?? ''
    message.useParentConfig = object.useParentConfig ?? false
    message.volumes = object.volumes?.map(e => VolumeLink.fromPartial(e)) || []
    message.command = object.command?.map(e => UniqueKey.fromPartial(e)) || []
    message.args = object.args?.map(e => UniqueKey.fromPartial(e)) || []
    message.environment = object.environment?.map(e => UniqueKeyValue.fromPartial(e)) || []
    return message
  },
}

function createBaseInitContainerList(): InitContainerList {
  return { data: [] }
}

export const InitContainerList = {
  encode(message: InitContainerList, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.data) {
      InitContainer.encode(v!, writer.uint32(8002).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): InitContainerList {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseInitContainerList()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1000:
          message.data.push(InitContainer.decode(reader, reader.uint32()))
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): InitContainerList {
    return { data: Array.isArray(object?.data) ? object.data.map((e: any) => InitContainer.fromJSON(e)) : [] }
  },

  toJSON(message: InitContainerList): unknown {
    const obj: any = {}
    if (message.data) {
      obj.data = message.data.map(e => (e ? InitContainer.toJSON(e) : undefined))
    } else {
      obj.data = []
    }
    return obj
  },

  create<I extends Exact<DeepPartial<InitContainerList>, I>>(base?: I): InitContainerList {
    return InitContainerList.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<InitContainerList>, I>>(object: I): InitContainerList {
    const message = createBaseInitContainerList()
    message.data = object.data?.map(e => InitContainer.fromPartial(e)) || []
    return message
  },
}

function createBaseLogConfig(): LogConfig {
  return { driver: 0, options: [] }
}

export const LogConfig = {
  encode(message: LogConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.driver !== 0) {
      writer.uint32(800).int32(message.driver)
    }
    for (const v of message.options) {
      UniqueKeyValue.encode(v!, writer.uint32(8002).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): LogConfig {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseLogConfig()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 100:
          message.driver = reader.int32() as any
          break
        case 1000:
          message.options.push(UniqueKeyValue.decode(reader, reader.uint32()))
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): LogConfig {
    return {
      driver: isSet(object.driver) ? driverTypeFromJSON(object.driver) : 0,
      options: Array.isArray(object?.options) ? object.options.map((e: any) => UniqueKeyValue.fromJSON(e)) : [],
    }
  },

  toJSON(message: LogConfig): unknown {
    const obj: any = {}
    message.driver !== undefined && (obj.driver = driverTypeToJSON(message.driver))
    if (message.options) {
      obj.options = message.options.map(e => (e ? UniqueKeyValue.toJSON(e) : undefined))
    } else {
      obj.options = []
    }
    return obj
  },

  create<I extends Exact<DeepPartial<LogConfig>, I>>(base?: I): LogConfig {
    return LogConfig.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<LogConfig>, I>>(object: I): LogConfig {
    const message = createBaseLogConfig()
    message.driver = object.driver ?? 0
    message.options = object.options?.map(e => UniqueKeyValue.fromPartial(e)) || []
    return message
  },
}

function createBasePort(): Port {
  return { id: '', internal: 0 }
}

export const Port = {
  encode(message: Port, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(802).string(message.id)
    }
    if (message.internal !== 0) {
      writer.uint32(808).int32(message.internal)
    }
    if (message.external !== undefined) {
      writer.uint32(816).int32(message.external)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Port {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBasePort()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 100:
          message.id = reader.string()
          break
        case 101:
          message.internal = reader.int32()
          break
        case 102:
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
    return {
      id: isSet(object.id) ? String(object.id) : '',
      internal: isSet(object.internal) ? Number(object.internal) : 0,
      external: isSet(object.external) ? Number(object.external) : undefined,
    }
  },

  toJSON(message: Port): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.internal !== undefined && (obj.internal = Math.round(message.internal))
    message.external !== undefined && (obj.external = Math.round(message.external))
    return obj
  },

  create<I extends Exact<DeepPartial<Port>, I>>(base?: I): Port {
    return Port.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<Port>, I>>(object: I): Port {
    const message = createBasePort()
    message.id = object.id ?? ''
    message.internal = object.internal ?? 0
    message.external = object.external ?? undefined
    return message
  },
}

function createBasePortList(): PortList {
  return { data: [] }
}

export const PortList = {
  encode(message: PortList, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.data) {
      Port.encode(v!, writer.uint32(8002).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PortList {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBasePortList()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1000:
          message.data.push(Port.decode(reader, reader.uint32()))
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): PortList {
    return { data: Array.isArray(object?.data) ? object.data.map((e: any) => Port.fromJSON(e)) : [] }
  },

  toJSON(message: PortList): unknown {
    const obj: any = {}
    if (message.data) {
      obj.data = message.data.map(e => (e ? Port.toJSON(e) : undefined))
    } else {
      obj.data = []
    }
    return obj
  },

  create<I extends Exact<DeepPartial<PortList>, I>>(base?: I): PortList {
    return PortList.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<PortList>, I>>(object: I): PortList {
    const message = createBasePortList()
    message.data = object.data?.map(e => Port.fromPartial(e)) || []
    return message
  },
}

function createBasePortRange(): PortRange {
  return { from: 0, to: 0 }
}

export const PortRange = {
  encode(message: PortRange, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.from !== 0) {
      writer.uint32(800).int32(message.from)
    }
    if (message.to !== 0) {
      writer.uint32(808).int32(message.to)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PortRange {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBasePortRange()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 100:
          message.from = reader.int32()
          break
        case 101:
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
    return { from: isSet(object.from) ? Number(object.from) : 0, to: isSet(object.to) ? Number(object.to) : 0 }
  },

  toJSON(message: PortRange): unknown {
    const obj: any = {}
    message.from !== undefined && (obj.from = Math.round(message.from))
    message.to !== undefined && (obj.to = Math.round(message.to))
    return obj
  },

  create<I extends Exact<DeepPartial<PortRange>, I>>(base?: I): PortRange {
    return PortRange.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<PortRange>, I>>(object: I): PortRange {
    const message = createBasePortRange()
    message.from = object.from ?? 0
    message.to = object.to ?? 0
    return message
  },
}

function createBasePortRangeBinding(): PortRangeBinding {
  return { id: '', internal: undefined, external: undefined }
}

export const PortRangeBinding = {
  encode(message: PortRangeBinding, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(802).string(message.id)
    }
    if (message.internal !== undefined) {
      PortRange.encode(message.internal, writer.uint32(810).fork()).ldelim()
    }
    if (message.external !== undefined) {
      PortRange.encode(message.external, writer.uint32(818).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PortRangeBinding {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBasePortRangeBinding()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 100:
          message.id = reader.string()
          break
        case 101:
          message.internal = PortRange.decode(reader, reader.uint32())
          break
        case 102:
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
    return {
      id: isSet(object.id) ? String(object.id) : '',
      internal: isSet(object.internal) ? PortRange.fromJSON(object.internal) : undefined,
      external: isSet(object.external) ? PortRange.fromJSON(object.external) : undefined,
    }
  },

  toJSON(message: PortRangeBinding): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.internal !== undefined && (obj.internal = message.internal ? PortRange.toJSON(message.internal) : undefined)
    message.external !== undefined && (obj.external = message.external ? PortRange.toJSON(message.external) : undefined)
    return obj
  },

  create<I extends Exact<DeepPartial<PortRangeBinding>, I>>(base?: I): PortRangeBinding {
    return PortRangeBinding.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<PortRangeBinding>, I>>(object: I): PortRangeBinding {
    const message = createBasePortRangeBinding()
    message.id = object.id ?? ''
    message.internal =
      object.internal !== undefined && object.internal !== null ? PortRange.fromPartial(object.internal) : undefined
    message.external =
      object.external !== undefined && object.external !== null ? PortRange.fromPartial(object.external) : undefined
    return message
  },
}

function createBasePortRangeBindingList(): PortRangeBindingList {
  return { data: [] }
}

export const PortRangeBindingList = {
  encode(message: PortRangeBindingList, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.data) {
      PortRangeBinding.encode(v!, writer.uint32(8002).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PortRangeBindingList {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBasePortRangeBindingList()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1000:
          message.data.push(PortRangeBinding.decode(reader, reader.uint32()))
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): PortRangeBindingList {
    return { data: Array.isArray(object?.data) ? object.data.map((e: any) => PortRangeBinding.fromJSON(e)) : [] }
  },

  toJSON(message: PortRangeBindingList): unknown {
    const obj: any = {}
    if (message.data) {
      obj.data = message.data.map(e => (e ? PortRangeBinding.toJSON(e) : undefined))
    } else {
      obj.data = []
    }
    return obj
  },

  create<I extends Exact<DeepPartial<PortRangeBindingList>, I>>(base?: I): PortRangeBindingList {
    return PortRangeBindingList.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<PortRangeBindingList>, I>>(object: I): PortRangeBindingList {
    const message = createBasePortRangeBindingList()
    message.data = object.data?.map(e => PortRangeBinding.fromPartial(e)) || []
    return message
  },
}

function createBaseVolume(): Volume {
  return { id: '', name: '', path: '' }
}

export const Volume = {
  encode(message: Volume, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(802).string(message.id)
    }
    if (message.name !== '') {
      writer.uint32(810).string(message.name)
    }
    if (message.path !== '') {
      writer.uint32(818).string(message.path)
    }
    if (message.size !== undefined) {
      writer.uint32(826).string(message.size)
    }
    if (message.type !== undefined) {
      writer.uint32(832).int32(message.type)
    }
    if (message.class !== undefined) {
      writer.uint32(842).string(message.class)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Volume {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseVolume()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 100:
          message.id = reader.string()
          break
        case 101:
          message.name = reader.string()
          break
        case 102:
          message.path = reader.string()
          break
        case 103:
          message.size = reader.string()
          break
        case 104:
          message.type = reader.int32() as any
          break
        case 105:
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
    return {
      id: isSet(object.id) ? String(object.id) : '',
      name: isSet(object.name) ? String(object.name) : '',
      path: isSet(object.path) ? String(object.path) : '',
      size: isSet(object.size) ? String(object.size) : undefined,
      type: isSet(object.type) ? volumeTypeFromJSON(object.type) : undefined,
      class: isSet(object.class) ? String(object.class) : undefined,
    }
  },

  toJSON(message: Volume): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.name !== undefined && (obj.name = message.name)
    message.path !== undefined && (obj.path = message.path)
    message.size !== undefined && (obj.size = message.size)
    message.type !== undefined && (obj.type = message.type !== undefined ? volumeTypeToJSON(message.type) : undefined)
    message.class !== undefined && (obj.class = message.class)
    return obj
  },

  create<I extends Exact<DeepPartial<Volume>, I>>(base?: I): Volume {
    return Volume.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<Volume>, I>>(object: I): Volume {
    const message = createBaseVolume()
    message.id = object.id ?? ''
    message.name = object.name ?? ''
    message.path = object.path ?? ''
    message.size = object.size ?? undefined
    message.type = object.type ?? undefined
    message.class = object.class ?? undefined
    return message
  },
}

function createBaseVolumeList(): VolumeList {
  return { data: [] }
}

export const VolumeList = {
  encode(message: VolumeList, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.data) {
      Volume.encode(v!, writer.uint32(8002).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): VolumeList {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseVolumeList()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1000:
          message.data.push(Volume.decode(reader, reader.uint32()))
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): VolumeList {
    return { data: Array.isArray(object?.data) ? object.data.map((e: any) => Volume.fromJSON(e)) : [] }
  },

  toJSON(message: VolumeList): unknown {
    const obj: any = {}
    if (message.data) {
      obj.data = message.data.map(e => (e ? Volume.toJSON(e) : undefined))
    } else {
      obj.data = []
    }
    return obj
  },

  create<I extends Exact<DeepPartial<VolumeList>, I>>(base?: I): VolumeList {
    return VolumeList.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<VolumeList>, I>>(object: I): VolumeList {
    const message = createBaseVolumeList()
    message.data = object.data?.map(e => Volume.fromPartial(e)) || []
    return message
  },
}

function createBaseUniqueKeyList(): UniqueKeyList {
  return { data: [] }
}

export const UniqueKeyList = {
  encode(message: UniqueKeyList, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.data) {
      UniqueKey.encode(v!, writer.uint32(8002).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UniqueKeyList {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseUniqueKeyList()
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

  fromJSON(object: any): UniqueKeyList {
    return { data: Array.isArray(object?.data) ? object.data.map((e: any) => UniqueKey.fromJSON(e)) : [] }
  },

  toJSON(message: UniqueKeyList): unknown {
    const obj: any = {}
    if (message.data) {
      obj.data = message.data.map(e => (e ? UniqueKey.toJSON(e) : undefined))
    } else {
      obj.data = []
    }
    return obj
  },

  create<I extends Exact<DeepPartial<UniqueKeyList>, I>>(base?: I): UniqueKeyList {
    return UniqueKeyList.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<UniqueKeyList>, I>>(object: I): UniqueKeyList {
    const message = createBaseUniqueKeyList()
    message.data = object.data?.map(e => UniqueKey.fromPartial(e)) || []
    return message
  },
}

function createBaseUniqueKeyValue(): UniqueKeyValue {
  return { id: '', key: '', value: '' }
}

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
    const message = createBaseUniqueKeyValue()
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
    return {
      id: isSet(object.id) ? String(object.id) : '',
      key: isSet(object.key) ? String(object.key) : '',
      value: isSet(object.value) ? String(object.value) : '',
    }
  },

  toJSON(message: UniqueKeyValue): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.key !== undefined && (obj.key = message.key)
    message.value !== undefined && (obj.value = message.value)
    return obj
  },

  create<I extends Exact<DeepPartial<UniqueKeyValue>, I>>(base?: I): UniqueKeyValue {
    return UniqueKeyValue.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<UniqueKeyValue>, I>>(object: I): UniqueKeyValue {
    const message = createBaseUniqueKeyValue()
    message.id = object.id ?? ''
    message.key = object.key ?? ''
    message.value = object.value ?? ''
    return message
  },
}

function createBaseUniqueKeyValueList(): UniqueKeyValueList {
  return { data: [] }
}

export const UniqueKeyValueList = {
  encode(message: UniqueKeyValueList, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.data) {
      UniqueKeyValue.encode(v!, writer.uint32(8002).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UniqueKeyValueList {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseUniqueKeyValueList()
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

  fromJSON(object: any): UniqueKeyValueList {
    return { data: Array.isArray(object?.data) ? object.data.map((e: any) => UniqueKeyValue.fromJSON(e)) : [] }
  },

  toJSON(message: UniqueKeyValueList): unknown {
    const obj: any = {}
    if (message.data) {
      obj.data = message.data.map(e => (e ? UniqueKeyValue.toJSON(e) : undefined))
    } else {
      obj.data = []
    }
    return obj
  },

  create<I extends Exact<DeepPartial<UniqueKeyValueList>, I>>(base?: I): UniqueKeyValueList {
    return UniqueKeyValueList.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<UniqueKeyValueList>, I>>(object: I): UniqueKeyValueList {
    const message = createBaseUniqueKeyValueList()
    message.data = object.data?.map(e => UniqueKeyValue.fromPartial(e)) || []
    return message
  },
}

function createBaseUniqueSecretKey(): UniqueSecretKey {
  return { id: '', key: '', required: false }
}

export const UniqueSecretKey = {
  encode(message: UniqueSecretKey, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(802).string(message.id)
    }
    if (message.key !== '') {
      writer.uint32(810).string(message.key)
    }
    if (message.required === true) {
      writer.uint32(816).bool(message.required)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UniqueSecretKey {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseUniqueSecretKey()
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
          message.required = reader.bool()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): UniqueSecretKey {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      key: isSet(object.key) ? String(object.key) : '',
      required: isSet(object.required) ? Boolean(object.required) : false,
    }
  },

  toJSON(message: UniqueSecretKey): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.key !== undefined && (obj.key = message.key)
    message.required !== undefined && (obj.required = message.required)
    return obj
  },

  create<I extends Exact<DeepPartial<UniqueSecretKey>, I>>(base?: I): UniqueSecretKey {
    return UniqueSecretKey.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<UniqueSecretKey>, I>>(object: I): UniqueSecretKey {
    const message = createBaseUniqueSecretKey()
    message.id = object.id ?? ''
    message.key = object.key ?? ''
    message.required = object.required ?? false
    return message
  },
}

function createBaseUniqueSecretKeyList(): UniqueSecretKeyList {
  return { data: [] }
}

export const UniqueSecretKeyList = {
  encode(message: UniqueSecretKeyList, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.data) {
      UniqueSecretKey.encode(v!, writer.uint32(8002).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UniqueSecretKeyList {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseUniqueSecretKeyList()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1000:
          message.data.push(UniqueSecretKey.decode(reader, reader.uint32()))
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): UniqueSecretKeyList {
    return { data: Array.isArray(object?.data) ? object.data.map((e: any) => UniqueSecretKey.fromJSON(e)) : [] }
  },

  toJSON(message: UniqueSecretKeyList): unknown {
    const obj: any = {}
    if (message.data) {
      obj.data = message.data.map(e => (e ? UniqueSecretKey.toJSON(e) : undefined))
    } else {
      obj.data = []
    }
    return obj
  },

  create<I extends Exact<DeepPartial<UniqueSecretKeyList>, I>>(base?: I): UniqueSecretKeyList {
    return UniqueSecretKeyList.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<UniqueSecretKeyList>, I>>(object: I): UniqueSecretKeyList {
    const message = createBaseUniqueSecretKeyList()
    message.data = object.data?.map(e => UniqueSecretKey.fromPartial(e)) || []
    return message
  },
}

function createBaseUniqueSecretKeyValue(): UniqueSecretKeyValue {
  return { id: '', key: '', value: '', required: false, encrypted: false }
}

export const UniqueSecretKeyValue = {
  encode(message: UniqueSecretKeyValue, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(802).string(message.id)
    }
    if (message.key !== '') {
      writer.uint32(810).string(message.key)
    }
    if (message.value !== '') {
      writer.uint32(826).string(message.value)
    }
    if (message.required === true) {
      writer.uint32(832).bool(message.required)
    }
    if (message.encrypted === true) {
      writer.uint32(840).bool(message.encrypted)
    }
    if (message.publicKey !== undefined) {
      writer.uint32(850).string(message.publicKey)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UniqueSecretKeyValue {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseUniqueSecretKeyValue()
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
          message.required = reader.bool()
          break
        case 105:
          message.encrypted = reader.bool()
          break
        case 106:
          message.publicKey = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): UniqueSecretKeyValue {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      key: isSet(object.key) ? String(object.key) : '',
      value: isSet(object.value) ? String(object.value) : '',
      required: isSet(object.required) ? Boolean(object.required) : false,
      encrypted: isSet(object.encrypted) ? Boolean(object.encrypted) : false,
      publicKey: isSet(object.publicKey) ? String(object.publicKey) : undefined,
    }
  },

  toJSON(message: UniqueSecretKeyValue): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.key !== undefined && (obj.key = message.key)
    message.value !== undefined && (obj.value = message.value)
    message.required !== undefined && (obj.required = message.required)
    message.encrypted !== undefined && (obj.encrypted = message.encrypted)
    message.publicKey !== undefined && (obj.publicKey = message.publicKey)
    return obj
  },

  create<I extends Exact<DeepPartial<UniqueSecretKeyValue>, I>>(base?: I): UniqueSecretKeyValue {
    return UniqueSecretKeyValue.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<UniqueSecretKeyValue>, I>>(object: I): UniqueSecretKeyValue {
    const message = createBaseUniqueSecretKeyValue()
    message.id = object.id ?? ''
    message.key = object.key ?? ''
    message.value = object.value ?? ''
    message.required = object.required ?? false
    message.encrypted = object.encrypted ?? false
    message.publicKey = object.publicKey ?? undefined
    return message
  },
}

function createBaseUniqueSecretKeyValueList(): UniqueSecretKeyValueList {
  return { data: [] }
}

export const UniqueSecretKeyValueList = {
  encode(message: UniqueSecretKeyValueList, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.data) {
      UniqueSecretKeyValue.encode(v!, writer.uint32(8002).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UniqueSecretKeyValueList {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseUniqueSecretKeyValueList()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1000:
          message.data.push(UniqueSecretKeyValue.decode(reader, reader.uint32()))
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): UniqueSecretKeyValueList {
    return { data: Array.isArray(object?.data) ? object.data.map((e: any) => UniqueSecretKeyValue.fromJSON(e)) : [] }
  },

  toJSON(message: UniqueSecretKeyValueList): unknown {
    const obj: any = {}
    if (message.data) {
      obj.data = message.data.map(e => (e ? UniqueSecretKeyValue.toJSON(e) : undefined))
    } else {
      obj.data = []
    }
    return obj
  },

  create<I extends Exact<DeepPartial<UniqueSecretKeyValueList>, I>>(base?: I): UniqueSecretKeyValueList {
    return UniqueSecretKeyValueList.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<UniqueSecretKeyValueList>, I>>(object: I): UniqueSecretKeyValueList {
    const message = createBaseUniqueSecretKeyValueList()
    message.data = object.data?.map(e => UniqueSecretKeyValue.fromPartial(e)) || []
    return message
  },
}

function createBaseMarker(): Marker {
  return { deployment: [], service: [], ingress: [] }
}

export const Marker = {
  encode(message: Marker, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.deployment) {
      UniqueKeyValue.encode(v!, writer.uint32(8002).fork()).ldelim()
    }
    for (const v of message.service) {
      UniqueKeyValue.encode(v!, writer.uint32(8010).fork()).ldelim()
    }
    for (const v of message.ingress) {
      UniqueKeyValue.encode(v!, writer.uint32(8018).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Marker {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseMarker()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1000:
          message.deployment.push(UniqueKeyValue.decode(reader, reader.uint32()))
          break
        case 1001:
          message.service.push(UniqueKeyValue.decode(reader, reader.uint32()))
          break
        case 1002:
          message.ingress.push(UniqueKeyValue.decode(reader, reader.uint32()))
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): Marker {
    return {
      deployment: Array.isArray(object?.deployment)
        ? object.deployment.map((e: any) => UniqueKeyValue.fromJSON(e))
        : [],
      service: Array.isArray(object?.service) ? object.service.map((e: any) => UniqueKeyValue.fromJSON(e)) : [],
      ingress: Array.isArray(object?.ingress) ? object.ingress.map((e: any) => UniqueKeyValue.fromJSON(e)) : [],
    }
  },

  toJSON(message: Marker): unknown {
    const obj: any = {}
    if (message.deployment) {
      obj.deployment = message.deployment.map(e => (e ? UniqueKeyValue.toJSON(e) : undefined))
    } else {
      obj.deployment = []
    }
    if (message.service) {
      obj.service = message.service.map(e => (e ? UniqueKeyValue.toJSON(e) : undefined))
    } else {
      obj.service = []
    }
    if (message.ingress) {
      obj.ingress = message.ingress.map(e => (e ? UniqueKeyValue.toJSON(e) : undefined))
    } else {
      obj.ingress = []
    }
    return obj
  },

  create<I extends Exact<DeepPartial<Marker>, I>>(base?: I): Marker {
    return Marker.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<Marker>, I>>(object: I): Marker {
    const message = createBaseMarker()
    message.deployment = object.deployment?.map(e => UniqueKeyValue.fromPartial(e)) || []
    message.service = object.service?.map(e => UniqueKeyValue.fromPartial(e)) || []
    message.ingress = object.ingress?.map(e => UniqueKeyValue.fromPartial(e)) || []
    return message
  },
}

function createBaseContainerStorage(): ContainerStorage {
  return {}
}

export const ContainerStorage = {
  encode(message: ContainerStorage, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.storageId !== undefined) {
      writer.uint32(802).string(message.storageId)
    }
    if (message.path !== undefined) {
      writer.uint32(810).string(message.path)
    }
    if (message.bucket !== undefined) {
      writer.uint32(818).string(message.bucket)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ContainerStorage {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseContainerStorage()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 100:
          message.storageId = reader.string()
          break
        case 101:
          message.path = reader.string()
          break
        case 102:
          message.bucket = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): ContainerStorage {
    return {
      storageId: isSet(object.storageId) ? String(object.storageId) : undefined,
      path: isSet(object.path) ? String(object.path) : undefined,
      bucket: isSet(object.bucket) ? String(object.bucket) : undefined,
    }
  },

  toJSON(message: ContainerStorage): unknown {
    const obj: any = {}
    message.storageId !== undefined && (obj.storageId = message.storageId)
    message.path !== undefined && (obj.path = message.path)
    message.bucket !== undefined && (obj.bucket = message.bucket)
    return obj
  },

  create<I extends Exact<DeepPartial<ContainerStorage>, I>>(base?: I): ContainerStorage {
    return ContainerStorage.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<ContainerStorage>, I>>(object: I): ContainerStorage {
    const message = createBaseContainerStorage()
    message.storageId = object.storageId ?? undefined
    message.path = object.path ?? undefined
    message.bucket = object.bucket ?? undefined
    return message
  },
}

function createBaseDagentContainerConfig(): DagentContainerConfig {
  return {}
}

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
    if (message.networks !== undefined) {
      UniqueKeyList.encode(message.networks, writer.uint32(8002).fork()).ldelim()
    }
    if (message.labels !== undefined) {
      UniqueKeyValueList.encode(message.labels, writer.uint32(8010).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DagentContainerConfig {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseDagentContainerConfig()
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
          message.networks = UniqueKeyList.decode(reader, reader.uint32())
          break
        case 1001:
          message.labels = UniqueKeyValueList.decode(reader, reader.uint32())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): DagentContainerConfig {
    return {
      logConfig: isSet(object.logConfig) ? LogConfig.fromJSON(object.logConfig) : undefined,
      restartPolicy: isSet(object.restartPolicy) ? restartPolicyFromJSON(object.restartPolicy) : undefined,
      networkMode: isSet(object.networkMode) ? networkModeFromJSON(object.networkMode) : undefined,
      networks: isSet(object.networks) ? UniqueKeyList.fromJSON(object.networks) : undefined,
      labels: isSet(object.labels) ? UniqueKeyValueList.fromJSON(object.labels) : undefined,
    }
  },

  toJSON(message: DagentContainerConfig): unknown {
    const obj: any = {}
    message.logConfig !== undefined &&
      (obj.logConfig = message.logConfig ? LogConfig.toJSON(message.logConfig) : undefined)
    message.restartPolicy !== undefined &&
      (obj.restartPolicy = message.restartPolicy !== undefined ? restartPolicyToJSON(message.restartPolicy) : undefined)
    message.networkMode !== undefined &&
      (obj.networkMode = message.networkMode !== undefined ? networkModeToJSON(message.networkMode) : undefined)
    message.networks !== undefined &&
      (obj.networks = message.networks ? UniqueKeyList.toJSON(message.networks) : undefined)
    message.labels !== undefined &&
      (obj.labels = message.labels ? UniqueKeyValueList.toJSON(message.labels) : undefined)
    return obj
  },

  create<I extends Exact<DeepPartial<DagentContainerConfig>, I>>(base?: I): DagentContainerConfig {
    return DagentContainerConfig.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<DagentContainerConfig>, I>>(object: I): DagentContainerConfig {
    const message = createBaseDagentContainerConfig()
    message.logConfig =
      object.logConfig !== undefined && object.logConfig !== null ? LogConfig.fromPartial(object.logConfig) : undefined
    message.restartPolicy = object.restartPolicy ?? undefined
    message.networkMode = object.networkMode ?? undefined
    message.networks =
      object.networks !== undefined && object.networks !== null ? UniqueKeyList.fromPartial(object.networks) : undefined
    message.labels =
      object.labels !== undefined && object.labels !== null ? UniqueKeyValueList.fromPartial(object.labels) : undefined
    return message
  },
}

function createBaseCraneContainerConfig(): CraneContainerConfig {
  return {}
}

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
    if (message.annotations !== undefined) {
      Marker.encode(message.annotations, writer.uint32(842).fork()).ldelim()
    }
    if (message.labels !== undefined) {
      Marker.encode(message.labels, writer.uint32(850).fork()).ldelim()
    }
    if (message.customHeaders !== undefined) {
      UniqueKeyList.encode(message.customHeaders, writer.uint32(8002).fork()).ldelim()
    }
    if (message.extraLBAnnotations !== undefined) {
      UniqueKeyValueList.encode(message.extraLBAnnotations, writer.uint32(8010).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CraneContainerConfig {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseCraneContainerConfig()
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
          message.annotations = Marker.decode(reader, reader.uint32())
          break
        case 106:
          message.labels = Marker.decode(reader, reader.uint32())
          break
        case 1000:
          message.customHeaders = UniqueKeyList.decode(reader, reader.uint32())
          break
        case 1001:
          message.extraLBAnnotations = UniqueKeyValueList.decode(reader, reader.uint32())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): CraneContainerConfig {
    return {
      deploymentStatregy: isSet(object.deploymentStatregy)
        ? deploymentStrategyFromJSON(object.deploymentStatregy)
        : undefined,
      healthCheckConfig: isSet(object.healthCheckConfig)
        ? HealthCheckConfig.fromJSON(object.healthCheckConfig)
        : undefined,
      resourceConfig: isSet(object.resourceConfig) ? ResourceConfig.fromJSON(object.resourceConfig) : undefined,
      proxyHeaders: isSet(object.proxyHeaders) ? Boolean(object.proxyHeaders) : undefined,
      useLoadBalancer: isSet(object.useLoadBalancer) ? Boolean(object.useLoadBalancer) : undefined,
      annotations: isSet(object.annotations) ? Marker.fromJSON(object.annotations) : undefined,
      labels: isSet(object.labels) ? Marker.fromJSON(object.labels) : undefined,
      customHeaders: isSet(object.customHeaders) ? UniqueKeyList.fromJSON(object.customHeaders) : undefined,
      extraLBAnnotations: isSet(object.extraLBAnnotations)
        ? UniqueKeyValueList.fromJSON(object.extraLBAnnotations)
        : undefined,
    }
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
    message.annotations !== undefined &&
      (obj.annotations = message.annotations ? Marker.toJSON(message.annotations) : undefined)
    message.labels !== undefined && (obj.labels = message.labels ? Marker.toJSON(message.labels) : undefined)
    message.customHeaders !== undefined &&
      (obj.customHeaders = message.customHeaders ? UniqueKeyList.toJSON(message.customHeaders) : undefined)
    message.extraLBAnnotations !== undefined &&
      (obj.extraLBAnnotations = message.extraLBAnnotations
        ? UniqueKeyValueList.toJSON(message.extraLBAnnotations)
        : undefined)
    return obj
  },

  create<I extends Exact<DeepPartial<CraneContainerConfig>, I>>(base?: I): CraneContainerConfig {
    return CraneContainerConfig.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<CraneContainerConfig>, I>>(object: I): CraneContainerConfig {
    const message = createBaseCraneContainerConfig()
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
    message.annotations =
      object.annotations !== undefined && object.annotations !== null
        ? Marker.fromPartial(object.annotations)
        : undefined
    message.labels =
      object.labels !== undefined && object.labels !== null ? Marker.fromPartial(object.labels) : undefined
    message.customHeaders =
      object.customHeaders !== undefined && object.customHeaders !== null
        ? UniqueKeyList.fromPartial(object.customHeaders)
        : undefined
    message.extraLBAnnotations =
      object.extraLBAnnotations !== undefined && object.extraLBAnnotations !== null
        ? UniqueKeyValueList.fromPartial(object.extraLBAnnotations)
        : undefined
    return message
  },
}

function createBaseCommonContainerConfig(): CommonContainerConfig {
  return {}
}

export const CommonContainerConfig = {
  encode(message: CommonContainerConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== undefined) {
      writer.uint32(810).string(message.name)
    }
    if (message.expose !== undefined) {
      writer.uint32(816).int32(message.expose)
    }
    if (message.ingress !== undefined) {
      Ingress.encode(message.ingress, writer.uint32(826).fork()).ldelim()
    }
    if (message.configContainer !== undefined) {
      ConfigContainer.encode(message.configContainer, writer.uint32(834).fork()).ldelim()
    }
    if (message.user !== undefined) {
      writer.uint32(840).int64(message.user)
    }
    if (message.TTY !== undefined) {
      writer.uint32(848).bool(message.TTY)
    }
    if (message.storage !== undefined) {
      ContainerStorage.encode(message.storage, writer.uint32(858).fork()).ldelim()
    }
    if (message.ports !== undefined) {
      PortList.encode(message.ports, writer.uint32(8002).fork()).ldelim()
    }
    if (message.portRanges !== undefined) {
      PortRangeBindingList.encode(message.portRanges, writer.uint32(8010).fork()).ldelim()
    }
    if (message.volumes !== undefined) {
      VolumeList.encode(message.volumes, writer.uint32(8018).fork()).ldelim()
    }
    if (message.commands !== undefined) {
      UniqueKeyList.encode(message.commands, writer.uint32(8026).fork()).ldelim()
    }
    if (message.args !== undefined) {
      UniqueKeyList.encode(message.args, writer.uint32(8034).fork()).ldelim()
    }
    if (message.environment !== undefined) {
      UniqueKeyValueList.encode(message.environment, writer.uint32(8042).fork()).ldelim()
    }
    if (message.initContainers !== undefined) {
      InitContainerList.encode(message.initContainers, writer.uint32(8050).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CommonContainerConfig {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseCommonContainerConfig()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 101:
          message.name = reader.string()
          break
        case 102:
          message.expose = reader.int32() as any
          break
        case 103:
          message.ingress = Ingress.decode(reader, reader.uint32())
          break
        case 104:
          message.configContainer = ConfigContainer.decode(reader, reader.uint32())
          break
        case 105:
          message.user = longToNumber(reader.int64() as Long)
          break
        case 106:
          message.TTY = reader.bool()
          break
        case 107:
          message.storage = ContainerStorage.decode(reader, reader.uint32())
          break
        case 1000:
          message.ports = PortList.decode(reader, reader.uint32())
          break
        case 1001:
          message.portRanges = PortRangeBindingList.decode(reader, reader.uint32())
          break
        case 1002:
          message.volumes = VolumeList.decode(reader, reader.uint32())
          break
        case 1003:
          message.commands = UniqueKeyList.decode(reader, reader.uint32())
          break
        case 1004:
          message.args = UniqueKeyList.decode(reader, reader.uint32())
          break
        case 1005:
          message.environment = UniqueKeyValueList.decode(reader, reader.uint32())
          break
        case 1006:
          message.initContainers = InitContainerList.decode(reader, reader.uint32())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): CommonContainerConfig {
    return {
      name: isSet(object.name) ? String(object.name) : undefined,
      expose: isSet(object.expose) ? exposeStrategyFromJSON(object.expose) : undefined,
      ingress: isSet(object.ingress) ? Ingress.fromJSON(object.ingress) : undefined,
      configContainer: isSet(object.configContainer) ? ConfigContainer.fromJSON(object.configContainer) : undefined,
      user: isSet(object.user) ? Number(object.user) : undefined,
      TTY: isSet(object.TTY) ? Boolean(object.TTY) : undefined,
      storage: isSet(object.storage) ? ContainerStorage.fromJSON(object.storage) : undefined,
      ports: isSet(object.ports) ? PortList.fromJSON(object.ports) : undefined,
      portRanges: isSet(object.portRanges) ? PortRangeBindingList.fromJSON(object.portRanges) : undefined,
      volumes: isSet(object.volumes) ? VolumeList.fromJSON(object.volumes) : undefined,
      commands: isSet(object.commands) ? UniqueKeyList.fromJSON(object.commands) : undefined,
      args: isSet(object.args) ? UniqueKeyList.fromJSON(object.args) : undefined,
      environment: isSet(object.environment) ? UniqueKeyValueList.fromJSON(object.environment) : undefined,
      initContainers: isSet(object.initContainers) ? InitContainerList.fromJSON(object.initContainers) : undefined,
    }
  },

  toJSON(message: CommonContainerConfig): unknown {
    const obj: any = {}
    message.name !== undefined && (obj.name = message.name)
    message.expose !== undefined &&
      (obj.expose = message.expose !== undefined ? exposeStrategyToJSON(message.expose) : undefined)
    message.ingress !== undefined && (obj.ingress = message.ingress ? Ingress.toJSON(message.ingress) : undefined)
    message.configContainer !== undefined &&
      (obj.configContainer = message.configContainer ? ConfigContainer.toJSON(message.configContainer) : undefined)
    message.user !== undefined && (obj.user = Math.round(message.user))
    message.TTY !== undefined && (obj.TTY = message.TTY)
    message.storage !== undefined &&
      (obj.storage = message.storage ? ContainerStorage.toJSON(message.storage) : undefined)
    message.ports !== undefined && (obj.ports = message.ports ? PortList.toJSON(message.ports) : undefined)
    message.portRanges !== undefined &&
      (obj.portRanges = message.portRanges ? PortRangeBindingList.toJSON(message.portRanges) : undefined)
    message.volumes !== undefined && (obj.volumes = message.volumes ? VolumeList.toJSON(message.volumes) : undefined)
    message.commands !== undefined &&
      (obj.commands = message.commands ? UniqueKeyList.toJSON(message.commands) : undefined)
    message.args !== undefined && (obj.args = message.args ? UniqueKeyList.toJSON(message.args) : undefined)
    message.environment !== undefined &&
      (obj.environment = message.environment ? UniqueKeyValueList.toJSON(message.environment) : undefined)
    message.initContainers !== undefined &&
      (obj.initContainers = message.initContainers ? InitContainerList.toJSON(message.initContainers) : undefined)
    return obj
  },

  create<I extends Exact<DeepPartial<CommonContainerConfig>, I>>(base?: I): CommonContainerConfig {
    return CommonContainerConfig.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<CommonContainerConfig>, I>>(object: I): CommonContainerConfig {
    const message = createBaseCommonContainerConfig()
    message.name = object.name ?? undefined
    message.expose = object.expose ?? undefined
    message.ingress =
      object.ingress !== undefined && object.ingress !== null ? Ingress.fromPartial(object.ingress) : undefined
    message.configContainer =
      object.configContainer !== undefined && object.configContainer !== null
        ? ConfigContainer.fromPartial(object.configContainer)
        : undefined
    message.user = object.user ?? undefined
    message.TTY = object.TTY ?? undefined
    message.storage =
      object.storage !== undefined && object.storage !== null ? ContainerStorage.fromPartial(object.storage) : undefined
    message.ports = object.ports !== undefined && object.ports !== null ? PortList.fromPartial(object.ports) : undefined
    message.portRanges =
      object.portRanges !== undefined && object.portRanges !== null
        ? PortRangeBindingList.fromPartial(object.portRanges)
        : undefined
    message.volumes =
      object.volumes !== undefined && object.volumes !== null ? VolumeList.fromPartial(object.volumes) : undefined
    message.commands =
      object.commands !== undefined && object.commands !== null ? UniqueKeyList.fromPartial(object.commands) : undefined
    message.args =
      object.args !== undefined && object.args !== null ? UniqueKeyList.fromPartial(object.args) : undefined
    message.environment =
      object.environment !== undefined && object.environment !== null
        ? UniqueKeyValueList.fromPartial(object.environment)
        : undefined
    message.initContainers =
      object.initContainers !== undefined && object.initContainers !== null
        ? InitContainerList.fromPartial(object.initContainers)
        : undefined
    return message
  },
}

function createBaseImageContainerConfig(): ImageContainerConfig {
  return {}
}

export const ImageContainerConfig = {
  encode(message: ImageContainerConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.common !== undefined) {
      CommonContainerConfig.encode(message.common, writer.uint32(802).fork()).ldelim()
    }
    if (message.dagent !== undefined) {
      DagentContainerConfig.encode(message.dagent, writer.uint32(810).fork()).ldelim()
    }
    if (message.crane !== undefined) {
      CraneContainerConfig.encode(message.crane, writer.uint32(818).fork()).ldelim()
    }
    if (message.secrets !== undefined) {
      UniqueSecretKeyList.encode(message.secrets, writer.uint32(8002).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ImageContainerConfig {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseImageContainerConfig()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 100:
          message.common = CommonContainerConfig.decode(reader, reader.uint32())
          break
        case 101:
          message.dagent = DagentContainerConfig.decode(reader, reader.uint32())
          break
        case 102:
          message.crane = CraneContainerConfig.decode(reader, reader.uint32())
          break
        case 1000:
          message.secrets = UniqueSecretKeyList.decode(reader, reader.uint32())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): ImageContainerConfig {
    return {
      common: isSet(object.common) ? CommonContainerConfig.fromJSON(object.common) : undefined,
      dagent: isSet(object.dagent) ? DagentContainerConfig.fromJSON(object.dagent) : undefined,
      crane: isSet(object.crane) ? CraneContainerConfig.fromJSON(object.crane) : undefined,
      secrets: isSet(object.secrets) ? UniqueSecretKeyList.fromJSON(object.secrets) : undefined,
    }
  },

  toJSON(message: ImageContainerConfig): unknown {
    const obj: any = {}
    message.common !== undefined &&
      (obj.common = message.common ? CommonContainerConfig.toJSON(message.common) : undefined)
    message.dagent !== undefined &&
      (obj.dagent = message.dagent ? DagentContainerConfig.toJSON(message.dagent) : undefined)
    message.crane !== undefined && (obj.crane = message.crane ? CraneContainerConfig.toJSON(message.crane) : undefined)
    message.secrets !== undefined &&
      (obj.secrets = message.secrets ? UniqueSecretKeyList.toJSON(message.secrets) : undefined)
    return obj
  },

  create<I extends Exact<DeepPartial<ImageContainerConfig>, I>>(base?: I): ImageContainerConfig {
    return ImageContainerConfig.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<ImageContainerConfig>, I>>(object: I): ImageContainerConfig {
    const message = createBaseImageContainerConfig()
    message.common =
      object.common !== undefined && object.common !== null
        ? CommonContainerConfig.fromPartial(object.common)
        : undefined
    message.dagent =
      object.dagent !== undefined && object.dagent !== null
        ? DagentContainerConfig.fromPartial(object.dagent)
        : undefined
    message.crane =
      object.crane !== undefined && object.crane !== null ? CraneContainerConfig.fromPartial(object.crane) : undefined
    message.secrets =
      object.secrets !== undefined && object.secrets !== null
        ? UniqueSecretKeyList.fromPartial(object.secrets)
        : undefined
    return message
  },
}

function createBaseInstanceContainerConfig(): InstanceContainerConfig {
  return {}
}

export const InstanceContainerConfig = {
  encode(message: InstanceContainerConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.common !== undefined) {
      CommonContainerConfig.encode(message.common, writer.uint32(802).fork()).ldelim()
    }
    if (message.dagent !== undefined) {
      DagentContainerConfig.encode(message.dagent, writer.uint32(810).fork()).ldelim()
    }
    if (message.crane !== undefined) {
      CraneContainerConfig.encode(message.crane, writer.uint32(818).fork()).ldelim()
    }
    if (message.secrets !== undefined) {
      UniqueSecretKeyValueList.encode(message.secrets, writer.uint32(8002).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): InstanceContainerConfig {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseInstanceContainerConfig()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 100:
          message.common = CommonContainerConfig.decode(reader, reader.uint32())
          break
        case 101:
          message.dagent = DagentContainerConfig.decode(reader, reader.uint32())
          break
        case 102:
          message.crane = CraneContainerConfig.decode(reader, reader.uint32())
          break
        case 1000:
          message.secrets = UniqueSecretKeyValueList.decode(reader, reader.uint32())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): InstanceContainerConfig {
    return {
      common: isSet(object.common) ? CommonContainerConfig.fromJSON(object.common) : undefined,
      dagent: isSet(object.dagent) ? DagentContainerConfig.fromJSON(object.dagent) : undefined,
      crane: isSet(object.crane) ? CraneContainerConfig.fromJSON(object.crane) : undefined,
      secrets: isSet(object.secrets) ? UniqueSecretKeyValueList.fromJSON(object.secrets) : undefined,
    }
  },

  toJSON(message: InstanceContainerConfig): unknown {
    const obj: any = {}
    message.common !== undefined &&
      (obj.common = message.common ? CommonContainerConfig.toJSON(message.common) : undefined)
    message.dagent !== undefined &&
      (obj.dagent = message.dagent ? DagentContainerConfig.toJSON(message.dagent) : undefined)
    message.crane !== undefined && (obj.crane = message.crane ? CraneContainerConfig.toJSON(message.crane) : undefined)
    message.secrets !== undefined &&
      (obj.secrets = message.secrets ? UniqueSecretKeyValueList.toJSON(message.secrets) : undefined)
    return obj
  },

  create<I extends Exact<DeepPartial<InstanceContainerConfig>, I>>(base?: I): InstanceContainerConfig {
    return InstanceContainerConfig.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<InstanceContainerConfig>, I>>(object: I): InstanceContainerConfig {
    const message = createBaseInstanceContainerConfig()
    message.common =
      object.common !== undefined && object.common !== null
        ? CommonContainerConfig.fromPartial(object.common)
        : undefined
    message.dagent =
      object.dagent !== undefined && object.dagent !== null
        ? DagentContainerConfig.fromPartial(object.dagent)
        : undefined
    message.crane =
      object.crane !== undefined && object.crane !== null ? CraneContainerConfig.fromPartial(object.crane) : undefined
    message.secrets =
      object.secrets !== undefined && object.secrets !== null
        ? UniqueSecretKeyValueList.fromPartial(object.secrets)
        : undefined
    return message
  },
}

function createBaseImageResponse(): ImageResponse {
  return {
    id: '',
    name: '',
    tag: '',
    order: 0,
    registryId: '',
    config: undefined,
    createdAt: undefined,
    registryName: '',
    registryType: 0,
  }
}

export const ImageResponse = {
  encode(message: ImageResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id)
    }
    if (message.name !== '') {
      writer.uint32(802).string(message.name)
    }
    if (message.tag !== '') {
      writer.uint32(810).string(message.tag)
    }
    if (message.order !== 0) {
      writer.uint32(816).uint32(message.order)
    }
    if (message.registryId !== '') {
      writer.uint32(826).string(message.registryId)
    }
    if (message.config !== undefined) {
      ImageContainerConfig.encode(message.config, writer.uint32(834).fork()).ldelim()
    }
    if (message.createdAt !== undefined) {
      Timestamp.encode(message.createdAt, writer.uint32(842).fork()).ldelim()
    }
    if (message.registryName !== '') {
      writer.uint32(850).string(message.registryName)
    }
    if (message.registryType !== 0) {
      writer.uint32(856).int32(message.registryType)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ImageResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseImageResponse()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string()
          break
        case 100:
          message.name = reader.string()
          break
        case 101:
          message.tag = reader.string()
          break
        case 102:
          message.order = reader.uint32()
          break
        case 103:
          message.registryId = reader.string()
          break
        case 104:
          message.config = ImageContainerConfig.decode(reader, reader.uint32())
          break
        case 105:
          message.createdAt = Timestamp.decode(reader, reader.uint32())
          break
        case 106:
          message.registryName = reader.string()
          break
        case 107:
          message.registryType = reader.int32() as any
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): ImageResponse {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      name: isSet(object.name) ? String(object.name) : '',
      tag: isSet(object.tag) ? String(object.tag) : '',
      order: isSet(object.order) ? Number(object.order) : 0,
      registryId: isSet(object.registryId) ? String(object.registryId) : '',
      config: isSet(object.config) ? ImageContainerConfig.fromJSON(object.config) : undefined,
      createdAt: isSet(object.createdAt) ? fromJsonTimestamp(object.createdAt) : undefined,
      registryName: isSet(object.registryName) ? String(object.registryName) : '',
      registryType: isSet(object.registryType) ? registryTypeFromJSON(object.registryType) : 0,
    }
  },

  toJSON(message: ImageResponse): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.name !== undefined && (obj.name = message.name)
    message.tag !== undefined && (obj.tag = message.tag)
    message.order !== undefined && (obj.order = Math.round(message.order))
    message.registryId !== undefined && (obj.registryId = message.registryId)
    message.config !== undefined &&
      (obj.config = message.config ? ImageContainerConfig.toJSON(message.config) : undefined)
    message.createdAt !== undefined && (obj.createdAt = fromTimestamp(message.createdAt).toISOString())
    message.registryName !== undefined && (obj.registryName = message.registryName)
    message.registryType !== undefined && (obj.registryType = registryTypeToJSON(message.registryType))
    return obj
  },

  create<I extends Exact<DeepPartial<ImageResponse>, I>>(base?: I): ImageResponse {
    return ImageResponse.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<ImageResponse>, I>>(object: I): ImageResponse {
    const message = createBaseImageResponse()
    message.id = object.id ?? ''
    message.name = object.name ?? ''
    message.tag = object.tag ?? ''
    message.order = object.order ?? 0
    message.registryId = object.registryId ?? ''
    message.config =
      object.config !== undefined && object.config !== null
        ? ImageContainerConfig.fromPartial(object.config)
        : undefined
    message.createdAt =
      object.createdAt !== undefined && object.createdAt !== null ? Timestamp.fromPartial(object.createdAt) : undefined
    message.registryName = object.registryName ?? ''
    message.registryType = object.registryType ?? 0
    return message
  },
}

function createBaseNodeResponse(): NodeResponse {
  return { id: '', audit: undefined, name: '', status: 0, type: 0, updating: false }
}

export const NodeResponse = {
  encode(message: NodeResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id)
    }
    if (message.audit !== undefined) {
      AuditResponse.encode(message.audit, writer.uint32(18).fork()).ldelim()
    }
    if (message.name !== '') {
      writer.uint32(802).string(message.name)
    }
    if (message.description !== undefined) {
      writer.uint32(810).string(message.description)
    }
    if (message.icon !== undefined) {
      writer.uint32(818).string(message.icon)
    }
    if (message.address !== undefined) {
      writer.uint32(826).string(message.address)
    }
    if (message.status !== 0) {
      writer.uint32(832).int32(message.status)
    }
    if (message.connectedAt !== undefined) {
      Timestamp.encode(message.connectedAt, writer.uint32(842).fork()).ldelim()
    }
    if (message.version !== undefined) {
      writer.uint32(850).string(message.version)
    }
    if (message.type !== 0) {
      writer.uint32(856).int32(message.type)
    }
    if (message.updating === true) {
      writer.uint32(864).bool(message.updating)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): NodeResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseNodeResponse()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string()
          break
        case 2:
          message.audit = AuditResponse.decode(reader, reader.uint32())
          break
        case 100:
          message.name = reader.string()
          break
        case 101:
          message.description = reader.string()
          break
        case 102:
          message.icon = reader.string()
          break
        case 103:
          message.address = reader.string()
          break
        case 104:
          message.status = reader.int32() as any
          break
        case 105:
          message.connectedAt = Timestamp.decode(reader, reader.uint32())
          break
        case 106:
          message.version = reader.string()
          break
        case 107:
          message.type = reader.int32() as any
          break
        case 108:
          message.updating = reader.bool()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): NodeResponse {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      audit: isSet(object.audit) ? AuditResponse.fromJSON(object.audit) : undefined,
      name: isSet(object.name) ? String(object.name) : '',
      description: isSet(object.description) ? String(object.description) : undefined,
      icon: isSet(object.icon) ? String(object.icon) : undefined,
      address: isSet(object.address) ? String(object.address) : undefined,
      status: isSet(object.status) ? nodeConnectionStatusFromJSON(object.status) : 0,
      connectedAt: isSet(object.connectedAt) ? fromJsonTimestamp(object.connectedAt) : undefined,
      version: isSet(object.version) ? String(object.version) : undefined,
      type: isSet(object.type) ? nodeTypeFromJSON(object.type) : 0,
      updating: isSet(object.updating) ? Boolean(object.updating) : false,
    }
  },

  toJSON(message: NodeResponse): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.audit !== undefined && (obj.audit = message.audit ? AuditResponse.toJSON(message.audit) : undefined)
    message.name !== undefined && (obj.name = message.name)
    message.description !== undefined && (obj.description = message.description)
    message.icon !== undefined && (obj.icon = message.icon)
    message.address !== undefined && (obj.address = message.address)
    message.status !== undefined && (obj.status = nodeConnectionStatusToJSON(message.status))
    message.connectedAt !== undefined && (obj.connectedAt = fromTimestamp(message.connectedAt).toISOString())
    message.version !== undefined && (obj.version = message.version)
    message.type !== undefined && (obj.type = nodeTypeToJSON(message.type))
    message.updating !== undefined && (obj.updating = message.updating)
    return obj
  },

  create<I extends Exact<DeepPartial<NodeResponse>, I>>(base?: I): NodeResponse {
    return NodeResponse.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<NodeResponse>, I>>(object: I): NodeResponse {
    const message = createBaseNodeResponse()
    message.id = object.id ?? ''
    message.audit =
      object.audit !== undefined && object.audit !== null ? AuditResponse.fromPartial(object.audit) : undefined
    message.name = object.name ?? ''
    message.description = object.description ?? undefined
    message.icon = object.icon ?? undefined
    message.address = object.address ?? undefined
    message.status = object.status ?? 0
    message.connectedAt =
      object.connectedAt !== undefined && object.connectedAt !== null
        ? Timestamp.fromPartial(object.connectedAt)
        : undefined
    message.version = object.version ?? undefined
    message.type = object.type ?? 0
    message.updating = object.updating ?? false
    return message
  },
}

function createBaseNodeDetailsResponse(): NodeDetailsResponse {
  return { id: '', audit: undefined, name: '', status: 0, hasToken: false, type: 0, updating: false }
}

export const NodeDetailsResponse = {
  encode(message: NodeDetailsResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id)
    }
    if (message.audit !== undefined) {
      AuditResponse.encode(message.audit, writer.uint32(18).fork()).ldelim()
    }
    if (message.name !== '') {
      writer.uint32(802).string(message.name)
    }
    if (message.description !== undefined) {
      writer.uint32(810).string(message.description)
    }
    if (message.icon !== undefined) {
      writer.uint32(818).string(message.icon)
    }
    if (message.address !== undefined) {
      writer.uint32(826).string(message.address)
    }
    if (message.status !== 0) {
      writer.uint32(832).int32(message.status)
    }
    if (message.hasToken === true) {
      writer.uint32(840).bool(message.hasToken)
    }
    if (message.connectedAt !== undefined) {
      Timestamp.encode(message.connectedAt, writer.uint32(850).fork()).ldelim()
    }
    if (message.install !== undefined) {
      NodeInstallResponse.encode(message.install, writer.uint32(858).fork()).ldelim()
    }
    if (message.script !== undefined) {
      NodeScriptResponse.encode(message.script, writer.uint32(866).fork()).ldelim()
    }
    if (message.version !== undefined) {
      writer.uint32(874).string(message.version)
    }
    if (message.type !== 0) {
      writer.uint32(880).int32(message.type)
    }
    if (message.updating === true) {
      writer.uint32(888).bool(message.updating)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): NodeDetailsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseNodeDetailsResponse()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string()
          break
        case 2:
          message.audit = AuditResponse.decode(reader, reader.uint32())
          break
        case 100:
          message.name = reader.string()
          break
        case 101:
          message.description = reader.string()
          break
        case 102:
          message.icon = reader.string()
          break
        case 103:
          message.address = reader.string()
          break
        case 104:
          message.status = reader.int32() as any
          break
        case 105:
          message.hasToken = reader.bool()
          break
        case 106:
          message.connectedAt = Timestamp.decode(reader, reader.uint32())
          break
        case 107:
          message.install = NodeInstallResponse.decode(reader, reader.uint32())
          break
        case 108:
          message.script = NodeScriptResponse.decode(reader, reader.uint32())
          break
        case 109:
          message.version = reader.string()
          break
        case 110:
          message.type = reader.int32() as any
          break
        case 111:
          message.updating = reader.bool()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): NodeDetailsResponse {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      audit: isSet(object.audit) ? AuditResponse.fromJSON(object.audit) : undefined,
      name: isSet(object.name) ? String(object.name) : '',
      description: isSet(object.description) ? String(object.description) : undefined,
      icon: isSet(object.icon) ? String(object.icon) : undefined,
      address: isSet(object.address) ? String(object.address) : undefined,
      status: isSet(object.status) ? nodeConnectionStatusFromJSON(object.status) : 0,
      hasToken: isSet(object.hasToken) ? Boolean(object.hasToken) : false,
      connectedAt: isSet(object.connectedAt) ? fromJsonTimestamp(object.connectedAt) : undefined,
      install: isSet(object.install) ? NodeInstallResponse.fromJSON(object.install) : undefined,
      script: isSet(object.script) ? NodeScriptResponse.fromJSON(object.script) : undefined,
      version: isSet(object.version) ? String(object.version) : undefined,
      type: isSet(object.type) ? nodeTypeFromJSON(object.type) : 0,
      updating: isSet(object.updating) ? Boolean(object.updating) : false,
    }
  },

  toJSON(message: NodeDetailsResponse): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.audit !== undefined && (obj.audit = message.audit ? AuditResponse.toJSON(message.audit) : undefined)
    message.name !== undefined && (obj.name = message.name)
    message.description !== undefined && (obj.description = message.description)
    message.icon !== undefined && (obj.icon = message.icon)
    message.address !== undefined && (obj.address = message.address)
    message.status !== undefined && (obj.status = nodeConnectionStatusToJSON(message.status))
    message.hasToken !== undefined && (obj.hasToken = message.hasToken)
    message.connectedAt !== undefined && (obj.connectedAt = fromTimestamp(message.connectedAt).toISOString())
    message.install !== undefined &&
      (obj.install = message.install ? NodeInstallResponse.toJSON(message.install) : undefined)
    message.script !== undefined &&
      (obj.script = message.script ? NodeScriptResponse.toJSON(message.script) : undefined)
    message.version !== undefined && (obj.version = message.version)
    message.type !== undefined && (obj.type = nodeTypeToJSON(message.type))
    message.updating !== undefined && (obj.updating = message.updating)
    return obj
  },

  create<I extends Exact<DeepPartial<NodeDetailsResponse>, I>>(base?: I): NodeDetailsResponse {
    return NodeDetailsResponse.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<NodeDetailsResponse>, I>>(object: I): NodeDetailsResponse {
    const message = createBaseNodeDetailsResponse()
    message.id = object.id ?? ''
    message.audit =
      object.audit !== undefined && object.audit !== null ? AuditResponse.fromPartial(object.audit) : undefined
    message.name = object.name ?? ''
    message.description = object.description ?? undefined
    message.icon = object.icon ?? undefined
    message.address = object.address ?? undefined
    message.status = object.status ?? 0
    message.hasToken = object.hasToken ?? false
    message.connectedAt =
      object.connectedAt !== undefined && object.connectedAt !== null
        ? Timestamp.fromPartial(object.connectedAt)
        : undefined
    message.install =
      object.install !== undefined && object.install !== null
        ? NodeInstallResponse.fromPartial(object.install)
        : undefined
    message.script =
      object.script !== undefined && object.script !== null ? NodeScriptResponse.fromPartial(object.script) : undefined
    message.version = object.version ?? undefined
    message.type = object.type ?? 0
    message.updating = object.updating ?? false
    return message
  },
}

function createBaseNodeListResponse(): NodeListResponse {
  return { data: [] }
}

export const NodeListResponse = {
  encode(message: NodeListResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.data) {
      NodeResponse.encode(v!, writer.uint32(8002).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): NodeListResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseNodeListResponse()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1000:
          message.data.push(NodeResponse.decode(reader, reader.uint32()))
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): NodeListResponse {
    return { data: Array.isArray(object?.data) ? object.data.map((e: any) => NodeResponse.fromJSON(e)) : [] }
  },

  toJSON(message: NodeListResponse): unknown {
    const obj: any = {}
    if (message.data) {
      obj.data = message.data.map(e => (e ? NodeResponse.toJSON(e) : undefined))
    } else {
      obj.data = []
    }
    return obj
  },

  create<I extends Exact<DeepPartial<NodeListResponse>, I>>(base?: I): NodeListResponse {
    return NodeListResponse.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<NodeListResponse>, I>>(object: I): NodeListResponse {
    const message = createBaseNodeListResponse()
    message.data = object.data?.map(e => NodeResponse.fromPartial(e)) || []
    return message
  },
}

function createBaseCreateNodeRequest(): CreateNodeRequest {
  return { name: '' }
}

export const CreateNodeRequest = {
  encode(message: CreateNodeRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== '') {
      writer.uint32(802).string(message.name)
    }
    if (message.description !== undefined) {
      writer.uint32(810).string(message.description)
    }
    if (message.icon !== undefined) {
      writer.uint32(818).string(message.icon)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CreateNodeRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseCreateNodeRequest()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 100:
          message.name = reader.string()
          break
        case 101:
          message.description = reader.string()
          break
        case 102:
          message.icon = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): CreateNodeRequest {
    return {
      name: isSet(object.name) ? String(object.name) : '',
      description: isSet(object.description) ? String(object.description) : undefined,
      icon: isSet(object.icon) ? String(object.icon) : undefined,
    }
  },

  toJSON(message: CreateNodeRequest): unknown {
    const obj: any = {}
    message.name !== undefined && (obj.name = message.name)
    message.description !== undefined && (obj.description = message.description)
    message.icon !== undefined && (obj.icon = message.icon)
    return obj
  },

  create<I extends Exact<DeepPartial<CreateNodeRequest>, I>>(base?: I): CreateNodeRequest {
    return CreateNodeRequest.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<CreateNodeRequest>, I>>(object: I): CreateNodeRequest {
    const message = createBaseCreateNodeRequest()
    message.name = object.name ?? ''
    message.description = object.description ?? undefined
    message.icon = object.icon ?? undefined
    return message
  },
}

function createBaseUpdateNodeRequest(): UpdateNodeRequest {
  return { id: '', name: '' }
}

export const UpdateNodeRequest = {
  encode(message: UpdateNodeRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id)
    }
    if (message.name !== '') {
      writer.uint32(802).string(message.name)
    }
    if (message.description !== undefined) {
      writer.uint32(810).string(message.description)
    }
    if (message.icon !== undefined) {
      writer.uint32(818).string(message.icon)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UpdateNodeRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseUpdateNodeRequest()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string()
          break
        case 100:
          message.name = reader.string()
          break
        case 101:
          message.description = reader.string()
          break
        case 102:
          message.icon = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): UpdateNodeRequest {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      name: isSet(object.name) ? String(object.name) : '',
      description: isSet(object.description) ? String(object.description) : undefined,
      icon: isSet(object.icon) ? String(object.icon) : undefined,
    }
  },

  toJSON(message: UpdateNodeRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.name !== undefined && (obj.name = message.name)
    message.description !== undefined && (obj.description = message.description)
    message.icon !== undefined && (obj.icon = message.icon)
    return obj
  },

  create<I extends Exact<DeepPartial<UpdateNodeRequest>, I>>(base?: I): UpdateNodeRequest {
    return UpdateNodeRequest.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<UpdateNodeRequest>, I>>(object: I): UpdateNodeRequest {
    const message = createBaseUpdateNodeRequest()
    message.id = object.id ?? ''
    message.name = object.name ?? ''
    message.description = object.description ?? undefined
    message.icon = object.icon ?? undefined
    return message
  },
}

function createBaseDagentTraefikOptions(): DagentTraefikOptions {
  return { acmeEmail: '' }
}

export const DagentTraefikOptions = {
  encode(message: DagentTraefikOptions, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.acmeEmail !== '') {
      writer.uint32(802).string(message.acmeEmail)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DagentTraefikOptions {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseDagentTraefikOptions()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 100:
          message.acmeEmail = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): DagentTraefikOptions {
    return { acmeEmail: isSet(object.acmeEmail) ? String(object.acmeEmail) : '' }
  },

  toJSON(message: DagentTraefikOptions): unknown {
    const obj: any = {}
    message.acmeEmail !== undefined && (obj.acmeEmail = message.acmeEmail)
    return obj
  },

  create<I extends Exact<DeepPartial<DagentTraefikOptions>, I>>(base?: I): DagentTraefikOptions {
    return DagentTraefikOptions.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<DagentTraefikOptions>, I>>(object: I): DagentTraefikOptions {
    const message = createBaseDagentTraefikOptions()
    message.acmeEmail = object.acmeEmail ?? ''
    return message
  },
}

function createBaseGenerateScriptRequest(): GenerateScriptRequest {
  return { id: '', type: 0, scriptType: 0 }
}

export const GenerateScriptRequest = {
  encode(message: GenerateScriptRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id)
    }
    if (message.type !== 0) {
      writer.uint32(800).int32(message.type)
    }
    if (message.rootPath !== undefined) {
      writer.uint32(810).string(message.rootPath)
    }
    if (message.scriptType !== 0) {
      writer.uint32(816).int32(message.scriptType)
    }
    if (message.dagentTraefik !== undefined) {
      DagentTraefikOptions.encode(message.dagentTraefik, writer.uint32(826).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GenerateScriptRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseGenerateScriptRequest()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string()
          break
        case 100:
          message.type = reader.int32() as any
          break
        case 101:
          message.rootPath = reader.string()
          break
        case 102:
          message.scriptType = reader.int32() as any
          break
        case 103:
          message.dagentTraefik = DagentTraefikOptions.decode(reader, reader.uint32())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): GenerateScriptRequest {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      type: isSet(object.type) ? nodeTypeFromJSON(object.type) : 0,
      rootPath: isSet(object.rootPath) ? String(object.rootPath) : undefined,
      scriptType: isSet(object.scriptType) ? nodeScriptTypeFromJSON(object.scriptType) : 0,
      dagentTraefik: isSet(object.dagentTraefik) ? DagentTraefikOptions.fromJSON(object.dagentTraefik) : undefined,
    }
  },

  toJSON(message: GenerateScriptRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.type !== undefined && (obj.type = nodeTypeToJSON(message.type))
    message.rootPath !== undefined && (obj.rootPath = message.rootPath)
    message.scriptType !== undefined && (obj.scriptType = nodeScriptTypeToJSON(message.scriptType))
    message.dagentTraefik !== undefined &&
      (obj.dagentTraefik = message.dagentTraefik ? DagentTraefikOptions.toJSON(message.dagentTraefik) : undefined)
    return obj
  },

  create<I extends Exact<DeepPartial<GenerateScriptRequest>, I>>(base?: I): GenerateScriptRequest {
    return GenerateScriptRequest.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<GenerateScriptRequest>, I>>(object: I): GenerateScriptRequest {
    const message = createBaseGenerateScriptRequest()
    message.id = object.id ?? ''
    message.type = object.type ?? 0
    message.rootPath = object.rootPath ?? undefined
    message.scriptType = object.scriptType ?? 0
    message.dagentTraefik =
      object.dagentTraefik !== undefined && object.dagentTraefik !== null
        ? DagentTraefikOptions.fromPartial(object.dagentTraefik)
        : undefined
    return message
  },
}

function createBaseNodeInstallResponse(): NodeInstallResponse {
  return { command: '', expireAt: undefined }
}

export const NodeInstallResponse = {
  encode(message: NodeInstallResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.command !== '') {
      writer.uint32(802).string(message.command)
    }
    if (message.expireAt !== undefined) {
      Timestamp.encode(message.expireAt, writer.uint32(810).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): NodeInstallResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseNodeInstallResponse()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 100:
          message.command = reader.string()
          break
        case 101:
          message.expireAt = Timestamp.decode(reader, reader.uint32())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): NodeInstallResponse {
    return {
      command: isSet(object.command) ? String(object.command) : '',
      expireAt: isSet(object.expireAt) ? fromJsonTimestamp(object.expireAt) : undefined,
    }
  },

  toJSON(message: NodeInstallResponse): unknown {
    const obj: any = {}
    message.command !== undefined && (obj.command = message.command)
    message.expireAt !== undefined && (obj.expireAt = fromTimestamp(message.expireAt).toISOString())
    return obj
  },

  create<I extends Exact<DeepPartial<NodeInstallResponse>, I>>(base?: I): NodeInstallResponse {
    return NodeInstallResponse.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<NodeInstallResponse>, I>>(object: I): NodeInstallResponse {
    const message = createBaseNodeInstallResponse()
    message.command = object.command ?? ''
    message.expireAt =
      object.expireAt !== undefined && object.expireAt !== null ? Timestamp.fromPartial(object.expireAt) : undefined
    return message
  },
}

function createBaseNodeScriptResponse(): NodeScriptResponse {
  return { content: '' }
}

export const NodeScriptResponse = {
  encode(message: NodeScriptResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.content !== '') {
      writer.uint32(802).string(message.content)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): NodeScriptResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseNodeScriptResponse()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 100:
          message.content = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): NodeScriptResponse {
    return { content: isSet(object.content) ? String(object.content) : '' }
  },

  toJSON(message: NodeScriptResponse): unknown {
    const obj: any = {}
    message.content !== undefined && (obj.content = message.content)
    return obj
  },

  create<I extends Exact<DeepPartial<NodeScriptResponse>, I>>(base?: I): NodeScriptResponse {
    return NodeScriptResponse.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<NodeScriptResponse>, I>>(object: I): NodeScriptResponse {
    const message = createBaseNodeScriptResponse()
    message.content = object.content ?? ''
    return message
  },
}

function createBaseNodeContainerCommandRequest(): NodeContainerCommandRequest {
  return { id: '', command: undefined }
}

export const NodeContainerCommandRequest = {
  encode(message: NodeContainerCommandRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id)
    }
    if (message.command !== undefined) {
      ContainerCommandRequest.encode(message.command, writer.uint32(802).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): NodeContainerCommandRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseNodeContainerCommandRequest()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string()
          break
        case 100:
          message.command = ContainerCommandRequest.decode(reader, reader.uint32())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): NodeContainerCommandRequest {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      command: isSet(object.command) ? ContainerCommandRequest.fromJSON(object.command) : undefined,
    }
  },

  toJSON(message: NodeContainerCommandRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.command !== undefined &&
      (obj.command = message.command ? ContainerCommandRequest.toJSON(message.command) : undefined)
    return obj
  },

  create<I extends Exact<DeepPartial<NodeContainerCommandRequest>, I>>(base?: I): NodeContainerCommandRequest {
    return NodeContainerCommandRequest.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<NodeContainerCommandRequest>, I>>(object: I): NodeContainerCommandRequest {
    const message = createBaseNodeContainerCommandRequest()
    message.id = object.id ?? ''
    message.command =
      object.command !== undefined && object.command !== null
        ? ContainerCommandRequest.fromPartial(object.command)
        : undefined
    return message
  },
}

function createBaseNodeDeleteContainersRequest(): NodeDeleteContainersRequest {
  return { id: '', containers: undefined }
}

export const NodeDeleteContainersRequest = {
  encode(message: NodeDeleteContainersRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id)
    }
    if (message.containers !== undefined) {
      DeleteContainersRequest.encode(message.containers, writer.uint32(802).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): NodeDeleteContainersRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseNodeDeleteContainersRequest()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string()
          break
        case 100:
          message.containers = DeleteContainersRequest.decode(reader, reader.uint32())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): NodeDeleteContainersRequest {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      containers: isSet(object.containers) ? DeleteContainersRequest.fromJSON(object.containers) : undefined,
    }
  },

  toJSON(message: NodeDeleteContainersRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.containers !== undefined &&
      (obj.containers = message.containers ? DeleteContainersRequest.toJSON(message.containers) : undefined)
    return obj
  },

  create<I extends Exact<DeepPartial<NodeDeleteContainersRequest>, I>>(base?: I): NodeDeleteContainersRequest {
    return NodeDeleteContainersRequest.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<NodeDeleteContainersRequest>, I>>(object: I): NodeDeleteContainersRequest {
    const message = createBaseNodeDeleteContainersRequest()
    message.id = object.id ?? ''
    message.containers =
      object.containers !== undefined && object.containers !== null
        ? DeleteContainersRequest.fromPartial(object.containers)
        : undefined
    return message
  },
}

function createBaseNodeEventMessage(): NodeEventMessage {
  return { id: '', status: 0 }
}

export const NodeEventMessage = {
  encode(message: NodeEventMessage, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id)
    }
    if (message.status !== 0) {
      writer.uint32(800).int32(message.status)
    }
    if (message.address !== undefined) {
      writer.uint32(810).string(message.address)
    }
    if (message.version !== undefined) {
      writer.uint32(818).string(message.version)
    }
    if (message.connectedAt !== undefined) {
      Timestamp.encode(message.connectedAt, writer.uint32(826).fork()).ldelim()
    }
    if (message.error !== undefined) {
      writer.uint32(834).string(message.error)
    }
    if (message.updating !== undefined) {
      writer.uint32(840).bool(message.updating)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): NodeEventMessage {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseNodeEventMessage()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string()
          break
        case 100:
          message.status = reader.int32() as any
          break
        case 101:
          message.address = reader.string()
          break
        case 102:
          message.version = reader.string()
          break
        case 103:
          message.connectedAt = Timestamp.decode(reader, reader.uint32())
          break
        case 104:
          message.error = reader.string()
          break
        case 105:
          message.updating = reader.bool()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): NodeEventMessage {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      status: isSet(object.status) ? nodeConnectionStatusFromJSON(object.status) : 0,
      address: isSet(object.address) ? String(object.address) : undefined,
      version: isSet(object.version) ? String(object.version) : undefined,
      connectedAt: isSet(object.connectedAt) ? fromJsonTimestamp(object.connectedAt) : undefined,
      error: isSet(object.error) ? String(object.error) : undefined,
      updating: isSet(object.updating) ? Boolean(object.updating) : undefined,
    }
  },

  toJSON(message: NodeEventMessage): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.status !== undefined && (obj.status = nodeConnectionStatusToJSON(message.status))
    message.address !== undefined && (obj.address = message.address)
    message.version !== undefined && (obj.version = message.version)
    message.connectedAt !== undefined && (obj.connectedAt = fromTimestamp(message.connectedAt).toISOString())
    message.error !== undefined && (obj.error = message.error)
    message.updating !== undefined && (obj.updating = message.updating)
    return obj
  },

  create<I extends Exact<DeepPartial<NodeEventMessage>, I>>(base?: I): NodeEventMessage {
    return NodeEventMessage.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<NodeEventMessage>, I>>(object: I): NodeEventMessage {
    const message = createBaseNodeEventMessage()
    message.id = object.id ?? ''
    message.status = object.status ?? 0
    message.address = object.address ?? undefined
    message.version = object.version ?? undefined
    message.connectedAt =
      object.connectedAt !== undefined && object.connectedAt !== null
        ? Timestamp.fromPartial(object.connectedAt)
        : undefined
    message.error = object.error ?? undefined
    message.updating = object.updating ?? undefined
    return message
  },
}

function createBaseWatchContainerStateRequest(): WatchContainerStateRequest {
  return { nodeId: '' }
}

export const WatchContainerStateRequest = {
  encode(message: WatchContainerStateRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.nodeId !== '') {
      writer.uint32(802).string(message.nodeId)
    }
    if (message.prefix !== undefined) {
      writer.uint32(810).string(message.prefix)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): WatchContainerStateRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseWatchContainerStateRequest()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 100:
          message.nodeId = reader.string()
          break
        case 101:
          message.prefix = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): WatchContainerStateRequest {
    return {
      nodeId: isSet(object.nodeId) ? String(object.nodeId) : '',
      prefix: isSet(object.prefix) ? String(object.prefix) : undefined,
    }
  },

  toJSON(message: WatchContainerStateRequest): unknown {
    const obj: any = {}
    message.nodeId !== undefined && (obj.nodeId = message.nodeId)
    message.prefix !== undefined && (obj.prefix = message.prefix)
    return obj
  },

  create<I extends Exact<DeepPartial<WatchContainerStateRequest>, I>>(base?: I): WatchContainerStateRequest {
    return WatchContainerStateRequest.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<WatchContainerStateRequest>, I>>(object: I): WatchContainerStateRequest {
    const message = createBaseWatchContainerStateRequest()
    message.nodeId = object.nodeId ?? ''
    message.prefix = object.prefix ?? undefined
    return message
  },
}

function createBaseWatchContainerLogRequest(): WatchContainerLogRequest {
  return { nodeId: '', container: undefined }
}

export const WatchContainerLogRequest = {
  encode(message: WatchContainerLogRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.nodeId !== '') {
      writer.uint32(802).string(message.nodeId)
    }
    if (message.container !== undefined) {
      ContainerIdentifier.encode(message.container, writer.uint32(810).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): WatchContainerLogRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseWatchContainerLogRequest()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 100:
          message.nodeId = reader.string()
          break
        case 101:
          message.container = ContainerIdentifier.decode(reader, reader.uint32())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): WatchContainerLogRequest {
    return {
      nodeId: isSet(object.nodeId) ? String(object.nodeId) : '',
      container: isSet(object.container) ? ContainerIdentifier.fromJSON(object.container) : undefined,
    }
  },

  toJSON(message: WatchContainerLogRequest): unknown {
    const obj: any = {}
    message.nodeId !== undefined && (obj.nodeId = message.nodeId)
    message.container !== undefined &&
      (obj.container = message.container ? ContainerIdentifier.toJSON(message.container) : undefined)
    return obj
  },

  create<I extends Exact<DeepPartial<WatchContainerLogRequest>, I>>(base?: I): WatchContainerLogRequest {
    return WatchContainerLogRequest.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<WatchContainerLogRequest>, I>>(object: I): WatchContainerLogRequest {
    const message = createBaseWatchContainerLogRequest()
    message.nodeId = object.nodeId ?? ''
    message.container =
      object.container !== undefined && object.container !== null
        ? ContainerIdentifier.fromPartial(object.container)
        : undefined
    return message
  },
}

function createBaseDeploymentProgressMessage(): DeploymentProgressMessage {
  return { id: '', log: [] }
}

export const DeploymentProgressMessage = {
  encode(message: DeploymentProgressMessage, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id)
    }
    if (message.status !== undefined) {
      writer.uint32(800).int32(message.status)
    }
    if (message.instance !== undefined) {
      InstanceDeploymentItem.encode(message.instance, writer.uint32(810).fork()).ldelim()
    }
    for (const v of message.log) {
      writer.uint32(8002).string(v!)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DeploymentProgressMessage {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseDeploymentProgressMessage()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string()
          break
        case 100:
          message.status = reader.int32() as any
          break
        case 101:
          message.instance = InstanceDeploymentItem.decode(reader, reader.uint32())
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

  fromJSON(object: any): DeploymentProgressMessage {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      status: isSet(object.status) ? deploymentStatusFromJSON(object.status) : undefined,
      instance: isSet(object.instance) ? InstanceDeploymentItem.fromJSON(object.instance) : undefined,
      log: Array.isArray(object?.log) ? object.log.map((e: any) => String(e)) : [],
    }
  },

  toJSON(message: DeploymentProgressMessage): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.status !== undefined &&
      (obj.status = message.status !== undefined ? deploymentStatusToJSON(message.status) : undefined)
    message.instance !== undefined &&
      (obj.instance = message.instance ? InstanceDeploymentItem.toJSON(message.instance) : undefined)
    if (message.log) {
      obj.log = message.log.map(e => e)
    } else {
      obj.log = []
    }
    return obj
  },

  create<I extends Exact<DeepPartial<DeploymentProgressMessage>, I>>(base?: I): DeploymentProgressMessage {
    return DeploymentProgressMessage.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<DeploymentProgressMessage>, I>>(object: I): DeploymentProgressMessage {
    const message = createBaseDeploymentProgressMessage()
    message.id = object.id ?? ''
    message.status = object.status ?? undefined
    message.instance =
      object.instance !== undefined && object.instance !== null
        ? InstanceDeploymentItem.fromPartial(object.instance)
        : undefined
    message.log = object.log?.map(e => e) || []
    return message
  },
}

function createBaseInstancesCreatedEventList(): InstancesCreatedEventList {
  return { data: [] }
}

export const InstancesCreatedEventList = {
  encode(message: InstancesCreatedEventList, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.data) {
      InstanceResponse.encode(v!, writer.uint32(8002).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): InstancesCreatedEventList {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseInstancesCreatedEventList()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1000:
          message.data.push(InstanceResponse.decode(reader, reader.uint32()))
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): InstancesCreatedEventList {
    return { data: Array.isArray(object?.data) ? object.data.map((e: any) => InstanceResponse.fromJSON(e)) : [] }
  },

  toJSON(message: InstancesCreatedEventList): unknown {
    const obj: any = {}
    if (message.data) {
      obj.data = message.data.map(e => (e ? InstanceResponse.toJSON(e) : undefined))
    } else {
      obj.data = []
    }
    return obj
  },

  create<I extends Exact<DeepPartial<InstancesCreatedEventList>, I>>(base?: I): InstancesCreatedEventList {
    return InstancesCreatedEventList.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<InstancesCreatedEventList>, I>>(object: I): InstancesCreatedEventList {
    const message = createBaseInstancesCreatedEventList()
    message.data = object.data?.map(e => InstanceResponse.fromPartial(e)) || []
    return message
  },
}

function createBaseDeploymentEditEventMessage(): DeploymentEditEventMessage {
  return {}
}

export const DeploymentEditEventMessage = {
  encode(message: DeploymentEditEventMessage, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.instancesCreated !== undefined) {
      InstancesCreatedEventList.encode(message.instancesCreated, writer.uint32(1602).fork()).ldelim()
    }
    if (message.imageIdDeleted !== undefined) {
      writer.uint32(1610).string(message.imageIdDeleted)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DeploymentEditEventMessage {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseDeploymentEditEventMessage()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 200:
          message.instancesCreated = InstancesCreatedEventList.decode(reader, reader.uint32())
          break
        case 201:
          message.imageIdDeleted = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): DeploymentEditEventMessage {
    return {
      instancesCreated: isSet(object.instancesCreated)
        ? InstancesCreatedEventList.fromJSON(object.instancesCreated)
        : undefined,
      imageIdDeleted: isSet(object.imageIdDeleted) ? String(object.imageIdDeleted) : undefined,
    }
  },

  toJSON(message: DeploymentEditEventMessage): unknown {
    const obj: any = {}
    message.instancesCreated !== undefined &&
      (obj.instancesCreated = message.instancesCreated
        ? InstancesCreatedEventList.toJSON(message.instancesCreated)
        : undefined)
    message.imageIdDeleted !== undefined && (obj.imageIdDeleted = message.imageIdDeleted)
    return obj
  },

  create<I extends Exact<DeepPartial<DeploymentEditEventMessage>, I>>(base?: I): DeploymentEditEventMessage {
    return DeploymentEditEventMessage.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<DeploymentEditEventMessage>, I>>(object: I): DeploymentEditEventMessage {
    const message = createBaseDeploymentEditEventMessage()
    message.instancesCreated =
      object.instancesCreated !== undefined && object.instancesCreated !== null
        ? InstancesCreatedEventList.fromPartial(object.instancesCreated)
        : undefined
    message.imageIdDeleted = object.imageIdDeleted ?? undefined
    return message
  },
}

function createBaseInstanceResponse(): InstanceResponse {
  return { id: '', audit: undefined, image: undefined }
}

export const InstanceResponse = {
  encode(message: InstanceResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id)
    }
    if (message.audit !== undefined) {
      AuditResponse.encode(message.audit, writer.uint32(18).fork()).ldelim()
    }
    if (message.image !== undefined) {
      ImageResponse.encode(message.image, writer.uint32(802).fork()).ldelim()
    }
    if (message.state !== undefined) {
      writer.uint32(808).int32(message.state)
    }
    if (message.config !== undefined) {
      InstanceContainerConfig.encode(message.config, writer.uint32(818).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): InstanceResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseInstanceResponse()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string()
          break
        case 2:
          message.audit = AuditResponse.decode(reader, reader.uint32())
          break
        case 100:
          message.image = ImageResponse.decode(reader, reader.uint32())
          break
        case 101:
          message.state = reader.int32() as any
          break
        case 102:
          message.config = InstanceContainerConfig.decode(reader, reader.uint32())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): InstanceResponse {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      audit: isSet(object.audit) ? AuditResponse.fromJSON(object.audit) : undefined,
      image: isSet(object.image) ? ImageResponse.fromJSON(object.image) : undefined,
      state: isSet(object.state) ? containerStateFromJSON(object.state) : undefined,
      config: isSet(object.config) ? InstanceContainerConfig.fromJSON(object.config) : undefined,
    }
  },

  toJSON(message: InstanceResponse): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.audit !== undefined && (obj.audit = message.audit ? AuditResponse.toJSON(message.audit) : undefined)
    message.image !== undefined && (obj.image = message.image ? ImageResponse.toJSON(message.image) : undefined)
    message.state !== undefined &&
      (obj.state = message.state !== undefined ? containerStateToJSON(message.state) : undefined)
    message.config !== undefined &&
      (obj.config = message.config ? InstanceContainerConfig.toJSON(message.config) : undefined)
    return obj
  },

  create<I extends Exact<DeepPartial<InstanceResponse>, I>>(base?: I): InstanceResponse {
    return InstanceResponse.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<InstanceResponse>, I>>(object: I): InstanceResponse {
    const message = createBaseInstanceResponse()
    message.id = object.id ?? ''
    message.audit =
      object.audit !== undefined && object.audit !== null ? AuditResponse.fromPartial(object.audit) : undefined
    message.image =
      object.image !== undefined && object.image !== null ? ImageResponse.fromPartial(object.image) : undefined
    message.state = object.state ?? undefined
    message.config =
      object.config !== undefined && object.config !== null
        ? InstanceContainerConfig.fromPartial(object.config)
        : undefined
    return message
  },
}

function createBasePatchInstanceRequest(): PatchInstanceRequest {
  return { id: '' }
}

export const PatchInstanceRequest = {
  encode(message: PatchInstanceRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id)
    }
    if (message.config !== undefined) {
      InstanceContainerConfig.encode(message.config, writer.uint32(802).fork()).ldelim()
    }
    if (message.resetSection !== undefined) {
      writer.uint32(810).string(message.resetSection)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PatchInstanceRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBasePatchInstanceRequest()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string()
          break
        case 100:
          message.config = InstanceContainerConfig.decode(reader, reader.uint32())
          break
        case 101:
          message.resetSection = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): PatchInstanceRequest {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      config: isSet(object.config) ? InstanceContainerConfig.fromJSON(object.config) : undefined,
      resetSection: isSet(object.resetSection) ? String(object.resetSection) : undefined,
    }
  },

  toJSON(message: PatchInstanceRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.config !== undefined &&
      (obj.config = message.config ? InstanceContainerConfig.toJSON(message.config) : undefined)
    message.resetSection !== undefined && (obj.resetSection = message.resetSection)
    return obj
  },

  create<I extends Exact<DeepPartial<PatchInstanceRequest>, I>>(base?: I): PatchInstanceRequest {
    return PatchInstanceRequest.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<PatchInstanceRequest>, I>>(object: I): PatchInstanceRequest {
    const message = createBasePatchInstanceRequest()
    message.id = object.id ?? ''
    message.config =
      object.config !== undefined && object.config !== null
        ? InstanceContainerConfig.fromPartial(object.config)
        : undefined
    message.resetSection = object.resetSection ?? undefined
    return message
  },
}

function createBaseDeploymentEventContainerState(): DeploymentEventContainerState {
  return { instanceId: '', state: 0 }
}

export const DeploymentEventContainerState = {
  encode(message: DeploymentEventContainerState, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.instanceId !== '') {
      writer.uint32(10).string(message.instanceId)
    }
    if (message.state !== 0) {
      writer.uint32(16).int32(message.state)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DeploymentEventContainerState {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseDeploymentEventContainerState()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.instanceId = reader.string()
          break
        case 2:
          message.state = reader.int32() as any
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): DeploymentEventContainerState {
    return {
      instanceId: isSet(object.instanceId) ? String(object.instanceId) : '',
      state: isSet(object.state) ? containerStateFromJSON(object.state) : 0,
    }
  },

  toJSON(message: DeploymentEventContainerState): unknown {
    const obj: any = {}
    message.instanceId !== undefined && (obj.instanceId = message.instanceId)
    message.state !== undefined && (obj.state = containerStateToJSON(message.state))
    return obj
  },

  create<I extends Exact<DeepPartial<DeploymentEventContainerState>, I>>(base?: I): DeploymentEventContainerState {
    return DeploymentEventContainerState.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<DeploymentEventContainerState>, I>>(
    object: I,
  ): DeploymentEventContainerState {
    const message = createBaseDeploymentEventContainerState()
    message.instanceId = object.instanceId ?? ''
    message.state = object.state ?? 0
    return message
  },
}

function createBaseDeploymentEventLog(): DeploymentEventLog {
  return { log: [] }
}

export const DeploymentEventLog = {
  encode(message: DeploymentEventLog, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.log) {
      writer.uint32(8002).string(v!)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DeploymentEventLog {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseDeploymentEventLog()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
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

  fromJSON(object: any): DeploymentEventLog {
    return { log: Array.isArray(object?.log) ? object.log.map((e: any) => String(e)) : [] }
  },

  toJSON(message: DeploymentEventLog): unknown {
    const obj: any = {}
    if (message.log) {
      obj.log = message.log.map(e => e)
    } else {
      obj.log = []
    }
    return obj
  },

  create<I extends Exact<DeepPartial<DeploymentEventLog>, I>>(base?: I): DeploymentEventLog {
    return DeploymentEventLog.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<DeploymentEventLog>, I>>(object: I): DeploymentEventLog {
    const message = createBaseDeploymentEventLog()
    message.log = object.log?.map(e => e) || []
    return message
  },
}

function createBaseHealthResponse(): HealthResponse {
  return { status: 0, cruxVersion: '' }
}

export const HealthResponse = {
  encode(message: HealthResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.status !== 0) {
      writer.uint32(800).int32(message.status)
    }
    if (message.cruxVersion !== '') {
      writer.uint32(810).string(message.cruxVersion)
    }
    if (message.lastMigration !== undefined) {
      writer.uint32(818).string(message.lastMigration)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): HealthResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseHealthResponse()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 100:
          message.status = reader.int32() as any
          break
        case 101:
          message.cruxVersion = reader.string()
          break
        case 102:
          message.lastMigration = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): HealthResponse {
    return {
      status: isSet(object.status) ? serviceStatusFromJSON(object.status) : 0,
      cruxVersion: isSet(object.cruxVersion) ? String(object.cruxVersion) : '',
      lastMigration: isSet(object.lastMigration) ? String(object.lastMigration) : undefined,
    }
  },

  toJSON(message: HealthResponse): unknown {
    const obj: any = {}
    message.status !== undefined && (obj.status = serviceStatusToJSON(message.status))
    message.cruxVersion !== undefined && (obj.cruxVersion = message.cruxVersion)
    message.lastMigration !== undefined && (obj.lastMigration = message.lastMigration)
    return obj
  },

  create<I extends Exact<DeepPartial<HealthResponse>, I>>(base?: I): HealthResponse {
    return HealthResponse.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<HealthResponse>, I>>(object: I): HealthResponse {
    const message = createBaseHealthResponse()
    message.status = object.status ?? 0
    message.cruxVersion = object.cruxVersion ?? ''
    message.lastMigration = object.lastMigration ?? undefined
    return message
  },
}

/** Services */
export type CruxNodeService = typeof CruxNodeService
export const CruxNodeService = {
  /** CRUD */
  getNodes: {
    path: '/crux.CruxNode/GetNodes',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: Empty) => Buffer.from(Empty.encode(value).finish()),
    requestDeserialize: (value: Buffer) => Empty.decode(value),
    responseSerialize: (value: NodeListResponse) => Buffer.from(NodeListResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => NodeListResponse.decode(value),
  },
  createNode: {
    path: '/crux.CruxNode/CreateNode',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: CreateNodeRequest) => Buffer.from(CreateNodeRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => CreateNodeRequest.decode(value),
    responseSerialize: (value: CreateEntityResponse) => Buffer.from(CreateEntityResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => CreateEntityResponse.decode(value),
  },
  updateNode: {
    path: '/crux.CruxNode/UpdateNode',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: UpdateNodeRequest) => Buffer.from(UpdateNodeRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => UpdateNodeRequest.decode(value),
    responseSerialize: (value: Empty) => Buffer.from(Empty.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Empty.decode(value),
  },
  deleteNode: {
    path: '/crux.CruxNode/DeleteNode',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: IdRequest) => Buffer.from(IdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => IdRequest.decode(value),
    responseSerialize: (value: Empty) => Buffer.from(Empty.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Empty.decode(value),
  },
  getNodeDetails: {
    path: '/crux.CruxNode/GetNodeDetails',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: IdRequest) => Buffer.from(IdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => IdRequest.decode(value),
    responseSerialize: (value: NodeDetailsResponse) => Buffer.from(NodeDetailsResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => NodeDetailsResponse.decode(value),
  },
  generateScript: {
    path: '/crux.CruxNode/GenerateScript',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: GenerateScriptRequest) => Buffer.from(GenerateScriptRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => GenerateScriptRequest.decode(value),
    responseSerialize: (value: NodeInstallResponse) => Buffer.from(NodeInstallResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => NodeInstallResponse.decode(value),
  },
  getScript: {
    path: '/crux.CruxNode/GetScript',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: ServiceIdRequest) => Buffer.from(ServiceIdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => ServiceIdRequest.decode(value),
    responseSerialize: (value: NodeScriptResponse) => Buffer.from(NodeScriptResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => NodeScriptResponse.decode(value),
  },
  discardScript: {
    path: '/crux.CruxNode/DiscardScript',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: IdRequest) => Buffer.from(IdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => IdRequest.decode(value),
    responseSerialize: (value: Empty) => Buffer.from(Empty.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Empty.decode(value),
  },
  revokeToken: {
    path: '/crux.CruxNode/RevokeToken',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: IdRequest) => Buffer.from(IdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => IdRequest.decode(value),
    responseSerialize: (value: Empty) => Buffer.from(Empty.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Empty.decode(value),
  },
  updateNodeAgent: {
    path: '/crux.CruxNode/UpdateNodeAgent',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: IdRequest) => Buffer.from(IdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => IdRequest.decode(value),
    responseSerialize: (value: Empty) => Buffer.from(Empty.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Empty.decode(value),
  },
  sendContainerCommand: {
    path: '/crux.CruxNode/SendContainerCommand',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: NodeContainerCommandRequest) =>
      Buffer.from(NodeContainerCommandRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => NodeContainerCommandRequest.decode(value),
    responseSerialize: (value: Empty) => Buffer.from(Empty.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Empty.decode(value),
  },
  deleteContainers: {
    path: '/crux.CruxNode/DeleteContainers',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: NodeDeleteContainersRequest) =>
      Buffer.from(NodeDeleteContainersRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => NodeDeleteContainersRequest.decode(value),
    responseSerialize: (value: Empty) => Buffer.from(Empty.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Empty.decode(value),
  },
  subscribeNodeEventChannel: {
    path: '/crux.CruxNode/SubscribeNodeEventChannel',
    requestStream: false,
    responseStream: true,
    requestSerialize: (value: ServiceIdRequest) => Buffer.from(ServiceIdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => ServiceIdRequest.decode(value),
    responseSerialize: (value: NodeEventMessage) => Buffer.from(NodeEventMessage.encode(value).finish()),
    responseDeserialize: (value: Buffer) => NodeEventMessage.decode(value),
  },
  watchContainerState: {
    path: '/crux.CruxNode/WatchContainerState',
    requestStream: false,
    responseStream: true,
    requestSerialize: (value: WatchContainerStateRequest) =>
      Buffer.from(WatchContainerStateRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => WatchContainerStateRequest.decode(value),
    responseSerialize: (value: ContainerStateListMessage) =>
      Buffer.from(ContainerStateListMessage.encode(value).finish()),
    responseDeserialize: (value: Buffer) => ContainerStateListMessage.decode(value),
  },
  subscribeContainerLogChannel: {
    path: '/crux.CruxNode/SubscribeContainerLogChannel',
    requestStream: false,
    responseStream: true,
    requestSerialize: (value: WatchContainerLogRequest) => Buffer.from(WatchContainerLogRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => WatchContainerLogRequest.decode(value),
    responseSerialize: (value: ContainerLogMessage) => Buffer.from(ContainerLogMessage.encode(value).finish()),
    responseDeserialize: (value: Buffer) => ContainerLogMessage.decode(value),
  },
} as const

export interface CruxNodeServer extends UntypedServiceImplementation {
  /** CRUD */
  getNodes: handleUnaryCall<Empty, NodeListResponse>
  createNode: handleUnaryCall<CreateNodeRequest, CreateEntityResponse>
  updateNode: handleUnaryCall<UpdateNodeRequest, Empty>
  deleteNode: handleUnaryCall<IdRequest, Empty>
  getNodeDetails: handleUnaryCall<IdRequest, NodeDetailsResponse>
  generateScript: handleUnaryCall<GenerateScriptRequest, NodeInstallResponse>
  getScript: handleUnaryCall<ServiceIdRequest, NodeScriptResponse>
  discardScript: handleUnaryCall<IdRequest, Empty>
  revokeToken: handleUnaryCall<IdRequest, Empty>
  updateNodeAgent: handleUnaryCall<IdRequest, Empty>
  sendContainerCommand: handleUnaryCall<NodeContainerCommandRequest, Empty>
  deleteContainers: handleUnaryCall<NodeDeleteContainersRequest, Empty>
  subscribeNodeEventChannel: handleServerStreamingCall<ServiceIdRequest, NodeEventMessage>
  watchContainerState: handleServerStreamingCall<WatchContainerStateRequest, ContainerStateListMessage>
  subscribeContainerLogChannel: handleServerStreamingCall<WatchContainerLogRequest, ContainerLogMessage>
}

export interface CruxNodeClient extends Client {
  /** CRUD */
  getNodes(request: Empty, callback: (error: ServiceError | null, response: NodeListResponse) => void): ClientUnaryCall
  getNodes(
    request: Empty,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: NodeListResponse) => void,
  ): ClientUnaryCall
  getNodes(
    request: Empty,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: NodeListResponse) => void,
  ): ClientUnaryCall
  createNode(
    request: CreateNodeRequest,
    callback: (error: ServiceError | null, response: CreateEntityResponse) => void,
  ): ClientUnaryCall
  createNode(
    request: CreateNodeRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: CreateEntityResponse) => void,
  ): ClientUnaryCall
  createNode(
    request: CreateNodeRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: CreateEntityResponse) => void,
  ): ClientUnaryCall
  updateNode(
    request: UpdateNodeRequest,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  updateNode(
    request: UpdateNodeRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  updateNode(
    request: UpdateNodeRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  deleteNode(request: IdRequest, callback: (error: ServiceError | null, response: Empty) => void): ClientUnaryCall
  deleteNode(
    request: IdRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  deleteNode(
    request: IdRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  getNodeDetails(
    request: IdRequest,
    callback: (error: ServiceError | null, response: NodeDetailsResponse) => void,
  ): ClientUnaryCall
  getNodeDetails(
    request: IdRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: NodeDetailsResponse) => void,
  ): ClientUnaryCall
  getNodeDetails(
    request: IdRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: NodeDetailsResponse) => void,
  ): ClientUnaryCall
  generateScript(
    request: GenerateScriptRequest,
    callback: (error: ServiceError | null, response: NodeInstallResponse) => void,
  ): ClientUnaryCall
  generateScript(
    request: GenerateScriptRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: NodeInstallResponse) => void,
  ): ClientUnaryCall
  generateScript(
    request: GenerateScriptRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: NodeInstallResponse) => void,
  ): ClientUnaryCall
  getScript(
    request: ServiceIdRequest,
    callback: (error: ServiceError | null, response: NodeScriptResponse) => void,
  ): ClientUnaryCall
  getScript(
    request: ServiceIdRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: NodeScriptResponse) => void,
  ): ClientUnaryCall
  getScript(
    request: ServiceIdRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: NodeScriptResponse) => void,
  ): ClientUnaryCall
  discardScript(request: IdRequest, callback: (error: ServiceError | null, response: Empty) => void): ClientUnaryCall
  discardScript(
    request: IdRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  discardScript(
    request: IdRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  revokeToken(request: IdRequest, callback: (error: ServiceError | null, response: Empty) => void): ClientUnaryCall
  revokeToken(
    request: IdRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  revokeToken(
    request: IdRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  updateNodeAgent(request: IdRequest, callback: (error: ServiceError | null, response: Empty) => void): ClientUnaryCall
  updateNodeAgent(
    request: IdRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  updateNodeAgent(
    request: IdRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  sendContainerCommand(
    request: NodeContainerCommandRequest,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  sendContainerCommand(
    request: NodeContainerCommandRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  sendContainerCommand(
    request: NodeContainerCommandRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  deleteContainers(
    request: NodeDeleteContainersRequest,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  deleteContainers(
    request: NodeDeleteContainersRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  deleteContainers(
    request: NodeDeleteContainersRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  subscribeNodeEventChannel(
    request: ServiceIdRequest,
    options?: Partial<CallOptions>,
  ): ClientReadableStream<NodeEventMessage>
  subscribeNodeEventChannel(
    request: ServiceIdRequest,
    metadata?: Metadata,
    options?: Partial<CallOptions>,
  ): ClientReadableStream<NodeEventMessage>
  watchContainerState(
    request: WatchContainerStateRequest,
    options?: Partial<CallOptions>,
  ): ClientReadableStream<ContainerStateListMessage>
  watchContainerState(
    request: WatchContainerStateRequest,
    metadata?: Metadata,
    options?: Partial<CallOptions>,
  ): ClientReadableStream<ContainerStateListMessage>
  subscribeContainerLogChannel(
    request: WatchContainerLogRequest,
    options?: Partial<CallOptions>,
  ): ClientReadableStream<ContainerLogMessage>
  subscribeContainerLogChannel(
    request: WatchContainerLogRequest,
    metadata?: Metadata,
    options?: Partial<CallOptions>,
  ): ClientReadableStream<ContainerLogMessage>
}

export const CruxNodeClient = makeGenericClientConstructor(CruxNodeService, 'crux.CruxNode') as unknown as {
  new (address: string, credentials: ChannelCredentials, options?: Partial<ClientOptions>): CruxNodeClient
  service: typeof CruxNodeService
}

export type CruxDeploymentService = typeof CruxDeploymentService
export const CruxDeploymentService = {
  subscribeToDeploymentEvents: {
    path: '/crux.CruxDeployment/SubscribeToDeploymentEvents',
    requestStream: false,
    responseStream: true,
    requestSerialize: (value: IdRequest) => Buffer.from(IdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => IdRequest.decode(value),
    responseSerialize: (value: DeploymentProgressMessage) =>
      Buffer.from(DeploymentProgressMessage.encode(value).finish()),
    responseDeserialize: (value: Buffer) => DeploymentProgressMessage.decode(value),
  },
  subscribeToDeploymentEditEvents: {
    path: '/crux.CruxDeployment/SubscribeToDeploymentEditEvents',
    requestStream: false,
    responseStream: true,
    requestSerialize: (value: ServiceIdRequest) => Buffer.from(ServiceIdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => ServiceIdRequest.decode(value),
    responseSerialize: (value: DeploymentEditEventMessage) =>
      Buffer.from(DeploymentEditEventMessage.encode(value).finish()),
    responseDeserialize: (value: Buffer) => DeploymentEditEventMessage.decode(value),
  },
} as const

export interface CruxDeploymentServer extends UntypedServiceImplementation {
  subscribeToDeploymentEvents: handleServerStreamingCall<IdRequest, DeploymentProgressMessage>
  subscribeToDeploymentEditEvents: handleServerStreamingCall<ServiceIdRequest, DeploymentEditEventMessage>
}

export interface CruxDeploymentClient extends Client {
  subscribeToDeploymentEvents(
    request: IdRequest,
    options?: Partial<CallOptions>,
  ): ClientReadableStream<DeploymentProgressMessage>
  subscribeToDeploymentEvents(
    request: IdRequest,
    metadata?: Metadata,
    options?: Partial<CallOptions>,
  ): ClientReadableStream<DeploymentProgressMessage>
  subscribeToDeploymentEditEvents(
    request: ServiceIdRequest,
    options?: Partial<CallOptions>,
  ): ClientReadableStream<DeploymentEditEventMessage>
  subscribeToDeploymentEditEvents(
    request: ServiceIdRequest,
    metadata?: Metadata,
    options?: Partial<CallOptions>,
  ): ClientReadableStream<DeploymentEditEventMessage>
}

export const CruxDeploymentClient = makeGenericClientConstructor(
  CruxDeploymentService,
  'crux.CruxDeployment',
) as unknown as {
  new (address: string, credentials: ChannelCredentials, options?: Partial<ClientOptions>): CruxDeploymentClient
  service: typeof CruxDeploymentService
}

export type CruxTeamService = typeof CruxTeamService
export const CruxTeamService = {
  createTeam: {
    path: '/crux.CruxTeam/CreateTeam',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: CreateTeamRequest) => Buffer.from(CreateTeamRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => CreateTeamRequest.decode(value),
    responseSerialize: (value: CreateEntityResponse) => Buffer.from(CreateEntityResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => CreateEntityResponse.decode(value),
  },
  getActiveTeamByUser: {
    path: '/crux.CruxTeam/GetActiveTeamByUser',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: Empty) => Buffer.from(Empty.encode(value).finish()),
    requestDeserialize: (value: Buffer) => Empty.decode(value),
    responseSerialize: (value: ActiveTeamDetailsResponse) =>
      Buffer.from(ActiveTeamDetailsResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => ActiveTeamDetailsResponse.decode(value),
  },
  updateTeam: {
    path: '/crux.CruxTeam/UpdateTeam',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: UpdateTeamRequest) => Buffer.from(UpdateTeamRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => UpdateTeamRequest.decode(value),
    responseSerialize: (value: Empty) => Buffer.from(Empty.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Empty.decode(value),
  },
  deleteTeam: {
    path: '/crux.CruxTeam/DeleteTeam',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: IdRequest) => Buffer.from(IdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => IdRequest.decode(value),
    responseSerialize: (value: Empty) => Buffer.from(Empty.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Empty.decode(value),
  },
  updateUserRole: {
    path: '/crux.CruxTeam/UpdateUserRole',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: UpdateUserRoleInTeamRequest) =>
      Buffer.from(UpdateUserRoleInTeamRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => UpdateUserRoleInTeamRequest.decode(value),
    responseSerialize: (value: Empty) => Buffer.from(Empty.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Empty.decode(value),
  },
  inviteUserToTeam: {
    path: '/crux.CruxTeam/InviteUserToTeam',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: InviteUserRequest) => Buffer.from(InviteUserRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => InviteUserRequest.decode(value),
    responseSerialize: (value: CreateEntityResponse) => Buffer.from(CreateEntityResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => CreateEntityResponse.decode(value),
  },
  reinviteUserToTeam: {
    path: '/crux.CruxTeam/ReinviteUserToTeam',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: ReinviteUserRequest) => Buffer.from(ReinviteUserRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => ReinviteUserRequest.decode(value),
    responseSerialize: (value: CreateEntityResponse) => Buffer.from(CreateEntityResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => CreateEntityResponse.decode(value),
  },
  deleteUserFromTeam: {
    path: '/crux.CruxTeam/DeleteUserFromTeam',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: DeleteUserFromTeamRequest) =>
      Buffer.from(DeleteUserFromTeamRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => DeleteUserFromTeamRequest.decode(value),
    responseSerialize: (value: Empty) => Buffer.from(Empty.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Empty.decode(value),
  },
  acceptTeamInvitation: {
    path: '/crux.CruxTeam/AcceptTeamInvitation',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: IdRequest) => Buffer.from(IdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => IdRequest.decode(value),
    responseSerialize: (value: Empty) => Buffer.from(Empty.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Empty.decode(value),
  },
  declineTeamInvitation: {
    path: '/crux.CruxTeam/DeclineTeamInvitation',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: IdRequest) => Buffer.from(IdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => IdRequest.decode(value),
    responseSerialize: (value: Empty) => Buffer.from(Empty.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Empty.decode(value),
  },
  selectTeam: {
    path: '/crux.CruxTeam/SelectTeam',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: IdRequest) => Buffer.from(IdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => IdRequest.decode(value),
    responseSerialize: (value: Empty) => Buffer.from(Empty.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Empty.decode(value),
  },
  getUserMeta: {
    path: '/crux.CruxTeam/GetUserMeta',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: Empty) => Buffer.from(Empty.encode(value).finish()),
    requestDeserialize: (value: Buffer) => Empty.decode(value),
    responseSerialize: (value: UserMetaResponse) => Buffer.from(UserMetaResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => UserMetaResponse.decode(value),
  },
  getAllTeams: {
    path: '/crux.CruxTeam/GetAllTeams',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: Empty) => Buffer.from(Empty.encode(value).finish()),
    requestDeserialize: (value: Buffer) => Empty.decode(value),
    responseSerialize: (value: AllTeamsResponse) => Buffer.from(AllTeamsResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => AllTeamsResponse.decode(value),
  },
  getTeamById: {
    path: '/crux.CruxTeam/GetTeamById',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: IdRequest) => Buffer.from(IdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => IdRequest.decode(value),
    responseSerialize: (value: TeamDetailsResponse) => Buffer.from(TeamDetailsResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => TeamDetailsResponse.decode(value),
  },
} as const

export interface CruxTeamServer extends UntypedServiceImplementation {
  createTeam: handleUnaryCall<CreateTeamRequest, CreateEntityResponse>
  getActiveTeamByUser: handleUnaryCall<Empty, ActiveTeamDetailsResponse>
  updateTeam: handleUnaryCall<UpdateTeamRequest, Empty>
  deleteTeam: handleUnaryCall<IdRequest, Empty>
  updateUserRole: handleUnaryCall<UpdateUserRoleInTeamRequest, Empty>
  inviteUserToTeam: handleUnaryCall<InviteUserRequest, CreateEntityResponse>
  reinviteUserToTeam: handleUnaryCall<ReinviteUserRequest, CreateEntityResponse>
  deleteUserFromTeam: handleUnaryCall<DeleteUserFromTeamRequest, Empty>
  acceptTeamInvitation: handleUnaryCall<IdRequest, Empty>
  declineTeamInvitation: handleUnaryCall<IdRequest, Empty>
  selectTeam: handleUnaryCall<IdRequest, Empty>
  getUserMeta: handleUnaryCall<Empty, UserMetaResponse>
  getAllTeams: handleUnaryCall<Empty, AllTeamsResponse>
  getTeamById: handleUnaryCall<IdRequest, TeamDetailsResponse>
}

export interface CruxTeamClient extends Client {
  createTeam(
    request: CreateTeamRequest,
    callback: (error: ServiceError | null, response: CreateEntityResponse) => void,
  ): ClientUnaryCall
  createTeam(
    request: CreateTeamRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: CreateEntityResponse) => void,
  ): ClientUnaryCall
  createTeam(
    request: CreateTeamRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: CreateEntityResponse) => void,
  ): ClientUnaryCall
  getActiveTeamByUser(
    request: Empty,
    callback: (error: ServiceError | null, response: ActiveTeamDetailsResponse) => void,
  ): ClientUnaryCall
  getActiveTeamByUser(
    request: Empty,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: ActiveTeamDetailsResponse) => void,
  ): ClientUnaryCall
  getActiveTeamByUser(
    request: Empty,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: ActiveTeamDetailsResponse) => void,
  ): ClientUnaryCall
  updateTeam(
    request: UpdateTeamRequest,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  updateTeam(
    request: UpdateTeamRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  updateTeam(
    request: UpdateTeamRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  deleteTeam(request: IdRequest, callback: (error: ServiceError | null, response: Empty) => void): ClientUnaryCall
  deleteTeam(
    request: IdRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  deleteTeam(
    request: IdRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  updateUserRole(
    request: UpdateUserRoleInTeamRequest,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  updateUserRole(
    request: UpdateUserRoleInTeamRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  updateUserRole(
    request: UpdateUserRoleInTeamRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  inviteUserToTeam(
    request: InviteUserRequest,
    callback: (error: ServiceError | null, response: CreateEntityResponse) => void,
  ): ClientUnaryCall
  inviteUserToTeam(
    request: InviteUserRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: CreateEntityResponse) => void,
  ): ClientUnaryCall
  inviteUserToTeam(
    request: InviteUserRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: CreateEntityResponse) => void,
  ): ClientUnaryCall
  reinviteUserToTeam(
    request: ReinviteUserRequest,
    callback: (error: ServiceError | null, response: CreateEntityResponse) => void,
  ): ClientUnaryCall
  reinviteUserToTeam(
    request: ReinviteUserRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: CreateEntityResponse) => void,
  ): ClientUnaryCall
  reinviteUserToTeam(
    request: ReinviteUserRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: CreateEntityResponse) => void,
  ): ClientUnaryCall
  deleteUserFromTeam(
    request: DeleteUserFromTeamRequest,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  deleteUserFromTeam(
    request: DeleteUserFromTeamRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  deleteUserFromTeam(
    request: DeleteUserFromTeamRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  acceptTeamInvitation(
    request: IdRequest,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  acceptTeamInvitation(
    request: IdRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  acceptTeamInvitation(
    request: IdRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  declineTeamInvitation(
    request: IdRequest,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  declineTeamInvitation(
    request: IdRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  declineTeamInvitation(
    request: IdRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  selectTeam(request: IdRequest, callback: (error: ServiceError | null, response: Empty) => void): ClientUnaryCall
  selectTeam(
    request: IdRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  selectTeam(
    request: IdRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  getUserMeta(
    request: Empty,
    callback: (error: ServiceError | null, response: UserMetaResponse) => void,
  ): ClientUnaryCall
  getUserMeta(
    request: Empty,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: UserMetaResponse) => void,
  ): ClientUnaryCall
  getUserMeta(
    request: Empty,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: UserMetaResponse) => void,
  ): ClientUnaryCall
  getAllTeams(
    request: Empty,
    callback: (error: ServiceError | null, response: AllTeamsResponse) => void,
  ): ClientUnaryCall
  getAllTeams(
    request: Empty,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: AllTeamsResponse) => void,
  ): ClientUnaryCall
  getAllTeams(
    request: Empty,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: AllTeamsResponse) => void,
  ): ClientUnaryCall
  getTeamById(
    request: IdRequest,
    callback: (error: ServiceError | null, response: TeamDetailsResponse) => void,
  ): ClientUnaryCall
  getTeamById(
    request: IdRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: TeamDetailsResponse) => void,
  ): ClientUnaryCall
  getTeamById(
    request: IdRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: TeamDetailsResponse) => void,
  ): ClientUnaryCall
}

export const CruxTeamClient = makeGenericClientConstructor(CruxTeamService, 'crux.CruxTeam') as unknown as {
  new (address: string, credentials: ChannelCredentials, options?: Partial<ClientOptions>): CruxTeamClient
  service: typeof CruxTeamService
}

export type CruxHealthService = typeof CruxHealthService
export const CruxHealthService = {
  getHealth: {
    path: '/crux.CruxHealth/getHealth',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: Empty) => Buffer.from(Empty.encode(value).finish()),
    requestDeserialize: (value: Buffer) => Empty.decode(value),
    responseSerialize: (value: HealthResponse) => Buffer.from(HealthResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => HealthResponse.decode(value),
  },
} as const

export interface CruxHealthServer extends UntypedServiceImplementation {
  getHealth: handleUnaryCall<Empty, HealthResponse>
}

export interface CruxHealthClient extends Client {
  getHealth(request: Empty, callback: (error: ServiceError | null, response: HealthResponse) => void): ClientUnaryCall
  getHealth(
    request: Empty,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: HealthResponse) => void,
  ): ClientUnaryCall
  getHealth(
    request: Empty,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: HealthResponse) => void,
  ): ClientUnaryCall
}

export const CruxHealthClient = makeGenericClientConstructor(CruxHealthService, 'crux.CruxHealth') as unknown as {
  new (address: string, credentials: ChannelCredentials, options?: Partial<ClientOptions>): CruxHealthClient
  service: typeof CruxHealthService
}

declare var self: any | undefined
declare var window: any | undefined
declare var global: any | undefined
var tsProtoGlobalThis: any = (() => {
  if (typeof globalThis !== 'undefined') {
    return globalThis
  }
  if (typeof self !== 'undefined') {
    return self
  }
  if (typeof window !== 'undefined') {
    return window
  }
  if (typeof global !== 'undefined') {
    return global
  }
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

function longToNumber(long: Long): number {
  if (long.gt(Number.MAX_SAFE_INTEGER)) {
    throw new tsProtoGlobalThis.Error('Value is larger than Number.MAX_SAFE_INTEGER')
  }
  return long.toNumber()
}

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any
  _m0.configure()
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined
}
