/* eslint-disable */
import {
  CallOptions,
  ChannelCredentials,
  ChannelOptions,
  Client,
  ClientReadableStream,
  ClientUnaryCall,
  handleServerStreamingCall,
  handleUnaryCall,
  makeGenericClientConstructor,
  Metadata,
  ServiceError,
  UntypedServiceImplementation,
} from '@grpc/grpc-js'
import _m0 from 'protobufjs/minimal'
import { Timestamp } from '../../google/protobuf/timestamp'
import {
  ContainerState,
  containerStateFromJSON,
  containerStateToJSON,
  DeploymentStatus,
  deploymentStatusFromJSON,
  deploymentStatusToJSON,
  ExplicitContainerConfig,
  InstanceDeploymentItem,
  KeyList,
  KeyValueList,
  ListSecretsResponse,
  Port,
  SecretList,
  UniqueKey,
  UniqueKeySecretValue,
  UniqueKeyValue,
} from './common'

export const protobufPackage = 'crux'

/** CRUX Protobuf definitions */

export enum UserRole {
  UNKNOWN_USER_ROLE = 0,
  USER = 1,
  OWNER = 2,
  ADMIN = 3,
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
    case UserRole.UNKNOWN_USER_ROLE:
      return 'UNKNOWN_USER_ROLE'
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
    case UserStatus.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED'
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
    case ProductType.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED'
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
    case VersionType.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED'
  }
}

export enum RegistryType {
  UNKNOWN_REGISTRY_TYPE = 0,
  V2 = 1,
  HUB = 2,
  GITLAB = 3,
  GITHUB = 4,
  GOOGLE = 5,
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
    case 3:
    case 'GITLAB':
      return RegistryType.GITLAB
    case 4:
    case 'GITHUB':
      return RegistryType.GITHUB
    case 5:
    case 'GOOGLE':
      return RegistryType.GOOGLE
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
    case RegistryType.GITLAB:
      return 'GITLAB'
    case RegistryType.GITHUB:
      return 'GITHUB'
    case RegistryType.GOOGLE:
      return 'GOOGLE'
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
    case NodeConnectionStatus.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED'
  }
}

export enum NodeType {
  UNKNOWN_NODE_TYPE = 0,
  DOCKER = 1,
  K8S = 2,
  UNRECOGNIZED = -1,
}

export function nodeTypeFromJSON(object: any): NodeType {
  switch (object) {
    case 0:
    case 'UNKNOWN_NODE_TYPE':
      return NodeType.UNKNOWN_NODE_TYPE
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
    case NodeType.UNKNOWN_NODE_TYPE:
      return 'UNKNOWN_NODE_TYPE'
    case NodeType.DOCKER:
      return 'DOCKER'
    case NodeType.K8S:
      return 'K8S'
    case NodeType.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED'
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
    case DeploymentEventType.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED'
  }
}

export enum NotificationType {
  UNKNOWN_NOTIFICATION_TYPE = 0,
  DISCORD = 1,
  SLACK = 2,
  TEAMS = 3,
  UNRECOGNIZED = -1,
}

export function notificationTypeFromJSON(object: any): NotificationType {
  switch (object) {
    case 0:
    case 'UNKNOWN_NOTIFICATION_TYPE':
      return NotificationType.UNKNOWN_NOTIFICATION_TYPE
    case 1:
    case 'DISCORD':
      return NotificationType.DISCORD
    case 2:
    case 'SLACK':
      return NotificationType.SLACK
    case 3:
    case 'TEAMS':
      return NotificationType.TEAMS
    case -1:
    case 'UNRECOGNIZED':
    default:
      return NotificationType.UNRECOGNIZED
  }
}

export function notificationTypeToJSON(object: NotificationType): string {
  switch (object) {
    case NotificationType.UNKNOWN_NOTIFICATION_TYPE:
      return 'UNKNOWN_NOTIFICATION_TYPE'
    case NotificationType.DISCORD:
      return 'DISCORD'
    case NotificationType.SLACK:
      return 'SLACK'
    case NotificationType.TEAMS:
      return 'TEAMS'
    case NotificationType.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED'
  }
}

export enum NotificationEventType {
  UNKNOWN_NOTIFICATION_EVENT_TYPE = 0,
  DEPLOYMENT_CREATED = 1,
  VERSION_CREATED = 2,
  NODE_ADDED = 3,
  USER_INVITED = 4,
  UNRECOGNIZED = -1,
}

export function notificationEventTypeFromJSON(object: any): NotificationEventType {
  switch (object) {
    case 0:
    case 'UNKNOWN_NOTIFICATION_EVENT_TYPE':
      return NotificationEventType.UNKNOWN_NOTIFICATION_EVENT_TYPE
    case 1:
    case 'DEPLOYMENT_CREATED':
      return NotificationEventType.DEPLOYMENT_CREATED
    case 2:
    case 'VERSION_CREATED':
      return NotificationEventType.VERSION_CREATED
    case 3:
    case 'NODE_ADDED':
      return NotificationEventType.NODE_ADDED
    case 4:
    case 'USER_INVITED':
      return NotificationEventType.USER_INVITED
    case -1:
    case 'UNRECOGNIZED':
    default:
      return NotificationEventType.UNRECOGNIZED
  }
}

export function notificationEventTypeToJSON(object: NotificationEventType): string {
  switch (object) {
    case NotificationEventType.UNKNOWN_NOTIFICATION_EVENT_TYPE:
      return 'UNKNOWN_NOTIFICATION_EVENT_TYPE'
    case NotificationEventType.DEPLOYMENT_CREATED:
      return 'DEPLOYMENT_CREATED'
    case NotificationEventType.VERSION_CREATED:
      return 'VERSION_CREATED'
    case NotificationEventType.NODE_ADDED:
      return 'NODE_ADDED'
    case NotificationEventType.USER_INVITED:
      return 'USER_INVITED'
    case NotificationEventType.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED'
  }
}

export enum ServiceStatus {
  UNKNOWN_SERVICE_STATUS = 0,
  UNAVAILABLE = 1,
  DISRUPTED = 2,
  OPERATIONAL = 3,
  UNRECOGNIZED = -1,
}

export function serviceStatusFromJSON(object: any): ServiceStatus {
  switch (object) {
    case 0:
    case 'UNKNOWN_SERVICE_STATUS':
      return ServiceStatus.UNKNOWN_SERVICE_STATUS
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
    case ServiceStatus.UNKNOWN_SERVICE_STATUS:
      return 'UNKNOWN_SERVICE_STATUS'
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

export interface PrefixRequest {
  prefix: string
}

/** AUDIT */
export interface AuditLogResponse {
  createdAt: Timestamp | undefined
  userId: string
  identityEmail: string
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

export interface UpdateTeamRequest {
  id: string
  accessedBy: string
  name: string
}

export interface UpdateUserRoleInTeamRequest {
  id: string
  accessedBy: string
  userId: string
  role: UserRole
}

export interface InviteUserRequest {
  id: string
  accessedBy: string
  email: string
}

export interface DeleteUserFromTeamRequest {
  id: string
  accessedBy: string
  userId: string
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
  type: RegistryType
}

export interface RegistryListResponse {
  data: RegistryResponse[]
}

export interface HubRegistryDetails {
  imageNamePrefix: string
}

export interface V2RegistryDetails {
  url: string
  user?: string | undefined
  token?: string | undefined
}

export interface GitlabRegistryDetails {
  user: string
  token: string
  imageNamePrefix: string
  url?: string | undefined
  apiUrl?: string | undefined
}

export interface GithubRegistryDetails {
  user: string
  token: string
  imageNamePrefix: string
}

export interface GoogleRegistryDetails {
  url: string
  user?: string | undefined
  token?: string | undefined
  imageNamePrefix: string
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
  google: GoogleRegistryDetails | undefined
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
  google: GoogleRegistryDetails | undefined
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
  google: GoogleRegistryDetails | undefined
}

export interface CreateVersionRequest {
  accessedBy: string
  productId: string
  name: string
  changelog?: string | undefined
  type: VersionType
}

export interface UpdateVersionRequest {
  id: string
  accessedBy: string
  name: string
  changelog?: string | undefined
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
  deployments: DeploymentByVersionResponse[]
}

export interface IncreaseVersionRequest {
  id: string
  accessedBy: string
  name: string
  changelog?: string | undefined
}

export interface ContainerConfig {
  config: ExplicitContainerConfig | undefined
  name: string
  capabilities: UniqueKeyValue[]
  environment: UniqueKeyValue[]
  secrets: UniqueKey[]
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

export interface PatchContainerConfig {
  capabilities?: KeyValueList | undefined
  environment?: KeyValueList | undefined
  secrets?: KeyList | undefined
  config?: ExplicitContainerConfig | undefined
  name?: string | undefined
}

export interface PatchImageRequest {
  id: string
  accessedBy: string
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
  type: NodeType
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

export interface GenerateScriptRequest {
  id: string
  accessedBy: string
  type: NodeType
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

export interface WatchContainerStateRequest {
  accessedBy: string
  nodeId: string
  prefix?: string | undefined
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
  note?: string | undefined
  prefix: string
}

export interface UpdateDeploymentRequest {
  id: string
  accessedBy: string
  note?: string | undefined
  prefix: string
}

export interface PatchDeploymentRequest {
  id: string
  accessedBy: string
  environment?: KeyValueList | undefined
  instance?: PatchInstanceRequest | undefined
}

export interface InstanceContainerConfig {
  config: ExplicitContainerConfig | undefined
  capabilities: UniqueKeyValue[]
  environment: UniqueKeyValue[]
  secrets: UniqueKeySecretValue[]
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
  accessedBy: string
  environment?: KeyValueList | undefined
  capabilities?: KeyValueList | undefined
  config?: ExplicitContainerConfig | undefined
  secrets?: SecretList | undefined
}

export interface DeploymentListResponse {
  data: DeploymentResponse[]
}

export interface DeploymentResponse {
  id: string
  product: string
  productId: string
  version: string
  versionId: string
  node: string
  status: DeploymentStatus
  nodeId: string
  note?: string | undefined
  prefix: string
  updatedAt?: Timestamp | undefined
}

export interface DeploymentListByVersionResponse {
  data: DeploymentByVersionResponse[]
}

export interface DeploymentByVersionResponse {
  id: string
  audit: AuditResponse | undefined
  prefix: string
  nodeId: string
  nodeName: string
  status: DeploymentStatus
  nodeStatus: NodeConnectionStatus
  note?: string | undefined
}

export interface DeploymentDetailsResponse {
  id: string
  audit: AuditResponse | undefined
  productVersionId: string
  nodeId: string
  note?: string | undefined
  prefix: string
  environment: UniqueKeyValue[]
  status: DeploymentStatus
  publicKey?: string | undefined
  instances: InstanceResponse[]
}

export interface DeploymentEventContainerState {
  instanceId: string
  state: ContainerState
}

export interface DeploymentEventLog {
  log: string[]
}

export interface DeploymentEventResponse {
  type: DeploymentEventType
  createdAt: Timestamp | undefined
  log: DeploymentEventLog | undefined
  deploymentStatus: DeploymentStatus | undefined
  containerStatus: DeploymentEventContainerState | undefined
}

export interface DeploymentEventListResponse {
  data: DeploymentEventResponse[]
}

export interface CreateNotificationRequest {
  accessedBy: string
  name: string
  url: string
  type: NotificationType
  active: boolean
  events: NotificationEventType[]
}

export interface CreateNotificationResponse {
  id: string
  creator: string
}

export interface UpdateNotificationRequest {
  id: string
  accessedBy: string
  name: string
  url: string
  type: NotificationType
  active: boolean
  events: NotificationEventType[]
}

export interface NotificationDetailsResponse {
  id: string
  audit: AuditResponse | undefined
  name: string
  url: string
  type: NotificationType
  active: boolean
  events: NotificationEventType[]
}

export interface NotificationResponse {
  id: string
  audit: AuditResponse | undefined
  name: string
  url: string
  type: NotificationType
  active: boolean
  events: NotificationEventType[]
}

export interface NotificationListResponse {
  data: NotificationResponse[]
}

export interface HealthResponse {
  status: ServiceStatus
  cruxVersion: string
  lastMigration?: string | undefined
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

  fromPartial<I extends Exact<DeepPartial<ServiceIdRequest>, I>>(object: I): ServiceIdRequest {
    const message = createBaseServiceIdRequest()
    message.id = object.id ?? ''
    return message
  },
}

function createBaseIdRequest(): IdRequest {
  return { id: '', accessedBy: '' }
}

export const IdRequest = {
  encode(message: IdRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id)
    }
    if (message.accessedBy !== '') {
      writer.uint32(18).string(message.accessedBy)
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
        case 2:
          message.accessedBy = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): IdRequest {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      accessedBy: isSet(object.accessedBy) ? String(object.accessedBy) : '',
    }
  },

  toJSON(message: IdRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<IdRequest>, I>>(object: I): IdRequest {
    const message = createBaseIdRequest()
    message.id = object.id ?? ''
    message.accessedBy = object.accessedBy ?? ''
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

  fromPartial<I extends Exact<DeepPartial<UpdateEntityResponse>, I>>(object: I): UpdateEntityResponse {
    const message = createBaseUpdateEntityResponse()
    message.updatedAt =
      object.updatedAt !== undefined && object.updatedAt !== null ? Timestamp.fromPartial(object.updatedAt) : undefined
    return message
  },
}

function createBasePrefixRequest(): PrefixRequest {
  return { prefix: '' }
}

export const PrefixRequest = {
  encode(message: PrefixRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.prefix !== '') {
      writer.uint32(10).string(message.prefix)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PrefixRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBasePrefixRequest()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.prefix = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): PrefixRequest {
    return { prefix: isSet(object.prefix) ? String(object.prefix) : '' }
  },

  toJSON(message: PrefixRequest): unknown {
    const obj: any = {}
    message.prefix !== undefined && (obj.prefix = message.prefix)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<PrefixRequest>, I>>(object: I): PrefixRequest {
    const message = createBasePrefixRequest()
    message.prefix = object.prefix ?? ''
    return message
  },
}

function createBaseAuditLogResponse(): AuditLogResponse {
  return { createdAt: undefined, userId: '', identityEmail: '', serviceCall: '' }
}

export const AuditLogResponse = {
  encode(message: AuditLogResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.createdAt !== undefined) {
      Timestamp.encode(message.createdAt, writer.uint32(802).fork()).ldelim()
    }
    if (message.userId !== '') {
      writer.uint32(810).string(message.userId)
    }
    if (message.identityEmail !== '') {
      writer.uint32(818).string(message.identityEmail)
    }
    if (message.serviceCall !== '') {
      writer.uint32(826).string(message.serviceCall)
    }
    if (message.data !== undefined) {
      writer.uint32(834).string(message.data)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AuditLogResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseAuditLogResponse()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 100:
          message.createdAt = Timestamp.decode(reader, reader.uint32())
          break
        case 101:
          message.userId = reader.string()
          break
        case 102:
          message.identityEmail = reader.string()
          break
        case 103:
          message.serviceCall = reader.string()
          break
        case 104:
          message.data = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): AuditLogResponse {
    return {
      createdAt: isSet(object.createdAt) ? fromJsonTimestamp(object.createdAt) : undefined,
      userId: isSet(object.userId) ? String(object.userId) : '',
      identityEmail: isSet(object.identityEmail) ? String(object.identityEmail) : '',
      serviceCall: isSet(object.serviceCall) ? String(object.serviceCall) : '',
      data: isSet(object.data) ? String(object.data) : undefined,
    }
  },

  toJSON(message: AuditLogResponse): unknown {
    const obj: any = {}
    message.createdAt !== undefined && (obj.createdAt = fromTimestamp(message.createdAt).toISOString())
    message.userId !== undefined && (obj.userId = message.userId)
    message.identityEmail !== undefined && (obj.identityEmail = message.identityEmail)
    message.serviceCall !== undefined && (obj.serviceCall = message.serviceCall)
    message.data !== undefined && (obj.data = message.data)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<AuditLogResponse>, I>>(object: I): AuditLogResponse {
    const message = createBaseAuditLogResponse()
    message.createdAt =
      object.createdAt !== undefined && object.createdAt !== null ? Timestamp.fromPartial(object.createdAt) : undefined
    message.userId = object.userId ?? ''
    message.identityEmail = object.identityEmail ?? ''
    message.serviceCall = object.serviceCall ?? ''
    message.data = object.data ?? undefined
    return message
  },
}

function createBaseAuditLogListResponse(): AuditLogListResponse {
  return { data: [] }
}

export const AuditLogListResponse = {
  encode(message: AuditLogListResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.data) {
      AuditLogResponse.encode(v!, writer.uint32(8002).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AuditLogListResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseAuditLogListResponse()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1000:
          message.data.push(AuditLogResponse.decode(reader, reader.uint32()))
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): AuditLogListResponse {
    return { data: Array.isArray(object?.data) ? object.data.map((e: any) => AuditLogResponse.fromJSON(e)) : [] }
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

  fromPartial<I extends Exact<DeepPartial<AuditLogListResponse>, I>>(object: I): AuditLogListResponse {
    const message = createBaseAuditLogListResponse()
    message.data = object.data?.map(e => AuditLogResponse.fromPartial(e)) || []
    return message
  },
}

function createBaseCreateTeamRequest(): CreateTeamRequest {
  return { accessedBy: '', name: '' }
}

export const CreateTeamRequest = {
  encode(message: CreateTeamRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.accessedBy !== '') {
      writer.uint32(18).string(message.accessedBy)
    }
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
        case 2:
          message.accessedBy = reader.string()
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

  fromJSON(object: any): CreateTeamRequest {
    return {
      accessedBy: isSet(object.accessedBy) ? String(object.accessedBy) : '',
      name: isSet(object.name) ? String(object.name) : '',
    }
  },

  toJSON(message: CreateTeamRequest): unknown {
    const obj: any = {}
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
    message.name !== undefined && (obj.name = message.name)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<CreateTeamRequest>, I>>(object: I): CreateTeamRequest {
    const message = createBaseCreateTeamRequest()
    message.accessedBy = object.accessedBy ?? ''
    message.name = object.name ?? ''
    return message
  },
}

function createBaseUpdateTeamRequest(): UpdateTeamRequest {
  return { id: '', accessedBy: '', name: '' }
}

export const UpdateTeamRequest = {
  encode(message: UpdateTeamRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id)
    }
    if (message.accessedBy !== '') {
      writer.uint32(18).string(message.accessedBy)
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
        case 2:
          message.accessedBy = reader.string()
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
    return {
      id: isSet(object.id) ? String(object.id) : '',
      accessedBy: isSet(object.accessedBy) ? String(object.accessedBy) : '',
      name: isSet(object.name) ? String(object.name) : '',
    }
  },

  toJSON(message: UpdateTeamRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
    message.name !== undefined && (obj.name = message.name)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<UpdateTeamRequest>, I>>(object: I): UpdateTeamRequest {
    const message = createBaseUpdateTeamRequest()
    message.id = object.id ?? ''
    message.accessedBy = object.accessedBy ?? ''
    message.name = object.name ?? ''
    return message
  },
}

function createBaseUpdateUserRoleInTeamRequest(): UpdateUserRoleInTeamRequest {
  return { id: '', accessedBy: '', userId: '', role: 0 }
}

export const UpdateUserRoleInTeamRequest = {
  encode(message: UpdateUserRoleInTeamRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id)
    }
    if (message.accessedBy !== '') {
      writer.uint32(18).string(message.accessedBy)
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
        case 2:
          message.accessedBy = reader.string()
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
      accessedBy: isSet(object.accessedBy) ? String(object.accessedBy) : '',
      userId: isSet(object.userId) ? String(object.userId) : '',
      role: isSet(object.role) ? userRoleFromJSON(object.role) : 0,
    }
  },

  toJSON(message: UpdateUserRoleInTeamRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
    message.userId !== undefined && (obj.userId = message.userId)
    message.role !== undefined && (obj.role = userRoleToJSON(message.role))
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<UpdateUserRoleInTeamRequest>, I>>(object: I): UpdateUserRoleInTeamRequest {
    const message = createBaseUpdateUserRoleInTeamRequest()
    message.id = object.id ?? ''
    message.accessedBy = object.accessedBy ?? ''
    message.userId = object.userId ?? ''
    message.role = object.role ?? 0
    return message
  },
}

function createBaseInviteUserRequest(): InviteUserRequest {
  return { id: '', accessedBy: '', email: '' }
}

export const InviteUserRequest = {
  encode(message: InviteUserRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id)
    }
    if (message.accessedBy !== '') {
      writer.uint32(18).string(message.accessedBy)
    }
    if (message.email !== '') {
      writer.uint32(802).string(message.email)
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
        case 2:
          message.accessedBy = reader.string()
          break
        case 100:
          message.email = reader.string()
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
      accessedBy: isSet(object.accessedBy) ? String(object.accessedBy) : '',
      email: isSet(object.email) ? String(object.email) : '',
    }
  },

  toJSON(message: InviteUserRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
    message.email !== undefined && (obj.email = message.email)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<InviteUserRequest>, I>>(object: I): InviteUserRequest {
    const message = createBaseInviteUserRequest()
    message.id = object.id ?? ''
    message.accessedBy = object.accessedBy ?? ''
    message.email = object.email ?? ''
    return message
  },
}

function createBaseDeleteUserFromTeamRequest(): DeleteUserFromTeamRequest {
  return { id: '', accessedBy: '', userId: '' }
}

export const DeleteUserFromTeamRequest = {
  encode(message: DeleteUserFromTeamRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id)
    }
    if (message.accessedBy !== '') {
      writer.uint32(18).string(message.accessedBy)
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
        case 2:
          message.accessedBy = reader.string()
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
    return {
      id: isSet(object.id) ? String(object.id) : '',
      accessedBy: isSet(object.accessedBy) ? String(object.accessedBy) : '',
      userId: isSet(object.userId) ? String(object.userId) : '',
    }
  },

  toJSON(message: DeleteUserFromTeamRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
    message.userId !== undefined && (obj.userId = message.userId)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<DeleteUserFromTeamRequest>, I>>(object: I): DeleteUserFromTeamRequest {
    const message = createBaseDeleteUserFromTeamRequest()
    message.id = object.id ?? ''
    message.accessedBy = object.accessedBy ?? ''
    message.userId = object.userId ?? ''
    return message
  },
}

function createBaseAccessRequest(): AccessRequest {
  return { accessedBy: '' }
}

export const AccessRequest = {
  encode(message: AccessRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.accessedBy !== '') {
      writer.uint32(18).string(message.accessedBy)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AccessRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseAccessRequest()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 2:
          message.accessedBy = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): AccessRequest {
    return { accessedBy: isSet(object.accessedBy) ? String(object.accessedBy) : '' }
  },

  toJSON(message: AccessRequest): unknown {
    const obj: any = {}
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<AccessRequest>, I>>(object: I): AccessRequest {
    const message = createBaseAccessRequest()
    message.accessedBy = object.accessedBy ?? ''
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

function createBaseProductDetailsReponse(): ProductDetailsReponse {
  return { id: '', audit: undefined, name: '', type: 0, versions: [] }
}

export const ProductDetailsReponse = {
  encode(message: ProductDetailsReponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
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
    if (message.type !== 0) {
      writer.uint32(816).int32(message.type)
    }
    for (const v of message.versions) {
      VersionResponse.encode(v!, writer.uint32(8002).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ProductDetailsReponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseProductDetailsReponse()
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
          message.type = reader.int32() as any
          break
        case 1000:
          message.versions.push(VersionResponse.decode(reader, reader.uint32()))
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): ProductDetailsReponse {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      audit: isSet(object.audit) ? AuditResponse.fromJSON(object.audit) : undefined,
      name: isSet(object.name) ? String(object.name) : '',
      description: isSet(object.description) ? String(object.description) : undefined,
      type: isSet(object.type) ? productTypeFromJSON(object.type) : 0,
      versions: Array.isArray(object?.versions) ? object.versions.map((e: any) => VersionResponse.fromJSON(e)) : [],
    }
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

  fromPartial<I extends Exact<DeepPartial<ProductDetailsReponse>, I>>(object: I): ProductDetailsReponse {
    const message = createBaseProductDetailsReponse()
    message.id = object.id ?? ''
    message.audit =
      object.audit !== undefined && object.audit !== null ? AuditResponse.fromPartial(object.audit) : undefined
    message.name = object.name ?? ''
    message.description = object.description ?? undefined
    message.type = object.type ?? 0
    message.versions = object.versions?.map(e => VersionResponse.fromPartial(e)) || []
    return message
  },
}

function createBaseProductReponse(): ProductReponse {
  return { id: '', audit: undefined, name: '', type: 0 }
}

export const ProductReponse = {
  encode(message: ProductReponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
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
    if (message.type !== 0) {
      writer.uint32(816).int32(message.type)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ProductReponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseProductReponse()
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
          message.type = reader.int32() as any
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): ProductReponse {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      audit: isSet(object.audit) ? AuditResponse.fromJSON(object.audit) : undefined,
      name: isSet(object.name) ? String(object.name) : '',
      description: isSet(object.description) ? String(object.description) : undefined,
      type: isSet(object.type) ? productTypeFromJSON(object.type) : 0,
    }
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

  fromPartial<I extends Exact<DeepPartial<ProductReponse>, I>>(object: I): ProductReponse {
    const message = createBaseProductReponse()
    message.id = object.id ?? ''
    message.audit =
      object.audit !== undefined && object.audit !== null ? AuditResponse.fromPartial(object.audit) : undefined
    message.name = object.name ?? ''
    message.description = object.description ?? undefined
    message.type = object.type ?? 0
    return message
  },
}

function createBaseProductListResponse(): ProductListResponse {
  return { data: [] }
}

export const ProductListResponse = {
  encode(message: ProductListResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.data) {
      ProductReponse.encode(v!, writer.uint32(8002).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ProductListResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseProductListResponse()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1000:
          message.data.push(ProductReponse.decode(reader, reader.uint32()))
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): ProductListResponse {
    return { data: Array.isArray(object?.data) ? object.data.map((e: any) => ProductReponse.fromJSON(e)) : [] }
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

  fromPartial<I extends Exact<DeepPartial<ProductListResponse>, I>>(object: I): ProductListResponse {
    const message = createBaseProductListResponse()
    message.data = object.data?.map(e => ProductReponse.fromPartial(e)) || []
    return message
  },
}

function createBaseCreateProductRequest(): CreateProductRequest {
  return { accessedBy: '', name: '', type: 0 }
}

export const CreateProductRequest = {
  encode(message: CreateProductRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.accessedBy !== '') {
      writer.uint32(18).string(message.accessedBy)
    }
    if (message.name !== '') {
      writer.uint32(802).string(message.name)
    }
    if (message.description !== undefined) {
      writer.uint32(810).string(message.description)
    }
    if (message.type !== 0) {
      writer.uint32(816).int32(message.type)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CreateProductRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseCreateProductRequest()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 2:
          message.accessedBy = reader.string()
          break
        case 100:
          message.name = reader.string()
          break
        case 101:
          message.description = reader.string()
          break
        case 102:
          message.type = reader.int32() as any
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): CreateProductRequest {
    return {
      accessedBy: isSet(object.accessedBy) ? String(object.accessedBy) : '',
      name: isSet(object.name) ? String(object.name) : '',
      description: isSet(object.description) ? String(object.description) : undefined,
      type: isSet(object.type) ? productTypeFromJSON(object.type) : 0,
    }
  },

  toJSON(message: CreateProductRequest): unknown {
    const obj: any = {}
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
    message.name !== undefined && (obj.name = message.name)
    message.description !== undefined && (obj.description = message.description)
    message.type !== undefined && (obj.type = productTypeToJSON(message.type))
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<CreateProductRequest>, I>>(object: I): CreateProductRequest {
    const message = createBaseCreateProductRequest()
    message.accessedBy = object.accessedBy ?? ''
    message.name = object.name ?? ''
    message.description = object.description ?? undefined
    message.type = object.type ?? 0
    return message
  },
}

function createBaseUpdateProductRequest(): UpdateProductRequest {
  return { id: '', accessedBy: '', name: '' }
}

export const UpdateProductRequest = {
  encode(message: UpdateProductRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id)
    }
    if (message.accessedBy !== '') {
      writer.uint32(18).string(message.accessedBy)
    }
    if (message.name !== '') {
      writer.uint32(802).string(message.name)
    }
    if (message.description !== undefined) {
      writer.uint32(810).string(message.description)
    }
    if (message.changelog !== undefined) {
      writer.uint32(818).string(message.changelog)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UpdateProductRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseUpdateProductRequest()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string()
          break
        case 2:
          message.accessedBy = reader.string()
          break
        case 100:
          message.name = reader.string()
          break
        case 101:
          message.description = reader.string()
          break
        case 102:
          message.changelog = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): UpdateProductRequest {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      accessedBy: isSet(object.accessedBy) ? String(object.accessedBy) : '',
      name: isSet(object.name) ? String(object.name) : '',
      description: isSet(object.description) ? String(object.description) : undefined,
      changelog: isSet(object.changelog) ? String(object.changelog) : undefined,
    }
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

  fromPartial<I extends Exact<DeepPartial<UpdateProductRequest>, I>>(object: I): UpdateProductRequest {
    const message = createBaseUpdateProductRequest()
    message.id = object.id ?? ''
    message.accessedBy = object.accessedBy ?? ''
    message.name = object.name ?? ''
    message.description = object.description ?? undefined
    message.changelog = object.changelog ?? undefined
    return message
  },
}

function createBaseRegistryResponse(): RegistryResponse {
  return { id: '', audit: undefined, name: '', url: '', type: 0 }
}

export const RegistryResponse = {
  encode(message: RegistryResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
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
    if (message.url !== '') {
      writer.uint32(826).string(message.url)
    }
    if (message.type !== 0) {
      writer.uint32(832).int32(message.type)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RegistryResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseRegistryResponse()
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
          message.url = reader.string()
          break
        case 104:
          message.type = reader.int32() as any
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): RegistryResponse {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      audit: isSet(object.audit) ? AuditResponse.fromJSON(object.audit) : undefined,
      name: isSet(object.name) ? String(object.name) : '',
      description: isSet(object.description) ? String(object.description) : undefined,
      icon: isSet(object.icon) ? String(object.icon) : undefined,
      url: isSet(object.url) ? String(object.url) : '',
      type: isSet(object.type) ? registryTypeFromJSON(object.type) : 0,
    }
  },

  toJSON(message: RegistryResponse): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.audit !== undefined && (obj.audit = message.audit ? AuditResponse.toJSON(message.audit) : undefined)
    message.name !== undefined && (obj.name = message.name)
    message.description !== undefined && (obj.description = message.description)
    message.icon !== undefined && (obj.icon = message.icon)
    message.url !== undefined && (obj.url = message.url)
    message.type !== undefined && (obj.type = registryTypeToJSON(message.type))
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<RegistryResponse>, I>>(object: I): RegistryResponse {
    const message = createBaseRegistryResponse()
    message.id = object.id ?? ''
    message.audit =
      object.audit !== undefined && object.audit !== null ? AuditResponse.fromPartial(object.audit) : undefined
    message.name = object.name ?? ''
    message.description = object.description ?? undefined
    message.icon = object.icon ?? undefined
    message.url = object.url ?? ''
    message.type = object.type ?? 0
    return message
  },
}

function createBaseRegistryListResponse(): RegistryListResponse {
  return { data: [] }
}

export const RegistryListResponse = {
  encode(message: RegistryListResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.data) {
      RegistryResponse.encode(v!, writer.uint32(8002).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RegistryListResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseRegistryListResponse()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1000:
          message.data.push(RegistryResponse.decode(reader, reader.uint32()))
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): RegistryListResponse {
    return { data: Array.isArray(object?.data) ? object.data.map((e: any) => RegistryResponse.fromJSON(e)) : [] }
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

  fromPartial<I extends Exact<DeepPartial<RegistryListResponse>, I>>(object: I): RegistryListResponse {
    const message = createBaseRegistryListResponse()
    message.data = object.data?.map(e => RegistryResponse.fromPartial(e)) || []
    return message
  },
}

function createBaseHubRegistryDetails(): HubRegistryDetails {
  return { imageNamePrefix: '' }
}

export const HubRegistryDetails = {
  encode(message: HubRegistryDetails, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.imageNamePrefix !== '') {
      writer.uint32(802).string(message.imageNamePrefix)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): HubRegistryDetails {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseHubRegistryDetails()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 100:
          message.imageNamePrefix = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): HubRegistryDetails {
    return { imageNamePrefix: isSet(object.imageNamePrefix) ? String(object.imageNamePrefix) : '' }
  },

  toJSON(message: HubRegistryDetails): unknown {
    const obj: any = {}
    message.imageNamePrefix !== undefined && (obj.imageNamePrefix = message.imageNamePrefix)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<HubRegistryDetails>, I>>(object: I): HubRegistryDetails {
    const message = createBaseHubRegistryDetails()
    message.imageNamePrefix = object.imageNamePrefix ?? ''
    return message
  },
}

function createBaseV2RegistryDetails(): V2RegistryDetails {
  return { url: '' }
}

export const V2RegistryDetails = {
  encode(message: V2RegistryDetails, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.url !== '') {
      writer.uint32(802).string(message.url)
    }
    if (message.user !== undefined) {
      writer.uint32(810).string(message.user)
    }
    if (message.token !== undefined) {
      writer.uint32(818).string(message.token)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): V2RegistryDetails {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseV2RegistryDetails()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 100:
          message.url = reader.string()
          break
        case 101:
          message.user = reader.string()
          break
        case 102:
          message.token = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): V2RegistryDetails {
    return {
      url: isSet(object.url) ? String(object.url) : '',
      user: isSet(object.user) ? String(object.user) : undefined,
      token: isSet(object.token) ? String(object.token) : undefined,
    }
  },

  toJSON(message: V2RegistryDetails): unknown {
    const obj: any = {}
    message.url !== undefined && (obj.url = message.url)
    message.user !== undefined && (obj.user = message.user)
    message.token !== undefined && (obj.token = message.token)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<V2RegistryDetails>, I>>(object: I): V2RegistryDetails {
    const message = createBaseV2RegistryDetails()
    message.url = object.url ?? ''
    message.user = object.user ?? undefined
    message.token = object.token ?? undefined
    return message
  },
}

function createBaseGitlabRegistryDetails(): GitlabRegistryDetails {
  return { user: '', token: '', imageNamePrefix: '' }
}

export const GitlabRegistryDetails = {
  encode(message: GitlabRegistryDetails, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.user !== '') {
      writer.uint32(802).string(message.user)
    }
    if (message.token !== '') {
      writer.uint32(810).string(message.token)
    }
    if (message.imageNamePrefix !== '') {
      writer.uint32(818).string(message.imageNamePrefix)
    }
    if (message.url !== undefined) {
      writer.uint32(826).string(message.url)
    }
    if (message.apiUrl !== undefined) {
      writer.uint32(834).string(message.apiUrl)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GitlabRegistryDetails {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseGitlabRegistryDetails()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 100:
          message.user = reader.string()
          break
        case 101:
          message.token = reader.string()
          break
        case 102:
          message.imageNamePrefix = reader.string()
          break
        case 103:
          message.url = reader.string()
          break
        case 104:
          message.apiUrl = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): GitlabRegistryDetails {
    return {
      user: isSet(object.user) ? String(object.user) : '',
      token: isSet(object.token) ? String(object.token) : '',
      imageNamePrefix: isSet(object.imageNamePrefix) ? String(object.imageNamePrefix) : '',
      url: isSet(object.url) ? String(object.url) : undefined,
      apiUrl: isSet(object.apiUrl) ? String(object.apiUrl) : undefined,
    }
  },

  toJSON(message: GitlabRegistryDetails): unknown {
    const obj: any = {}
    message.user !== undefined && (obj.user = message.user)
    message.token !== undefined && (obj.token = message.token)
    message.imageNamePrefix !== undefined && (obj.imageNamePrefix = message.imageNamePrefix)
    message.url !== undefined && (obj.url = message.url)
    message.apiUrl !== undefined && (obj.apiUrl = message.apiUrl)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<GitlabRegistryDetails>, I>>(object: I): GitlabRegistryDetails {
    const message = createBaseGitlabRegistryDetails()
    message.user = object.user ?? ''
    message.token = object.token ?? ''
    message.imageNamePrefix = object.imageNamePrefix ?? ''
    message.url = object.url ?? undefined
    message.apiUrl = object.apiUrl ?? undefined
    return message
  },
}

function createBaseGithubRegistryDetails(): GithubRegistryDetails {
  return { user: '', token: '', imageNamePrefix: '' }
}

export const GithubRegistryDetails = {
  encode(message: GithubRegistryDetails, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.user !== '') {
      writer.uint32(802).string(message.user)
    }
    if (message.token !== '') {
      writer.uint32(810).string(message.token)
    }
    if (message.imageNamePrefix !== '') {
      writer.uint32(818).string(message.imageNamePrefix)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GithubRegistryDetails {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseGithubRegistryDetails()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 100:
          message.user = reader.string()
          break
        case 101:
          message.token = reader.string()
          break
        case 102:
          message.imageNamePrefix = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): GithubRegistryDetails {
    return {
      user: isSet(object.user) ? String(object.user) : '',
      token: isSet(object.token) ? String(object.token) : '',
      imageNamePrefix: isSet(object.imageNamePrefix) ? String(object.imageNamePrefix) : '',
    }
  },

  toJSON(message: GithubRegistryDetails): unknown {
    const obj: any = {}
    message.user !== undefined && (obj.user = message.user)
    message.token !== undefined && (obj.token = message.token)
    message.imageNamePrefix !== undefined && (obj.imageNamePrefix = message.imageNamePrefix)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<GithubRegistryDetails>, I>>(object: I): GithubRegistryDetails {
    const message = createBaseGithubRegistryDetails()
    message.user = object.user ?? ''
    message.token = object.token ?? ''
    message.imageNamePrefix = object.imageNamePrefix ?? ''
    return message
  },
}

function createBaseGoogleRegistryDetails(): GoogleRegistryDetails {
  return { url: '', imageNamePrefix: '' }
}

export const GoogleRegistryDetails = {
  encode(message: GoogleRegistryDetails, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.url !== '') {
      writer.uint32(802).string(message.url)
    }
    if (message.user !== undefined) {
      writer.uint32(810).string(message.user)
    }
    if (message.token !== undefined) {
      writer.uint32(818).string(message.token)
    }
    if (message.imageNamePrefix !== '') {
      writer.uint32(826).string(message.imageNamePrefix)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GoogleRegistryDetails {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseGoogleRegistryDetails()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 100:
          message.url = reader.string()
          break
        case 101:
          message.user = reader.string()
          break
        case 102:
          message.token = reader.string()
          break
        case 103:
          message.imageNamePrefix = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): GoogleRegistryDetails {
    return {
      url: isSet(object.url) ? String(object.url) : '',
      user: isSet(object.user) ? String(object.user) : undefined,
      token: isSet(object.token) ? String(object.token) : undefined,
      imageNamePrefix: isSet(object.imageNamePrefix) ? String(object.imageNamePrefix) : '',
    }
  },

  toJSON(message: GoogleRegistryDetails): unknown {
    const obj: any = {}
    message.url !== undefined && (obj.url = message.url)
    message.user !== undefined && (obj.user = message.user)
    message.token !== undefined && (obj.token = message.token)
    message.imageNamePrefix !== undefined && (obj.imageNamePrefix = message.imageNamePrefix)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<GoogleRegistryDetails>, I>>(object: I): GoogleRegistryDetails {
    const message = createBaseGoogleRegistryDetails()
    message.url = object.url ?? ''
    message.user = object.user ?? undefined
    message.token = object.token ?? undefined
    message.imageNamePrefix = object.imageNamePrefix ?? ''
    return message
  },
}

function createBaseCreateRegistryRequest(): CreateRegistryRequest {
  return {
    accessedBy: '',
    name: '',
    hub: undefined,
    v2: undefined,
    gitlab: undefined,
    github: undefined,
    google: undefined,
  }
}

export const CreateRegistryRequest = {
  encode(message: CreateRegistryRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.accessedBy !== '') {
      writer.uint32(18).string(message.accessedBy)
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
    if (message.hub !== undefined) {
      HubRegistryDetails.encode(message.hub, writer.uint32(1602).fork()).ldelim()
    }
    if (message.v2 !== undefined) {
      V2RegistryDetails.encode(message.v2, writer.uint32(1610).fork()).ldelim()
    }
    if (message.gitlab !== undefined) {
      GitlabRegistryDetails.encode(message.gitlab, writer.uint32(1618).fork()).ldelim()
    }
    if (message.github !== undefined) {
      GithubRegistryDetails.encode(message.github, writer.uint32(1626).fork()).ldelim()
    }
    if (message.google !== undefined) {
      GoogleRegistryDetails.encode(message.google, writer.uint32(1634).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CreateRegistryRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseCreateRegistryRequest()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 2:
          message.accessedBy = reader.string()
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
        case 200:
          message.hub = HubRegistryDetails.decode(reader, reader.uint32())
          break
        case 201:
          message.v2 = V2RegistryDetails.decode(reader, reader.uint32())
          break
        case 202:
          message.gitlab = GitlabRegistryDetails.decode(reader, reader.uint32())
          break
        case 203:
          message.github = GithubRegistryDetails.decode(reader, reader.uint32())
          break
        case 204:
          message.google = GoogleRegistryDetails.decode(reader, reader.uint32())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): CreateRegistryRequest {
    return {
      accessedBy: isSet(object.accessedBy) ? String(object.accessedBy) : '',
      name: isSet(object.name) ? String(object.name) : '',
      description: isSet(object.description) ? String(object.description) : undefined,
      icon: isSet(object.icon) ? String(object.icon) : undefined,
      hub: isSet(object.hub) ? HubRegistryDetails.fromJSON(object.hub) : undefined,
      v2: isSet(object.v2) ? V2RegistryDetails.fromJSON(object.v2) : undefined,
      gitlab: isSet(object.gitlab) ? GitlabRegistryDetails.fromJSON(object.gitlab) : undefined,
      github: isSet(object.github) ? GithubRegistryDetails.fromJSON(object.github) : undefined,
      google: isSet(object.google) ? GoogleRegistryDetails.fromJSON(object.google) : undefined,
    }
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
    message.google !== undefined &&
      (obj.google = message.google ? GoogleRegistryDetails.toJSON(message.google) : undefined)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<CreateRegistryRequest>, I>>(object: I): CreateRegistryRequest {
    const message = createBaseCreateRegistryRequest()
    message.accessedBy = object.accessedBy ?? ''
    message.name = object.name ?? ''
    message.description = object.description ?? undefined
    message.icon = object.icon ?? undefined
    message.hub =
      object.hub !== undefined && object.hub !== null ? HubRegistryDetails.fromPartial(object.hub) : undefined
    message.v2 = object.v2 !== undefined && object.v2 !== null ? V2RegistryDetails.fromPartial(object.v2) : undefined
    message.gitlab =
      object.gitlab !== undefined && object.gitlab !== null
        ? GitlabRegistryDetails.fromPartial(object.gitlab)
        : undefined
    message.github =
      object.github !== undefined && object.github !== null
        ? GithubRegistryDetails.fromPartial(object.github)
        : undefined
    message.google =
      object.google !== undefined && object.google !== null
        ? GoogleRegistryDetails.fromPartial(object.google)
        : undefined
    return message
  },
}

function createBaseUpdateRegistryRequest(): UpdateRegistryRequest {
  return {
    id: '',
    accessedBy: '',
    name: '',
    hub: undefined,
    v2: undefined,
    gitlab: undefined,
    github: undefined,
    google: undefined,
  }
}

export const UpdateRegistryRequest = {
  encode(message: UpdateRegistryRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id)
    }
    if (message.accessedBy !== '') {
      writer.uint32(18).string(message.accessedBy)
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
    if (message.hub !== undefined) {
      HubRegistryDetails.encode(message.hub, writer.uint32(1602).fork()).ldelim()
    }
    if (message.v2 !== undefined) {
      V2RegistryDetails.encode(message.v2, writer.uint32(1610).fork()).ldelim()
    }
    if (message.gitlab !== undefined) {
      GitlabRegistryDetails.encode(message.gitlab, writer.uint32(1618).fork()).ldelim()
    }
    if (message.github !== undefined) {
      GithubRegistryDetails.encode(message.github, writer.uint32(1626).fork()).ldelim()
    }
    if (message.google !== undefined) {
      GoogleRegistryDetails.encode(message.google, writer.uint32(1634).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UpdateRegistryRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseUpdateRegistryRequest()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string()
          break
        case 2:
          message.accessedBy = reader.string()
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
        case 200:
          message.hub = HubRegistryDetails.decode(reader, reader.uint32())
          break
        case 201:
          message.v2 = V2RegistryDetails.decode(reader, reader.uint32())
          break
        case 202:
          message.gitlab = GitlabRegistryDetails.decode(reader, reader.uint32())
          break
        case 203:
          message.github = GithubRegistryDetails.decode(reader, reader.uint32())
          break
        case 204:
          message.google = GoogleRegistryDetails.decode(reader, reader.uint32())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): UpdateRegistryRequest {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      accessedBy: isSet(object.accessedBy) ? String(object.accessedBy) : '',
      name: isSet(object.name) ? String(object.name) : '',
      description: isSet(object.description) ? String(object.description) : undefined,
      icon: isSet(object.icon) ? String(object.icon) : undefined,
      hub: isSet(object.hub) ? HubRegistryDetails.fromJSON(object.hub) : undefined,
      v2: isSet(object.v2) ? V2RegistryDetails.fromJSON(object.v2) : undefined,
      gitlab: isSet(object.gitlab) ? GitlabRegistryDetails.fromJSON(object.gitlab) : undefined,
      github: isSet(object.github) ? GithubRegistryDetails.fromJSON(object.github) : undefined,
      google: isSet(object.google) ? GoogleRegistryDetails.fromJSON(object.google) : undefined,
    }
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
    message.google !== undefined &&
      (obj.google = message.google ? GoogleRegistryDetails.toJSON(message.google) : undefined)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<UpdateRegistryRequest>, I>>(object: I): UpdateRegistryRequest {
    const message = createBaseUpdateRegistryRequest()
    message.id = object.id ?? ''
    message.accessedBy = object.accessedBy ?? ''
    message.name = object.name ?? ''
    message.description = object.description ?? undefined
    message.icon = object.icon ?? undefined
    message.hub =
      object.hub !== undefined && object.hub !== null ? HubRegistryDetails.fromPartial(object.hub) : undefined
    message.v2 = object.v2 !== undefined && object.v2 !== null ? V2RegistryDetails.fromPartial(object.v2) : undefined
    message.gitlab =
      object.gitlab !== undefined && object.gitlab !== null
        ? GitlabRegistryDetails.fromPartial(object.gitlab)
        : undefined
    message.github =
      object.github !== undefined && object.github !== null
        ? GithubRegistryDetails.fromPartial(object.github)
        : undefined
    message.google =
      object.google !== undefined && object.google !== null
        ? GoogleRegistryDetails.fromPartial(object.google)
        : undefined
    return message
  },
}

function createBaseRegistryDetailsResponse(): RegistryDetailsResponse {
  return {
    id: '',
    audit: undefined,
    name: '',
    hub: undefined,
    v2: undefined,
    gitlab: undefined,
    github: undefined,
    google: undefined,
  }
}

export const RegistryDetailsResponse = {
  encode(message: RegistryDetailsResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
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
    if (message.hub !== undefined) {
      HubRegistryDetails.encode(message.hub, writer.uint32(1602).fork()).ldelim()
    }
    if (message.v2 !== undefined) {
      V2RegistryDetails.encode(message.v2, writer.uint32(1610).fork()).ldelim()
    }
    if (message.gitlab !== undefined) {
      GitlabRegistryDetails.encode(message.gitlab, writer.uint32(1618).fork()).ldelim()
    }
    if (message.github !== undefined) {
      GithubRegistryDetails.encode(message.github, writer.uint32(1626).fork()).ldelim()
    }
    if (message.google !== undefined) {
      GoogleRegistryDetails.encode(message.google, writer.uint32(1634).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RegistryDetailsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseRegistryDetailsResponse()
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
        case 200:
          message.hub = HubRegistryDetails.decode(reader, reader.uint32())
          break
        case 201:
          message.v2 = V2RegistryDetails.decode(reader, reader.uint32())
          break
        case 202:
          message.gitlab = GitlabRegistryDetails.decode(reader, reader.uint32())
          break
        case 203:
          message.github = GithubRegistryDetails.decode(reader, reader.uint32())
          break
        case 204:
          message.google = GoogleRegistryDetails.decode(reader, reader.uint32())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): RegistryDetailsResponse {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      audit: isSet(object.audit) ? AuditResponse.fromJSON(object.audit) : undefined,
      name: isSet(object.name) ? String(object.name) : '',
      description: isSet(object.description) ? String(object.description) : undefined,
      icon: isSet(object.icon) ? String(object.icon) : undefined,
      hub: isSet(object.hub) ? HubRegistryDetails.fromJSON(object.hub) : undefined,
      v2: isSet(object.v2) ? V2RegistryDetails.fromJSON(object.v2) : undefined,
      gitlab: isSet(object.gitlab) ? GitlabRegistryDetails.fromJSON(object.gitlab) : undefined,
      github: isSet(object.github) ? GithubRegistryDetails.fromJSON(object.github) : undefined,
      google: isSet(object.google) ? GoogleRegistryDetails.fromJSON(object.google) : undefined,
    }
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
    message.google !== undefined &&
      (obj.google = message.google ? GoogleRegistryDetails.toJSON(message.google) : undefined)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<RegistryDetailsResponse>, I>>(object: I): RegistryDetailsResponse {
    const message = createBaseRegistryDetailsResponse()
    message.id = object.id ?? ''
    message.audit =
      object.audit !== undefined && object.audit !== null ? AuditResponse.fromPartial(object.audit) : undefined
    message.name = object.name ?? ''
    message.description = object.description ?? undefined
    message.icon = object.icon ?? undefined
    message.hub =
      object.hub !== undefined && object.hub !== null ? HubRegistryDetails.fromPartial(object.hub) : undefined
    message.v2 = object.v2 !== undefined && object.v2 !== null ? V2RegistryDetails.fromPartial(object.v2) : undefined
    message.gitlab =
      object.gitlab !== undefined && object.gitlab !== null
        ? GitlabRegistryDetails.fromPartial(object.gitlab)
        : undefined
    message.github =
      object.github !== undefined && object.github !== null
        ? GithubRegistryDetails.fromPartial(object.github)
        : undefined
    message.google =
      object.google !== undefined && object.google !== null
        ? GoogleRegistryDetails.fromPartial(object.google)
        : undefined
    return message
  },
}

function createBaseCreateVersionRequest(): CreateVersionRequest {
  return { accessedBy: '', productId: '', name: '', type: 0 }
}

export const CreateVersionRequest = {
  encode(message: CreateVersionRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.accessedBy !== '') {
      writer.uint32(18).string(message.accessedBy)
    }
    if (message.productId !== '') {
      writer.uint32(802).string(message.productId)
    }
    if (message.name !== '') {
      writer.uint32(810).string(message.name)
    }
    if (message.changelog !== undefined) {
      writer.uint32(818).string(message.changelog)
    }
    if (message.type !== 0) {
      writer.uint32(832).int32(message.type)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CreateVersionRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseCreateVersionRequest()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 2:
          message.accessedBy = reader.string()
          break
        case 100:
          message.productId = reader.string()
          break
        case 101:
          message.name = reader.string()
          break
        case 102:
          message.changelog = reader.string()
          break
        case 104:
          message.type = reader.int32() as any
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): CreateVersionRequest {
    return {
      accessedBy: isSet(object.accessedBy) ? String(object.accessedBy) : '',
      productId: isSet(object.productId) ? String(object.productId) : '',
      name: isSet(object.name) ? String(object.name) : '',
      changelog: isSet(object.changelog) ? String(object.changelog) : undefined,
      type: isSet(object.type) ? versionTypeFromJSON(object.type) : 0,
    }
  },

  toJSON(message: CreateVersionRequest): unknown {
    const obj: any = {}
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
    message.productId !== undefined && (obj.productId = message.productId)
    message.name !== undefined && (obj.name = message.name)
    message.changelog !== undefined && (obj.changelog = message.changelog)
    message.type !== undefined && (obj.type = versionTypeToJSON(message.type))
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<CreateVersionRequest>, I>>(object: I): CreateVersionRequest {
    const message = createBaseCreateVersionRequest()
    message.accessedBy = object.accessedBy ?? ''
    message.productId = object.productId ?? ''
    message.name = object.name ?? ''
    message.changelog = object.changelog ?? undefined
    message.type = object.type ?? 0
    return message
  },
}

function createBaseUpdateVersionRequest(): UpdateVersionRequest {
  return { id: '', accessedBy: '', name: '' }
}

export const UpdateVersionRequest = {
  encode(message: UpdateVersionRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id)
    }
    if (message.accessedBy !== '') {
      writer.uint32(18).string(message.accessedBy)
    }
    if (message.name !== '') {
      writer.uint32(802).string(message.name)
    }
    if (message.changelog !== undefined) {
      writer.uint32(810).string(message.changelog)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UpdateVersionRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseUpdateVersionRequest()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string()
          break
        case 2:
          message.accessedBy = reader.string()
          break
        case 100:
          message.name = reader.string()
          break
        case 101:
          message.changelog = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): UpdateVersionRequest {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      accessedBy: isSet(object.accessedBy) ? String(object.accessedBy) : '',
      name: isSet(object.name) ? String(object.name) : '',
      changelog: isSet(object.changelog) ? String(object.changelog) : undefined,
    }
  },

  toJSON(message: UpdateVersionRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
    message.name !== undefined && (obj.name = message.name)
    message.changelog !== undefined && (obj.changelog = message.changelog)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<UpdateVersionRequest>, I>>(object: I): UpdateVersionRequest {
    const message = createBaseUpdateVersionRequest()
    message.id = object.id ?? ''
    message.accessedBy = object.accessedBy ?? ''
    message.name = object.name ?? ''
    message.changelog = object.changelog ?? undefined
    return message
  },
}

function createBaseVersionResponse(): VersionResponse {
  return { id: '', audit: undefined, name: '', changelog: '', default: false, type: 0, increasable: false }
}

export const VersionResponse = {
  encode(message: VersionResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id)
    }
    if (message.audit !== undefined) {
      AuditResponse.encode(message.audit, writer.uint32(18).fork()).ldelim()
    }
    if (message.name !== '') {
      writer.uint32(802).string(message.name)
    }
    if (message.changelog !== '') {
      writer.uint32(810).string(message.changelog)
    }
    if (message.default === true) {
      writer.uint32(816).bool(message.default)
    }
    if (message.type !== 0) {
      writer.uint32(824).int32(message.type)
    }
    if (message.increasable === true) {
      writer.uint32(832).bool(message.increasable)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): VersionResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseVersionResponse()
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
          message.changelog = reader.string()
          break
        case 102:
          message.default = reader.bool()
          break
        case 103:
          message.type = reader.int32() as any
          break
        case 104:
          message.increasable = reader.bool()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): VersionResponse {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      audit: isSet(object.audit) ? AuditResponse.fromJSON(object.audit) : undefined,
      name: isSet(object.name) ? String(object.name) : '',
      changelog: isSet(object.changelog) ? String(object.changelog) : '',
      default: isSet(object.default) ? Boolean(object.default) : false,
      type: isSet(object.type) ? versionTypeFromJSON(object.type) : 0,
      increasable: isSet(object.increasable) ? Boolean(object.increasable) : false,
    }
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

  fromPartial<I extends Exact<DeepPartial<VersionResponse>, I>>(object: I): VersionResponse {
    const message = createBaseVersionResponse()
    message.id = object.id ?? ''
    message.audit =
      object.audit !== undefined && object.audit !== null ? AuditResponse.fromPartial(object.audit) : undefined
    message.name = object.name ?? ''
    message.changelog = object.changelog ?? ''
    message.default = object.default ?? false
    message.type = object.type ?? 0
    message.increasable = object.increasable ?? false
    return message
  },
}

function createBaseVersionListResponse(): VersionListResponse {
  return { data: [] }
}

export const VersionListResponse = {
  encode(message: VersionListResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.data) {
      VersionResponse.encode(v!, writer.uint32(8002).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): VersionListResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseVersionListResponse()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1000:
          message.data.push(VersionResponse.decode(reader, reader.uint32()))
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): VersionListResponse {
    return { data: Array.isArray(object?.data) ? object.data.map((e: any) => VersionResponse.fromJSON(e)) : [] }
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

  fromPartial<I extends Exact<DeepPartial<VersionListResponse>, I>>(object: I): VersionListResponse {
    const message = createBaseVersionListResponse()
    message.data = object.data?.map(e => VersionResponse.fromPartial(e)) || []
    return message
  },
}

function createBaseVersionDetailsResponse(): VersionDetailsResponse {
  return {
    id: '',
    audit: undefined,
    name: '',
    changelog: '',
    default: false,
    type: 0,
    mutable: false,
    increasable: false,
    images: [],
    deployments: [],
  }
}

export const VersionDetailsResponse = {
  encode(message: VersionDetailsResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id)
    }
    if (message.audit !== undefined) {
      AuditResponse.encode(message.audit, writer.uint32(18).fork()).ldelim()
    }
    if (message.name !== '') {
      writer.uint32(802).string(message.name)
    }
    if (message.changelog !== '') {
      writer.uint32(810).string(message.changelog)
    }
    if (message.default === true) {
      writer.uint32(816).bool(message.default)
    }
    if (message.type !== 0) {
      writer.uint32(824).int32(message.type)
    }
    if (message.mutable === true) {
      writer.uint32(832).bool(message.mutable)
    }
    if (message.increasable === true) {
      writer.uint32(840).bool(message.increasable)
    }
    for (const v of message.images) {
      ImageResponse.encode(v!, writer.uint32(8002).fork()).ldelim()
    }
    for (const v of message.deployments) {
      DeploymentByVersionResponse.encode(v!, writer.uint32(8010).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): VersionDetailsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseVersionDetailsResponse()
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
          message.changelog = reader.string()
          break
        case 102:
          message.default = reader.bool()
          break
        case 103:
          message.type = reader.int32() as any
          break
        case 104:
          message.mutable = reader.bool()
          break
        case 105:
          message.increasable = reader.bool()
          break
        case 1000:
          message.images.push(ImageResponse.decode(reader, reader.uint32()))
          break
        case 1001:
          message.deployments.push(DeploymentByVersionResponse.decode(reader, reader.uint32()))
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): VersionDetailsResponse {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      audit: isSet(object.audit) ? AuditResponse.fromJSON(object.audit) : undefined,
      name: isSet(object.name) ? String(object.name) : '',
      changelog: isSet(object.changelog) ? String(object.changelog) : '',
      default: isSet(object.default) ? Boolean(object.default) : false,
      type: isSet(object.type) ? versionTypeFromJSON(object.type) : 0,
      mutable: isSet(object.mutable) ? Boolean(object.mutable) : false,
      increasable: isSet(object.increasable) ? Boolean(object.increasable) : false,
      images: Array.isArray(object?.images) ? object.images.map((e: any) => ImageResponse.fromJSON(e)) : [],
      deployments: Array.isArray(object?.deployments)
        ? object.deployments.map((e: any) => DeploymentByVersionResponse.fromJSON(e))
        : [],
    }
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
      obj.deployments = message.deployments.map(e => (e ? DeploymentByVersionResponse.toJSON(e) : undefined))
    } else {
      obj.deployments = []
    }
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<VersionDetailsResponse>, I>>(object: I): VersionDetailsResponse {
    const message = createBaseVersionDetailsResponse()
    message.id = object.id ?? ''
    message.audit =
      object.audit !== undefined && object.audit !== null ? AuditResponse.fromPartial(object.audit) : undefined
    message.name = object.name ?? ''
    message.changelog = object.changelog ?? ''
    message.default = object.default ?? false
    message.type = object.type ?? 0
    message.mutable = object.mutable ?? false
    message.increasable = object.increasable ?? false
    message.images = object.images?.map(e => ImageResponse.fromPartial(e)) || []
    message.deployments = object.deployments?.map(e => DeploymentByVersionResponse.fromPartial(e)) || []
    return message
  },
}

function createBaseIncreaseVersionRequest(): IncreaseVersionRequest {
  return { id: '', accessedBy: '', name: '' }
}

export const IncreaseVersionRequest = {
  encode(message: IncreaseVersionRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id)
    }
    if (message.accessedBy !== '') {
      writer.uint32(18).string(message.accessedBy)
    }
    if (message.name !== '') {
      writer.uint32(802).string(message.name)
    }
    if (message.changelog !== undefined) {
      writer.uint32(810).string(message.changelog)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): IncreaseVersionRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseIncreaseVersionRequest()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string()
          break
        case 2:
          message.accessedBy = reader.string()
          break
        case 100:
          message.name = reader.string()
          break
        case 101:
          message.changelog = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): IncreaseVersionRequest {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      accessedBy: isSet(object.accessedBy) ? String(object.accessedBy) : '',
      name: isSet(object.name) ? String(object.name) : '',
      changelog: isSet(object.changelog) ? String(object.changelog) : undefined,
    }
  },

  toJSON(message: IncreaseVersionRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
    message.name !== undefined && (obj.name = message.name)
    message.changelog !== undefined && (obj.changelog = message.changelog)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<IncreaseVersionRequest>, I>>(object: I): IncreaseVersionRequest {
    const message = createBaseIncreaseVersionRequest()
    message.id = object.id ?? ''
    message.accessedBy = object.accessedBy ?? ''
    message.name = object.name ?? ''
    message.changelog = object.changelog ?? undefined
    return message
  },
}

function createBaseContainerConfig(): ContainerConfig {
  return { config: undefined, name: '', capabilities: [], environment: [], secrets: [] }
}

export const ContainerConfig = {
  encode(message: ContainerConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.config !== undefined) {
      ExplicitContainerConfig.encode(message.config, writer.uint32(802).fork()).ldelim()
    }
    if (message.name !== '') {
      writer.uint32(810).string(message.name)
    }
    for (const v of message.capabilities) {
      UniqueKeyValue.encode(v!, writer.uint32(8002).fork()).ldelim()
    }
    for (const v of message.environment) {
      UniqueKeyValue.encode(v!, writer.uint32(8010).fork()).ldelim()
    }
    for (const v of message.secrets) {
      UniqueKey.encode(v!, writer.uint32(8018).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ContainerConfig {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseContainerConfig()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 100:
          message.config = ExplicitContainerConfig.decode(reader, reader.uint32())
          break
        case 101:
          message.name = reader.string()
          break
        case 1000:
          message.capabilities.push(UniqueKeyValue.decode(reader, reader.uint32()))
          break
        case 1001:
          message.environment.push(UniqueKeyValue.decode(reader, reader.uint32()))
          break
        case 1002:
          message.secrets.push(UniqueKey.decode(reader, reader.uint32()))
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): ContainerConfig {
    return {
      config: isSet(object.config) ? ExplicitContainerConfig.fromJSON(object.config) : undefined,
      name: isSet(object.name) ? String(object.name) : '',
      capabilities: Array.isArray(object?.capabilities)
        ? object.capabilities.map((e: any) => UniqueKeyValue.fromJSON(e))
        : [],
      environment: Array.isArray(object?.environment)
        ? object.environment.map((e: any) => UniqueKeyValue.fromJSON(e))
        : [],
      secrets: Array.isArray(object?.secrets) ? object.secrets.map((e: any) => UniqueKey.fromJSON(e)) : [],
    }
  },

  toJSON(message: ContainerConfig): unknown {
    const obj: any = {}
    message.config !== undefined &&
      (obj.config = message.config ? ExplicitContainerConfig.toJSON(message.config) : undefined)
    message.name !== undefined && (obj.name = message.name)
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
    if (message.secrets) {
      obj.secrets = message.secrets.map(e => (e ? UniqueKey.toJSON(e) : undefined))
    } else {
      obj.secrets = []
    }
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<ContainerConfig>, I>>(object: I): ContainerConfig {
    const message = createBaseContainerConfig()
    message.config =
      object.config !== undefined && object.config !== null
        ? ExplicitContainerConfig.fromPartial(object.config)
        : undefined
    message.name = object.name ?? ''
    message.capabilities = object.capabilities?.map(e => UniqueKeyValue.fromPartial(e)) || []
    message.environment = object.environment?.map(e => UniqueKeyValue.fromPartial(e)) || []
    message.secrets = object.secrets?.map(e => UniqueKey.fromPartial(e)) || []
    return message
  },
}

function createBaseImageResponse(): ImageResponse {
  return { id: '', name: '', tag: '', order: 0, registryId: '', config: undefined }
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
      ContainerConfig.encode(message.config, writer.uint32(834).fork()).ldelim()
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
          message.config = ContainerConfig.decode(reader, reader.uint32())
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
      config: isSet(object.config) ? ContainerConfig.fromJSON(object.config) : undefined,
    }
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

  fromPartial<I extends Exact<DeepPartial<ImageResponse>, I>>(object: I): ImageResponse {
    const message = createBaseImageResponse()
    message.id = object.id ?? ''
    message.name = object.name ?? ''
    message.tag = object.tag ?? ''
    message.order = object.order ?? 0
    message.registryId = object.registryId ?? ''
    message.config =
      object.config !== undefined && object.config !== null ? ContainerConfig.fromPartial(object.config) : undefined
    return message
  },
}

function createBaseImageListResponse(): ImageListResponse {
  return { data: [] }
}

export const ImageListResponse = {
  encode(message: ImageListResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.data) {
      ImageResponse.encode(v!, writer.uint32(802).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ImageListResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseImageListResponse()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 100:
          message.data.push(ImageResponse.decode(reader, reader.uint32()))
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): ImageListResponse {
    return { data: Array.isArray(object?.data) ? object.data.map((e: any) => ImageResponse.fromJSON(e)) : [] }
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

  fromPartial<I extends Exact<DeepPartial<ImageListResponse>, I>>(object: I): ImageListResponse {
    const message = createBaseImageListResponse()
    message.data = object.data?.map(e => ImageResponse.fromPartial(e)) || []
    return message
  },
}

function createBaseOrderVersionImagesRequest(): OrderVersionImagesRequest {
  return { accessedBy: '', versionId: '', imageIds: [] }
}

export const OrderVersionImagesRequest = {
  encode(message: OrderVersionImagesRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.accessedBy !== '') {
      writer.uint32(18).string(message.accessedBy)
    }
    if (message.versionId !== '') {
      writer.uint32(802).string(message.versionId)
    }
    for (const v of message.imageIds) {
      writer.uint32(810).string(v!)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): OrderVersionImagesRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseOrderVersionImagesRequest()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 2:
          message.accessedBy = reader.string()
          break
        case 100:
          message.versionId = reader.string()
          break
        case 101:
          message.imageIds.push(reader.string())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): OrderVersionImagesRequest {
    return {
      accessedBy: isSet(object.accessedBy) ? String(object.accessedBy) : '',
      versionId: isSet(object.versionId) ? String(object.versionId) : '',
      imageIds: Array.isArray(object?.imageIds) ? object.imageIds.map((e: any) => String(e)) : [],
    }
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

  fromPartial<I extends Exact<DeepPartial<OrderVersionImagesRequest>, I>>(object: I): OrderVersionImagesRequest {
    const message = createBaseOrderVersionImagesRequest()
    message.accessedBy = object.accessedBy ?? ''
    message.versionId = object.versionId ?? ''
    message.imageIds = object.imageIds?.map(e => e) || []
    return message
  },
}

function createBaseRegistryImages(): RegistryImages {
  return { registryId: '', imageNames: [] }
}

export const RegistryImages = {
  encode(message: RegistryImages, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.registryId !== '') {
      writer.uint32(802).string(message.registryId)
    }
    for (const v of message.imageNames) {
      writer.uint32(810).string(v!)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RegistryImages {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseRegistryImages()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 100:
          message.registryId = reader.string()
          break
        case 101:
          message.imageNames.push(reader.string())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): RegistryImages {
    return {
      registryId: isSet(object.registryId) ? String(object.registryId) : '',
      imageNames: Array.isArray(object?.imageNames) ? object.imageNames.map((e: any) => String(e)) : [],
    }
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

  fromPartial<I extends Exact<DeepPartial<RegistryImages>, I>>(object: I): RegistryImages {
    const message = createBaseRegistryImages()
    message.registryId = object.registryId ?? ''
    message.imageNames = object.imageNames?.map(e => e) || []
    return message
  },
}

function createBaseAddImagesToVersionRequest(): AddImagesToVersionRequest {
  return { accessedBy: '', versionId: '', images: [] }
}

export const AddImagesToVersionRequest = {
  encode(message: AddImagesToVersionRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.accessedBy !== '') {
      writer.uint32(18).string(message.accessedBy)
    }
    if (message.versionId !== '') {
      writer.uint32(802).string(message.versionId)
    }
    for (const v of message.images) {
      RegistryImages.encode(v!, writer.uint32(810).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AddImagesToVersionRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseAddImagesToVersionRequest()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 2:
          message.accessedBy = reader.string()
          break
        case 100:
          message.versionId = reader.string()
          break
        case 101:
          message.images.push(RegistryImages.decode(reader, reader.uint32()))
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): AddImagesToVersionRequest {
    return {
      accessedBy: isSet(object.accessedBy) ? String(object.accessedBy) : '',
      versionId: isSet(object.versionId) ? String(object.versionId) : '',
      images: Array.isArray(object?.images) ? object.images.map((e: any) => RegistryImages.fromJSON(e)) : [],
    }
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

  fromPartial<I extends Exact<DeepPartial<AddImagesToVersionRequest>, I>>(object: I): AddImagesToVersionRequest {
    const message = createBaseAddImagesToVersionRequest()
    message.accessedBy = object.accessedBy ?? ''
    message.versionId = object.versionId ?? ''
    message.images = object.images?.map(e => RegistryImages.fromPartial(e)) || []
    return message
  },
}

function createBasePatchContainerConfig(): PatchContainerConfig {
  return {}
}

export const PatchContainerConfig = {
  encode(message: PatchContainerConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.capabilities !== undefined) {
      KeyValueList.encode(message.capabilities, writer.uint32(802).fork()).ldelim()
    }
    if (message.environment !== undefined) {
      KeyValueList.encode(message.environment, writer.uint32(810).fork()).ldelim()
    }
    if (message.secrets !== undefined) {
      KeyList.encode(message.secrets, writer.uint32(818).fork()).ldelim()
    }
    if (message.config !== undefined) {
      ExplicitContainerConfig.encode(message.config, writer.uint32(826).fork()).ldelim()
    }
    if (message.name !== undefined) {
      writer.uint32(834).string(message.name)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PatchContainerConfig {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBasePatchContainerConfig()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 100:
          message.capabilities = KeyValueList.decode(reader, reader.uint32())
          break
        case 101:
          message.environment = KeyValueList.decode(reader, reader.uint32())
          break
        case 102:
          message.secrets = KeyList.decode(reader, reader.uint32())
          break
        case 103:
          message.config = ExplicitContainerConfig.decode(reader, reader.uint32())
          break
        case 104:
          message.name = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): PatchContainerConfig {
    return {
      capabilities: isSet(object.capabilities) ? KeyValueList.fromJSON(object.capabilities) : undefined,
      environment: isSet(object.environment) ? KeyValueList.fromJSON(object.environment) : undefined,
      secrets: isSet(object.secrets) ? KeyList.fromJSON(object.secrets) : undefined,
      config: isSet(object.config) ? ExplicitContainerConfig.fromJSON(object.config) : undefined,
      name: isSet(object.name) ? String(object.name) : undefined,
    }
  },

  toJSON(message: PatchContainerConfig): unknown {
    const obj: any = {}
    message.capabilities !== undefined &&
      (obj.capabilities = message.capabilities ? KeyValueList.toJSON(message.capabilities) : undefined)
    message.environment !== undefined &&
      (obj.environment = message.environment ? KeyValueList.toJSON(message.environment) : undefined)
    message.secrets !== undefined && (obj.secrets = message.secrets ? KeyList.toJSON(message.secrets) : undefined)
    message.config !== undefined &&
      (obj.config = message.config ? ExplicitContainerConfig.toJSON(message.config) : undefined)
    message.name !== undefined && (obj.name = message.name)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<PatchContainerConfig>, I>>(object: I): PatchContainerConfig {
    const message = createBasePatchContainerConfig()
    message.capabilities =
      object.capabilities !== undefined && object.capabilities !== null
        ? KeyValueList.fromPartial(object.capabilities)
        : undefined
    message.environment =
      object.environment !== undefined && object.environment !== null
        ? KeyValueList.fromPartial(object.environment)
        : undefined
    message.secrets =
      object.secrets !== undefined && object.secrets !== null ? KeyList.fromPartial(object.secrets) : undefined
    message.config =
      object.config !== undefined && object.config !== null
        ? ExplicitContainerConfig.fromPartial(object.config)
        : undefined
    message.name = object.name ?? undefined
    return message
  },
}

function createBasePatchImageRequest(): PatchImageRequest {
  return { id: '', accessedBy: '' }
}

export const PatchImageRequest = {
  encode(message: PatchImageRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id)
    }
    if (message.accessedBy !== '') {
      writer.uint32(18).string(message.accessedBy)
    }
    if (message.tag !== undefined) {
      writer.uint32(810).string(message.tag)
    }
    if (message.config !== undefined) {
      PatchContainerConfig.encode(message.config, writer.uint32(818).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PatchImageRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBasePatchImageRequest()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string()
          break
        case 2:
          message.accessedBy = reader.string()
          break
        case 101:
          message.tag = reader.string()
          break
        case 102:
          message.config = PatchContainerConfig.decode(reader, reader.uint32())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): PatchImageRequest {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      accessedBy: isSet(object.accessedBy) ? String(object.accessedBy) : '',
      tag: isSet(object.tag) ? String(object.tag) : undefined,
      config: isSet(object.config) ? PatchContainerConfig.fromJSON(object.config) : undefined,
    }
  },

  toJSON(message: PatchImageRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
    message.tag !== undefined && (obj.tag = message.tag)
    message.config !== undefined &&
      (obj.config = message.config ? PatchContainerConfig.toJSON(message.config) : undefined)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<PatchImageRequest>, I>>(object: I): PatchImageRequest {
    const message = createBasePatchImageRequest()
    message.id = object.id ?? ''
    message.accessedBy = object.accessedBy ?? ''
    message.tag = object.tag ?? undefined
    message.config =
      object.config !== undefined && object.config !== null
        ? PatchContainerConfig.fromPartial(object.config)
        : undefined
    return message
  },
}

function createBaseNodeResponse(): NodeResponse {
  return { id: '', audit: undefined, name: '', status: 0, type: 0 }
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
    return obj
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
    return message
  },
}

function createBaseNodeDetailsResponse(): NodeDetailsResponse {
  return { id: '', audit: undefined, name: '', status: 0, hasToken: false, type: 0 }
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
    return obj
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

  fromPartial<I extends Exact<DeepPartial<NodeListResponse>, I>>(object: I): NodeListResponse {
    const message = createBaseNodeListResponse()
    message.data = object.data?.map(e => NodeResponse.fromPartial(e)) || []
    return message
  },
}

function createBaseCreateNodeRequest(): CreateNodeRequest {
  return { accessedBy: '', name: '' }
}

export const CreateNodeRequest = {
  encode(message: CreateNodeRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.accessedBy !== '') {
      writer.uint32(18).string(message.accessedBy)
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

  decode(input: _m0.Reader | Uint8Array, length?: number): CreateNodeRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseCreateNodeRequest()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 2:
          message.accessedBy = reader.string()
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

  fromJSON(object: any): CreateNodeRequest {
    return {
      accessedBy: isSet(object.accessedBy) ? String(object.accessedBy) : '',
      name: isSet(object.name) ? String(object.name) : '',
      description: isSet(object.description) ? String(object.description) : undefined,
      icon: isSet(object.icon) ? String(object.icon) : undefined,
    }
  },

  toJSON(message: CreateNodeRequest): unknown {
    const obj: any = {}
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
    message.name !== undefined && (obj.name = message.name)
    message.description !== undefined && (obj.description = message.description)
    message.icon !== undefined && (obj.icon = message.icon)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<CreateNodeRequest>, I>>(object: I): CreateNodeRequest {
    const message = createBaseCreateNodeRequest()
    message.accessedBy = object.accessedBy ?? ''
    message.name = object.name ?? ''
    message.description = object.description ?? undefined
    message.icon = object.icon ?? undefined
    return message
  },
}

function createBaseUpdateNodeRequest(): UpdateNodeRequest {
  return { id: '', accessedBy: '', name: '' }
}

export const UpdateNodeRequest = {
  encode(message: UpdateNodeRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id)
    }
    if (message.accessedBy !== '') {
      writer.uint32(18).string(message.accessedBy)
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
        case 2:
          message.accessedBy = reader.string()
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
      accessedBy: isSet(object.accessedBy) ? String(object.accessedBy) : '',
      name: isSet(object.name) ? String(object.name) : '',
      description: isSet(object.description) ? String(object.description) : undefined,
      icon: isSet(object.icon) ? String(object.icon) : undefined,
    }
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

  fromPartial<I extends Exact<DeepPartial<UpdateNodeRequest>, I>>(object: I): UpdateNodeRequest {
    const message = createBaseUpdateNodeRequest()
    message.id = object.id ?? ''
    message.accessedBy = object.accessedBy ?? ''
    message.name = object.name ?? ''
    message.description = object.description ?? undefined
    message.icon = object.icon ?? undefined
    return message
  },
}

function createBaseGenerateScriptRequest(): GenerateScriptRequest {
  return { id: '', accessedBy: '', type: 0 }
}

export const GenerateScriptRequest = {
  encode(message: GenerateScriptRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id)
    }
    if (message.accessedBy !== '') {
      writer.uint32(18).string(message.accessedBy)
    }
    if (message.type !== 0) {
      writer.uint32(800).int32(message.type)
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
        case 2:
          message.accessedBy = reader.string()
          break
        case 100:
          message.type = reader.int32() as any
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
      accessedBy: isSet(object.accessedBy) ? String(object.accessedBy) : '',
      type: isSet(object.type) ? nodeTypeFromJSON(object.type) : 0,
    }
  },

  toJSON(message: GenerateScriptRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
    message.type !== undefined && (obj.type = nodeTypeToJSON(message.type))
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<GenerateScriptRequest>, I>>(object: I): GenerateScriptRequest {
    const message = createBaseGenerateScriptRequest()
    message.id = object.id ?? ''
    message.accessedBy = object.accessedBy ?? ''
    message.type = object.type ?? 0
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

  fromPartial<I extends Exact<DeepPartial<NodeScriptResponse>, I>>(object: I): NodeScriptResponse {
    const message = createBaseNodeScriptResponse()
    message.content = object.content ?? ''
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
    }
  },

  toJSON(message: NodeEventMessage): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.status !== undefined && (obj.status = nodeConnectionStatusToJSON(message.status))
    message.address !== undefined && (obj.address = message.address)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<NodeEventMessage>, I>>(object: I): NodeEventMessage {
    const message = createBaseNodeEventMessage()
    message.id = object.id ?? ''
    message.status = object.status ?? 0
    message.address = object.address ?? undefined
    return message
  },
}

function createBaseWatchContainerStateRequest(): WatchContainerStateRequest {
  return { accessedBy: '', nodeId: '' }
}

export const WatchContainerStateRequest = {
  encode(message: WatchContainerStateRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.accessedBy !== '') {
      writer.uint32(18).string(message.accessedBy)
    }
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
        case 2:
          message.accessedBy = reader.string()
          break
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
      accessedBy: isSet(object.accessedBy) ? String(object.accessedBy) : '',
      nodeId: isSet(object.nodeId) ? String(object.nodeId) : '',
      prefix: isSet(object.prefix) ? String(object.prefix) : undefined,
    }
  },

  toJSON(message: WatchContainerStateRequest): unknown {
    const obj: any = {}
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
    message.nodeId !== undefined && (obj.nodeId = message.nodeId)
    message.prefix !== undefined && (obj.prefix = message.prefix)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<WatchContainerStateRequest>, I>>(object: I): WatchContainerStateRequest {
    const message = createBaseWatchContainerStateRequest()
    message.accessedBy = object.accessedBy ?? ''
    message.nodeId = object.nodeId ?? ''
    message.prefix = object.prefix ?? undefined
    return message
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
    const message = createBaseContainerStateItem()
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
    return {
      containerId: isSet(object.containerId) ? String(object.containerId) : '',
      name: isSet(object.name) ? String(object.name) : '',
      command: isSet(object.command) ? String(object.command) : '',
      createdAt: isSet(object.createdAt) ? fromJsonTimestamp(object.createdAt) : undefined,
      state: isSet(object.state) ? containerStateFromJSON(object.state) : 0,
      status: isSet(object.status) ? String(object.status) : '',
      imageName: isSet(object.imageName) ? String(object.imageName) : '',
      imageTag: isSet(object.imageTag) ? String(object.imageTag) : '',
      ports: Array.isArray(object?.ports) ? object.ports.map((e: any) => Port.fromJSON(e)) : [],
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
      obj.ports = message.ports.map(e => (e ? Port.toJSON(e) : undefined))
    } else {
      obj.ports = []
    }
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<ContainerStateItem>, I>>(object: I): ContainerStateItem {
    const message = createBaseContainerStateItem()
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

  fromPartial<I extends Exact<DeepPartial<InstancesCreatedEventList>, I>>(object: I): InstancesCreatedEventList {
    const message = createBaseInstancesCreatedEventList()
    message.data = object.data?.map(e => InstanceResponse.fromPartial(e)) || []
    return message
  },
}

function createBaseDeploymentEditEventMessage(): DeploymentEditEventMessage {
  return { instancesCreated: undefined, imageIdDeleted: undefined }
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

function createBaseCreateDeploymentRequest(): CreateDeploymentRequest {
  return { accessedBy: '', versionId: '', nodeId: '', prefix: '' }
}

export const CreateDeploymentRequest = {
  encode(message: CreateDeploymentRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.accessedBy !== '') {
      writer.uint32(18).string(message.accessedBy)
    }
    if (message.versionId !== '') {
      writer.uint32(802).string(message.versionId)
    }
    if (message.nodeId !== '') {
      writer.uint32(810).string(message.nodeId)
    }
    if (message.note !== undefined) {
      writer.uint32(818).string(message.note)
    }
    if (message.prefix !== '') {
      writer.uint32(826).string(message.prefix)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CreateDeploymentRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseCreateDeploymentRequest()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 2:
          message.accessedBy = reader.string()
          break
        case 100:
          message.versionId = reader.string()
          break
        case 101:
          message.nodeId = reader.string()
          break
        case 102:
          message.note = reader.string()
          break
        case 103:
          message.prefix = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): CreateDeploymentRequest {
    return {
      accessedBy: isSet(object.accessedBy) ? String(object.accessedBy) : '',
      versionId: isSet(object.versionId) ? String(object.versionId) : '',
      nodeId: isSet(object.nodeId) ? String(object.nodeId) : '',
      note: isSet(object.note) ? String(object.note) : undefined,
      prefix: isSet(object.prefix) ? String(object.prefix) : '',
    }
  },

  toJSON(message: CreateDeploymentRequest): unknown {
    const obj: any = {}
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
    message.versionId !== undefined && (obj.versionId = message.versionId)
    message.nodeId !== undefined && (obj.nodeId = message.nodeId)
    message.note !== undefined && (obj.note = message.note)
    message.prefix !== undefined && (obj.prefix = message.prefix)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<CreateDeploymentRequest>, I>>(object: I): CreateDeploymentRequest {
    const message = createBaseCreateDeploymentRequest()
    message.accessedBy = object.accessedBy ?? ''
    message.versionId = object.versionId ?? ''
    message.nodeId = object.nodeId ?? ''
    message.note = object.note ?? undefined
    message.prefix = object.prefix ?? ''
    return message
  },
}

function createBaseUpdateDeploymentRequest(): UpdateDeploymentRequest {
  return { id: '', accessedBy: '', prefix: '' }
}

export const UpdateDeploymentRequest = {
  encode(message: UpdateDeploymentRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id)
    }
    if (message.accessedBy !== '') {
      writer.uint32(18).string(message.accessedBy)
    }
    if (message.note !== undefined) {
      writer.uint32(802).string(message.note)
    }
    if (message.prefix !== '') {
      writer.uint32(810).string(message.prefix)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UpdateDeploymentRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseUpdateDeploymentRequest()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string()
          break
        case 2:
          message.accessedBy = reader.string()
          break
        case 100:
          message.note = reader.string()
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

  fromJSON(object: any): UpdateDeploymentRequest {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      accessedBy: isSet(object.accessedBy) ? String(object.accessedBy) : '',
      note: isSet(object.note) ? String(object.note) : undefined,
      prefix: isSet(object.prefix) ? String(object.prefix) : '',
    }
  },

  toJSON(message: UpdateDeploymentRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
    message.note !== undefined && (obj.note = message.note)
    message.prefix !== undefined && (obj.prefix = message.prefix)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<UpdateDeploymentRequest>, I>>(object: I): UpdateDeploymentRequest {
    const message = createBaseUpdateDeploymentRequest()
    message.id = object.id ?? ''
    message.accessedBy = object.accessedBy ?? ''
    message.note = object.note ?? undefined
    message.prefix = object.prefix ?? ''
    return message
  },
}

function createBasePatchDeploymentRequest(): PatchDeploymentRequest {
  return { id: '', accessedBy: '' }
}

export const PatchDeploymentRequest = {
  encode(message: PatchDeploymentRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id)
    }
    if (message.accessedBy !== '') {
      writer.uint32(18).string(message.accessedBy)
    }
    if (message.environment !== undefined) {
      KeyValueList.encode(message.environment, writer.uint32(802).fork()).ldelim()
    }
    if (message.instance !== undefined) {
      PatchInstanceRequest.encode(message.instance, writer.uint32(8010).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PatchDeploymentRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBasePatchDeploymentRequest()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string()
          break
        case 2:
          message.accessedBy = reader.string()
          break
        case 100:
          message.environment = KeyValueList.decode(reader, reader.uint32())
          break
        case 1001:
          message.instance = PatchInstanceRequest.decode(reader, reader.uint32())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): PatchDeploymentRequest {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      accessedBy: isSet(object.accessedBy) ? String(object.accessedBy) : '',
      environment: isSet(object.environment) ? KeyValueList.fromJSON(object.environment) : undefined,
      instance: isSet(object.instance) ? PatchInstanceRequest.fromJSON(object.instance) : undefined,
    }
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

  fromPartial<I extends Exact<DeepPartial<PatchDeploymentRequest>, I>>(object: I): PatchDeploymentRequest {
    const message = createBasePatchDeploymentRequest()
    message.id = object.id ?? ''
    message.accessedBy = object.accessedBy ?? ''
    message.environment =
      object.environment !== undefined && object.environment !== null
        ? KeyValueList.fromPartial(object.environment)
        : undefined
    message.instance =
      object.instance !== undefined && object.instance !== null
        ? PatchInstanceRequest.fromPartial(object.instance)
        : undefined
    return message
  },
}

function createBaseInstanceContainerConfig(): InstanceContainerConfig {
  return { config: undefined, capabilities: [], environment: [], secrets: [] }
}

export const InstanceContainerConfig = {
  encode(message: InstanceContainerConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.config !== undefined) {
      ExplicitContainerConfig.encode(message.config, writer.uint32(802).fork()).ldelim()
    }
    for (const v of message.capabilities) {
      UniqueKeyValue.encode(v!, writer.uint32(8002).fork()).ldelim()
    }
    for (const v of message.environment) {
      UniqueKeyValue.encode(v!, writer.uint32(8010).fork()).ldelim()
    }
    for (const v of message.secrets) {
      UniqueKeySecretValue.encode(v!, writer.uint32(8018).fork()).ldelim()
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
          message.config = ExplicitContainerConfig.decode(reader, reader.uint32())
          break
        case 1000:
          message.capabilities.push(UniqueKeyValue.decode(reader, reader.uint32()))
          break
        case 1001:
          message.environment.push(UniqueKeyValue.decode(reader, reader.uint32()))
          break
        case 1002:
          message.secrets.push(UniqueKeySecretValue.decode(reader, reader.uint32()))
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
      config: isSet(object.config) ? ExplicitContainerConfig.fromJSON(object.config) : undefined,
      capabilities: Array.isArray(object?.capabilities)
        ? object.capabilities.map((e: any) => UniqueKeyValue.fromJSON(e))
        : [],
      environment: Array.isArray(object?.environment)
        ? object.environment.map((e: any) => UniqueKeyValue.fromJSON(e))
        : [],
      secrets: Array.isArray(object?.secrets) ? object.secrets.map((e: any) => UniqueKeySecretValue.fromJSON(e)) : [],
    }
  },

  toJSON(message: InstanceContainerConfig): unknown {
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
    if (message.secrets) {
      obj.secrets = message.secrets.map(e => (e ? UniqueKeySecretValue.toJSON(e) : undefined))
    } else {
      obj.secrets = []
    }
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<InstanceContainerConfig>, I>>(object: I): InstanceContainerConfig {
    const message = createBaseInstanceContainerConfig()
    message.config =
      object.config !== undefined && object.config !== null
        ? ExplicitContainerConfig.fromPartial(object.config)
        : undefined
    message.capabilities = object.capabilities?.map(e => UniqueKeyValue.fromPartial(e)) || []
    message.environment = object.environment?.map(e => UniqueKeyValue.fromPartial(e)) || []
    message.secrets = object.secrets?.map(e => UniqueKeySecretValue.fromPartial(e)) || []
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
  return { id: '', accessedBy: '' }
}

export const PatchInstanceRequest = {
  encode(message: PatchInstanceRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id)
    }
    if (message.accessedBy !== '') {
      writer.uint32(18).string(message.accessedBy)
    }
    if (message.environment !== undefined) {
      KeyValueList.encode(message.environment, writer.uint32(802).fork()).ldelim()
    }
    if (message.capabilities !== undefined) {
      KeyValueList.encode(message.capabilities, writer.uint32(810).fork()).ldelim()
    }
    if (message.config !== undefined) {
      ExplicitContainerConfig.encode(message.config, writer.uint32(818).fork()).ldelim()
    }
    if (message.secrets !== undefined) {
      SecretList.encode(message.secrets, writer.uint32(826).fork()).ldelim()
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
        case 2:
          message.accessedBy = reader.string()
          break
        case 100:
          message.environment = KeyValueList.decode(reader, reader.uint32())
          break
        case 101:
          message.capabilities = KeyValueList.decode(reader, reader.uint32())
          break
        case 102:
          message.config = ExplicitContainerConfig.decode(reader, reader.uint32())
          break
        case 103:
          message.secrets = SecretList.decode(reader, reader.uint32())
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
      accessedBy: isSet(object.accessedBy) ? String(object.accessedBy) : '',
      environment: isSet(object.environment) ? KeyValueList.fromJSON(object.environment) : undefined,
      capabilities: isSet(object.capabilities) ? KeyValueList.fromJSON(object.capabilities) : undefined,
      config: isSet(object.config) ? ExplicitContainerConfig.fromJSON(object.config) : undefined,
      secrets: isSet(object.secrets) ? SecretList.fromJSON(object.secrets) : undefined,
    }
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
    message.secrets !== undefined && (obj.secrets = message.secrets ? SecretList.toJSON(message.secrets) : undefined)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<PatchInstanceRequest>, I>>(object: I): PatchInstanceRequest {
    const message = createBasePatchInstanceRequest()
    message.id = object.id ?? ''
    message.accessedBy = object.accessedBy ?? ''
    message.environment =
      object.environment !== undefined && object.environment !== null
        ? KeyValueList.fromPartial(object.environment)
        : undefined
    message.capabilities =
      object.capabilities !== undefined && object.capabilities !== null
        ? KeyValueList.fromPartial(object.capabilities)
        : undefined
    message.config =
      object.config !== undefined && object.config !== null
        ? ExplicitContainerConfig.fromPartial(object.config)
        : undefined
    message.secrets =
      object.secrets !== undefined && object.secrets !== null ? SecretList.fromPartial(object.secrets) : undefined
    return message
  },
}

function createBaseDeploymentListResponse(): DeploymentListResponse {
  return { data: [] }
}

export const DeploymentListResponse = {
  encode(message: DeploymentListResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.data) {
      DeploymentResponse.encode(v!, writer.uint32(8002).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DeploymentListResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseDeploymentListResponse()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1000:
          message.data.push(DeploymentResponse.decode(reader, reader.uint32()))
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): DeploymentListResponse {
    return { data: Array.isArray(object?.data) ? object.data.map((e: any) => DeploymentResponse.fromJSON(e)) : [] }
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

  fromPartial<I extends Exact<DeepPartial<DeploymentListResponse>, I>>(object: I): DeploymentListResponse {
    const message = createBaseDeploymentListResponse()
    message.data = object.data?.map(e => DeploymentResponse.fromPartial(e)) || []
    return message
  },
}

function createBaseDeploymentResponse(): DeploymentResponse {
  return {
    id: '',
    product: '',
    productId: '',
    version: '',
    versionId: '',
    node: '',
    status: 0,
    nodeId: '',
    prefix: '',
  }
}

export const DeploymentResponse = {
  encode(message: DeploymentResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id)
    }
    if (message.product !== '') {
      writer.uint32(802).string(message.product)
    }
    if (message.productId !== '') {
      writer.uint32(810).string(message.productId)
    }
    if (message.version !== '') {
      writer.uint32(818).string(message.version)
    }
    if (message.versionId !== '') {
      writer.uint32(826).string(message.versionId)
    }
    if (message.node !== '') {
      writer.uint32(834).string(message.node)
    }
    if (message.status !== 0) {
      writer.uint32(840).int32(message.status)
    }
    if (message.nodeId !== '') {
      writer.uint32(850).string(message.nodeId)
    }
    if (message.note !== undefined) {
      writer.uint32(858).string(message.note)
    }
    if (message.prefix !== '') {
      writer.uint32(866).string(message.prefix)
    }
    if (message.updatedAt !== undefined) {
      Timestamp.encode(message.updatedAt, writer.uint32(874).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DeploymentResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseDeploymentResponse()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string()
          break
        case 100:
          message.product = reader.string()
          break
        case 101:
          message.productId = reader.string()
          break
        case 102:
          message.version = reader.string()
          break
        case 103:
          message.versionId = reader.string()
          break
        case 104:
          message.node = reader.string()
          break
        case 105:
          message.status = reader.int32() as any
          break
        case 106:
          message.nodeId = reader.string()
          break
        case 107:
          message.note = reader.string()
          break
        case 108:
          message.prefix = reader.string()
          break
        case 109:
          message.updatedAt = Timestamp.decode(reader, reader.uint32())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): DeploymentResponse {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      product: isSet(object.product) ? String(object.product) : '',
      productId: isSet(object.productId) ? String(object.productId) : '',
      version: isSet(object.version) ? String(object.version) : '',
      versionId: isSet(object.versionId) ? String(object.versionId) : '',
      node: isSet(object.node) ? String(object.node) : '',
      status: isSet(object.status) ? deploymentStatusFromJSON(object.status) : 0,
      nodeId: isSet(object.nodeId) ? String(object.nodeId) : '',
      note: isSet(object.note) ? String(object.note) : undefined,
      prefix: isSet(object.prefix) ? String(object.prefix) : '',
      updatedAt: isSet(object.updatedAt) ? fromJsonTimestamp(object.updatedAt) : undefined,
    }
  },

  toJSON(message: DeploymentResponse): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.product !== undefined && (obj.product = message.product)
    message.productId !== undefined && (obj.productId = message.productId)
    message.version !== undefined && (obj.version = message.version)
    message.versionId !== undefined && (obj.versionId = message.versionId)
    message.node !== undefined && (obj.node = message.node)
    message.status !== undefined && (obj.status = deploymentStatusToJSON(message.status))
    message.nodeId !== undefined && (obj.nodeId = message.nodeId)
    message.note !== undefined && (obj.note = message.note)
    message.prefix !== undefined && (obj.prefix = message.prefix)
    message.updatedAt !== undefined && (obj.updatedAt = fromTimestamp(message.updatedAt).toISOString())
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<DeploymentResponse>, I>>(object: I): DeploymentResponse {
    const message = createBaseDeploymentResponse()
    message.id = object.id ?? ''
    message.product = object.product ?? ''
    message.productId = object.productId ?? ''
    message.version = object.version ?? ''
    message.versionId = object.versionId ?? ''
    message.node = object.node ?? ''
    message.status = object.status ?? 0
    message.nodeId = object.nodeId ?? ''
    message.note = object.note ?? undefined
    message.prefix = object.prefix ?? ''
    message.updatedAt =
      object.updatedAt !== undefined && object.updatedAt !== null ? Timestamp.fromPartial(object.updatedAt) : undefined
    return message
  },
}

function createBaseDeploymentListByVersionResponse(): DeploymentListByVersionResponse {
  return { data: [] }
}

export const DeploymentListByVersionResponse = {
  encode(message: DeploymentListByVersionResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.data) {
      DeploymentByVersionResponse.encode(v!, writer.uint32(8002).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DeploymentListByVersionResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseDeploymentListByVersionResponse()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1000:
          message.data.push(DeploymentByVersionResponse.decode(reader, reader.uint32()))
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): DeploymentListByVersionResponse {
    return {
      data: Array.isArray(object?.data) ? object.data.map((e: any) => DeploymentByVersionResponse.fromJSON(e)) : [],
    }
  },

  toJSON(message: DeploymentListByVersionResponse): unknown {
    const obj: any = {}
    if (message.data) {
      obj.data = message.data.map(e => (e ? DeploymentByVersionResponse.toJSON(e) : undefined))
    } else {
      obj.data = []
    }
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<DeploymentListByVersionResponse>, I>>(
    object: I,
  ): DeploymentListByVersionResponse {
    const message = createBaseDeploymentListByVersionResponse()
    message.data = object.data?.map(e => DeploymentByVersionResponse.fromPartial(e)) || []
    return message
  },
}

function createBaseDeploymentByVersionResponse(): DeploymentByVersionResponse {
  return { id: '', audit: undefined, prefix: '', nodeId: '', nodeName: '', status: 0, nodeStatus: 0 }
}

export const DeploymentByVersionResponse = {
  encode(message: DeploymentByVersionResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id)
    }
    if (message.audit !== undefined) {
      AuditResponse.encode(message.audit, writer.uint32(18).fork()).ldelim()
    }
    if (message.prefix !== '') {
      writer.uint32(802).string(message.prefix)
    }
    if (message.nodeId !== '') {
      writer.uint32(810).string(message.nodeId)
    }
    if (message.nodeName !== '') {
      writer.uint32(818).string(message.nodeName)
    }
    if (message.status !== 0) {
      writer.uint32(824).int32(message.status)
    }
    if (message.nodeStatus !== 0) {
      writer.uint32(832).int32(message.nodeStatus)
    }
    if (message.note !== undefined) {
      writer.uint32(842).string(message.note)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DeploymentByVersionResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseDeploymentByVersionResponse()
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
          message.prefix = reader.string()
          break
        case 101:
          message.nodeId = reader.string()
          break
        case 102:
          message.nodeName = reader.string()
          break
        case 103:
          message.status = reader.int32() as any
          break
        case 104:
          message.nodeStatus = reader.int32() as any
          break
        case 105:
          message.note = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): DeploymentByVersionResponse {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      audit: isSet(object.audit) ? AuditResponse.fromJSON(object.audit) : undefined,
      prefix: isSet(object.prefix) ? String(object.prefix) : '',
      nodeId: isSet(object.nodeId) ? String(object.nodeId) : '',
      nodeName: isSet(object.nodeName) ? String(object.nodeName) : '',
      status: isSet(object.status) ? deploymentStatusFromJSON(object.status) : 0,
      nodeStatus: isSet(object.nodeStatus) ? nodeConnectionStatusFromJSON(object.nodeStatus) : 0,
      note: isSet(object.note) ? String(object.note) : undefined,
    }
  },

  toJSON(message: DeploymentByVersionResponse): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.audit !== undefined && (obj.audit = message.audit ? AuditResponse.toJSON(message.audit) : undefined)
    message.prefix !== undefined && (obj.prefix = message.prefix)
    message.nodeId !== undefined && (obj.nodeId = message.nodeId)
    message.nodeName !== undefined && (obj.nodeName = message.nodeName)
    message.status !== undefined && (obj.status = deploymentStatusToJSON(message.status))
    message.nodeStatus !== undefined && (obj.nodeStatus = nodeConnectionStatusToJSON(message.nodeStatus))
    message.note !== undefined && (obj.note = message.note)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<DeploymentByVersionResponse>, I>>(object: I): DeploymentByVersionResponse {
    const message = createBaseDeploymentByVersionResponse()
    message.id = object.id ?? ''
    message.audit =
      object.audit !== undefined && object.audit !== null ? AuditResponse.fromPartial(object.audit) : undefined
    message.prefix = object.prefix ?? ''
    message.nodeId = object.nodeId ?? ''
    message.nodeName = object.nodeName ?? ''
    message.status = object.status ?? 0
    message.nodeStatus = object.nodeStatus ?? 0
    message.note = object.note ?? undefined
    return message
  },
}

function createBaseDeploymentDetailsResponse(): DeploymentDetailsResponse {
  return {
    id: '',
    audit: undefined,
    productVersionId: '',
    nodeId: '',
    prefix: '',
    environment: [],
    status: 0,
    instances: [],
  }
}

export const DeploymentDetailsResponse = {
  encode(message: DeploymentDetailsResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id)
    }
    if (message.audit !== undefined) {
      AuditResponse.encode(message.audit, writer.uint32(18).fork()).ldelim()
    }
    if (message.productVersionId !== '') {
      writer.uint32(802).string(message.productVersionId)
    }
    if (message.nodeId !== '') {
      writer.uint32(810).string(message.nodeId)
    }
    if (message.note !== undefined) {
      writer.uint32(818).string(message.note)
    }
    if (message.prefix !== '') {
      writer.uint32(826).string(message.prefix)
    }
    for (const v of message.environment) {
      UniqueKeyValue.encode(v!, writer.uint32(834).fork()).ldelim()
    }
    if (message.status !== 0) {
      writer.uint32(840).int32(message.status)
    }
    if (message.publicKey !== undefined) {
      writer.uint32(850).string(message.publicKey)
    }
    for (const v of message.instances) {
      InstanceResponse.encode(v!, writer.uint32(8002).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DeploymentDetailsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseDeploymentDetailsResponse()
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
          message.productVersionId = reader.string()
          break
        case 101:
          message.nodeId = reader.string()
          break
        case 102:
          message.note = reader.string()
          break
        case 103:
          message.prefix = reader.string()
          break
        case 104:
          message.environment.push(UniqueKeyValue.decode(reader, reader.uint32()))
          break
        case 105:
          message.status = reader.int32() as any
          break
        case 106:
          message.publicKey = reader.string()
          break
        case 1000:
          message.instances.push(InstanceResponse.decode(reader, reader.uint32()))
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): DeploymentDetailsResponse {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      audit: isSet(object.audit) ? AuditResponse.fromJSON(object.audit) : undefined,
      productVersionId: isSet(object.productVersionId) ? String(object.productVersionId) : '',
      nodeId: isSet(object.nodeId) ? String(object.nodeId) : '',
      note: isSet(object.note) ? String(object.note) : undefined,
      prefix: isSet(object.prefix) ? String(object.prefix) : '',
      environment: Array.isArray(object?.environment)
        ? object.environment.map((e: any) => UniqueKeyValue.fromJSON(e))
        : [],
      status: isSet(object.status) ? deploymentStatusFromJSON(object.status) : 0,
      publicKey: isSet(object.publicKey) ? String(object.publicKey) : undefined,
      instances: Array.isArray(object?.instances) ? object.instances.map((e: any) => InstanceResponse.fromJSON(e)) : [],
    }
  },

  toJSON(message: DeploymentDetailsResponse): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.audit !== undefined && (obj.audit = message.audit ? AuditResponse.toJSON(message.audit) : undefined)
    message.productVersionId !== undefined && (obj.productVersionId = message.productVersionId)
    message.nodeId !== undefined && (obj.nodeId = message.nodeId)
    message.note !== undefined && (obj.note = message.note)
    message.prefix !== undefined && (obj.prefix = message.prefix)
    if (message.environment) {
      obj.environment = message.environment.map(e => (e ? UniqueKeyValue.toJSON(e) : undefined))
    } else {
      obj.environment = []
    }
    message.status !== undefined && (obj.status = deploymentStatusToJSON(message.status))
    message.publicKey !== undefined && (obj.publicKey = message.publicKey)
    if (message.instances) {
      obj.instances = message.instances.map(e => (e ? InstanceResponse.toJSON(e) : undefined))
    } else {
      obj.instances = []
    }
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<DeploymentDetailsResponse>, I>>(object: I): DeploymentDetailsResponse {
    const message = createBaseDeploymentDetailsResponse()
    message.id = object.id ?? ''
    message.audit =
      object.audit !== undefined && object.audit !== null ? AuditResponse.fromPartial(object.audit) : undefined
    message.productVersionId = object.productVersionId ?? ''
    message.nodeId = object.nodeId ?? ''
    message.note = object.note ?? undefined
    message.prefix = object.prefix ?? ''
    message.environment = object.environment?.map(e => UniqueKeyValue.fromPartial(e)) || []
    message.status = object.status ?? 0
    message.publicKey = object.publicKey ?? undefined
    message.instances = object.instances?.map(e => InstanceResponse.fromPartial(e)) || []
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

  fromPartial<I extends Exact<DeepPartial<DeploymentEventLog>, I>>(object: I): DeploymentEventLog {
    const message = createBaseDeploymentEventLog()
    message.log = object.log?.map(e => e) || []
    return message
  },
}

function createBaseDeploymentEventResponse(): DeploymentEventResponse {
  return { type: 0, createdAt: undefined, log: undefined, deploymentStatus: undefined, containerStatus: undefined }
}

export const DeploymentEventResponse = {
  encode(message: DeploymentEventResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.type !== 0) {
      writer.uint32(800).int32(message.type)
    }
    if (message.createdAt !== undefined) {
      Timestamp.encode(message.createdAt, writer.uint32(810).fork()).ldelim()
    }
    if (message.log !== undefined) {
      DeploymentEventLog.encode(message.log, writer.uint32(1602).fork()).ldelim()
    }
    if (message.deploymentStatus !== undefined) {
      writer.uint32(1608).int32(message.deploymentStatus)
    }
    if (message.containerStatus !== undefined) {
      DeploymentEventContainerState.encode(message.containerStatus, writer.uint32(1618).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DeploymentEventResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseDeploymentEventResponse()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 100:
          message.type = reader.int32() as any
          break
        case 101:
          message.createdAt = Timestamp.decode(reader, reader.uint32())
          break
        case 200:
          message.log = DeploymentEventLog.decode(reader, reader.uint32())
          break
        case 201:
          message.deploymentStatus = reader.int32() as any
          break
        case 202:
          message.containerStatus = DeploymentEventContainerState.decode(reader, reader.uint32())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): DeploymentEventResponse {
    return {
      type: isSet(object.type) ? deploymentEventTypeFromJSON(object.type) : 0,
      createdAt: isSet(object.createdAt) ? fromJsonTimestamp(object.createdAt) : undefined,
      log: isSet(object.log) ? DeploymentEventLog.fromJSON(object.log) : undefined,
      deploymentStatus: isSet(object.deploymentStatus) ? deploymentStatusFromJSON(object.deploymentStatus) : undefined,
      containerStatus: isSet(object.containerStatus)
        ? DeploymentEventContainerState.fromJSON(object.containerStatus)
        : undefined,
    }
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
        ? DeploymentEventContainerState.toJSON(message.containerStatus)
        : undefined)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<DeploymentEventResponse>, I>>(object: I): DeploymentEventResponse {
    const message = createBaseDeploymentEventResponse()
    message.type = object.type ?? 0
    message.createdAt =
      object.createdAt !== undefined && object.createdAt !== null ? Timestamp.fromPartial(object.createdAt) : undefined
    message.log =
      object.log !== undefined && object.log !== null ? DeploymentEventLog.fromPartial(object.log) : undefined
    message.deploymentStatus = object.deploymentStatus ?? undefined
    message.containerStatus =
      object.containerStatus !== undefined && object.containerStatus !== null
        ? DeploymentEventContainerState.fromPartial(object.containerStatus)
        : undefined
    return message
  },
}

function createBaseDeploymentEventListResponse(): DeploymentEventListResponse {
  return { data: [] }
}

export const DeploymentEventListResponse = {
  encode(message: DeploymentEventListResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.data) {
      DeploymentEventResponse.encode(v!, writer.uint32(8002).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DeploymentEventListResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseDeploymentEventListResponse()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1000:
          message.data.push(DeploymentEventResponse.decode(reader, reader.uint32()))
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): DeploymentEventListResponse {
    return {
      data: Array.isArray(object?.data) ? object.data.map((e: any) => DeploymentEventResponse.fromJSON(e)) : [],
    }
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

  fromPartial<I extends Exact<DeepPartial<DeploymentEventListResponse>, I>>(object: I): DeploymentEventListResponse {
    const message = createBaseDeploymentEventListResponse()
    message.data = object.data?.map(e => DeploymentEventResponse.fromPartial(e)) || []
    return message
  },
}

function createBaseCreateNotificationRequest(): CreateNotificationRequest {
  return { accessedBy: '', name: '', url: '', type: 0, active: false, events: [] }
}

export const CreateNotificationRequest = {
  encode(message: CreateNotificationRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.accessedBy !== '') {
      writer.uint32(18).string(message.accessedBy)
    }
    if (message.name !== '') {
      writer.uint32(802).string(message.name)
    }
    if (message.url !== '') {
      writer.uint32(810).string(message.url)
    }
    if (message.type !== 0) {
      writer.uint32(816).int32(message.type)
    }
    if (message.active === true) {
      writer.uint32(824).bool(message.active)
    }
    writer.uint32(8002).fork()
    for (const v of message.events) {
      writer.int32(v)
    }
    writer.ldelim()
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CreateNotificationRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseCreateNotificationRequest()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 2:
          message.accessedBy = reader.string()
          break
        case 100:
          message.name = reader.string()
          break
        case 101:
          message.url = reader.string()
          break
        case 102:
          message.type = reader.int32() as any
          break
        case 103:
          message.active = reader.bool()
          break
        case 1000:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos
            while (reader.pos < end2) {
              message.events.push(reader.int32() as any)
            }
          } else {
            message.events.push(reader.int32() as any)
          }
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): CreateNotificationRequest {
    return {
      accessedBy: isSet(object.accessedBy) ? String(object.accessedBy) : '',
      name: isSet(object.name) ? String(object.name) : '',
      url: isSet(object.url) ? String(object.url) : '',
      type: isSet(object.type) ? notificationTypeFromJSON(object.type) : 0,
      active: isSet(object.active) ? Boolean(object.active) : false,
      events: Array.isArray(object?.events) ? object.events.map((e: any) => notificationEventTypeFromJSON(e)) : [],
    }
  },

  toJSON(message: CreateNotificationRequest): unknown {
    const obj: any = {}
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
    message.name !== undefined && (obj.name = message.name)
    message.url !== undefined && (obj.url = message.url)
    message.type !== undefined && (obj.type = notificationTypeToJSON(message.type))
    message.active !== undefined && (obj.active = message.active)
    if (message.events) {
      obj.events = message.events.map(e => notificationEventTypeToJSON(e))
    } else {
      obj.events = []
    }
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<CreateNotificationRequest>, I>>(object: I): CreateNotificationRequest {
    const message = createBaseCreateNotificationRequest()
    message.accessedBy = object.accessedBy ?? ''
    message.name = object.name ?? ''
    message.url = object.url ?? ''
    message.type = object.type ?? 0
    message.active = object.active ?? false
    message.events = object.events?.map(e => e) || []
    return message
  },
}

function createBaseCreateNotificationResponse(): CreateNotificationResponse {
  return { id: '', creator: '' }
}

export const CreateNotificationResponse = {
  encode(message: CreateNotificationResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id)
    }
    if (message.creator !== '') {
      writer.uint32(802).string(message.creator)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CreateNotificationResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseCreateNotificationResponse()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string()
          break
        case 100:
          message.creator = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): CreateNotificationResponse {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      creator: isSet(object.creator) ? String(object.creator) : '',
    }
  },

  toJSON(message: CreateNotificationResponse): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.creator !== undefined && (obj.creator = message.creator)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<CreateNotificationResponse>, I>>(object: I): CreateNotificationResponse {
    const message = createBaseCreateNotificationResponse()
    message.id = object.id ?? ''
    message.creator = object.creator ?? ''
    return message
  },
}

function createBaseUpdateNotificationRequest(): UpdateNotificationRequest {
  return { id: '', accessedBy: '', name: '', url: '', type: 0, active: false, events: [] }
}

export const UpdateNotificationRequest = {
  encode(message: UpdateNotificationRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id)
    }
    if (message.accessedBy !== '') {
      writer.uint32(18).string(message.accessedBy)
    }
    if (message.name !== '') {
      writer.uint32(802).string(message.name)
    }
    if (message.url !== '') {
      writer.uint32(810).string(message.url)
    }
    if (message.type !== 0) {
      writer.uint32(816).int32(message.type)
    }
    if (message.active === true) {
      writer.uint32(824).bool(message.active)
    }
    writer.uint32(8002).fork()
    for (const v of message.events) {
      writer.int32(v)
    }
    writer.ldelim()
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UpdateNotificationRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseUpdateNotificationRequest()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string()
          break
        case 2:
          message.accessedBy = reader.string()
          break
        case 100:
          message.name = reader.string()
          break
        case 101:
          message.url = reader.string()
          break
        case 102:
          message.type = reader.int32() as any
          break
        case 103:
          message.active = reader.bool()
          break
        case 1000:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos
            while (reader.pos < end2) {
              message.events.push(reader.int32() as any)
            }
          } else {
            message.events.push(reader.int32() as any)
          }
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): UpdateNotificationRequest {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      accessedBy: isSet(object.accessedBy) ? String(object.accessedBy) : '',
      name: isSet(object.name) ? String(object.name) : '',
      url: isSet(object.url) ? String(object.url) : '',
      type: isSet(object.type) ? notificationTypeFromJSON(object.type) : 0,
      active: isSet(object.active) ? Boolean(object.active) : false,
      events: Array.isArray(object?.events) ? object.events.map((e: any) => notificationEventTypeFromJSON(e)) : [],
    }
  },

  toJSON(message: UpdateNotificationRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
    message.name !== undefined && (obj.name = message.name)
    message.url !== undefined && (obj.url = message.url)
    message.type !== undefined && (obj.type = notificationTypeToJSON(message.type))
    message.active !== undefined && (obj.active = message.active)
    if (message.events) {
      obj.events = message.events.map(e => notificationEventTypeToJSON(e))
    } else {
      obj.events = []
    }
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<UpdateNotificationRequest>, I>>(object: I): UpdateNotificationRequest {
    const message = createBaseUpdateNotificationRequest()
    message.id = object.id ?? ''
    message.accessedBy = object.accessedBy ?? ''
    message.name = object.name ?? ''
    message.url = object.url ?? ''
    message.type = object.type ?? 0
    message.active = object.active ?? false
    message.events = object.events?.map(e => e) || []
    return message
  },
}

function createBaseNotificationDetailsResponse(): NotificationDetailsResponse {
  return { id: '', audit: undefined, name: '', url: '', type: 0, active: false, events: [] }
}

export const NotificationDetailsResponse = {
  encode(message: NotificationDetailsResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id)
    }
    if (message.audit !== undefined) {
      AuditResponse.encode(message.audit, writer.uint32(18).fork()).ldelim()
    }
    if (message.name !== '') {
      writer.uint32(802).string(message.name)
    }
    if (message.url !== '') {
      writer.uint32(810).string(message.url)
    }
    if (message.type !== 0) {
      writer.uint32(816).int32(message.type)
    }
    if (message.active === true) {
      writer.uint32(824).bool(message.active)
    }
    writer.uint32(8002).fork()
    for (const v of message.events) {
      writer.int32(v)
    }
    writer.ldelim()
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): NotificationDetailsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseNotificationDetailsResponse()
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
          message.url = reader.string()
          break
        case 102:
          message.type = reader.int32() as any
          break
        case 103:
          message.active = reader.bool()
          break
        case 1000:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos
            while (reader.pos < end2) {
              message.events.push(reader.int32() as any)
            }
          } else {
            message.events.push(reader.int32() as any)
          }
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): NotificationDetailsResponse {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      audit: isSet(object.audit) ? AuditResponse.fromJSON(object.audit) : undefined,
      name: isSet(object.name) ? String(object.name) : '',
      url: isSet(object.url) ? String(object.url) : '',
      type: isSet(object.type) ? notificationTypeFromJSON(object.type) : 0,
      active: isSet(object.active) ? Boolean(object.active) : false,
      events: Array.isArray(object?.events) ? object.events.map((e: any) => notificationEventTypeFromJSON(e)) : [],
    }
  },

  toJSON(message: NotificationDetailsResponse): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.audit !== undefined && (obj.audit = message.audit ? AuditResponse.toJSON(message.audit) : undefined)
    message.name !== undefined && (obj.name = message.name)
    message.url !== undefined && (obj.url = message.url)
    message.type !== undefined && (obj.type = notificationTypeToJSON(message.type))
    message.active !== undefined && (obj.active = message.active)
    if (message.events) {
      obj.events = message.events.map(e => notificationEventTypeToJSON(e))
    } else {
      obj.events = []
    }
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<NotificationDetailsResponse>, I>>(object: I): NotificationDetailsResponse {
    const message = createBaseNotificationDetailsResponse()
    message.id = object.id ?? ''
    message.audit =
      object.audit !== undefined && object.audit !== null ? AuditResponse.fromPartial(object.audit) : undefined
    message.name = object.name ?? ''
    message.url = object.url ?? ''
    message.type = object.type ?? 0
    message.active = object.active ?? false
    message.events = object.events?.map(e => e) || []
    return message
  },
}

function createBaseNotificationResponse(): NotificationResponse {
  return { id: '', audit: undefined, name: '', url: '', type: 0, active: false, events: [] }
}

export const NotificationResponse = {
  encode(message: NotificationResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id)
    }
    if (message.audit !== undefined) {
      AuditResponse.encode(message.audit, writer.uint32(18).fork()).ldelim()
    }
    if (message.name !== '') {
      writer.uint32(802).string(message.name)
    }
    if (message.url !== '') {
      writer.uint32(810).string(message.url)
    }
    if (message.type !== 0) {
      writer.uint32(824).int32(message.type)
    }
    if (message.active === true) {
      writer.uint32(832).bool(message.active)
    }
    writer.uint32(8002).fork()
    for (const v of message.events) {
      writer.int32(v)
    }
    writer.ldelim()
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): NotificationResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseNotificationResponse()
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
          message.url = reader.string()
          break
        case 103:
          message.type = reader.int32() as any
          break
        case 104:
          message.active = reader.bool()
          break
        case 1000:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos
            while (reader.pos < end2) {
              message.events.push(reader.int32() as any)
            }
          } else {
            message.events.push(reader.int32() as any)
          }
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): NotificationResponse {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      audit: isSet(object.audit) ? AuditResponse.fromJSON(object.audit) : undefined,
      name: isSet(object.name) ? String(object.name) : '',
      url: isSet(object.url) ? String(object.url) : '',
      type: isSet(object.type) ? notificationTypeFromJSON(object.type) : 0,
      active: isSet(object.active) ? Boolean(object.active) : false,
      events: Array.isArray(object?.events) ? object.events.map((e: any) => notificationEventTypeFromJSON(e)) : [],
    }
  },

  toJSON(message: NotificationResponse): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.audit !== undefined && (obj.audit = message.audit ? AuditResponse.toJSON(message.audit) : undefined)
    message.name !== undefined && (obj.name = message.name)
    message.url !== undefined && (obj.url = message.url)
    message.type !== undefined && (obj.type = notificationTypeToJSON(message.type))
    message.active !== undefined && (obj.active = message.active)
    if (message.events) {
      obj.events = message.events.map(e => notificationEventTypeToJSON(e))
    } else {
      obj.events = []
    }
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<NotificationResponse>, I>>(object: I): NotificationResponse {
    const message = createBaseNotificationResponse()
    message.id = object.id ?? ''
    message.audit =
      object.audit !== undefined && object.audit !== null ? AuditResponse.fromPartial(object.audit) : undefined
    message.name = object.name ?? ''
    message.url = object.url ?? ''
    message.type = object.type ?? 0
    message.active = object.active ?? false
    message.events = object.events?.map(e => e) || []
    return message
  },
}

function createBaseNotificationListResponse(): NotificationListResponse {
  return { data: [] }
}

export const NotificationListResponse = {
  encode(message: NotificationListResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.data) {
      NotificationResponse.encode(v!, writer.uint32(8002).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): NotificationListResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseNotificationListResponse()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1000:
          message.data.push(NotificationResponse.decode(reader, reader.uint32()))
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): NotificationListResponse {
    return { data: Array.isArray(object?.data) ? object.data.map((e: any) => NotificationResponse.fromJSON(e)) : [] }
  },

  toJSON(message: NotificationListResponse): unknown {
    const obj: any = {}
    if (message.data) {
      obj.data = message.data.map(e => (e ? NotificationResponse.toJSON(e) : undefined))
    } else {
      obj.data = []
    }
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<NotificationListResponse>, I>>(object: I): NotificationListResponse {
    const message = createBaseNotificationListResponse()
    message.data = object.data?.map(e => NotificationResponse.fromPartial(e)) || []
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

  fromPartial<I extends Exact<DeepPartial<HealthResponse>, I>>(object: I): HealthResponse {
    const message = createBaseHealthResponse()
    message.status = object.status ?? 0
    message.cruxVersion = object.cruxVersion ?? ''
    message.lastMigration = object.lastMigration ?? undefined
    return message
  },
}

/** Services */
export type CruxProductService = typeof CruxProductService
export const CruxProductService = {
  /** CRUD */
  getProducts: {
    path: '/crux.CruxProduct/GetProducts',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: AccessRequest) => Buffer.from(AccessRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => AccessRequest.decode(value),
    responseSerialize: (value: ProductListResponse) => Buffer.from(ProductListResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => ProductListResponse.decode(value),
  },
  createProduct: {
    path: '/crux.CruxProduct/CreateProduct',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: CreateProductRequest) => Buffer.from(CreateProductRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => CreateProductRequest.decode(value),
    responseSerialize: (value: CreateEntityResponse) => Buffer.from(CreateEntityResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => CreateEntityResponse.decode(value),
  },
  updateProduct: {
    path: '/crux.CruxProduct/UpdateProduct',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: UpdateProductRequest) => Buffer.from(UpdateProductRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => UpdateProductRequest.decode(value),
    responseSerialize: (value: UpdateEntityResponse) => Buffer.from(UpdateEntityResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => UpdateEntityResponse.decode(value),
  },
  deleteProduct: {
    path: '/crux.CruxProduct/DeleteProduct',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: IdRequest) => Buffer.from(IdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => IdRequest.decode(value),
    responseSerialize: (value: Empty) => Buffer.from(Empty.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Empty.decode(value),
  },
  getProductDetails: {
    path: '/crux.CruxProduct/GetProductDetails',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: IdRequest) => Buffer.from(IdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => IdRequest.decode(value),
    responseSerialize: (value: ProductDetailsReponse) => Buffer.from(ProductDetailsReponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => ProductDetailsReponse.decode(value),
  },
} as const

export interface CruxProductServer extends UntypedServiceImplementation {
  /** CRUD */
  getProducts: handleUnaryCall<AccessRequest, ProductListResponse>
  createProduct: handleUnaryCall<CreateProductRequest, CreateEntityResponse>
  updateProduct: handleUnaryCall<UpdateProductRequest, UpdateEntityResponse>
  deleteProduct: handleUnaryCall<IdRequest, Empty>
  getProductDetails: handleUnaryCall<IdRequest, ProductDetailsReponse>
}

export interface CruxProductClient extends Client {
  /** CRUD */
  getProducts(
    request: AccessRequest,
    callback: (error: ServiceError | null, response: ProductListResponse) => void,
  ): ClientUnaryCall
  getProducts(
    request: AccessRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: ProductListResponse) => void,
  ): ClientUnaryCall
  getProducts(
    request: AccessRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: ProductListResponse) => void,
  ): ClientUnaryCall
  createProduct(
    request: CreateProductRequest,
    callback: (error: ServiceError | null, response: CreateEntityResponse) => void,
  ): ClientUnaryCall
  createProduct(
    request: CreateProductRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: CreateEntityResponse) => void,
  ): ClientUnaryCall
  createProduct(
    request: CreateProductRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: CreateEntityResponse) => void,
  ): ClientUnaryCall
  updateProduct(
    request: UpdateProductRequest,
    callback: (error: ServiceError | null, response: UpdateEntityResponse) => void,
  ): ClientUnaryCall
  updateProduct(
    request: UpdateProductRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: UpdateEntityResponse) => void,
  ): ClientUnaryCall
  updateProduct(
    request: UpdateProductRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: UpdateEntityResponse) => void,
  ): ClientUnaryCall
  deleteProduct(request: IdRequest, callback: (error: ServiceError | null, response: Empty) => void): ClientUnaryCall
  deleteProduct(
    request: IdRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  deleteProduct(
    request: IdRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  getProductDetails(
    request: IdRequest,
    callback: (error: ServiceError | null, response: ProductDetailsReponse) => void,
  ): ClientUnaryCall
  getProductDetails(
    request: IdRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: ProductDetailsReponse) => void,
  ): ClientUnaryCall
  getProductDetails(
    request: IdRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: ProductDetailsReponse) => void,
  ): ClientUnaryCall
}

export const CruxProductClient = makeGenericClientConstructor(CruxProductService, 'crux.CruxProduct') as unknown as {
  new (address: string, credentials: ChannelCredentials, options?: Partial<ChannelOptions>): CruxProductClient
  service: typeof CruxProductService
}

export type CruxRegistryService = typeof CruxRegistryService
export const CruxRegistryService = {
  /** CRUD */
  getRegistries: {
    path: '/crux.CruxRegistry/GetRegistries',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: AccessRequest) => Buffer.from(AccessRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => AccessRequest.decode(value),
    responseSerialize: (value: RegistryListResponse) => Buffer.from(RegistryListResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => RegistryListResponse.decode(value),
  },
  createRegistry: {
    path: '/crux.CruxRegistry/CreateRegistry',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: CreateRegistryRequest) => Buffer.from(CreateRegistryRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => CreateRegistryRequest.decode(value),
    responseSerialize: (value: CreateEntityResponse) => Buffer.from(CreateEntityResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => CreateEntityResponse.decode(value),
  },
  updateRegistry: {
    path: '/crux.CruxRegistry/UpdateRegistry',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: UpdateRegistryRequest) => Buffer.from(UpdateRegistryRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => UpdateRegistryRequest.decode(value),
    responseSerialize: (value: UpdateEntityResponse) => Buffer.from(UpdateEntityResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => UpdateEntityResponse.decode(value),
  },
  deleteRegistry: {
    path: '/crux.CruxRegistry/DeleteRegistry',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: IdRequest) => Buffer.from(IdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => IdRequest.decode(value),
    responseSerialize: (value: Empty) => Buffer.from(Empty.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Empty.decode(value),
  },
  getRegistryDetails: {
    path: '/crux.CruxRegistry/GetRegistryDetails',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: IdRequest) => Buffer.from(IdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => IdRequest.decode(value),
    responseSerialize: (value: RegistryDetailsResponse) => Buffer.from(RegistryDetailsResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => RegistryDetailsResponse.decode(value),
  },
} as const

export interface CruxRegistryServer extends UntypedServiceImplementation {
  /** CRUD */
  getRegistries: handleUnaryCall<AccessRequest, RegistryListResponse>
  createRegistry: handleUnaryCall<CreateRegistryRequest, CreateEntityResponse>
  updateRegistry: handleUnaryCall<UpdateRegistryRequest, UpdateEntityResponse>
  deleteRegistry: handleUnaryCall<IdRequest, Empty>
  getRegistryDetails: handleUnaryCall<IdRequest, RegistryDetailsResponse>
}

export interface CruxRegistryClient extends Client {
  /** CRUD */
  getRegistries(
    request: AccessRequest,
    callback: (error: ServiceError | null, response: RegistryListResponse) => void,
  ): ClientUnaryCall
  getRegistries(
    request: AccessRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: RegistryListResponse) => void,
  ): ClientUnaryCall
  getRegistries(
    request: AccessRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: RegistryListResponse) => void,
  ): ClientUnaryCall
  createRegistry(
    request: CreateRegistryRequest,
    callback: (error: ServiceError | null, response: CreateEntityResponse) => void,
  ): ClientUnaryCall
  createRegistry(
    request: CreateRegistryRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: CreateEntityResponse) => void,
  ): ClientUnaryCall
  createRegistry(
    request: CreateRegistryRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: CreateEntityResponse) => void,
  ): ClientUnaryCall
  updateRegistry(
    request: UpdateRegistryRequest,
    callback: (error: ServiceError | null, response: UpdateEntityResponse) => void,
  ): ClientUnaryCall
  updateRegistry(
    request: UpdateRegistryRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: UpdateEntityResponse) => void,
  ): ClientUnaryCall
  updateRegistry(
    request: UpdateRegistryRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: UpdateEntityResponse) => void,
  ): ClientUnaryCall
  deleteRegistry(request: IdRequest, callback: (error: ServiceError | null, response: Empty) => void): ClientUnaryCall
  deleteRegistry(
    request: IdRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  deleteRegistry(
    request: IdRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  getRegistryDetails(
    request: IdRequest,
    callback: (error: ServiceError | null, response: RegistryDetailsResponse) => void,
  ): ClientUnaryCall
  getRegistryDetails(
    request: IdRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: RegistryDetailsResponse) => void,
  ): ClientUnaryCall
  getRegistryDetails(
    request: IdRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: RegistryDetailsResponse) => void,
  ): ClientUnaryCall
}

export const CruxRegistryClient = makeGenericClientConstructor(CruxRegistryService, 'crux.CruxRegistry') as unknown as {
  new (address: string, credentials: ChannelCredentials, options?: Partial<ChannelOptions>): CruxRegistryClient
  service: typeof CruxRegistryService
}

export type CruxNodeService = typeof CruxNodeService
export const CruxNodeService = {
  /** CRUD */
  getNodes: {
    path: '/crux.CruxNode/GetNodes',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: AccessRequest) => Buffer.from(AccessRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => AccessRequest.decode(value),
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
} as const

export interface CruxNodeServer extends UntypedServiceImplementation {
  /** CRUD */
  getNodes: handleUnaryCall<AccessRequest, NodeListResponse>
  createNode: handleUnaryCall<CreateNodeRequest, CreateEntityResponse>
  updateNode: handleUnaryCall<UpdateNodeRequest, Empty>
  deleteNode: handleUnaryCall<IdRequest, Empty>
  getNodeDetails: handleUnaryCall<IdRequest, NodeDetailsResponse>
  generateScript: handleUnaryCall<GenerateScriptRequest, NodeInstallResponse>
  getScript: handleUnaryCall<ServiceIdRequest, NodeScriptResponse>
  discardScript: handleUnaryCall<IdRequest, Empty>
  revokeToken: handleUnaryCall<IdRequest, Empty>
  subscribeNodeEventChannel: handleServerStreamingCall<ServiceIdRequest, NodeEventMessage>
  watchContainerState: handleServerStreamingCall<WatchContainerStateRequest, ContainerStateListMessage>
}

export interface CruxNodeClient extends Client {
  /** CRUD */
  getNodes(
    request: AccessRequest,
    callback: (error: ServiceError | null, response: NodeListResponse) => void,
  ): ClientUnaryCall
  getNodes(
    request: AccessRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: NodeListResponse) => void,
  ): ClientUnaryCall
  getNodes(
    request: AccessRequest,
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
}

export const CruxNodeClient = makeGenericClientConstructor(CruxNodeService, 'crux.CruxNode') as unknown as {
  new (address: string, credentials: ChannelCredentials, options?: Partial<ChannelOptions>): CruxNodeClient
  service: typeof CruxNodeService
}

export type CruxProductVersionService = typeof CruxProductVersionService
export const CruxProductVersionService = {
  getVersionsByProductId: {
    path: '/crux.CruxProductVersion/GetVersionsByProductId',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: IdRequest) => Buffer.from(IdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => IdRequest.decode(value),
    responseSerialize: (value: VersionListResponse) => Buffer.from(VersionListResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => VersionListResponse.decode(value),
  },
  createVersion: {
    path: '/crux.CruxProductVersion/CreateVersion',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: CreateVersionRequest) => Buffer.from(CreateVersionRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => CreateVersionRequest.decode(value),
    responseSerialize: (value: CreateEntityResponse) => Buffer.from(CreateEntityResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => CreateEntityResponse.decode(value),
  },
  updateVersion: {
    path: '/crux.CruxProductVersion/UpdateVersion',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: UpdateVersionRequest) => Buffer.from(UpdateVersionRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => UpdateVersionRequest.decode(value),
    responseSerialize: (value: UpdateEntityResponse) => Buffer.from(UpdateEntityResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => UpdateEntityResponse.decode(value),
  },
  deleteVersion: {
    path: '/crux.CruxProductVersion/DeleteVersion',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: IdRequest) => Buffer.from(IdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => IdRequest.decode(value),
    responseSerialize: (value: Empty) => Buffer.from(Empty.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Empty.decode(value),
  },
  setDefaultVersion: {
    path: '/crux.CruxProductVersion/SetDefaultVersion',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: IdRequest) => Buffer.from(IdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => IdRequest.decode(value),
    responseSerialize: (value: Empty) => Buffer.from(Empty.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Empty.decode(value),
  },
  getVersionDetails: {
    path: '/crux.CruxProductVersion/GetVersionDetails',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: IdRequest) => Buffer.from(IdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => IdRequest.decode(value),
    responseSerialize: (value: VersionDetailsResponse) => Buffer.from(VersionDetailsResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => VersionDetailsResponse.decode(value),
  },
  increaseVersion: {
    path: '/crux.CruxProductVersion/IncreaseVersion',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: IncreaseVersionRequest) => Buffer.from(IncreaseVersionRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => IncreaseVersionRequest.decode(value),
    responseSerialize: (value: CreateEntityResponse) => Buffer.from(CreateEntityResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => CreateEntityResponse.decode(value),
  },
} as const

export interface CruxProductVersionServer extends UntypedServiceImplementation {
  getVersionsByProductId: handleUnaryCall<IdRequest, VersionListResponse>
  createVersion: handleUnaryCall<CreateVersionRequest, CreateEntityResponse>
  updateVersion: handleUnaryCall<UpdateVersionRequest, UpdateEntityResponse>
  deleteVersion: handleUnaryCall<IdRequest, Empty>
  setDefaultVersion: handleUnaryCall<IdRequest, Empty>
  getVersionDetails: handleUnaryCall<IdRequest, VersionDetailsResponse>
  increaseVersion: handleUnaryCall<IncreaseVersionRequest, CreateEntityResponse>
}

export interface CruxProductVersionClient extends Client {
  getVersionsByProductId(
    request: IdRequest,
    callback: (error: ServiceError | null, response: VersionListResponse) => void,
  ): ClientUnaryCall
  getVersionsByProductId(
    request: IdRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: VersionListResponse) => void,
  ): ClientUnaryCall
  getVersionsByProductId(
    request: IdRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: VersionListResponse) => void,
  ): ClientUnaryCall
  createVersion(
    request: CreateVersionRequest,
    callback: (error: ServiceError | null, response: CreateEntityResponse) => void,
  ): ClientUnaryCall
  createVersion(
    request: CreateVersionRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: CreateEntityResponse) => void,
  ): ClientUnaryCall
  createVersion(
    request: CreateVersionRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: CreateEntityResponse) => void,
  ): ClientUnaryCall
  updateVersion(
    request: UpdateVersionRequest,
    callback: (error: ServiceError | null, response: UpdateEntityResponse) => void,
  ): ClientUnaryCall
  updateVersion(
    request: UpdateVersionRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: UpdateEntityResponse) => void,
  ): ClientUnaryCall
  updateVersion(
    request: UpdateVersionRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: UpdateEntityResponse) => void,
  ): ClientUnaryCall
  deleteVersion(request: IdRequest, callback: (error: ServiceError | null, response: Empty) => void): ClientUnaryCall
  deleteVersion(
    request: IdRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  deleteVersion(
    request: IdRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  setDefaultVersion(
    request: IdRequest,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  setDefaultVersion(
    request: IdRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  setDefaultVersion(
    request: IdRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  getVersionDetails(
    request: IdRequest,
    callback: (error: ServiceError | null, response: VersionDetailsResponse) => void,
  ): ClientUnaryCall
  getVersionDetails(
    request: IdRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: VersionDetailsResponse) => void,
  ): ClientUnaryCall
  getVersionDetails(
    request: IdRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: VersionDetailsResponse) => void,
  ): ClientUnaryCall
  increaseVersion(
    request: IncreaseVersionRequest,
    callback: (error: ServiceError | null, response: CreateEntityResponse) => void,
  ): ClientUnaryCall
  increaseVersion(
    request: IncreaseVersionRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: CreateEntityResponse) => void,
  ): ClientUnaryCall
  increaseVersion(
    request: IncreaseVersionRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: CreateEntityResponse) => void,
  ): ClientUnaryCall
}

export const CruxProductVersionClient = makeGenericClientConstructor(
  CruxProductVersionService,
  'crux.CruxProductVersion',
) as unknown as {
  new (address: string, credentials: ChannelCredentials, options?: Partial<ChannelOptions>): CruxProductVersionClient
  service: typeof CruxProductVersionService
}

export type CruxImageService = typeof CruxImageService
export const CruxImageService = {
  getImagesByVersionId: {
    path: '/crux.CruxImage/GetImagesByVersionId',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: IdRequest) => Buffer.from(IdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => IdRequest.decode(value),
    responseSerialize: (value: ImageListResponse) => Buffer.from(ImageListResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => ImageListResponse.decode(value),
  },
  addImagesToVersion: {
    path: '/crux.CruxImage/AddImagesToVersion',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: AddImagesToVersionRequest) =>
      Buffer.from(AddImagesToVersionRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => AddImagesToVersionRequest.decode(value),
    responseSerialize: (value: ImageListResponse) => Buffer.from(ImageListResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => ImageListResponse.decode(value),
  },
  orderImages: {
    path: '/crux.CruxImage/OrderImages',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: OrderVersionImagesRequest) =>
      Buffer.from(OrderVersionImagesRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => OrderVersionImagesRequest.decode(value),
    responseSerialize: (value: Empty) => Buffer.from(Empty.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Empty.decode(value),
  },
  patchImage: {
    path: '/crux.CruxImage/PatchImage',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: PatchImageRequest) => Buffer.from(PatchImageRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => PatchImageRequest.decode(value),
    responseSerialize: (value: Empty) => Buffer.from(Empty.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Empty.decode(value),
  },
  deleteImage: {
    path: '/crux.CruxImage/DeleteImage',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: IdRequest) => Buffer.from(IdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => IdRequest.decode(value),
    responseSerialize: (value: Empty) => Buffer.from(Empty.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Empty.decode(value),
  },
  getImageDetails: {
    path: '/crux.CruxImage/GetImageDetails',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: IdRequest) => Buffer.from(IdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => IdRequest.decode(value),
    responseSerialize: (value: ImageResponse) => Buffer.from(ImageResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => ImageResponse.decode(value),
  },
} as const

export interface CruxImageServer extends UntypedServiceImplementation {
  getImagesByVersionId: handleUnaryCall<IdRequest, ImageListResponse>
  addImagesToVersion: handleUnaryCall<AddImagesToVersionRequest, ImageListResponse>
  orderImages: handleUnaryCall<OrderVersionImagesRequest, Empty>
  patchImage: handleUnaryCall<PatchImageRequest, Empty>
  deleteImage: handleUnaryCall<IdRequest, Empty>
  getImageDetails: handleUnaryCall<IdRequest, ImageResponse>
}

export interface CruxImageClient extends Client {
  getImagesByVersionId(
    request: IdRequest,
    callback: (error: ServiceError | null, response: ImageListResponse) => void,
  ): ClientUnaryCall
  getImagesByVersionId(
    request: IdRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: ImageListResponse) => void,
  ): ClientUnaryCall
  getImagesByVersionId(
    request: IdRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: ImageListResponse) => void,
  ): ClientUnaryCall
  addImagesToVersion(
    request: AddImagesToVersionRequest,
    callback: (error: ServiceError | null, response: ImageListResponse) => void,
  ): ClientUnaryCall
  addImagesToVersion(
    request: AddImagesToVersionRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: ImageListResponse) => void,
  ): ClientUnaryCall
  addImagesToVersion(
    request: AddImagesToVersionRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: ImageListResponse) => void,
  ): ClientUnaryCall
  orderImages(
    request: OrderVersionImagesRequest,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  orderImages(
    request: OrderVersionImagesRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  orderImages(
    request: OrderVersionImagesRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  patchImage(
    request: PatchImageRequest,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  patchImage(
    request: PatchImageRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  patchImage(
    request: PatchImageRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  deleteImage(request: IdRequest, callback: (error: ServiceError | null, response: Empty) => void): ClientUnaryCall
  deleteImage(
    request: IdRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  deleteImage(
    request: IdRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  getImageDetails(
    request: IdRequest,
    callback: (error: ServiceError | null, response: ImageResponse) => void,
  ): ClientUnaryCall
  getImageDetails(
    request: IdRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: ImageResponse) => void,
  ): ClientUnaryCall
  getImageDetails(
    request: IdRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: ImageResponse) => void,
  ): ClientUnaryCall
}

export const CruxImageClient = makeGenericClientConstructor(CruxImageService, 'crux.CruxImage') as unknown as {
  new (address: string, credentials: ChannelCredentials, options?: Partial<ChannelOptions>): CruxImageClient
  service: typeof CruxImageService
}

export type CruxDeploymentService = typeof CruxDeploymentService
export const CruxDeploymentService = {
  getDeploymentsByVersionId: {
    path: '/crux.CruxDeployment/GetDeploymentsByVersionId',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: IdRequest) => Buffer.from(IdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => IdRequest.decode(value),
    responseSerialize: (value: DeploymentListByVersionResponse) =>
      Buffer.from(DeploymentListByVersionResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => DeploymentListByVersionResponse.decode(value),
  },
  createDeployment: {
    path: '/crux.CruxDeployment/CreateDeployment',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: CreateDeploymentRequest) => Buffer.from(CreateDeploymentRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => CreateDeploymentRequest.decode(value),
    responseSerialize: (value: CreateEntityResponse) => Buffer.from(CreateEntityResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => CreateEntityResponse.decode(value),
  },
  updateDeployment: {
    path: '/crux.CruxDeployment/UpdateDeployment',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: UpdateDeploymentRequest) => Buffer.from(UpdateDeploymentRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => UpdateDeploymentRequest.decode(value),
    responseSerialize: (value: UpdateEntityResponse) => Buffer.from(UpdateEntityResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => UpdateEntityResponse.decode(value),
  },
  patchDeployment: {
    path: '/crux.CruxDeployment/PatchDeployment',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: PatchDeploymentRequest) => Buffer.from(PatchDeploymentRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => PatchDeploymentRequest.decode(value),
    responseSerialize: (value: UpdateEntityResponse) => Buffer.from(UpdateEntityResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => UpdateEntityResponse.decode(value),
  },
  deleteDeployment: {
    path: '/crux.CruxDeployment/DeleteDeployment',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: IdRequest) => Buffer.from(IdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => IdRequest.decode(value),
    responseSerialize: (value: Empty) => Buffer.from(Empty.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Empty.decode(value),
  },
  getDeploymentDetails: {
    path: '/crux.CruxDeployment/GetDeploymentDetails',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: IdRequest) => Buffer.from(IdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => IdRequest.decode(value),
    responseSerialize: (value: DeploymentDetailsResponse) =>
      Buffer.from(DeploymentDetailsResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => DeploymentDetailsResponse.decode(value),
  },
  getDeploymentEvents: {
    path: '/crux.CruxDeployment/GetDeploymentEvents',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: IdRequest) => Buffer.from(IdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => IdRequest.decode(value),
    responseSerialize: (value: DeploymentEventListResponse) =>
      Buffer.from(DeploymentEventListResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => DeploymentEventListResponse.decode(value),
  },
  getDeploymentList: {
    path: '/crux.CruxDeployment/GetDeploymentList',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: AccessRequest) => Buffer.from(AccessRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => AccessRequest.decode(value),
    responseSerialize: (value: DeploymentListResponse) => Buffer.from(DeploymentListResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => DeploymentListResponse.decode(value),
  },
  getSecrets: {
    path: '/crux.CruxDeployment/GetSecrets',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: PrefixRequest) => Buffer.from(PrefixRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => PrefixRequest.decode(value),
    responseSerialize: (value: ListSecretsResponse) => Buffer.from(ListSecretsResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => ListSecretsResponse.decode(value),
  },
  startDeployment: {
    path: '/crux.CruxDeployment/StartDeployment',
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
  getDeploymentsByVersionId: handleUnaryCall<IdRequest, DeploymentListByVersionResponse>
  createDeployment: handleUnaryCall<CreateDeploymentRequest, CreateEntityResponse>
  updateDeployment: handleUnaryCall<UpdateDeploymentRequest, UpdateEntityResponse>
  patchDeployment: handleUnaryCall<PatchDeploymentRequest, UpdateEntityResponse>
  deleteDeployment: handleUnaryCall<IdRequest, Empty>
  getDeploymentDetails: handleUnaryCall<IdRequest, DeploymentDetailsResponse>
  getDeploymentEvents: handleUnaryCall<IdRequest, DeploymentEventListResponse>
  getDeploymentList: handleUnaryCall<AccessRequest, DeploymentListResponse>
  getSecrets: handleUnaryCall<PrefixRequest, ListSecretsResponse>
  startDeployment: handleServerStreamingCall<IdRequest, DeploymentProgressMessage>
  subscribeToDeploymentEditEvents: handleServerStreamingCall<ServiceIdRequest, DeploymentEditEventMessage>
}

export interface CruxDeploymentClient extends Client {
  getDeploymentsByVersionId(
    request: IdRequest,
    callback: (error: ServiceError | null, response: DeploymentListByVersionResponse) => void,
  ): ClientUnaryCall
  getDeploymentsByVersionId(
    request: IdRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: DeploymentListByVersionResponse) => void,
  ): ClientUnaryCall
  getDeploymentsByVersionId(
    request: IdRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: DeploymentListByVersionResponse) => void,
  ): ClientUnaryCall
  createDeployment(
    request: CreateDeploymentRequest,
    callback: (error: ServiceError | null, response: CreateEntityResponse) => void,
  ): ClientUnaryCall
  createDeployment(
    request: CreateDeploymentRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: CreateEntityResponse) => void,
  ): ClientUnaryCall
  createDeployment(
    request: CreateDeploymentRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: CreateEntityResponse) => void,
  ): ClientUnaryCall
  updateDeployment(
    request: UpdateDeploymentRequest,
    callback: (error: ServiceError | null, response: UpdateEntityResponse) => void,
  ): ClientUnaryCall
  updateDeployment(
    request: UpdateDeploymentRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: UpdateEntityResponse) => void,
  ): ClientUnaryCall
  updateDeployment(
    request: UpdateDeploymentRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: UpdateEntityResponse) => void,
  ): ClientUnaryCall
  patchDeployment(
    request: PatchDeploymentRequest,
    callback: (error: ServiceError | null, response: UpdateEntityResponse) => void,
  ): ClientUnaryCall
  patchDeployment(
    request: PatchDeploymentRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: UpdateEntityResponse) => void,
  ): ClientUnaryCall
  patchDeployment(
    request: PatchDeploymentRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: UpdateEntityResponse) => void,
  ): ClientUnaryCall
  deleteDeployment(request: IdRequest, callback: (error: ServiceError | null, response: Empty) => void): ClientUnaryCall
  deleteDeployment(
    request: IdRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  deleteDeployment(
    request: IdRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  getDeploymentDetails(
    request: IdRequest,
    callback: (error: ServiceError | null, response: DeploymentDetailsResponse) => void,
  ): ClientUnaryCall
  getDeploymentDetails(
    request: IdRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: DeploymentDetailsResponse) => void,
  ): ClientUnaryCall
  getDeploymentDetails(
    request: IdRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: DeploymentDetailsResponse) => void,
  ): ClientUnaryCall
  getDeploymentEvents(
    request: IdRequest,
    callback: (error: ServiceError | null, response: DeploymentEventListResponse) => void,
  ): ClientUnaryCall
  getDeploymentEvents(
    request: IdRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: DeploymentEventListResponse) => void,
  ): ClientUnaryCall
  getDeploymentEvents(
    request: IdRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: DeploymentEventListResponse) => void,
  ): ClientUnaryCall
  getDeploymentList(
    request: AccessRequest,
    callback: (error: ServiceError | null, response: DeploymentListResponse) => void,
  ): ClientUnaryCall
  getDeploymentList(
    request: AccessRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: DeploymentListResponse) => void,
  ): ClientUnaryCall
  getDeploymentList(
    request: AccessRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: DeploymentListResponse) => void,
  ): ClientUnaryCall
  getSecrets(
    request: PrefixRequest,
    callback: (error: ServiceError | null, response: ListSecretsResponse) => void,
  ): ClientUnaryCall
  getSecrets(
    request: PrefixRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: ListSecretsResponse) => void,
  ): ClientUnaryCall
  getSecrets(
    request: PrefixRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: ListSecretsResponse) => void,
  ): ClientUnaryCall
  startDeployment(request: IdRequest, options?: Partial<CallOptions>): ClientReadableStream<DeploymentProgressMessage>
  startDeployment(
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
  new (address: string, credentials: ChannelCredentials, options?: Partial<ChannelOptions>): CruxDeploymentClient
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
    requestSerialize: (value: AccessRequest) => Buffer.from(AccessRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => AccessRequest.decode(value),
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
  acceptTeamInvite: {
    path: '/crux.CruxTeam/AcceptTeamInvite',
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
    requestSerialize: (value: AccessRequest) => Buffer.from(AccessRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => AccessRequest.decode(value),
    responseSerialize: (value: UserMetaResponse) => Buffer.from(UserMetaResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => UserMetaResponse.decode(value),
  },
  getAllTeams: {
    path: '/crux.CruxTeam/GetAllTeams',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: AccessRequest) => Buffer.from(AccessRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => AccessRequest.decode(value),
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
  getActiveTeamByUser: handleUnaryCall<AccessRequest, ActiveTeamDetailsResponse>
  updateTeam: handleUnaryCall<UpdateTeamRequest, Empty>
  deleteTeam: handleUnaryCall<IdRequest, Empty>
  updateUserRole: handleUnaryCall<UpdateUserRoleInTeamRequest, Empty>
  inviteUserToTeam: handleUnaryCall<InviteUserRequest, CreateEntityResponse>
  deleteUserFromTeam: handleUnaryCall<DeleteUserFromTeamRequest, Empty>
  acceptTeamInvite: handleUnaryCall<IdRequest, Empty>
  selectTeam: handleUnaryCall<IdRequest, Empty>
  getUserMeta: handleUnaryCall<AccessRequest, UserMetaResponse>
  getAllTeams: handleUnaryCall<AccessRequest, AllTeamsResponse>
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
    request: AccessRequest,
    callback: (error: ServiceError | null, response: ActiveTeamDetailsResponse) => void,
  ): ClientUnaryCall
  getActiveTeamByUser(
    request: AccessRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: ActiveTeamDetailsResponse) => void,
  ): ClientUnaryCall
  getActiveTeamByUser(
    request: AccessRequest,
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
  acceptTeamInvite(request: IdRequest, callback: (error: ServiceError | null, response: Empty) => void): ClientUnaryCall
  acceptTeamInvite(
    request: IdRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  acceptTeamInvite(
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
    request: AccessRequest,
    callback: (error: ServiceError | null, response: UserMetaResponse) => void,
  ): ClientUnaryCall
  getUserMeta(
    request: AccessRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: UserMetaResponse) => void,
  ): ClientUnaryCall
  getUserMeta(
    request: AccessRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: UserMetaResponse) => void,
  ): ClientUnaryCall
  getAllTeams(
    request: AccessRequest,
    callback: (error: ServiceError | null, response: AllTeamsResponse) => void,
  ): ClientUnaryCall
  getAllTeams(
    request: AccessRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: AllTeamsResponse) => void,
  ): ClientUnaryCall
  getAllTeams(
    request: AccessRequest,
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
  new (address: string, credentials: ChannelCredentials, options?: Partial<ChannelOptions>): CruxTeamClient
  service: typeof CruxTeamService
}

export type CruxNotificationService = typeof CruxNotificationService
export const CruxNotificationService = {
  createNotification: {
    path: '/crux.CruxNotification/CreateNotification',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: CreateNotificationRequest) =>
      Buffer.from(CreateNotificationRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => CreateNotificationRequest.decode(value),
    responseSerialize: (value: CreateNotificationResponse) =>
      Buffer.from(CreateNotificationResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => CreateNotificationResponse.decode(value),
  },
  updateNotification: {
    path: '/crux.CruxNotification/UpdateNotification',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: UpdateNotificationRequest) =>
      Buffer.from(UpdateNotificationRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => UpdateNotificationRequest.decode(value),
    responseSerialize: (value: UpdateEntityResponse) => Buffer.from(UpdateEntityResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => UpdateEntityResponse.decode(value),
  },
  deleteNotification: {
    path: '/crux.CruxNotification/DeleteNotification',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: IdRequest) => Buffer.from(IdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => IdRequest.decode(value),
    responseSerialize: (value: Empty) => Buffer.from(Empty.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Empty.decode(value),
  },
  getNotificationList: {
    path: '/crux.CruxNotification/GetNotificationList',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: AccessRequest) => Buffer.from(AccessRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => AccessRequest.decode(value),
    responseSerialize: (value: NotificationListResponse) =>
      Buffer.from(NotificationListResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => NotificationListResponse.decode(value),
  },
  getNotificationDetails: {
    path: '/crux.CruxNotification/GetNotificationDetails',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: IdRequest) => Buffer.from(IdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => IdRequest.decode(value),
    responseSerialize: (value: NotificationDetailsResponse) =>
      Buffer.from(NotificationDetailsResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => NotificationDetailsResponse.decode(value),
  },
  testNotification: {
    path: '/crux.CruxNotification/TestNotification',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: IdRequest) => Buffer.from(IdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => IdRequest.decode(value),
    responseSerialize: (value: Empty) => Buffer.from(Empty.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Empty.decode(value),
  },
} as const

export interface CruxNotificationServer extends UntypedServiceImplementation {
  createNotification: handleUnaryCall<CreateNotificationRequest, CreateNotificationResponse>
  updateNotification: handleUnaryCall<UpdateNotificationRequest, UpdateEntityResponse>
  deleteNotification: handleUnaryCall<IdRequest, Empty>
  getNotificationList: handleUnaryCall<AccessRequest, NotificationListResponse>
  getNotificationDetails: handleUnaryCall<IdRequest, NotificationDetailsResponse>
  testNotification: handleUnaryCall<IdRequest, Empty>
}

export interface CruxNotificationClient extends Client {
  createNotification(
    request: CreateNotificationRequest,
    callback: (error: ServiceError | null, response: CreateNotificationResponse) => void,
  ): ClientUnaryCall
  createNotification(
    request: CreateNotificationRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: CreateNotificationResponse) => void,
  ): ClientUnaryCall
  createNotification(
    request: CreateNotificationRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: CreateNotificationResponse) => void,
  ): ClientUnaryCall
  updateNotification(
    request: UpdateNotificationRequest,
    callback: (error: ServiceError | null, response: UpdateEntityResponse) => void,
  ): ClientUnaryCall
  updateNotification(
    request: UpdateNotificationRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: UpdateEntityResponse) => void,
  ): ClientUnaryCall
  updateNotification(
    request: UpdateNotificationRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: UpdateEntityResponse) => void,
  ): ClientUnaryCall
  deleteNotification(
    request: IdRequest,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  deleteNotification(
    request: IdRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  deleteNotification(
    request: IdRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  getNotificationList(
    request: AccessRequest,
    callback: (error: ServiceError | null, response: NotificationListResponse) => void,
  ): ClientUnaryCall
  getNotificationList(
    request: AccessRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: NotificationListResponse) => void,
  ): ClientUnaryCall
  getNotificationList(
    request: AccessRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: NotificationListResponse) => void,
  ): ClientUnaryCall
  getNotificationDetails(
    request: IdRequest,
    callback: (error: ServiceError | null, response: NotificationDetailsResponse) => void,
  ): ClientUnaryCall
  getNotificationDetails(
    request: IdRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: NotificationDetailsResponse) => void,
  ): ClientUnaryCall
  getNotificationDetails(
    request: IdRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: NotificationDetailsResponse) => void,
  ): ClientUnaryCall
  testNotification(request: IdRequest, callback: (error: ServiceError | null, response: Empty) => void): ClientUnaryCall
  testNotification(
    request: IdRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  testNotification(
    request: IdRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
}

export const CruxNotificationClient = makeGenericClientConstructor(
  CruxNotificationService,
  'crux.CruxNotification',
) as unknown as {
  new (address: string, credentials: ChannelCredentials, options?: Partial<ChannelOptions>): CruxNotificationClient
  service: typeof CruxNotificationService
}

export type CruxAuditService = typeof CruxAuditService
export const CruxAuditService = {
  getAuditLog: {
    path: '/crux.CruxAudit/GetAuditLog',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: AccessRequest) => Buffer.from(AccessRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => AccessRequest.decode(value),
    responseSerialize: (value: AuditLogListResponse) => Buffer.from(AuditLogListResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => AuditLogListResponse.decode(value),
  },
} as const

export interface CruxAuditServer extends UntypedServiceImplementation {
  getAuditLog: handleUnaryCall<AccessRequest, AuditLogListResponse>
}

export interface CruxAuditClient extends Client {
  getAuditLog(
    request: AccessRequest,
    callback: (error: ServiceError | null, response: AuditLogListResponse) => void,
  ): ClientUnaryCall
  getAuditLog(
    request: AccessRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: AuditLogListResponse) => void,
  ): ClientUnaryCall
  getAuditLog(
    request: AccessRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: AuditLogListResponse) => void,
  ): ClientUnaryCall
}

export const CruxAuditClient = makeGenericClientConstructor(CruxAuditService, 'crux.CruxAudit') as unknown as {
  new (address: string, credentials: ChannelCredentials, options?: Partial<ChannelOptions>): CruxAuditClient
  service: typeof CruxAuditService
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
  new (address: string, credentials: ChannelCredentials, options?: Partial<ChannelOptions>): CruxHealthClient
  service: typeof CruxHealthService
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
