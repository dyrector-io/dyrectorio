/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices'
import { util, configure } from 'protobufjs/minimal'
import * as Long from 'long'
import { Observable } from 'rxjs'
import { Timestamp } from '../../google/protobuf/timestamp'
import { Metadata } from '@grpc/grpc-js'

export const protobufPackage = 'crux'

/** CRUX Protobuf definitions */

export enum UserRole {
  UNKNOWN_USER_ROLE = 0,
  USER = 1,
  OWNER = 2,
  UNRECOGNIZED = -1,
}

export function userRoleFromJSON(object: any): UserRole {
  switch (object) {
    case 0:
    case 'UNKNOWN_USER_ROLE':
      return UserRole.UNKNOWN_USER_ROLE
    case 1:
    case 'USER':
      return UserRole.USER
    case 2:
    case 'OWNER':
      return UserRole.OWNER
    case -1:
    case 'UNRECOGNIZED':
    default:
      return UserRole.UNRECOGNIZED
  }
}

export function userRoleToJSON(object: UserRole): string {
  switch (object) {
    case UserRole.UNKNOWN_USER_ROLE:
      return 'UNKNOWN_USER_ROLE'
    case UserRole.USER:
      return 'USER'
    case UserRole.OWNER:
      return 'OWNER'
    default:
      return 'UNKNOWN'
  }
}

export enum UserStatus {
  UNKNOWN_USER_STATUS = 0,
  PENDING = 1,
  VERIFIED = 2,
  UNRECOGNIZED = -1,
}

export function userStatusFromJSON(object: any): UserStatus {
  switch (object) {
    case 0:
    case 'UNKNOWN_USER_STATUS':
      return UserStatus.UNKNOWN_USER_STATUS
    case 1:
    case 'PENDING':
      return UserStatus.PENDING
    case 2:
    case 'VERIFIED':
      return UserStatus.VERIFIED
    case -1:
    case 'UNRECOGNIZED':
    default:
      return UserStatus.UNRECOGNIZED
  }
}

export function userStatusToJSON(object: UserStatus): string {
  switch (object) {
    case UserStatus.UNKNOWN_USER_STATUS:
      return 'UNKNOWN_USER_STATUS'
    case UserStatus.PENDING:
      return 'PENDING'
    case UserStatus.VERIFIED:
      return 'VERIFIED'
    default:
      return 'UNKNOWN'
  }
}

/** PRODUCT */
export enum ProductType {
  UNKNOWN_PRODUCT_TYPE = 0,
  SIMPLE = 1,
  COMPLEX = 2,
  UNRECOGNIZED = -1,
}

export function productTypeFromJSON(object: any): ProductType {
  switch (object) {
    case 0:
    case 'UNKNOWN_PRODUCT_TYPE':
      return ProductType.UNKNOWN_PRODUCT_TYPE
    case 1:
    case 'SIMPLE':
      return ProductType.SIMPLE
    case 2:
    case 'COMPLEX':
      return ProductType.COMPLEX
    case -1:
    case 'UNRECOGNIZED':
    default:
      return ProductType.UNRECOGNIZED
  }
}

export function productTypeToJSON(object: ProductType): string {
  switch (object) {
    case ProductType.UNKNOWN_PRODUCT_TYPE:
      return 'UNKNOWN_PRODUCT_TYPE'
    case ProductType.SIMPLE:
      return 'SIMPLE'
    case ProductType.COMPLEX:
      return 'COMPLEX'
    default:
      return 'UNKNOWN'
  }
}

export enum VersionType {
  UNKNOWN_VERSION_TYPE = 0,
  INCREMENTAL = 1,
  ROLLING = 2,
  UNRECOGNIZED = -1,
}

export function versionTypeFromJSON(object: any): VersionType {
  switch (object) {
    case 0:
    case 'UNKNOWN_VERSION_TYPE':
      return VersionType.UNKNOWN_VERSION_TYPE
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
    case VersionType.UNKNOWN_VERSION_TYPE:
      return 'UNKNOWN_VERSION_TYPE'
    case VersionType.INCREMENTAL:
      return 'INCREMENTAL'
    case VersionType.ROLLING:
      return 'ROLLING'
    default:
      return 'UNKNOWN'
  }
}

export enum RegistryType {
  UNKNOWN_REGISTRY_TYPE = 0,
  V2 = 1,
  HUB = 2,
  UNRECOGNIZED = -1,
}

export function registryTypeFromJSON(object: any): RegistryType {
  switch (object) {
    case 0:
    case 'UNKNOWN_REGISTRY_TYPE':
      return RegistryType.UNKNOWN_REGISTRY_TYPE
    case 1:
    case 'V2':
      return RegistryType.V2
    case 2:
    case 'HUB':
      return RegistryType.HUB
    case -1:
    case 'UNRECOGNIZED':
    default:
      return RegistryType.UNRECOGNIZED
  }
}

export function registryTypeToJSON(object: RegistryType): string {
  switch (object) {
    case RegistryType.UNKNOWN_REGISTRY_TYPE:
      return 'UNKNOWN_REGISTRY_TYPE'
    case RegistryType.V2:
      return 'V2'
    case RegistryType.HUB:
      return 'HUB'
    default:
      return 'UNKNOWN'
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
  UNKNOWN_CONNECTION_STATUS = 0,
  /** UNREACHABLE - Node was not yet connected or became unreachable */
  UNREACHABLE = 1,
  /** CONNECTED - Node is running and connected */
  CONNECTED = 2,
  UNRECOGNIZED = -1,
}

export function nodeConnectionStatusFromJSON(object: any): NodeConnectionStatus {
  switch (object) {
    case 0:
    case 'UNKNOWN_CONNECTION_STATUS':
      return NodeConnectionStatus.UNKNOWN_CONNECTION_STATUS
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
    case NodeConnectionStatus.UNKNOWN_CONNECTION_STATUS:
      return 'UNKNOWN_CONNECTION_STATUS'
    case NodeConnectionStatus.UNREACHABLE:
      return 'UNREACHABLE'
    case NodeConnectionStatus.CONNECTED:
      return 'CONNECTED'
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

export enum DeploymentEventType {
  UNKNOWN_DEPLOYMENT_EVENT_TYPE = 0,
  DEPLOYMENT_LOG = 1,
  DEPLOYMENT_STATUS = 2,
  CONTAINER_STATUS = 3,
  UNRECOGNIZED = -1,
}

export function deploymentEventTypeFromJSON(object: any): DeploymentEventType {
  switch (object) {
    case 0:
    case 'UNKNOWN_DEPLOYMENT_EVENT_TYPE':
      return DeploymentEventType.UNKNOWN_DEPLOYMENT_EVENT_TYPE
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
    case DeploymentEventType.UNKNOWN_DEPLOYMENT_EVENT_TYPE:
      return 'UNKNOWN_DEPLOYMENT_EVENT_TYPE'
    case DeploymentEventType.DEPLOYMENT_LOG:
      return 'DEPLOYMENT_LOG'
    case DeploymentEventType.DEPLOYMENT_STATUS:
      return 'DEPLOYMENT_STATUS'
    case DeploymentEventType.CONTAINER_STATUS:
      return 'CONTAINER_STATUS'
    default:
      return 'UNKNOWN'
  }
}

export enum ContainerStatus {
  UNKNOWN_CONTAINER_STATUS = 0,
  CREATED = 1,
  RESTARTING = 2,
  RUNNING = 3,
  REMOVING = 4,
  PAUSED = 5,
  EXITED = 6,
  DEAD = 7,
  UNRECOGNIZED = -1,
}

export function containerStatusFromJSON(object: any): ContainerStatus {
  switch (object) {
    case 0:
    case 'UNKNOWN_CONTAINER_STATUS':
      return ContainerStatus.UNKNOWN_CONTAINER_STATUS
    case 1:
    case 'CREATED':
      return ContainerStatus.CREATED
    case 2:
    case 'RESTARTING':
      return ContainerStatus.RESTARTING
    case 3:
    case 'RUNNING':
      return ContainerStatus.RUNNING
    case 4:
    case 'REMOVING':
      return ContainerStatus.REMOVING
    case 5:
    case 'PAUSED':
      return ContainerStatus.PAUSED
    case 6:
    case 'EXITED':
      return ContainerStatus.EXITED
    case 7:
    case 'DEAD':
      return ContainerStatus.DEAD
    case -1:
    case 'UNRECOGNIZED':
    default:
      return ContainerStatus.UNRECOGNIZED
  }
}

export function containerStatusToJSON(object: ContainerStatus): string {
  switch (object) {
    case ContainerStatus.UNKNOWN_CONTAINER_STATUS:
      return 'UNKNOWN_CONTAINER_STATUS'
    case ContainerStatus.CREATED:
      return 'CREATED'
    case ContainerStatus.RESTARTING:
      return 'RESTARTING'
    case ContainerStatus.RUNNING:
      return 'RUNNING'
    case ContainerStatus.REMOVING:
      return 'REMOVING'
    case ContainerStatus.PAUSED:
      return 'PAUSED'
    case ContainerStatus.EXITED:
      return 'EXITED'
    case ContainerStatus.DEAD:
      return 'DEAD'
    default:
      return 'UNKNOWN'
  }
}

/** Common messages */
export interface Empty {}

export interface ServiceIdRequest {
  id: string
}

export interface IdRequest {
  id: string
  accessedBy: string
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

/** AUDIT */
export interface AuditLogResponse {
  createdAt: Timestamp | undefined
  userId: string
  identityName: string
  serviceCall: string
  data?: string | undefined
}

export interface AuditLogListResponse {
  data: AuditLogResponse[]
}

/** TEAM */
export interface CreateTeamRequest {
  accessedBy: string
  name: string
}

export interface UpdateActiveTeamRequest {
  accessedBy: string
  name: string
}

export interface UserInviteRequest {
  accessedBy: string
  email: string
}

export interface AccessRequest {
  accessedBy: string
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

export interface TeamDetailsResponse {
  id: string
  name: string
  users: UserResponse[]
}

export interface UserResponse {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
}

export interface ProductDetailsReponse {
  id: string
  audit: AuditResponse | undefined
  name: string
  description?: string | undefined
  type: ProductType
  versions: VersionResponse[]
}

export interface ProductReponse {
  id: string
  audit: AuditResponse | undefined
  name: string
  description?: string | undefined
  type: ProductType
}

export interface ProductListResponse {
  data: ProductReponse[]
}

export interface CreateProductRequest {
  accessedBy: string
  name: string
  description?: string | undefined
  type: ProductType
}

export interface UpdateProductRequest {
  id: string
  accessedBy: string
  name: string
  description?: string | undefined
  changelog?: string | undefined
}

export interface RegistryResponse {
  id: string
  audit: AuditResponse | undefined
  name: string
  description?: string | undefined
  icon?: string | undefined
  url: string
}

export interface RegistryListResponse {
  data: RegistryResponse[]
}

export interface HubRegistryDetails {
  urlPrefix: string
}

export interface V2RegistryDetails {
  url: string
  user?: string | undefined
  token?: string | undefined
}

export interface GitlabRegistryDetails {
  user: string
  token: string
  urlPrefix: string
  url?: string | undefined
  apiUrl?: string | undefined
}

export interface GithubRegistryDetails {
  user: string
  token: string
  urlPrefix: string
}

export interface CreateRegistryRequest {
  accessedBy: string
  name: string
  description?: string | undefined
  icon?: string | undefined
  hub: HubRegistryDetails | undefined
  v2: V2RegistryDetails | undefined
  gitlab: GitlabRegistryDetails | undefined
  github: GithubRegistryDetails | undefined
}

export interface UpdateRegistryRequest {
  id: string
  accessedBy: string
  name: string
  description?: string | undefined
  icon?: string | undefined
  hub: HubRegistryDetails | undefined
  v2: V2RegistryDetails | undefined
  gitlab: GitlabRegistryDetails | undefined
  github: GithubRegistryDetails | undefined
}

export interface RegistryDetailsResponse {
  id: string
  audit: AuditResponse | undefined
  name: string
  description?: string | undefined
  icon?: string | undefined
  hub: HubRegistryDetails | undefined
  v2: V2RegistryDetails | undefined
  gitlab: GitlabRegistryDetails | undefined
  github: GithubRegistryDetails | undefined
}

export interface CreateVersionRequest {
  accessedBy: string
  productId: string
  name: string
  changelog?: string | undefined
  default: boolean
  type: VersionType
}

export interface UpdateVersionRequest {
  id: string
  accessedBy: string
  name: string
  changelog?: string | undefined
  default: boolean
}

export interface VersionResponse {
  id: string
  audit: AuditResponse | undefined
  name: string
  changelog: string
  default: boolean
  type: VersionType
  increasable: boolean
}

export interface VersionListResponse {
  data: VersionResponse[]
}

export interface VersionDetailsResponse {
  id: string
  audit: AuditResponse | undefined
  name: string
  changelog: string
  default: boolean
  type: VersionType
  mutable: boolean
  increasable: boolean
  images: ImageResponse[]
  deployments: DeploymentResponse[]
}

export interface IncreaseVersionRequest {
  id: string
  accessedBy: string
  name: string
  changelog?: string | undefined
}

export interface ExplicitContainerConfig {
  /** container ports */
  ports: ExplicitContainerConfig_Port[]
  /** volume mounts in a piped format */
  mounts: string[]
  /** could be enum, i'm not sure if it is in use */
  networkMode?: ExplicitContainerConfig_NetworkMode | undefined
  /** exposure configuration */
  expose?: ExplicitContainerConfig_Expose | undefined
  user?: number | undefined
}

export enum ExplicitContainerConfig_NetworkMode {
  UNKNOWN_NETWORK_MODE = 0,
  NONE = 1,
  HOST = 2,
  UNRECOGNIZED = -1,
}

export function explicitContainerConfig_NetworkModeFromJSON(object: any): ExplicitContainerConfig_NetworkMode {
  switch (object) {
    case 0:
    case 'UNKNOWN_NETWORK_MODE':
      return ExplicitContainerConfig_NetworkMode.UNKNOWN_NETWORK_MODE
    case 1:
    case 'NONE':
      return ExplicitContainerConfig_NetworkMode.NONE
    case 2:
    case 'HOST':
      return ExplicitContainerConfig_NetworkMode.HOST
    case -1:
    case 'UNRECOGNIZED':
    default:
      return ExplicitContainerConfig_NetworkMode.UNRECOGNIZED
  }
}

export function explicitContainerConfig_NetworkModeToJSON(object: ExplicitContainerConfig_NetworkMode): string {
  switch (object) {
    case ExplicitContainerConfig_NetworkMode.UNKNOWN_NETWORK_MODE:
      return 'UNKNOWN_NETWORK_MODE'
    case ExplicitContainerConfig_NetworkMode.NONE:
      return 'NONE'
    case ExplicitContainerConfig_NetworkMode.HOST:
      return 'HOST'
    default:
      return 'UNKNOWN'
  }
}

export interface ExplicitContainerConfig_Port {
  /** internal that is bound by the container */
  internal: number
  /** external is docker only */
  external: number
}

export interface ExplicitContainerConfig_Expose {
  /** if expose is needed */
  public: boolean
  /** if tls is needed */
  tls: boolean
}

export interface ContainerConfig {
  config: ExplicitContainerConfig | undefined
  capabilities: UniqueKeyValue[]
  environment: UniqueKeyValue[]
}

export interface ImageResponse {
  id: string
  name: string
  tag: string
  order: number
  registryId: string
  config: ContainerConfig | undefined
}

export interface ImageListResponse {
  data: ImageResponse[]
}

export interface OrderVersionImagesRequest {
  accessedBy: string
  versionId: string
  imageIds: string[]
}

export interface RegistryImages {
  registryId: string
  imageNames: string[]
}

export interface AddImagesToVersionRequest {
  accessedBy: string
  versionId: string
  images: RegistryImages[]
}

export interface UniqueKeyValue {
  id: string
  key: string
  value: string
}

export interface KeyValueList {
  data: UniqueKeyValue[]
}

export interface PatchContainerConfig {
  capabilities?: KeyValueList | undefined
  environment?: KeyValueList | undefined
  config?: ExplicitContainerConfig | undefined
}

export interface PatchImageRequest {
  id: string
  accessedBy: string
  name?: string | undefined
  tag?: string | undefined
  config?: PatchContainerConfig | undefined
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
}

export interface NodeListResponse {
  data: NodeResponse[]
}

export interface CreateNodeRequest {
  accessedBy: string
  name: string
  description?: string | undefined
  icon?: string | undefined
}

export interface UpdateNodeRequest {
  id: string
  accessedBy: string
  name: string
  description?: string | undefined
  icon?: string | undefined
}

export interface NodeInstallResponse {
  command: string
  expireAt: Timestamp | undefined
}

export interface NodeScriptResponse {
  content: string
}

export interface NodeEventMessage {
  id: string
  status: NodeConnectionStatus
  address?: string | undefined
}

export interface WatchContainerStatusRequest {
  accessedBy: string
  nodeId: string
  prefix?: string | undefined
}

export interface ContainerPort {
  internal: number
  external: number
}

export interface ContainerStatusItem {
  containerId: string
  name: string
  command: string
  createdAt: Timestamp | undefined
  status: ContainerStatus
  ports: ContainerPort[]
}

export interface ContainerStatusListMessage {
  prefix?: string | undefined
  data: ContainerStatusItem[]
}

export interface InstanceDeploymentItem {
  instanceId: string
  status: ContainerStatus
}

export interface DeploymentStatusMessage {
  instance: InstanceDeploymentItem | undefined
  deploymentStatus: DeploymentStatus | undefined
  log: string[]
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
  instancesCreated: InstancesCreatedEventList | undefined
  imageIdDeleted: string | undefined
}

export interface CreateDeploymentRequest {
  accessedBy: string
  versionId: string
  nodeId: string
}

export interface UpdateDeploymentRequest {
  id: string
  accessedBy: string
  name: string
  descripion?: string | undefined
  prefix: string
}

export interface PatchDeploymentRequest {
  id: string
  accessedBy: string
  environment?: KeyValueList | undefined
  instance?: PatchInstanceRequest | undefined
}

export interface InstanceResponse {
  id: string
  audit: AuditResponse | undefined
  image: ImageResponse | undefined
  status?: ContainerStatus | undefined
  config?: ContainerConfig | undefined
}

export interface PatchInstanceRequest {
  id: string
  accessedBy: string
  environment?: KeyValueList | undefined
  capabilities?: KeyValueList | undefined
  config?: ExplicitContainerConfig | undefined
}

export interface DeploymentListResponse {
  data: DeploymentResponse[]
}

export interface DeploymentResponse {
  id: string
  audit: AuditResponse | undefined
  name: string
  prefix: string
  nodeId: string
  nodeName: string
  status: DeploymentStatus
}

export interface DeploymentDetailsResponse {
  id: string
  audit: AuditResponse | undefined
  productVersionId: string
  nodeId: string
  name: string
  description?: string | undefined
  prefix: string
  environment: UniqueKeyValue[]
  status: DeploymentStatus
  instances: InstanceResponse[]
}

export interface DeploymentEventContainerStatus {
  instanceId: string
  status: ContainerStatus
}

export interface DeploymentEventLog {
  log: string[]
}

export interface DeploymentEventResponse {
  type: DeploymentEventType
  createdAt: Timestamp | undefined
  log: DeploymentEventLog | undefined
  deploymentStatus: DeploymentStatus | undefined
  containerStatus: DeploymentEventContainerStatus | undefined
}

export interface DeploymentEventListResponse {
  data: DeploymentEventResponse[]
}

export const CRUX_PACKAGE_NAME = 'crux'

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

const baseServiceIdRequest: object = { id: '' }

export const ServiceIdRequest = {
  fromJSON(object: any): ServiceIdRequest {
    const message = { ...baseServiceIdRequest } as ServiceIdRequest
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    return message
  },

  toJSON(message: ServiceIdRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    return obj
  },
}

const baseIdRequest: object = { id: '', accessedBy: '' }

export const IdRequest = {
  fromJSON(object: any): IdRequest {
    const message = { ...baseIdRequest } as IdRequest
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.accessedBy = object.accessedBy !== undefined && object.accessedBy !== null ? String(object.accessedBy) : ''
    return message
  },

  toJSON(message: IdRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
    return obj
  },
}

const baseAuditResponse: object = { createdBy: '' }

export const AuditResponse = {
  fromJSON(object: any): AuditResponse {
    const message = { ...baseAuditResponse } as AuditResponse
    message.createdBy = object.createdBy !== undefined && object.createdBy !== null ? String(object.createdBy) : ''
    message.createdAt =
      object.createdAt !== undefined && object.createdAt !== null ? fromJsonTimestamp(object.createdAt) : undefined
    message.updatedBy =
      object.updatedBy !== undefined && object.updatedBy !== null ? String(object.updatedBy) : undefined
    message.updatedAt =
      object.updatedAt !== undefined && object.updatedAt !== null ? fromJsonTimestamp(object.updatedAt) : undefined
    return message
  },

  toJSON(message: AuditResponse): unknown {
    const obj: any = {}
    message.createdBy !== undefined && (obj.createdBy = message.createdBy)
    message.createdAt !== undefined && (obj.createdAt = fromTimestamp(message.createdAt).toISOString())
    message.updatedBy !== undefined && (obj.updatedBy = message.updatedBy)
    message.updatedAt !== undefined && (obj.updatedAt = fromTimestamp(message.updatedAt).toISOString())
    return obj
  },
}

const baseCreateEntityResponse: object = { id: '' }

export const CreateEntityResponse = {
  fromJSON(object: any): CreateEntityResponse {
    const message = { ...baseCreateEntityResponse } as CreateEntityResponse
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.createdAt =
      object.createdAt !== undefined && object.createdAt !== null ? fromJsonTimestamp(object.createdAt) : undefined
    return message
  },

  toJSON(message: CreateEntityResponse): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.createdAt !== undefined && (obj.createdAt = fromTimestamp(message.createdAt).toISOString())
    return obj
  },
}

const baseUpdateEntityResponse: object = {}

export const UpdateEntityResponse = {
  fromJSON(object: any): UpdateEntityResponse {
    const message = { ...baseUpdateEntityResponse } as UpdateEntityResponse
    message.updatedAt =
      object.updatedAt !== undefined && object.updatedAt !== null ? fromJsonTimestamp(object.updatedAt) : undefined
    return message
  },

  toJSON(message: UpdateEntityResponse): unknown {
    const obj: any = {}
    message.updatedAt !== undefined && (obj.updatedAt = fromTimestamp(message.updatedAt).toISOString())
    return obj
  },
}

const baseAuditLogResponse: object = {
  userId: '',
  identityName: '',
  serviceCall: '',
}

export const AuditLogResponse = {
  fromJSON(object: any): AuditLogResponse {
    const message = { ...baseAuditLogResponse } as AuditLogResponse
    message.createdAt =
      object.createdAt !== undefined && object.createdAt !== null ? fromJsonTimestamp(object.createdAt) : undefined
    message.userId = object.userId !== undefined && object.userId !== null ? String(object.userId) : ''
    message.identityName =
      object.identityName !== undefined && object.identityName !== null ? String(object.identityName) : ''
    message.serviceCall =
      object.serviceCall !== undefined && object.serviceCall !== null ? String(object.serviceCall) : ''
    message.data = object.data !== undefined && object.data !== null ? String(object.data) : undefined
    return message
  },

  toJSON(message: AuditLogResponse): unknown {
    const obj: any = {}
    message.createdAt !== undefined && (obj.createdAt = fromTimestamp(message.createdAt).toISOString())
    message.userId !== undefined && (obj.userId = message.userId)
    message.identityName !== undefined && (obj.identityName = message.identityName)
    message.serviceCall !== undefined && (obj.serviceCall = message.serviceCall)
    message.data !== undefined && (obj.data = message.data)
    return obj
  },
}

const baseAuditLogListResponse: object = {}

export const AuditLogListResponse = {
  fromJSON(object: any): AuditLogListResponse {
    const message = { ...baseAuditLogListResponse } as AuditLogListResponse
    message.data = (object.data ?? []).map((e: any) => AuditLogResponse.fromJSON(e))
    return message
  },

  toJSON(message: AuditLogListResponse): unknown {
    const obj: any = {}
    if (message.data) {
      obj.data = message.data.map(e => (e ? AuditLogResponse.toJSON(e) : undefined))
    } else {
      obj.data = []
    }
    return obj
  },
}

const baseCreateTeamRequest: object = { accessedBy: '', name: '' }

export const CreateTeamRequest = {
  fromJSON(object: any): CreateTeamRequest {
    const message = { ...baseCreateTeamRequest } as CreateTeamRequest
    message.accessedBy = object.accessedBy !== undefined && object.accessedBy !== null ? String(object.accessedBy) : ''
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    return message
  },

  toJSON(message: CreateTeamRequest): unknown {
    const obj: any = {}
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
    message.name !== undefined && (obj.name = message.name)
    return obj
  },
}

const baseUpdateActiveTeamRequest: object = { accessedBy: '', name: '' }

export const UpdateActiveTeamRequest = {
  fromJSON(object: any): UpdateActiveTeamRequest {
    const message = {
      ...baseUpdateActiveTeamRequest,
    } as UpdateActiveTeamRequest
    message.accessedBy = object.accessedBy !== undefined && object.accessedBy !== null ? String(object.accessedBy) : ''
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    return message
  },

  toJSON(message: UpdateActiveTeamRequest): unknown {
    const obj: any = {}
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
    message.name !== undefined && (obj.name = message.name)
    return obj
  },
}

const baseUserInviteRequest: object = { accessedBy: '', email: '' }

export const UserInviteRequest = {
  fromJSON(object: any): UserInviteRequest {
    const message = { ...baseUserInviteRequest } as UserInviteRequest
    message.accessedBy = object.accessedBy !== undefined && object.accessedBy !== null ? String(object.accessedBy) : ''
    message.email = object.email !== undefined && object.email !== null ? String(object.email) : ''
    return message
  },

  toJSON(message: UserInviteRequest): unknown {
    const obj: any = {}
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
    message.email !== undefined && (obj.email = message.email)
    return obj
  },
}

const baseAccessRequest: object = { accessedBy: '' }

export const AccessRequest = {
  fromJSON(object: any): AccessRequest {
    const message = { ...baseAccessRequest } as AccessRequest
    message.accessedBy = object.accessedBy !== undefined && object.accessedBy !== null ? String(object.accessedBy) : ''
    return message
  },

  toJSON(message: AccessRequest): unknown {
    const obj: any = {}
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
    return obj
  },
}

const baseUserMetaResponse: object = {}

export const UserMetaResponse = {
  fromJSON(object: any): UserMetaResponse {
    const message = { ...baseUserMetaResponse } as UserMetaResponse
    message.user = object.user !== undefined && object.user !== null ? ActiveTeamUser.fromJSON(object.user) : undefined
    message.teams = (object.teams ?? []).map((e: any) => TeamResponse.fromJSON(e))
    message.invitations = (object.invitations ?? []).map((e: any) => TeamResponse.fromJSON(e))
    return message
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
}

const baseActiveTeamUser: object = { activeTeamId: '', role: 0, status: 0 }

export const ActiveTeamUser = {
  fromJSON(object: any): ActiveTeamUser {
    const message = { ...baseActiveTeamUser } as ActiveTeamUser
    message.activeTeamId =
      object.activeTeamId !== undefined && object.activeTeamId !== null ? String(object.activeTeamId) : ''
    message.role = object.role !== undefined && object.role !== null ? userRoleFromJSON(object.role) : 0
    message.status = object.status !== undefined && object.status !== null ? userStatusFromJSON(object.status) : 0
    return message
  },

  toJSON(message: ActiveTeamUser): unknown {
    const obj: any = {}
    message.activeTeamId !== undefined && (obj.activeTeamId = message.activeTeamId)
    message.role !== undefined && (obj.role = userRoleToJSON(message.role))
    message.status !== undefined && (obj.status = userStatusToJSON(message.status))
    return obj
  },
}

const baseTeamResponse: object = { id: '', name: '' }

export const TeamResponse = {
  fromJSON(object: any): TeamResponse {
    const message = { ...baseTeamResponse } as TeamResponse
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    return message
  },

  toJSON(message: TeamResponse): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.name !== undefined && (obj.name = message.name)
    return obj
  },
}

const baseTeamDetailsResponse: object = { id: '', name: '' }

export const TeamDetailsResponse = {
  fromJSON(object: any): TeamDetailsResponse {
    const message = { ...baseTeamDetailsResponse } as TeamDetailsResponse
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    message.users = (object.users ?? []).map((e: any) => UserResponse.fromJSON(e))
    return message
  },

  toJSON(message: TeamDetailsResponse): unknown {
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
}

const baseUserResponse: object = {
  id: '',
  name: '',
  email: '',
  role: 0,
  status: 0,
}

export const UserResponse = {
  fromJSON(object: any): UserResponse {
    const message = { ...baseUserResponse } as UserResponse
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    message.email = object.email !== undefined && object.email !== null ? String(object.email) : ''
    message.role = object.role !== undefined && object.role !== null ? userRoleFromJSON(object.role) : 0
    message.status = object.status !== undefined && object.status !== null ? userStatusFromJSON(object.status) : 0
    return message
  },

  toJSON(message: UserResponse): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.name !== undefined && (obj.name = message.name)
    message.email !== undefined && (obj.email = message.email)
    message.role !== undefined && (obj.role = userRoleToJSON(message.role))
    message.status !== undefined && (obj.status = userStatusToJSON(message.status))
    return obj
  },
}

const baseProductDetailsReponse: object = { id: '', name: '', type: 0 }

export const ProductDetailsReponse = {
  fromJSON(object: any): ProductDetailsReponse {
    const message = { ...baseProductDetailsReponse } as ProductDetailsReponse
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.audit =
      object.audit !== undefined && object.audit !== null ? AuditResponse.fromJSON(object.audit) : undefined
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    message.description =
      object.description !== undefined && object.description !== null ? String(object.description) : undefined
    message.type = object.type !== undefined && object.type !== null ? productTypeFromJSON(object.type) : 0
    message.versions = (object.versions ?? []).map((e: any) => VersionResponse.fromJSON(e))
    return message
  },

  toJSON(message: ProductDetailsReponse): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.audit !== undefined && (obj.audit = message.audit ? AuditResponse.toJSON(message.audit) : undefined)
    message.name !== undefined && (obj.name = message.name)
    message.description !== undefined && (obj.description = message.description)
    message.type !== undefined && (obj.type = productTypeToJSON(message.type))
    if (message.versions) {
      obj.versions = message.versions.map(e => (e ? VersionResponse.toJSON(e) : undefined))
    } else {
      obj.versions = []
    }
    return obj
  },
}

const baseProductReponse: object = { id: '', name: '', type: 0 }

export const ProductReponse = {
  fromJSON(object: any): ProductReponse {
    const message = { ...baseProductReponse } as ProductReponse
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.audit =
      object.audit !== undefined && object.audit !== null ? AuditResponse.fromJSON(object.audit) : undefined
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    message.description =
      object.description !== undefined && object.description !== null ? String(object.description) : undefined
    message.type = object.type !== undefined && object.type !== null ? productTypeFromJSON(object.type) : 0
    return message
  },

  toJSON(message: ProductReponse): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.audit !== undefined && (obj.audit = message.audit ? AuditResponse.toJSON(message.audit) : undefined)
    message.name !== undefined && (obj.name = message.name)
    message.description !== undefined && (obj.description = message.description)
    message.type !== undefined && (obj.type = productTypeToJSON(message.type))
    return obj
  },
}

const baseProductListResponse: object = {}

export const ProductListResponse = {
  fromJSON(object: any): ProductListResponse {
    const message = { ...baseProductListResponse } as ProductListResponse
    message.data = (object.data ?? []).map((e: any) => ProductReponse.fromJSON(e))
    return message
  },

  toJSON(message: ProductListResponse): unknown {
    const obj: any = {}
    if (message.data) {
      obj.data = message.data.map(e => (e ? ProductReponse.toJSON(e) : undefined))
    } else {
      obj.data = []
    }
    return obj
  },
}

const baseCreateProductRequest: object = { accessedBy: '', name: '', type: 0 }

export const CreateProductRequest = {
  fromJSON(object: any): CreateProductRequest {
    const message = { ...baseCreateProductRequest } as CreateProductRequest
    message.accessedBy = object.accessedBy !== undefined && object.accessedBy !== null ? String(object.accessedBy) : ''
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    message.description =
      object.description !== undefined && object.description !== null ? String(object.description) : undefined
    message.type = object.type !== undefined && object.type !== null ? productTypeFromJSON(object.type) : 0
    return message
  },

  toJSON(message: CreateProductRequest): unknown {
    const obj: any = {}
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
    message.name !== undefined && (obj.name = message.name)
    message.description !== undefined && (obj.description = message.description)
    message.type !== undefined && (obj.type = productTypeToJSON(message.type))
    return obj
  },
}

const baseUpdateProductRequest: object = { id: '', accessedBy: '', name: '' }

export const UpdateProductRequest = {
  fromJSON(object: any): UpdateProductRequest {
    const message = { ...baseUpdateProductRequest } as UpdateProductRequest
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.accessedBy = object.accessedBy !== undefined && object.accessedBy !== null ? String(object.accessedBy) : ''
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    message.description =
      object.description !== undefined && object.description !== null ? String(object.description) : undefined
    message.changelog =
      object.changelog !== undefined && object.changelog !== null ? String(object.changelog) : undefined
    return message
  },

  toJSON(message: UpdateProductRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
    message.name !== undefined && (obj.name = message.name)
    message.description !== undefined && (obj.description = message.description)
    message.changelog !== undefined && (obj.changelog = message.changelog)
    return obj
  },
}

const baseRegistryResponse: object = { id: '', name: '', url: '' }

export const RegistryResponse = {
  fromJSON(object: any): RegistryResponse {
    const message = { ...baseRegistryResponse } as RegistryResponse
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.audit =
      object.audit !== undefined && object.audit !== null ? AuditResponse.fromJSON(object.audit) : undefined
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    message.description =
      object.description !== undefined && object.description !== null ? String(object.description) : undefined
    message.icon = object.icon !== undefined && object.icon !== null ? String(object.icon) : undefined
    message.url = object.url !== undefined && object.url !== null ? String(object.url) : ''
    return message
  },

  toJSON(message: RegistryResponse): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.audit !== undefined && (obj.audit = message.audit ? AuditResponse.toJSON(message.audit) : undefined)
    message.name !== undefined && (obj.name = message.name)
    message.description !== undefined && (obj.description = message.description)
    message.icon !== undefined && (obj.icon = message.icon)
    message.url !== undefined && (obj.url = message.url)
    return obj
  },
}

const baseRegistryListResponse: object = {}

export const RegistryListResponse = {
  fromJSON(object: any): RegistryListResponse {
    const message = { ...baseRegistryListResponse } as RegistryListResponse
    message.data = (object.data ?? []).map((e: any) => RegistryResponse.fromJSON(e))
    return message
  },

  toJSON(message: RegistryListResponse): unknown {
    const obj: any = {}
    if (message.data) {
      obj.data = message.data.map(e => (e ? RegistryResponse.toJSON(e) : undefined))
    } else {
      obj.data = []
    }
    return obj
  },
}

const baseHubRegistryDetails: object = { urlPrefix: '' }

export const HubRegistryDetails = {
  fromJSON(object: any): HubRegistryDetails {
    const message = { ...baseHubRegistryDetails } as HubRegistryDetails
    message.urlPrefix = object.urlPrefix !== undefined && object.urlPrefix !== null ? String(object.urlPrefix) : ''
    return message
  },

  toJSON(message: HubRegistryDetails): unknown {
    const obj: any = {}
    message.urlPrefix !== undefined && (obj.urlPrefix = message.urlPrefix)
    return obj
  },
}

const baseV2RegistryDetails: object = { url: '' }

export const V2RegistryDetails = {
  fromJSON(object: any): V2RegistryDetails {
    const message = { ...baseV2RegistryDetails } as V2RegistryDetails
    message.url = object.url !== undefined && object.url !== null ? String(object.url) : ''
    message.user = object.user !== undefined && object.user !== null ? String(object.user) : undefined
    message.token = object.token !== undefined && object.token !== null ? String(object.token) : undefined
    return message
  },

  toJSON(message: V2RegistryDetails): unknown {
    const obj: any = {}
    message.url !== undefined && (obj.url = message.url)
    message.user !== undefined && (obj.user = message.user)
    message.token !== undefined && (obj.token = message.token)
    return obj
  },
}

const baseGitlabRegistryDetails: object = {
  user: '',
  token: '',
  urlPrefix: '',
}

export const GitlabRegistryDetails = {
  fromJSON(object: any): GitlabRegistryDetails {
    const message = { ...baseGitlabRegistryDetails } as GitlabRegistryDetails
    message.user = object.user !== undefined && object.user !== null ? String(object.user) : ''
    message.token = object.token !== undefined && object.token !== null ? String(object.token) : ''
    message.urlPrefix = object.urlPrefix !== undefined && object.urlPrefix !== null ? String(object.urlPrefix) : ''
    message.url = object.url !== undefined && object.url !== null ? String(object.url) : undefined
    message.apiUrl = object.apiUrl !== undefined && object.apiUrl !== null ? String(object.apiUrl) : undefined
    return message
  },

  toJSON(message: GitlabRegistryDetails): unknown {
    const obj: any = {}
    message.user !== undefined && (obj.user = message.user)
    message.token !== undefined && (obj.token = message.token)
    message.urlPrefix !== undefined && (obj.urlPrefix = message.urlPrefix)
    message.url !== undefined && (obj.url = message.url)
    message.apiUrl !== undefined && (obj.apiUrl = message.apiUrl)
    return obj
  },
}

const baseGithubRegistryDetails: object = {
  user: '',
  token: '',
  urlPrefix: '',
}

export const GithubRegistryDetails = {
  fromJSON(object: any): GithubRegistryDetails {
    const message = { ...baseGithubRegistryDetails } as GithubRegistryDetails
    message.user = object.user !== undefined && object.user !== null ? String(object.user) : ''
    message.token = object.token !== undefined && object.token !== null ? String(object.token) : ''
    message.urlPrefix = object.urlPrefix !== undefined && object.urlPrefix !== null ? String(object.urlPrefix) : ''
    return message
  },

  toJSON(message: GithubRegistryDetails): unknown {
    const obj: any = {}
    message.user !== undefined && (obj.user = message.user)
    message.token !== undefined && (obj.token = message.token)
    message.urlPrefix !== undefined && (obj.urlPrefix = message.urlPrefix)
    return obj
  },
}

const baseCreateRegistryRequest: object = { accessedBy: '', name: '' }

export const CreateRegistryRequest = {
  fromJSON(object: any): CreateRegistryRequest {
    const message = { ...baseCreateRegistryRequest } as CreateRegistryRequest
    message.accessedBy = object.accessedBy !== undefined && object.accessedBy !== null ? String(object.accessedBy) : ''
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    message.description =
      object.description !== undefined && object.description !== null ? String(object.description) : undefined
    message.icon = object.icon !== undefined && object.icon !== null ? String(object.icon) : undefined
    message.hub = object.hub !== undefined && object.hub !== null ? HubRegistryDetails.fromJSON(object.hub) : undefined
    message.v2 = object.v2 !== undefined && object.v2 !== null ? V2RegistryDetails.fromJSON(object.v2) : undefined
    message.gitlab =
      object.gitlab !== undefined && object.gitlab !== null ? GitlabRegistryDetails.fromJSON(object.gitlab) : undefined
    message.github =
      object.github !== undefined && object.github !== null ? GithubRegistryDetails.fromJSON(object.github) : undefined
    return message
  },

  toJSON(message: CreateRegistryRequest): unknown {
    const obj: any = {}
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
    message.name !== undefined && (obj.name = message.name)
    message.description !== undefined && (obj.description = message.description)
    message.icon !== undefined && (obj.icon = message.icon)
    message.hub !== undefined && (obj.hub = message.hub ? HubRegistryDetails.toJSON(message.hub) : undefined)
    message.v2 !== undefined && (obj.v2 = message.v2 ? V2RegistryDetails.toJSON(message.v2) : undefined)
    message.gitlab !== undefined &&
      (obj.gitlab = message.gitlab ? GitlabRegistryDetails.toJSON(message.gitlab) : undefined)
    message.github !== undefined &&
      (obj.github = message.github ? GithubRegistryDetails.toJSON(message.github) : undefined)
    return obj
  },
}

const baseUpdateRegistryRequest: object = { id: '', accessedBy: '', name: '' }

export const UpdateRegistryRequest = {
  fromJSON(object: any): UpdateRegistryRequest {
    const message = { ...baseUpdateRegistryRequest } as UpdateRegistryRequest
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.accessedBy = object.accessedBy !== undefined && object.accessedBy !== null ? String(object.accessedBy) : ''
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    message.description =
      object.description !== undefined && object.description !== null ? String(object.description) : undefined
    message.icon = object.icon !== undefined && object.icon !== null ? String(object.icon) : undefined
    message.hub = object.hub !== undefined && object.hub !== null ? HubRegistryDetails.fromJSON(object.hub) : undefined
    message.v2 = object.v2 !== undefined && object.v2 !== null ? V2RegistryDetails.fromJSON(object.v2) : undefined
    message.gitlab =
      object.gitlab !== undefined && object.gitlab !== null ? GitlabRegistryDetails.fromJSON(object.gitlab) : undefined
    message.github =
      object.github !== undefined && object.github !== null ? GithubRegistryDetails.fromJSON(object.github) : undefined
    return message
  },

  toJSON(message: UpdateRegistryRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
    message.name !== undefined && (obj.name = message.name)
    message.description !== undefined && (obj.description = message.description)
    message.icon !== undefined && (obj.icon = message.icon)
    message.hub !== undefined && (obj.hub = message.hub ? HubRegistryDetails.toJSON(message.hub) : undefined)
    message.v2 !== undefined && (obj.v2 = message.v2 ? V2RegistryDetails.toJSON(message.v2) : undefined)
    message.gitlab !== undefined &&
      (obj.gitlab = message.gitlab ? GitlabRegistryDetails.toJSON(message.gitlab) : undefined)
    message.github !== undefined &&
      (obj.github = message.github ? GithubRegistryDetails.toJSON(message.github) : undefined)
    return obj
  },
}

const baseRegistryDetailsResponse: object = { id: '', name: '' }

export const RegistryDetailsResponse = {
  fromJSON(object: any): RegistryDetailsResponse {
    const message = {
      ...baseRegistryDetailsResponse,
    } as RegistryDetailsResponse
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.audit =
      object.audit !== undefined && object.audit !== null ? AuditResponse.fromJSON(object.audit) : undefined
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    message.description =
      object.description !== undefined && object.description !== null ? String(object.description) : undefined
    message.icon = object.icon !== undefined && object.icon !== null ? String(object.icon) : undefined
    message.hub = object.hub !== undefined && object.hub !== null ? HubRegistryDetails.fromJSON(object.hub) : undefined
    message.v2 = object.v2 !== undefined && object.v2 !== null ? V2RegistryDetails.fromJSON(object.v2) : undefined
    message.gitlab =
      object.gitlab !== undefined && object.gitlab !== null ? GitlabRegistryDetails.fromJSON(object.gitlab) : undefined
    message.github =
      object.github !== undefined && object.github !== null ? GithubRegistryDetails.fromJSON(object.github) : undefined
    return message
  },

  toJSON(message: RegistryDetailsResponse): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.audit !== undefined && (obj.audit = message.audit ? AuditResponse.toJSON(message.audit) : undefined)
    message.name !== undefined && (obj.name = message.name)
    message.description !== undefined && (obj.description = message.description)
    message.icon !== undefined && (obj.icon = message.icon)
    message.hub !== undefined && (obj.hub = message.hub ? HubRegistryDetails.toJSON(message.hub) : undefined)
    message.v2 !== undefined && (obj.v2 = message.v2 ? V2RegistryDetails.toJSON(message.v2) : undefined)
    message.gitlab !== undefined &&
      (obj.gitlab = message.gitlab ? GitlabRegistryDetails.toJSON(message.gitlab) : undefined)
    message.github !== undefined &&
      (obj.github = message.github ? GithubRegistryDetails.toJSON(message.github) : undefined)
    return obj
  },
}

const baseCreateVersionRequest: object = {
  accessedBy: '',
  productId: '',
  name: '',
  default: false,
  type: 0,
}

export const CreateVersionRequest = {
  fromJSON(object: any): CreateVersionRequest {
    const message = { ...baseCreateVersionRequest } as CreateVersionRequest
    message.accessedBy = object.accessedBy !== undefined && object.accessedBy !== null ? String(object.accessedBy) : ''
    message.productId = object.productId !== undefined && object.productId !== null ? String(object.productId) : ''
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    message.changelog =
      object.changelog !== undefined && object.changelog !== null ? String(object.changelog) : undefined
    message.default = object.default !== undefined && object.default !== null ? Boolean(object.default) : false
    message.type = object.type !== undefined && object.type !== null ? versionTypeFromJSON(object.type) : 0
    return message
  },

  toJSON(message: CreateVersionRequest): unknown {
    const obj: any = {}
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
    message.productId !== undefined && (obj.productId = message.productId)
    message.name !== undefined && (obj.name = message.name)
    message.changelog !== undefined && (obj.changelog = message.changelog)
    message.default !== undefined && (obj.default = message.default)
    message.type !== undefined && (obj.type = versionTypeToJSON(message.type))
    return obj
  },
}

const baseUpdateVersionRequest: object = {
  id: '',
  accessedBy: '',
  name: '',
  default: false,
}

export const UpdateVersionRequest = {
  fromJSON(object: any): UpdateVersionRequest {
    const message = { ...baseUpdateVersionRequest } as UpdateVersionRequest
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.accessedBy = object.accessedBy !== undefined && object.accessedBy !== null ? String(object.accessedBy) : ''
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    message.changelog =
      object.changelog !== undefined && object.changelog !== null ? String(object.changelog) : undefined
    message.default = object.default !== undefined && object.default !== null ? Boolean(object.default) : false
    return message
  },

  toJSON(message: UpdateVersionRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
    message.name !== undefined && (obj.name = message.name)
    message.changelog !== undefined && (obj.changelog = message.changelog)
    message.default !== undefined && (obj.default = message.default)
    return obj
  },
}

const baseVersionResponse: object = {
  id: '',
  name: '',
  changelog: '',
  default: false,
  type: 0,
  increasable: false,
}

export const VersionResponse = {
  fromJSON(object: any): VersionResponse {
    const message = { ...baseVersionResponse } as VersionResponse
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.audit =
      object.audit !== undefined && object.audit !== null ? AuditResponse.fromJSON(object.audit) : undefined
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    message.changelog = object.changelog !== undefined && object.changelog !== null ? String(object.changelog) : ''
    message.default = object.default !== undefined && object.default !== null ? Boolean(object.default) : false
    message.type = object.type !== undefined && object.type !== null ? versionTypeFromJSON(object.type) : 0
    message.increasable =
      object.increasable !== undefined && object.increasable !== null ? Boolean(object.increasable) : false
    return message
  },

  toJSON(message: VersionResponse): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.audit !== undefined && (obj.audit = message.audit ? AuditResponse.toJSON(message.audit) : undefined)
    message.name !== undefined && (obj.name = message.name)
    message.changelog !== undefined && (obj.changelog = message.changelog)
    message.default !== undefined && (obj.default = message.default)
    message.type !== undefined && (obj.type = versionTypeToJSON(message.type))
    message.increasable !== undefined && (obj.increasable = message.increasable)
    return obj
  },
}

const baseVersionListResponse: object = {}

export const VersionListResponse = {
  fromJSON(object: any): VersionListResponse {
    const message = { ...baseVersionListResponse } as VersionListResponse
    message.data = (object.data ?? []).map((e: any) => VersionResponse.fromJSON(e))
    return message
  },

  toJSON(message: VersionListResponse): unknown {
    const obj: any = {}
    if (message.data) {
      obj.data = message.data.map(e => (e ? VersionResponse.toJSON(e) : undefined))
    } else {
      obj.data = []
    }
    return obj
  },
}

const baseVersionDetailsResponse: object = {
  id: '',
  name: '',
  changelog: '',
  default: false,
  type: 0,
  mutable: false,
  increasable: false,
}

export const VersionDetailsResponse = {
  fromJSON(object: any): VersionDetailsResponse {
    const message = { ...baseVersionDetailsResponse } as VersionDetailsResponse
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.audit =
      object.audit !== undefined && object.audit !== null ? AuditResponse.fromJSON(object.audit) : undefined
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    message.changelog = object.changelog !== undefined && object.changelog !== null ? String(object.changelog) : ''
    message.default = object.default !== undefined && object.default !== null ? Boolean(object.default) : false
    message.type = object.type !== undefined && object.type !== null ? versionTypeFromJSON(object.type) : 0
    message.mutable = object.mutable !== undefined && object.mutable !== null ? Boolean(object.mutable) : false
    message.increasable =
      object.increasable !== undefined && object.increasable !== null ? Boolean(object.increasable) : false
    message.images = (object.images ?? []).map((e: any) => ImageResponse.fromJSON(e))
    message.deployments = (object.deployments ?? []).map((e: any) => DeploymentResponse.fromJSON(e))
    return message
  },

  toJSON(message: VersionDetailsResponse): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.audit !== undefined && (obj.audit = message.audit ? AuditResponse.toJSON(message.audit) : undefined)
    message.name !== undefined && (obj.name = message.name)
    message.changelog !== undefined && (obj.changelog = message.changelog)
    message.default !== undefined && (obj.default = message.default)
    message.type !== undefined && (obj.type = versionTypeToJSON(message.type))
    message.mutable !== undefined && (obj.mutable = message.mutable)
    message.increasable !== undefined && (obj.increasable = message.increasable)
    if (message.images) {
      obj.images = message.images.map(e => (e ? ImageResponse.toJSON(e) : undefined))
    } else {
      obj.images = []
    }
    if (message.deployments) {
      obj.deployments = message.deployments.map(e => (e ? DeploymentResponse.toJSON(e) : undefined))
    } else {
      obj.deployments = []
    }
    return obj
  },
}

const baseIncreaseVersionRequest: object = { id: '', accessedBy: '', name: '' }

export const IncreaseVersionRequest = {
  fromJSON(object: any): IncreaseVersionRequest {
    const message = { ...baseIncreaseVersionRequest } as IncreaseVersionRequest
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.accessedBy = object.accessedBy !== undefined && object.accessedBy !== null ? String(object.accessedBy) : ''
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    message.changelog =
      object.changelog !== undefined && object.changelog !== null ? String(object.changelog) : undefined
    return message
  },

  toJSON(message: IncreaseVersionRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
    message.name !== undefined && (obj.name = message.name)
    message.changelog !== undefined && (obj.changelog = message.changelog)
    return obj
  },
}

const baseExplicitContainerConfig: object = { mounts: '' }

export const ExplicitContainerConfig = {
  fromJSON(object: any): ExplicitContainerConfig {
    const message = {
      ...baseExplicitContainerConfig,
    } as ExplicitContainerConfig
    message.ports = (object.ports ?? []).map((e: any) => ExplicitContainerConfig_Port.fromJSON(e))
    message.mounts = (object.mounts ?? []).map((e: any) => String(e))
    message.networkMode =
      object.networkMode !== undefined && object.networkMode !== null
        ? explicitContainerConfig_NetworkModeFromJSON(object.networkMode)
        : undefined
    message.expose =
      object.expose !== undefined && object.expose !== null
        ? ExplicitContainerConfig_Expose.fromJSON(object.expose)
        : undefined
    message.user = object.user !== undefined && object.user !== null ? Number(object.user) : undefined
    return message
  },

  toJSON(message: ExplicitContainerConfig): unknown {
    const obj: any = {}
    if (message.ports) {
      obj.ports = message.ports.map(e => (e ? ExplicitContainerConfig_Port.toJSON(e) : undefined))
    } else {
      obj.ports = []
    }
    if (message.mounts) {
      obj.mounts = message.mounts.map(e => e)
    } else {
      obj.mounts = []
    }
    message.networkMode !== undefined &&
      (obj.networkMode =
        message.networkMode !== undefined ? explicitContainerConfig_NetworkModeToJSON(message.networkMode) : undefined)
    message.expose !== undefined &&
      (obj.expose = message.expose ? ExplicitContainerConfig_Expose.toJSON(message.expose) : undefined)
    message.user !== undefined && (obj.user = Math.round(message.user))
    return obj
  },
}

const baseExplicitContainerConfig_Port: object = { internal: 0, external: 0 }

export const ExplicitContainerConfig_Port = {
  fromJSON(object: any): ExplicitContainerConfig_Port {
    const message = {
      ...baseExplicitContainerConfig_Port,
    } as ExplicitContainerConfig_Port
    message.internal = object.internal !== undefined && object.internal !== null ? Number(object.internal) : 0
    message.external = object.external !== undefined && object.external !== null ? Number(object.external) : 0
    return message
  },

  toJSON(message: ExplicitContainerConfig_Port): unknown {
    const obj: any = {}
    message.internal !== undefined && (obj.internal = Math.round(message.internal))
    message.external !== undefined && (obj.external = Math.round(message.external))
    return obj
  },
}

const baseExplicitContainerConfig_Expose: object = {
  public: false,
  tls: false,
}

export const ExplicitContainerConfig_Expose = {
  fromJSON(object: any): ExplicitContainerConfig_Expose {
    const message = {
      ...baseExplicitContainerConfig_Expose,
    } as ExplicitContainerConfig_Expose
    message.public = object.public !== undefined && object.public !== null ? Boolean(object.public) : false
    message.tls = object.tls !== undefined && object.tls !== null ? Boolean(object.tls) : false
    return message
  },

  toJSON(message: ExplicitContainerConfig_Expose): unknown {
    const obj: any = {}
    message.public !== undefined && (obj.public = message.public)
    message.tls !== undefined && (obj.tls = message.tls)
    return obj
  },
}

const baseContainerConfig: object = {}

export const ContainerConfig = {
  fromJSON(object: any): ContainerConfig {
    const message = { ...baseContainerConfig } as ContainerConfig
    message.config =
      object.config !== undefined && object.config !== null
        ? ExplicitContainerConfig.fromJSON(object.config)
        : undefined
    message.capabilities = (object.capabilities ?? []).map((e: any) => UniqueKeyValue.fromJSON(e))
    message.environment = (object.environment ?? []).map((e: any) => UniqueKeyValue.fromJSON(e))
    return message
  },

  toJSON(message: ContainerConfig): unknown {
    const obj: any = {}
    message.config !== undefined &&
      (obj.config = message.config ? ExplicitContainerConfig.toJSON(message.config) : undefined)
    if (message.capabilities) {
      obj.capabilities = message.capabilities.map(e => (e ? UniqueKeyValue.toJSON(e) : undefined))
    } else {
      obj.capabilities = []
    }
    if (message.environment) {
      obj.environment = message.environment.map(e => (e ? UniqueKeyValue.toJSON(e) : undefined))
    } else {
      obj.environment = []
    }
    return obj
  },
}

const baseImageResponse: object = {
  id: '',
  name: '',
  tag: '',
  order: 0,
  registryId: '',
}

export const ImageResponse = {
  fromJSON(object: any): ImageResponse {
    const message = { ...baseImageResponse } as ImageResponse
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    message.tag = object.tag !== undefined && object.tag !== null ? String(object.tag) : ''
    message.order = object.order !== undefined && object.order !== null ? Number(object.order) : 0
    message.registryId = object.registryId !== undefined && object.registryId !== null ? String(object.registryId) : ''
    message.config =
      object.config !== undefined && object.config !== null ? ContainerConfig.fromJSON(object.config) : undefined
    return message
  },

  toJSON(message: ImageResponse): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.name !== undefined && (obj.name = message.name)
    message.tag !== undefined && (obj.tag = message.tag)
    message.order !== undefined && (obj.order = Math.round(message.order))
    message.registryId !== undefined && (obj.registryId = message.registryId)
    message.config !== undefined && (obj.config = message.config ? ContainerConfig.toJSON(message.config) : undefined)
    return obj
  },
}

const baseImageListResponse: object = {}

export const ImageListResponse = {
  fromJSON(object: any): ImageListResponse {
    const message = { ...baseImageListResponse } as ImageListResponse
    message.data = (object.data ?? []).map((e: any) => ImageResponse.fromJSON(e))
    return message
  },

  toJSON(message: ImageListResponse): unknown {
    const obj: any = {}
    if (message.data) {
      obj.data = message.data.map(e => (e ? ImageResponse.toJSON(e) : undefined))
    } else {
      obj.data = []
    }
    return obj
  },
}

const baseOrderVersionImagesRequest: object = {
  accessedBy: '',
  versionId: '',
  imageIds: '',
}

export const OrderVersionImagesRequest = {
  fromJSON(object: any): OrderVersionImagesRequest {
    const message = {
      ...baseOrderVersionImagesRequest,
    } as OrderVersionImagesRequest
    message.accessedBy = object.accessedBy !== undefined && object.accessedBy !== null ? String(object.accessedBy) : ''
    message.versionId = object.versionId !== undefined && object.versionId !== null ? String(object.versionId) : ''
    message.imageIds = (object.imageIds ?? []).map((e: any) => String(e))
    return message
  },

  toJSON(message: OrderVersionImagesRequest): unknown {
    const obj: any = {}
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
    message.versionId !== undefined && (obj.versionId = message.versionId)
    if (message.imageIds) {
      obj.imageIds = message.imageIds.map(e => e)
    } else {
      obj.imageIds = []
    }
    return obj
  },
}

const baseRegistryImages: object = { registryId: '', imageNames: '' }

export const RegistryImages = {
  fromJSON(object: any): RegistryImages {
    const message = { ...baseRegistryImages } as RegistryImages
    message.registryId = object.registryId !== undefined && object.registryId !== null ? String(object.registryId) : ''
    message.imageNames = (object.imageNames ?? []).map((e: any) => String(e))
    return message
  },

  toJSON(message: RegistryImages): unknown {
    const obj: any = {}
    message.registryId !== undefined && (obj.registryId = message.registryId)
    if (message.imageNames) {
      obj.imageNames = message.imageNames.map(e => e)
    } else {
      obj.imageNames = []
    }
    return obj
  },
}

const baseAddImagesToVersionRequest: object = { accessedBy: '', versionId: '' }

export const AddImagesToVersionRequest = {
  fromJSON(object: any): AddImagesToVersionRequest {
    const message = {
      ...baseAddImagesToVersionRequest,
    } as AddImagesToVersionRequest
    message.accessedBy = object.accessedBy !== undefined && object.accessedBy !== null ? String(object.accessedBy) : ''
    message.versionId = object.versionId !== undefined && object.versionId !== null ? String(object.versionId) : ''
    message.images = (object.images ?? []).map((e: any) => RegistryImages.fromJSON(e))
    return message
  },

  toJSON(message: AddImagesToVersionRequest): unknown {
    const obj: any = {}
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
    message.versionId !== undefined && (obj.versionId = message.versionId)
    if (message.images) {
      obj.images = message.images.map(e => (e ? RegistryImages.toJSON(e) : undefined))
    } else {
      obj.images = []
    }
    return obj
  },
}

const baseUniqueKeyValue: object = { id: '', key: '', value: '' }

export const UniqueKeyValue = {
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
}

const baseKeyValueList: object = {}

export const KeyValueList = {
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
}

const basePatchContainerConfig: object = {}

export const PatchContainerConfig = {
  fromJSON(object: any): PatchContainerConfig {
    const message = { ...basePatchContainerConfig } as PatchContainerConfig
    message.capabilities =
      object.capabilities !== undefined && object.capabilities !== null
        ? KeyValueList.fromJSON(object.capabilities)
        : undefined
    message.environment =
      object.environment !== undefined && object.environment !== null
        ? KeyValueList.fromJSON(object.environment)
        : undefined
    message.config =
      object.config !== undefined && object.config !== null
        ? ExplicitContainerConfig.fromJSON(object.config)
        : undefined
    return message
  },

  toJSON(message: PatchContainerConfig): unknown {
    const obj: any = {}
    message.capabilities !== undefined &&
      (obj.capabilities = message.capabilities ? KeyValueList.toJSON(message.capabilities) : undefined)
    message.environment !== undefined &&
      (obj.environment = message.environment ? KeyValueList.toJSON(message.environment) : undefined)
    message.config !== undefined &&
      (obj.config = message.config ? ExplicitContainerConfig.toJSON(message.config) : undefined)
    return obj
  },
}

const basePatchImageRequest: object = { id: '', accessedBy: '' }

export const PatchImageRequest = {
  fromJSON(object: any): PatchImageRequest {
    const message = { ...basePatchImageRequest } as PatchImageRequest
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.accessedBy = object.accessedBy !== undefined && object.accessedBy !== null ? String(object.accessedBy) : ''
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : undefined
    message.tag = object.tag !== undefined && object.tag !== null ? String(object.tag) : undefined
    message.config =
      object.config !== undefined && object.config !== null ? PatchContainerConfig.fromJSON(object.config) : undefined
    return message
  },

  toJSON(message: PatchImageRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
    message.name !== undefined && (obj.name = message.name)
    message.tag !== undefined && (obj.tag = message.tag)
    message.config !== undefined &&
      (obj.config = message.config ? PatchContainerConfig.toJSON(message.config) : undefined)
    return obj
  },
}

const baseNodeResponse: object = { id: '', name: '', status: 0 }

export const NodeResponse = {
  fromJSON(object: any): NodeResponse {
    const message = { ...baseNodeResponse } as NodeResponse
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.audit =
      object.audit !== undefined && object.audit !== null ? AuditResponse.fromJSON(object.audit) : undefined
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    message.description =
      object.description !== undefined && object.description !== null ? String(object.description) : undefined
    message.icon = object.icon !== undefined && object.icon !== null ? String(object.icon) : undefined
    message.address = object.address !== undefined && object.address !== null ? String(object.address) : undefined
    message.status =
      object.status !== undefined && object.status !== null ? nodeConnectionStatusFromJSON(object.status) : 0
    message.connectedAt =
      object.connectedAt !== undefined && object.connectedAt !== null
        ? fromJsonTimestamp(object.connectedAt)
        : undefined
    message.version = object.version !== undefined && object.version !== null ? String(object.version) : undefined
    return message
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
    return obj
  },
}

const baseNodeDetailsResponse: object = {
  id: '',
  name: '',
  status: 0,
  hasToken: false,
}

export const NodeDetailsResponse = {
  fromJSON(object: any): NodeDetailsResponse {
    const message = { ...baseNodeDetailsResponse } as NodeDetailsResponse
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.audit =
      object.audit !== undefined && object.audit !== null ? AuditResponse.fromJSON(object.audit) : undefined
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    message.description =
      object.description !== undefined && object.description !== null ? String(object.description) : undefined
    message.icon = object.icon !== undefined && object.icon !== null ? String(object.icon) : undefined
    message.address = object.address !== undefined && object.address !== null ? String(object.address) : undefined
    message.status =
      object.status !== undefined && object.status !== null ? nodeConnectionStatusFromJSON(object.status) : 0
    message.hasToken = object.hasToken !== undefined && object.hasToken !== null ? Boolean(object.hasToken) : false
    message.connectedAt =
      object.connectedAt !== undefined && object.connectedAt !== null
        ? fromJsonTimestamp(object.connectedAt)
        : undefined
    message.install =
      object.install !== undefined && object.install !== null ? NodeInstallResponse.fromJSON(object.install) : undefined
    message.script =
      object.script !== undefined && object.script !== null ? NodeScriptResponse.fromJSON(object.script) : undefined
    message.version = object.version !== undefined && object.version !== null ? String(object.version) : undefined
    return message
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
    return obj
  },
}

const baseNodeListResponse: object = {}

export const NodeListResponse = {
  fromJSON(object: any): NodeListResponse {
    const message = { ...baseNodeListResponse } as NodeListResponse
    message.data = (object.data ?? []).map((e: any) => NodeResponse.fromJSON(e))
    return message
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
}

const baseCreateNodeRequest: object = { accessedBy: '', name: '' }

export const CreateNodeRequest = {
  fromJSON(object: any): CreateNodeRequest {
    const message = { ...baseCreateNodeRequest } as CreateNodeRequest
    message.accessedBy = object.accessedBy !== undefined && object.accessedBy !== null ? String(object.accessedBy) : ''
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    message.description =
      object.description !== undefined && object.description !== null ? String(object.description) : undefined
    message.icon = object.icon !== undefined && object.icon !== null ? String(object.icon) : undefined
    return message
  },

  toJSON(message: CreateNodeRequest): unknown {
    const obj: any = {}
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
    message.name !== undefined && (obj.name = message.name)
    message.description !== undefined && (obj.description = message.description)
    message.icon !== undefined && (obj.icon = message.icon)
    return obj
  },
}

const baseUpdateNodeRequest: object = { id: '', accessedBy: '', name: '' }

export const UpdateNodeRequest = {
  fromJSON(object: any): UpdateNodeRequest {
    const message = { ...baseUpdateNodeRequest } as UpdateNodeRequest
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.accessedBy = object.accessedBy !== undefined && object.accessedBy !== null ? String(object.accessedBy) : ''
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    message.description =
      object.description !== undefined && object.description !== null ? String(object.description) : undefined
    message.icon = object.icon !== undefined && object.icon !== null ? String(object.icon) : undefined
    return message
  },

  toJSON(message: UpdateNodeRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
    message.name !== undefined && (obj.name = message.name)
    message.description !== undefined && (obj.description = message.description)
    message.icon !== undefined && (obj.icon = message.icon)
    return obj
  },
}

const baseNodeInstallResponse: object = { command: '' }

export const NodeInstallResponse = {
  fromJSON(object: any): NodeInstallResponse {
    const message = { ...baseNodeInstallResponse } as NodeInstallResponse
    message.command = object.command !== undefined && object.command !== null ? String(object.command) : ''
    message.expireAt =
      object.expireAt !== undefined && object.expireAt !== null ? fromJsonTimestamp(object.expireAt) : undefined
    return message
  },

  toJSON(message: NodeInstallResponse): unknown {
    const obj: any = {}
    message.command !== undefined && (obj.command = message.command)
    message.expireAt !== undefined && (obj.expireAt = fromTimestamp(message.expireAt).toISOString())
    return obj
  },
}

const baseNodeScriptResponse: object = { content: '' }

export const NodeScriptResponse = {
  fromJSON(object: any): NodeScriptResponse {
    const message = { ...baseNodeScriptResponse } as NodeScriptResponse
    message.content = object.content !== undefined && object.content !== null ? String(object.content) : ''
    return message
  },

  toJSON(message: NodeScriptResponse): unknown {
    const obj: any = {}
    message.content !== undefined && (obj.content = message.content)
    return obj
  },
}

const baseNodeEventMessage: object = { id: '', status: 0 }

export const NodeEventMessage = {
  fromJSON(object: any): NodeEventMessage {
    const message = { ...baseNodeEventMessage } as NodeEventMessage
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.status =
      object.status !== undefined && object.status !== null ? nodeConnectionStatusFromJSON(object.status) : 0
    message.address = object.address !== undefined && object.address !== null ? String(object.address) : undefined
    return message
  },

  toJSON(message: NodeEventMessage): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.status !== undefined && (obj.status = nodeConnectionStatusToJSON(message.status))
    message.address !== undefined && (obj.address = message.address)
    return obj
  },
}

const baseWatchContainerStatusRequest: object = { accessedBy: '', nodeId: '' }

export const WatchContainerStatusRequest = {
  fromJSON(object: any): WatchContainerStatusRequest {
    const message = {
      ...baseWatchContainerStatusRequest,
    } as WatchContainerStatusRequest
    message.accessedBy = object.accessedBy !== undefined && object.accessedBy !== null ? String(object.accessedBy) : ''
    message.nodeId = object.nodeId !== undefined && object.nodeId !== null ? String(object.nodeId) : ''
    message.prefix = object.prefix !== undefined && object.prefix !== null ? String(object.prefix) : undefined
    return message
  },

  toJSON(message: WatchContainerStatusRequest): unknown {
    const obj: any = {}
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
    message.nodeId !== undefined && (obj.nodeId = message.nodeId)
    message.prefix !== undefined && (obj.prefix = message.prefix)
    return obj
  },
}

const baseContainerPort: object = { internal: 0, external: 0 }

export const ContainerPort = {
  fromJSON(object: any): ContainerPort {
    const message = { ...baseContainerPort } as ContainerPort
    message.internal = object.internal !== undefined && object.internal !== null ? Number(object.internal) : 0
    message.external = object.external !== undefined && object.external !== null ? Number(object.external) : 0
    return message
  },

  toJSON(message: ContainerPort): unknown {
    const obj: any = {}
    message.internal !== undefined && (obj.internal = Math.round(message.internal))
    message.external !== undefined && (obj.external = Math.round(message.external))
    return obj
  },
}

const baseContainerStatusItem: object = {
  containerId: '',
  name: '',
  command: '',
  status: 0,
}

export const ContainerStatusItem = {
  fromJSON(object: any): ContainerStatusItem {
    const message = { ...baseContainerStatusItem } as ContainerStatusItem
    message.containerId =
      object.containerId !== undefined && object.containerId !== null ? String(object.containerId) : ''
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    message.command = object.command !== undefined && object.command !== null ? String(object.command) : ''
    message.createdAt =
      object.createdAt !== undefined && object.createdAt !== null ? fromJsonTimestamp(object.createdAt) : undefined
    message.status = object.status !== undefined && object.status !== null ? containerStatusFromJSON(object.status) : 0
    message.ports = (object.ports ?? []).map((e: any) => ContainerPort.fromJSON(e))
    return message
  },

  toJSON(message: ContainerStatusItem): unknown {
    const obj: any = {}
    message.containerId !== undefined && (obj.containerId = message.containerId)
    message.name !== undefined && (obj.name = message.name)
    message.command !== undefined && (obj.command = message.command)
    message.createdAt !== undefined && (obj.createdAt = fromTimestamp(message.createdAt).toISOString())
    message.status !== undefined && (obj.status = containerStatusToJSON(message.status))
    if (message.ports) {
      obj.ports = message.ports.map(e => (e ? ContainerPort.toJSON(e) : undefined))
    } else {
      obj.ports = []
    }
    return obj
  },
}

const baseContainerStatusListMessage: object = {}

export const ContainerStatusListMessage = {
  fromJSON(object: any): ContainerStatusListMessage {
    const message = {
      ...baseContainerStatusListMessage,
    } as ContainerStatusListMessage
    message.prefix = object.prefix !== undefined && object.prefix !== null ? String(object.prefix) : undefined
    message.data = (object.data ?? []).map((e: any) => ContainerStatusItem.fromJSON(e))
    return message
  },

  toJSON(message: ContainerStatusListMessage): unknown {
    const obj: any = {}
    message.prefix !== undefined && (obj.prefix = message.prefix)
    if (message.data) {
      obj.data = message.data.map(e => (e ? ContainerStatusItem.toJSON(e) : undefined))
    } else {
      obj.data = []
    }
    return obj
  },
}

const baseInstanceDeploymentItem: object = { instanceId: '', status: 0 }

export const InstanceDeploymentItem = {
  fromJSON(object: any): InstanceDeploymentItem {
    const message = { ...baseInstanceDeploymentItem } as InstanceDeploymentItem
    message.instanceId = object.instanceId !== undefined && object.instanceId !== null ? String(object.instanceId) : ''
    message.status = object.status !== undefined && object.status !== null ? containerStatusFromJSON(object.status) : 0
    return message
  },

  toJSON(message: InstanceDeploymentItem): unknown {
    const obj: any = {}
    message.instanceId !== undefined && (obj.instanceId = message.instanceId)
    message.status !== undefined && (obj.status = containerStatusToJSON(message.status))
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

const baseDeploymentProgressMessage: object = { id: '', log: '' }

export const DeploymentProgressMessage = {
  fromJSON(object: any): DeploymentProgressMessage {
    const message = {
      ...baseDeploymentProgressMessage,
    } as DeploymentProgressMessage
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.status =
      object.status !== undefined && object.status !== null ? deploymentStatusFromJSON(object.status) : undefined
    message.instance =
      object.instance !== undefined && object.instance !== null
        ? InstanceDeploymentItem.fromJSON(object.instance)
        : undefined
    message.log = (object.log ?? []).map((e: any) => String(e))
    return message
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
}

const baseInstancesCreatedEventList: object = {}

export const InstancesCreatedEventList = {
  fromJSON(object: any): InstancesCreatedEventList {
    const message = {
      ...baseInstancesCreatedEventList,
    } as InstancesCreatedEventList
    message.data = (object.data ?? []).map((e: any) => InstanceResponse.fromJSON(e))
    return message
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
}

const baseDeploymentEditEventMessage: object = {}

export const DeploymentEditEventMessage = {
  fromJSON(object: any): DeploymentEditEventMessage {
    const message = {
      ...baseDeploymentEditEventMessage,
    } as DeploymentEditEventMessage
    message.instancesCreated =
      object.instancesCreated !== undefined && object.instancesCreated !== null
        ? InstancesCreatedEventList.fromJSON(object.instancesCreated)
        : undefined
    message.imageIdDeleted =
      object.imageIdDeleted !== undefined && object.imageIdDeleted !== null ? String(object.imageIdDeleted) : undefined
    return message
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
}

const baseCreateDeploymentRequest: object = {
  accessedBy: '',
  versionId: '',
  nodeId: '',
}

export const CreateDeploymentRequest = {
  fromJSON(object: any): CreateDeploymentRequest {
    const message = {
      ...baseCreateDeploymentRequest,
    } as CreateDeploymentRequest
    message.accessedBy = object.accessedBy !== undefined && object.accessedBy !== null ? String(object.accessedBy) : ''
    message.versionId = object.versionId !== undefined && object.versionId !== null ? String(object.versionId) : ''
    message.nodeId = object.nodeId !== undefined && object.nodeId !== null ? String(object.nodeId) : ''
    return message
  },

  toJSON(message: CreateDeploymentRequest): unknown {
    const obj: any = {}
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
    message.versionId !== undefined && (obj.versionId = message.versionId)
    message.nodeId !== undefined && (obj.nodeId = message.nodeId)
    return obj
  },
}

const baseUpdateDeploymentRequest: object = {
  id: '',
  accessedBy: '',
  name: '',
  prefix: '',
}

export const UpdateDeploymentRequest = {
  fromJSON(object: any): UpdateDeploymentRequest {
    const message = {
      ...baseUpdateDeploymentRequest,
    } as UpdateDeploymentRequest
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.accessedBy = object.accessedBy !== undefined && object.accessedBy !== null ? String(object.accessedBy) : ''
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    message.descripion =
      object.descripion !== undefined && object.descripion !== null ? String(object.descripion) : undefined
    message.prefix = object.prefix !== undefined && object.prefix !== null ? String(object.prefix) : ''
    return message
  },

  toJSON(message: UpdateDeploymentRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
    message.name !== undefined && (obj.name = message.name)
    message.descripion !== undefined && (obj.descripion = message.descripion)
    message.prefix !== undefined && (obj.prefix = message.prefix)
    return obj
  },
}

const basePatchDeploymentRequest: object = { id: '', accessedBy: '' }

export const PatchDeploymentRequest = {
  fromJSON(object: any): PatchDeploymentRequest {
    const message = { ...basePatchDeploymentRequest } as PatchDeploymentRequest
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.accessedBy = object.accessedBy !== undefined && object.accessedBy !== null ? String(object.accessedBy) : ''
    message.environment =
      object.environment !== undefined && object.environment !== null
        ? KeyValueList.fromJSON(object.environment)
        : undefined
    message.instance =
      object.instance !== undefined && object.instance !== null
        ? PatchInstanceRequest.fromJSON(object.instance)
        : undefined
    return message
  },

  toJSON(message: PatchDeploymentRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
    message.environment !== undefined &&
      (obj.environment = message.environment ? KeyValueList.toJSON(message.environment) : undefined)
    message.instance !== undefined &&
      (obj.instance = message.instance ? PatchInstanceRequest.toJSON(message.instance) : undefined)
    return obj
  },
}

const baseInstanceResponse: object = { id: '' }

export const InstanceResponse = {
  fromJSON(object: any): InstanceResponse {
    const message = { ...baseInstanceResponse } as InstanceResponse
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.audit =
      object.audit !== undefined && object.audit !== null ? AuditResponse.fromJSON(object.audit) : undefined
    message.image =
      object.image !== undefined && object.image !== null ? ImageResponse.fromJSON(object.image) : undefined
    message.status =
      object.status !== undefined && object.status !== null ? containerStatusFromJSON(object.status) : undefined
    message.config =
      object.config !== undefined && object.config !== null ? ContainerConfig.fromJSON(object.config) : undefined
    return message
  },

  toJSON(message: InstanceResponse): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.audit !== undefined && (obj.audit = message.audit ? AuditResponse.toJSON(message.audit) : undefined)
    message.image !== undefined && (obj.image = message.image ? ImageResponse.toJSON(message.image) : undefined)
    message.status !== undefined &&
      (obj.status = message.status !== undefined ? containerStatusToJSON(message.status) : undefined)
    message.config !== undefined && (obj.config = message.config ? ContainerConfig.toJSON(message.config) : undefined)
    return obj
  },
}

const basePatchInstanceRequest: object = { id: '', accessedBy: '' }

export const PatchInstanceRequest = {
  fromJSON(object: any): PatchInstanceRequest {
    const message = { ...basePatchInstanceRequest } as PatchInstanceRequest
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.accessedBy = object.accessedBy !== undefined && object.accessedBy !== null ? String(object.accessedBy) : ''
    message.environment =
      object.environment !== undefined && object.environment !== null
        ? KeyValueList.fromJSON(object.environment)
        : undefined
    message.capabilities =
      object.capabilities !== undefined && object.capabilities !== null
        ? KeyValueList.fromJSON(object.capabilities)
        : undefined
    message.config =
      object.config !== undefined && object.config !== null
        ? ExplicitContainerConfig.fromJSON(object.config)
        : undefined
    return message
  },

  toJSON(message: PatchInstanceRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
    message.environment !== undefined &&
      (obj.environment = message.environment ? KeyValueList.toJSON(message.environment) : undefined)
    message.capabilities !== undefined &&
      (obj.capabilities = message.capabilities ? KeyValueList.toJSON(message.capabilities) : undefined)
    message.config !== undefined &&
      (obj.config = message.config ? ExplicitContainerConfig.toJSON(message.config) : undefined)
    return obj
  },
}

const baseDeploymentListResponse: object = {}

export const DeploymentListResponse = {
  fromJSON(object: any): DeploymentListResponse {
    const message = { ...baseDeploymentListResponse } as DeploymentListResponse
    message.data = (object.data ?? []).map((e: any) => DeploymentResponse.fromJSON(e))
    return message
  },

  toJSON(message: DeploymentListResponse): unknown {
    const obj: any = {}
    if (message.data) {
      obj.data = message.data.map(e => (e ? DeploymentResponse.toJSON(e) : undefined))
    } else {
      obj.data = []
    }
    return obj
  },
}

const baseDeploymentResponse: object = {
  id: '',
  name: '',
  prefix: '',
  nodeId: '',
  nodeName: '',
  status: 0,
}

export const DeploymentResponse = {
  fromJSON(object: any): DeploymentResponse {
    const message = { ...baseDeploymentResponse } as DeploymentResponse
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.audit =
      object.audit !== undefined && object.audit !== null ? AuditResponse.fromJSON(object.audit) : undefined
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    message.prefix = object.prefix !== undefined && object.prefix !== null ? String(object.prefix) : ''
    message.nodeId = object.nodeId !== undefined && object.nodeId !== null ? String(object.nodeId) : ''
    message.nodeName = object.nodeName !== undefined && object.nodeName !== null ? String(object.nodeName) : ''
    message.status = object.status !== undefined && object.status !== null ? deploymentStatusFromJSON(object.status) : 0
    return message
  },

  toJSON(message: DeploymentResponse): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.audit !== undefined && (obj.audit = message.audit ? AuditResponse.toJSON(message.audit) : undefined)
    message.name !== undefined && (obj.name = message.name)
    message.prefix !== undefined && (obj.prefix = message.prefix)
    message.nodeId !== undefined && (obj.nodeId = message.nodeId)
    message.nodeName !== undefined && (obj.nodeName = message.nodeName)
    message.status !== undefined && (obj.status = deploymentStatusToJSON(message.status))
    return obj
  },
}

const baseDeploymentDetailsResponse: object = {
  id: '',
  productVersionId: '',
  nodeId: '',
  name: '',
  prefix: '',
  status: 0,
}

export const DeploymentDetailsResponse = {
  fromJSON(object: any): DeploymentDetailsResponse {
    const message = {
      ...baseDeploymentDetailsResponse,
    } as DeploymentDetailsResponse
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.audit =
      object.audit !== undefined && object.audit !== null ? AuditResponse.fromJSON(object.audit) : undefined
    message.productVersionId =
      object.productVersionId !== undefined && object.productVersionId !== null ? String(object.productVersionId) : ''
    message.nodeId = object.nodeId !== undefined && object.nodeId !== null ? String(object.nodeId) : ''
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    message.description =
      object.description !== undefined && object.description !== null ? String(object.description) : undefined
    message.prefix = object.prefix !== undefined && object.prefix !== null ? String(object.prefix) : ''
    message.environment = (object.environment ?? []).map((e: any) => UniqueKeyValue.fromJSON(e))
    message.status = object.status !== undefined && object.status !== null ? deploymentStatusFromJSON(object.status) : 0
    message.instances = (object.instances ?? []).map((e: any) => InstanceResponse.fromJSON(e))
    return message
  },

  toJSON(message: DeploymentDetailsResponse): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.audit !== undefined && (obj.audit = message.audit ? AuditResponse.toJSON(message.audit) : undefined)
    message.productVersionId !== undefined && (obj.productVersionId = message.productVersionId)
    message.nodeId !== undefined && (obj.nodeId = message.nodeId)
    message.name !== undefined && (obj.name = message.name)
    message.description !== undefined && (obj.description = message.description)
    message.prefix !== undefined && (obj.prefix = message.prefix)
    if (message.environment) {
      obj.environment = message.environment.map(e => (e ? UniqueKeyValue.toJSON(e) : undefined))
    } else {
      obj.environment = []
    }
    message.status !== undefined && (obj.status = deploymentStatusToJSON(message.status))
    if (message.instances) {
      obj.instances = message.instances.map(e => (e ? InstanceResponse.toJSON(e) : undefined))
    } else {
      obj.instances = []
    }
    return obj
  },
}

const baseDeploymentEventContainerStatus: object = {
  instanceId: '',
  status: 0,
}

export const DeploymentEventContainerStatus = {
  fromJSON(object: any): DeploymentEventContainerStatus {
    const message = {
      ...baseDeploymentEventContainerStatus,
    } as DeploymentEventContainerStatus
    message.instanceId = object.instanceId !== undefined && object.instanceId !== null ? String(object.instanceId) : ''
    message.status = object.status !== undefined && object.status !== null ? containerStatusFromJSON(object.status) : 0
    return message
  },

  toJSON(message: DeploymentEventContainerStatus): unknown {
    const obj: any = {}
    message.instanceId !== undefined && (obj.instanceId = message.instanceId)
    message.status !== undefined && (obj.status = containerStatusToJSON(message.status))
    return obj
  },
}

const baseDeploymentEventLog: object = { log: '' }

export const DeploymentEventLog = {
  fromJSON(object: any): DeploymentEventLog {
    const message = { ...baseDeploymentEventLog } as DeploymentEventLog
    message.log = (object.log ?? []).map((e: any) => String(e))
    return message
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
}

const baseDeploymentEventResponse: object = { type: 0 }

export const DeploymentEventResponse = {
  fromJSON(object: any): DeploymentEventResponse {
    const message = {
      ...baseDeploymentEventResponse,
    } as DeploymentEventResponse
    message.type = object.type !== undefined && object.type !== null ? deploymentEventTypeFromJSON(object.type) : 0
    message.createdAt =
      object.createdAt !== undefined && object.createdAt !== null ? fromJsonTimestamp(object.createdAt) : undefined
    message.log = object.log !== undefined && object.log !== null ? DeploymentEventLog.fromJSON(object.log) : undefined
    message.deploymentStatus =
      object.deploymentStatus !== undefined && object.deploymentStatus !== null
        ? deploymentStatusFromJSON(object.deploymentStatus)
        : undefined
    message.containerStatus =
      object.containerStatus !== undefined && object.containerStatus !== null
        ? DeploymentEventContainerStatus.fromJSON(object.containerStatus)
        : undefined
    return message
  },

  toJSON(message: DeploymentEventResponse): unknown {
    const obj: any = {}
    message.type !== undefined && (obj.type = deploymentEventTypeToJSON(message.type))
    message.createdAt !== undefined && (obj.createdAt = fromTimestamp(message.createdAt).toISOString())
    message.log !== undefined && (obj.log = message.log ? DeploymentEventLog.toJSON(message.log) : undefined)
    message.deploymentStatus !== undefined &&
      (obj.deploymentStatus =
        message.deploymentStatus !== undefined ? deploymentStatusToJSON(message.deploymentStatus) : undefined)
    message.containerStatus !== undefined &&
      (obj.containerStatus = message.containerStatus
        ? DeploymentEventContainerStatus.toJSON(message.containerStatus)
        : undefined)
    return obj
  },
}

const baseDeploymentEventListResponse: object = {}

export const DeploymentEventListResponse = {
  fromJSON(object: any): DeploymentEventListResponse {
    const message = {
      ...baseDeploymentEventListResponse,
    } as DeploymentEventListResponse
    message.data = (object.data ?? []).map((e: any) => DeploymentEventResponse.fromJSON(e))
    return message
  },

  toJSON(message: DeploymentEventListResponse): unknown {
    const obj: any = {}
    if (message.data) {
      obj.data = message.data.map(e => (e ? DeploymentEventResponse.toJSON(e) : undefined))
    } else {
      obj.data = []
    }
    return obj
  },
}

/** Services */

export interface CruxProductClient {
  /** CRUD */

  getProducts(request: AccessRequest, metadata: Metadata, ...rest: any): Observable<ProductListResponse>

  createProduct(request: CreateProductRequest, metadata: Metadata, ...rest: any): Observable<CreateEntityResponse>

  updateProduct(request: UpdateProductRequest, metadata: Metadata, ...rest: any): Observable<UpdateEntityResponse>

  deleteProduct(request: IdRequest, metadata: Metadata, ...rest: any): Observable<Empty>

  getProductDetails(request: IdRequest, metadata: Metadata, ...rest: any): Observable<ProductDetailsReponse>
}

/** Services */

export interface CruxProductController {
  /** CRUD */

  getProducts(
    request: AccessRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<ProductListResponse> | Observable<ProductListResponse> | ProductListResponse

  createProduct(
    request: CreateProductRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<CreateEntityResponse> | Observable<CreateEntityResponse> | CreateEntityResponse

  updateProduct(
    request: UpdateProductRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<UpdateEntityResponse> | Observable<UpdateEntityResponse> | UpdateEntityResponse

  deleteProduct(request: IdRequest, metadata: Metadata, ...rest: any): Promise<Empty> | Observable<Empty> | Empty

  getProductDetails(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<ProductDetailsReponse> | Observable<ProductDetailsReponse> | ProductDetailsReponse
}

export function CruxProductControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [
      'getProducts',
      'createProduct',
      'updateProduct',
      'deleteProduct',
      'getProductDetails',
    ]
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method)
      GrpcMethod('CruxProduct', method)(constructor.prototype[method], method, descriptor)
    }
    const grpcStreamMethods: string[] = []
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method)
      GrpcStreamMethod('CruxProduct', method)(constructor.prototype[method], method, descriptor)
    }
  }
}

export const CRUX_PRODUCT_SERVICE_NAME = 'CruxProduct'

export interface CruxRegistryClient {
  /** CRUD */

  getRegistries(request: AccessRequest, metadata: Metadata, ...rest: any): Observable<RegistryListResponse>

  createRegistry(request: CreateRegistryRequest, metadata: Metadata, ...rest: any): Observable<CreateEntityResponse>

  updateRegistry(request: UpdateRegistryRequest, metadata: Metadata, ...rest: any): Observable<UpdateEntityResponse>

  deleteRegistry(request: IdRequest, metadata: Metadata, ...rest: any): Observable<Empty>

  getRegistryDetails(request: IdRequest, metadata: Metadata, ...rest: any): Observable<RegistryDetailsResponse>
}

export interface CruxRegistryController {
  /** CRUD */

  getRegistries(
    request: AccessRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<RegistryListResponse> | Observable<RegistryListResponse> | RegistryListResponse

  createRegistry(
    request: CreateRegistryRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<CreateEntityResponse> | Observable<CreateEntityResponse> | CreateEntityResponse

  updateRegistry(
    request: UpdateRegistryRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<UpdateEntityResponse> | Observable<UpdateEntityResponse> | UpdateEntityResponse

  deleteRegistry(request: IdRequest, metadata: Metadata, ...rest: any): Promise<Empty> | Observable<Empty> | Empty

  getRegistryDetails(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<RegistryDetailsResponse> | Observable<RegistryDetailsResponse> | RegistryDetailsResponse
}

export function CruxRegistryControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [
      'getRegistries',
      'createRegistry',
      'updateRegistry',
      'deleteRegistry',
      'getRegistryDetails',
    ]
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method)
      GrpcMethod('CruxRegistry', method)(constructor.prototype[method], method, descriptor)
    }
    const grpcStreamMethods: string[] = []
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method)
      GrpcStreamMethod('CruxRegistry', method)(constructor.prototype[method], method, descriptor)
    }
  }
}

export const CRUX_REGISTRY_SERVICE_NAME = 'CruxRegistry'

export interface CruxNodeClient {
  /** CRUD */

  getNodes(request: AccessRequest, metadata: Metadata, ...rest: any): Observable<NodeListResponse>

  createNode(request: CreateNodeRequest, metadata: Metadata, ...rest: any): Observable<CreateEntityResponse>

  updateNode(request: UpdateNodeRequest, metadata: Metadata, ...rest: any): Observable<Empty>

  deleteNode(request: IdRequest, metadata: Metadata, ...rest: any): Observable<Empty>

  getNodeDetails(request: IdRequest, metadata: Metadata, ...rest: any): Observable<NodeDetailsResponse>

  generateScript(request: IdRequest, metadata: Metadata, ...rest: any): Observable<NodeInstallResponse>

  getScript(request: ServiceIdRequest, metadata: Metadata, ...rest: any): Observable<NodeScriptResponse>

  discardScript(request: IdRequest, metadata: Metadata, ...rest: any): Observable<Empty>

  revokeToken(request: IdRequest, metadata: Metadata, ...rest: any): Observable<Empty>

  subscribeNodeEventChannel(request: ServiceIdRequest, metadata: Metadata, ...rest: any): Observable<NodeEventMessage>

  watchContainerStatus(
    request: WatchContainerStatusRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<ContainerStatusListMessage>
}

export interface CruxNodeController {
  /** CRUD */

  getNodes(
    request: AccessRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<NodeListResponse> | Observable<NodeListResponse> | NodeListResponse

  createNode(
    request: CreateNodeRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<CreateEntityResponse> | Observable<CreateEntityResponse> | CreateEntityResponse

  updateNode(request: UpdateNodeRequest, metadata: Metadata, ...rest: any): Promise<Empty> | Observable<Empty> | Empty

  deleteNode(request: IdRequest, metadata: Metadata, ...rest: any): Promise<Empty> | Observable<Empty> | Empty

  getNodeDetails(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<NodeDetailsResponse> | Observable<NodeDetailsResponse> | NodeDetailsResponse

  generateScript(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<NodeInstallResponse> | Observable<NodeInstallResponse> | NodeInstallResponse

  getScript(
    request: ServiceIdRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<NodeScriptResponse> | Observable<NodeScriptResponse> | NodeScriptResponse

  discardScript(request: IdRequest, metadata: Metadata, ...rest: any): Promise<Empty> | Observable<Empty> | Empty

  revokeToken(request: IdRequest, metadata: Metadata, ...rest: any): Promise<Empty> | Observable<Empty> | Empty

  subscribeNodeEventChannel(request: ServiceIdRequest, metadata: Metadata, ...rest: any): Observable<NodeEventMessage>

  watchContainerStatus(
    request: WatchContainerStatusRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<ContainerStatusListMessage>
}

export function CruxNodeControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [
      'getNodes',
      'createNode',
      'updateNode',
      'deleteNode',
      'getNodeDetails',
      'generateScript',
      'getScript',
      'discardScript',
      'revokeToken',
      'subscribeNodeEventChannel',
      'watchContainerStatus',
    ]
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method)
      GrpcMethod('CruxNode', method)(constructor.prototype[method], method, descriptor)
    }
    const grpcStreamMethods: string[] = []
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method)
      GrpcStreamMethod('CruxNode', method)(constructor.prototype[method], method, descriptor)
    }
  }
}

export const CRUX_NODE_SERVICE_NAME = 'CruxNode'

export interface CruxProductVersionClient {
  getVersionsByProductId(request: IdRequest, metadata: Metadata, ...rest: any): Observable<VersionListResponse>

  createVersion(request: CreateVersionRequest, metadata: Metadata, ...rest: any): Observable<CreateEntityResponse>

  updateVersion(request: UpdateVersionRequest, metadata: Metadata, ...rest: any): Observable<UpdateEntityResponse>

  deleteVersion(request: IdRequest, metadata: Metadata, ...rest: any): Observable<Empty>

  getVersionDetails(request: IdRequest, metadata: Metadata, ...rest: any): Observable<VersionDetailsResponse>

  increaseVersion(request: IncreaseVersionRequest, metadata: Metadata, ...rest: any): Observable<CreateEntityResponse>
}

export interface CruxProductVersionController {
  getVersionsByProductId(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<VersionListResponse> | Observable<VersionListResponse> | VersionListResponse

  createVersion(
    request: CreateVersionRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<CreateEntityResponse> | Observable<CreateEntityResponse> | CreateEntityResponse

  updateVersion(
    request: UpdateVersionRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<UpdateEntityResponse> | Observable<UpdateEntityResponse> | UpdateEntityResponse

  deleteVersion(request: IdRequest, metadata: Metadata, ...rest: any): Promise<Empty> | Observable<Empty> | Empty

  getVersionDetails(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<VersionDetailsResponse> | Observable<VersionDetailsResponse> | VersionDetailsResponse

  increaseVersion(
    request: IncreaseVersionRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<CreateEntityResponse> | Observable<CreateEntityResponse> | CreateEntityResponse
}

export function CruxProductVersionControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [
      'getVersionsByProductId',
      'createVersion',
      'updateVersion',
      'deleteVersion',
      'getVersionDetails',
      'increaseVersion',
    ]
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method)
      GrpcMethod('CruxProductVersion', method)(constructor.prototype[method], method, descriptor)
    }
    const grpcStreamMethods: string[] = []
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method)
      GrpcStreamMethod('CruxProductVersion', method)(constructor.prototype[method], method, descriptor)
    }
  }
}

export const CRUX_PRODUCT_VERSION_SERVICE_NAME = 'CruxProductVersion'

export interface CruxImageClient {
  getImagesByVersionId(request: IdRequest, metadata: Metadata, ...rest: any): Observable<ImageListResponse>

  addImagesToVersion(
    request: AddImagesToVersionRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<ImageListResponse>

  orderImages(request: OrderVersionImagesRequest, metadata: Metadata, ...rest: any): Observable<Empty>

  patchImage(request: PatchImageRequest, metadata: Metadata, ...rest: any): Observable<Empty>

  deleteImage(request: IdRequest, metadata: Metadata, ...rest: any): Observable<Empty>

  getImageDetails(request: IdRequest, metadata: Metadata, ...rest: any): Observable<ImageResponse>
}

export interface CruxImageController {
  getImagesByVersionId(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<ImageListResponse> | Observable<ImageListResponse> | ImageListResponse

  addImagesToVersion(
    request: AddImagesToVersionRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<ImageListResponse> | Observable<ImageListResponse> | ImageListResponse

  orderImages(
    request: OrderVersionImagesRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<Empty> | Observable<Empty> | Empty

  patchImage(request: PatchImageRequest, metadata: Metadata, ...rest: any): Promise<Empty> | Observable<Empty> | Empty

  deleteImage(request: IdRequest, metadata: Metadata, ...rest: any): Promise<Empty> | Observable<Empty> | Empty

  getImageDetails(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<ImageResponse> | Observable<ImageResponse> | ImageResponse
}

export function CruxImageControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [
      'getImagesByVersionId',
      'addImagesToVersion',
      'orderImages',
      'patchImage',
      'deleteImage',
      'getImageDetails',
    ]
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method)
      GrpcMethod('CruxImage', method)(constructor.prototype[method], method, descriptor)
    }
    const grpcStreamMethods: string[] = []
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method)
      GrpcStreamMethod('CruxImage', method)(constructor.prototype[method], method, descriptor)
    }
  }
}

export const CRUX_IMAGE_SERVICE_NAME = 'CruxImage'

export interface CruxDeploymentClient {
  getDeploymentsByVersionId(request: IdRequest, metadata: Metadata, ...rest: any): Observable<DeploymentListResponse>

  createDeployment(request: CreateDeploymentRequest, metadata: Metadata, ...rest: any): Observable<CreateEntityResponse>

  updateDeployment(request: UpdateDeploymentRequest, metadata: Metadata, ...rest: any): Observable<UpdateEntityResponse>

  patchDeployment(request: PatchDeploymentRequest, metadata: Metadata, ...rest: any): Observable<UpdateEntityResponse>

  deleteDeployment(request: IdRequest, metadata: Metadata, ...rest: any): Observable<Empty>

  getDeploymentDetails(request: IdRequest, metadata: Metadata, ...rest: any): Observable<DeploymentDetailsResponse>

  getDeploymentEvents(request: IdRequest, metadata: Metadata, ...rest: any): Observable<DeploymentEventListResponse>

  startDeployment(request: IdRequest, metadata: Metadata, ...rest: any): Observable<DeploymentProgressMessage>

  subscribeToDeploymentEditEvents(
    request: ServiceIdRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<DeploymentEditEventMessage>
}

export interface CruxDeploymentController {
  getDeploymentsByVersionId(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<DeploymentListResponse> | Observable<DeploymentListResponse> | DeploymentListResponse

  createDeployment(
    request: CreateDeploymentRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<CreateEntityResponse> | Observable<CreateEntityResponse> | CreateEntityResponse

  updateDeployment(
    request: UpdateDeploymentRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<UpdateEntityResponse> | Observable<UpdateEntityResponse> | UpdateEntityResponse

  patchDeployment(
    request: PatchDeploymentRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<UpdateEntityResponse> | Observable<UpdateEntityResponse> | UpdateEntityResponse

  deleteDeployment(request: IdRequest, metadata: Metadata, ...rest: any): Promise<Empty> | Observable<Empty> | Empty

  getDeploymentDetails(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<DeploymentDetailsResponse> | Observable<DeploymentDetailsResponse> | DeploymentDetailsResponse

  getDeploymentEvents(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<DeploymentEventListResponse> | Observable<DeploymentEventListResponse> | DeploymentEventListResponse

  startDeployment(request: IdRequest, metadata: Metadata, ...rest: any): Observable<DeploymentProgressMessage>

  subscribeToDeploymentEditEvents(
    request: ServiceIdRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<DeploymentEditEventMessage>
}

export function CruxDeploymentControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [
      'getDeploymentsByVersionId',
      'createDeployment',
      'updateDeployment',
      'patchDeployment',
      'deleteDeployment',
      'getDeploymentDetails',
      'getDeploymentEvents',
      'startDeployment',
      'subscribeToDeploymentEditEvents',
    ]
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method)
      GrpcMethod('CruxDeployment', method)(constructor.prototype[method], method, descriptor)
    }
    const grpcStreamMethods: string[] = []
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method)
      GrpcStreamMethod('CruxDeployment', method)(constructor.prototype[method], method, descriptor)
    }
  }
}

export const CRUX_DEPLOYMENT_SERVICE_NAME = 'CruxDeployment'

export interface CruxTeamClient {
  createTeam(request: CreateTeamRequest, metadata: Metadata, ...rest: any): Observable<CreateEntityResponse>

  getActiveTeamByUser(request: AccessRequest, metadata: Metadata, ...rest: any): Observable<TeamDetailsResponse>

  updateActiveTeam(request: UpdateActiveTeamRequest, metadata: Metadata, ...rest: any): Observable<Empty>

  deleteActiveTeam(request: AccessRequest, metadata: Metadata, ...rest: any): Observable<Empty>

  inviteUserToTheActiveTeam(
    request: UserInviteRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<CreateEntityResponse>

  deleteUserFromTheActiveTeam(request: IdRequest, metadata: Metadata, ...rest: any): Observable<Empty>

  acceptTeamInvite(request: IdRequest, metadata: Metadata, ...rest: any): Observable<Empty>

  selectTeam(request: IdRequest, metadata: Metadata, ...rest: any): Observable<Empty>

  getUserMeta(request: AccessRequest, metadata: Metadata, ...rest: any): Observable<UserMetaResponse>
}

export interface CruxTeamController {
  createTeam(
    request: CreateTeamRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<CreateEntityResponse> | Observable<CreateEntityResponse> | CreateEntityResponse

  getActiveTeamByUser(
    request: AccessRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<TeamDetailsResponse> | Observable<TeamDetailsResponse> | TeamDetailsResponse

  updateActiveTeam(
    request: UpdateActiveTeamRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<Empty> | Observable<Empty> | Empty

  deleteActiveTeam(request: AccessRequest, metadata: Metadata, ...rest: any): Promise<Empty> | Observable<Empty> | Empty

  inviteUserToTheActiveTeam(
    request: UserInviteRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<CreateEntityResponse> | Observable<CreateEntityResponse> | CreateEntityResponse

  deleteUserFromTheActiveTeam(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<Empty> | Observable<Empty> | Empty

  acceptTeamInvite(request: IdRequest, metadata: Metadata, ...rest: any): Promise<Empty> | Observable<Empty> | Empty

  selectTeam(request: IdRequest, metadata: Metadata, ...rest: any): Promise<Empty> | Observable<Empty> | Empty

  getUserMeta(
    request: AccessRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<UserMetaResponse> | Observable<UserMetaResponse> | UserMetaResponse
}

export function CruxTeamControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [
      'createTeam',
      'getActiveTeamByUser',
      'updateActiveTeam',
      'deleteActiveTeam',
      'inviteUserToTheActiveTeam',
      'deleteUserFromTheActiveTeam',
      'acceptTeamInvite',
      'selectTeam',
      'getUserMeta',
    ]
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method)
      GrpcMethod('CruxTeam', method)(constructor.prototype[method], method, descriptor)
    }
    const grpcStreamMethods: string[] = []
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method)
      GrpcStreamMethod('CruxTeam', method)(constructor.prototype[method], method, descriptor)
    }
  }
}

export const CRUX_TEAM_SERVICE_NAME = 'CruxTeam'

export interface CruxAuditClient {
  getAuditLog(request: AccessRequest, metadata: Metadata, ...rest: any): Observable<AuditLogListResponse>
}

export interface CruxAuditController {
  getAuditLog(
    request: AccessRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<AuditLogListResponse> | Observable<AuditLogListResponse> | AuditLogListResponse
}

export function CruxAuditControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ['getAuditLog']
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method)
      GrpcMethod('CruxAudit', method)(constructor.prototype[method], method, descriptor)
    }
    const grpcStreamMethods: string[] = []
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method)
      GrpcStreamMethod('CruxAudit', method)(constructor.prototype[method], method, descriptor)
    }
  }
}

export const CRUX_AUDIT_SERVICE_NAME = 'CruxAudit'

export interface CruxHealthClient {
  getHealth(request: Empty, metadata: Metadata, ...rest: any): Observable<Empty>
}

export interface CruxHealthController {
  getHealth(request: Empty, metadata: Metadata, ...rest: any): Promise<Empty> | Observable<Empty> | Empty
}

export function CruxHealthControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ['getHealth']
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method)
      GrpcMethod('CruxHealth', method)(constructor.prototype[method], method, descriptor)
    }
    const grpcStreamMethods: string[] = []
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method)
      GrpcStreamMethod('CruxHealth', method)(constructor.prototype[method], method, descriptor)
    }
  }
}

export const CRUX_HEALTH_SERVICE_NAME = 'CruxHealth'

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
