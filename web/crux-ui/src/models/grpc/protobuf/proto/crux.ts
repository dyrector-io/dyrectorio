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
  ListSecretsResponse,
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

/** PRODUCT */
export enum ProductType {
  PRODUCT_TYPE_UNSPECIFIED = 0,
  SIMPLE = 1,
  COMPLEX = 2,
  UNRECOGNIZED = -1,
}

export function productTypeFromJSON(object: any): ProductType {
  switch (object) {
    case 0:
    case 'PRODUCT_TYPE_UNSPECIFIED':
      return ProductType.PRODUCT_TYPE_UNSPECIFIED
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
    case ProductType.PRODUCT_TYPE_UNSPECIFIED:
      return 'PRODUCT_TYPE_UNSPECIFIED'
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

export enum RegistryNamespace {
  REGISTRY_NAMESPACE_UNSPECIFIED = 0,
  RNS_ORGANIZATION = 1,
  RNS_USER = 2,
  RNS_GROUP = 3,
  RNS_PROJECT = 4,
  UNRECOGNIZED = -1,
}

export function registryNamespaceFromJSON(object: any): RegistryNamespace {
  switch (object) {
    case 0:
    case 'REGISTRY_NAMESPACE_UNSPECIFIED':
      return RegistryNamespace.REGISTRY_NAMESPACE_UNSPECIFIED
    case 1:
    case 'RNS_ORGANIZATION':
      return RegistryNamespace.RNS_ORGANIZATION
    case 2:
    case 'RNS_USER':
      return RegistryNamespace.RNS_USER
    case 3:
    case 'RNS_GROUP':
      return RegistryNamespace.RNS_GROUP
    case 4:
    case 'RNS_PROJECT':
      return RegistryNamespace.RNS_PROJECT
    case -1:
    case 'UNRECOGNIZED':
    default:
      return RegistryNamespace.UNRECOGNIZED
  }
}

export function registryNamespaceToJSON(object: RegistryNamespace): string {
  switch (object) {
    case RegistryNamespace.REGISTRY_NAMESPACE_UNSPECIFIED:
      return 'REGISTRY_NAMESPACE_UNSPECIFIED'
    case RegistryNamespace.RNS_ORGANIZATION:
      return 'RNS_ORGANIZATION'
    case RegistryNamespace.RNS_USER:
      return 'RNS_USER'
    case RegistryNamespace.RNS_GROUP:
      return 'RNS_GROUP'
    case RegistryNamespace.RNS_PROJECT:
      return 'RNS_PROJECT'
    case RegistryNamespace.UNRECOGNIZED:
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

export enum NotificationType {
  NOTIFICATION_TYPE_UNSPECIFIED = 0,
  DISCORD = 1,
  SLACK = 2,
  TEAMS = 3,
  UNRECOGNIZED = -1,
}

export function notificationTypeFromJSON(object: any): NotificationType {
  switch (object) {
    case 0:
    case 'NOTIFICATION_TYPE_UNSPECIFIED':
      return NotificationType.NOTIFICATION_TYPE_UNSPECIFIED
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
    case NotificationType.NOTIFICATION_TYPE_UNSPECIFIED:
      return 'NOTIFICATION_TYPE_UNSPECIFIED'
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
  NOTIFICATION_EVENT_TYPE_UNSPECIFIED = 0,
  DEPLOYMENT_CREATED = 1,
  VERSION_CREATED = 2,
  NODE_ADDED = 3,
  USER_INVITED = 4,
  UNRECOGNIZED = -1,
}

export function notificationEventTypeFromJSON(object: any): NotificationEventType {
  switch (object) {
    case 0:
    case 'NOTIFICATION_EVENT_TYPE_UNSPECIFIED':
      return NotificationEventType.NOTIFICATION_EVENT_TYPE_UNSPECIFIED
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
    case NotificationEventType.NOTIFICATION_EVENT_TYPE_UNSPECIFIED:
      return 'NOTIFICATION_EVENT_TYPE_UNSPECIFIED'
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

/** AUTHENTICATION */
export interface GenerateTokenRequest {
  accessedBy: string
  name: string
  expirationInDays: number
}

export interface GenerateTokenResponse {
  id: string
  name: string
  expiresAt: Timestamp | undefined
  createdAt: Timestamp | undefined
  token: string
}

export interface TokenResponse {
  id: string
  name: string
  expiresAt: Timestamp | undefined
  createdAt: Timestamp | undefined
}

export interface TokenListResponse {
  data: TokenResponse[]
}

/** AUDIT */
export interface AuditLogListRequest {
  accessedBy: string
  pageSize: number
  pageNumber: number
  keyword?: string | undefined
  createdFrom?: Timestamp | undefined
  createdTo: Timestamp | undefined
}

export interface AuditLogListCountResponse {
  count: number
}

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
  firstName: string
  lastName?: string | undefined
}

export interface ReinviteUserRequest {
  id: string
  accessedBy: string
  userId: string
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
  deletable: boolean
  versions: VersionResponse[]
}

export interface ProductReponse {
  id: string
  audit: AuditResponse | undefined
  name: string
  description?: string | undefined
  type: ProductType
  versionCount: number
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
  namespace: RegistryNamespace
}

export interface GithubRegistryDetails {
  user: string
  token: string
  imageNamePrefix: string
  namespace: RegistryNamespace
}

export interface GoogleRegistryDetails {
  url: string
  user?: string | undefined
  token?: string | undefined
  imageNamePrefix: string
}

export interface UncheckedRegistryDetails {
  url: string
}

export interface CreateRegistryRequest {
  accessedBy: string
  name: string
  description?: string | undefined
  icon?: string | undefined
  hub?: HubRegistryDetails | undefined
  v2?: V2RegistryDetails | undefined
  gitlab?: GitlabRegistryDetails | undefined
  github?: GithubRegistryDetails | undefined
  google?: GoogleRegistryDetails | undefined
  unchecked?: UncheckedRegistryDetails | undefined
}

export interface UpdateRegistryRequest {
  id: string
  accessedBy: string
  name: string
  description?: string | undefined
  icon?: string | undefined
  hub?: HubRegistryDetails | undefined
  v2?: V2RegistryDetails | undefined
  gitlab?: GitlabRegistryDetails | undefined
  github?: GithubRegistryDetails | undefined
  google?: GoogleRegistryDetails | undefined
  unchecked?: UncheckedRegistryDetails | undefined
}

export interface RegistryDetailsResponse {
  id: string
  audit: AuditResponse | undefined
  name: string
  description?: string | undefined
  icon?: string | undefined
  inUse: boolean
  hub?: HubRegistryDetails | undefined
  v2?: V2RegistryDetails | undefined
  gitlab?: GitlabRegistryDetails | undefined
  github?: GithubRegistryDetails | undefined
  google?: GoogleRegistryDetails | undefined
  unchecked?: UncheckedRegistryDetails | undefined
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
  deletable: boolean
  images: ImageResponse[]
  deployments: DeploymentByVersionResponse[]
}

export interface IncreaseVersionRequest {
  id: string
  accessedBy: string
  name: string
  changelog?: string | undefined
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

export interface ImportContainer {
  volume: string
  command: string
  environment: UniqueKeyValue[]
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
  importContainer?: ImportContainer | undefined
  user?: number | undefined
  TTY?: boolean | undefined
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

export interface PatchImageRequest {
  id: string
  accessedBy: string
  tag?: string | undefined
  config?: ImageContainerConfig | undefined
  resetSection?: string | undefined
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

export interface DagentTraefikOptions {
  acmeEmail: string
}

export interface GenerateScriptRequest {
  id: string
  accessedBy: string
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
  accessedBy: string
  command: ContainerCommandRequest | undefined
}

export interface NodeDeleteContainersRequest {
  id: string
  accessedBy: string
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
  accessedBy: string
  nodeId: string
  prefix?: string | undefined
}

export interface WatchContainerLogRequest {
  accessedBy: string
  id: string
  dockerId?: string | undefined
  prefixName?: ContainerIdentifier | undefined
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
  environment?: UniqueKeyValueList | undefined
  instance?: PatchInstanceRequest | undefined
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
  config?: InstanceContainerConfig | undefined
  resetSection?: string | undefined
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
  versionType: VersionType
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
  log?: DeploymentEventLog | undefined
  deploymentStatus?: DeploymentStatus | undefined
  containerStatus?: DeploymentEventContainerState | undefined
}

export interface DeploymentEventListResponse {
  status: DeploymentStatus
  data: DeploymentEventResponse[]
}

export interface DeploymentListSecretsRequest {
  id: string
  accessedBy: string
  instanceId: string
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

/** TEMPLATE */
export interface TemplateResponse {
  id: string
  name: string
  description: string
  technologies: string[]
}

export interface TemplateListResponse {
  data: TemplateResponse[]
}

export interface CreateProductFromTemplateRequest {
  id: string
  accessedBy: string
  name: string
  description: string
  type: ProductType
}

export interface TemplateImageResponse {
  data: Uint8Array
}

/** DASHBOARD */
export interface DashboardActiveNodes {
  id: string
  name: string
  address: string
  version: string
}

export interface DashboardDeployment {
  id: string
  product: string
  version: string
  node: string
  changelog: string
  deployedAt?: Timestamp | undefined
  productId: string
  versionId: string
}

export interface DashboardResponse {
  users: number
  auditLogEntries: number
  products: number
  versions: number
  deployments: number
  failedDeployments: number
  nodes: DashboardActiveNodes[]
  latestDeployments: DashboardDeployment[]
  auditLog: AuditLogResponse[]
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

  create<I extends Exact<DeepPartial<IdRequest>, I>>(base?: I): IdRequest {
    return IdRequest.fromPartial(base ?? {})
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

function createBaseGenerateTokenRequest(): GenerateTokenRequest {
  return { accessedBy: '', name: '', expirationInDays: 0 }
}

export const GenerateTokenRequest = {
  encode(message: GenerateTokenRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.accessedBy !== '') {
      writer.uint32(18).string(message.accessedBy)
    }
    if (message.name !== '') {
      writer.uint32(802).string(message.name)
    }
    if (message.expirationInDays !== 0) {
      writer.uint32(808).int32(message.expirationInDays)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GenerateTokenRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseGenerateTokenRequest()
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
          message.expirationInDays = reader.int32()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): GenerateTokenRequest {
    return {
      accessedBy: isSet(object.accessedBy) ? String(object.accessedBy) : '',
      name: isSet(object.name) ? String(object.name) : '',
      expirationInDays: isSet(object.expirationInDays) ? Number(object.expirationInDays) : 0,
    }
  },

  toJSON(message: GenerateTokenRequest): unknown {
    const obj: any = {}
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
    message.name !== undefined && (obj.name = message.name)
    message.expirationInDays !== undefined && (obj.expirationInDays = Math.round(message.expirationInDays))
    return obj
  },

  create<I extends Exact<DeepPartial<GenerateTokenRequest>, I>>(base?: I): GenerateTokenRequest {
    return GenerateTokenRequest.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<GenerateTokenRequest>, I>>(object: I): GenerateTokenRequest {
    const message = createBaseGenerateTokenRequest()
    message.accessedBy = object.accessedBy ?? ''
    message.name = object.name ?? ''
    message.expirationInDays = object.expirationInDays ?? 0
    return message
  },
}

function createBaseGenerateTokenResponse(): GenerateTokenResponse {
  return { id: '', name: '', expiresAt: undefined, createdAt: undefined, token: '' }
}

export const GenerateTokenResponse = {
  encode(message: GenerateTokenResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id)
    }
    if (message.name !== '') {
      writer.uint32(802).string(message.name)
    }
    if (message.expiresAt !== undefined) {
      Timestamp.encode(message.expiresAt, writer.uint32(810).fork()).ldelim()
    }
    if (message.createdAt !== undefined) {
      Timestamp.encode(message.createdAt, writer.uint32(818).fork()).ldelim()
    }
    if (message.token !== '') {
      writer.uint32(826).string(message.token)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GenerateTokenResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseGenerateTokenResponse()
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
          message.expiresAt = Timestamp.decode(reader, reader.uint32())
          break
        case 102:
          message.createdAt = Timestamp.decode(reader, reader.uint32())
          break
        case 103:
          message.token = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): GenerateTokenResponse {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      name: isSet(object.name) ? String(object.name) : '',
      expiresAt: isSet(object.expiresAt) ? fromJsonTimestamp(object.expiresAt) : undefined,
      createdAt: isSet(object.createdAt) ? fromJsonTimestamp(object.createdAt) : undefined,
      token: isSet(object.token) ? String(object.token) : '',
    }
  },

  toJSON(message: GenerateTokenResponse): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.name !== undefined && (obj.name = message.name)
    message.expiresAt !== undefined && (obj.expiresAt = fromTimestamp(message.expiresAt).toISOString())
    message.createdAt !== undefined && (obj.createdAt = fromTimestamp(message.createdAt).toISOString())
    message.token !== undefined && (obj.token = message.token)
    return obj
  },

  create<I extends Exact<DeepPartial<GenerateTokenResponse>, I>>(base?: I): GenerateTokenResponse {
    return GenerateTokenResponse.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<GenerateTokenResponse>, I>>(object: I): GenerateTokenResponse {
    const message = createBaseGenerateTokenResponse()
    message.id = object.id ?? ''
    message.name = object.name ?? ''
    message.expiresAt =
      object.expiresAt !== undefined && object.expiresAt !== null ? Timestamp.fromPartial(object.expiresAt) : undefined
    message.createdAt =
      object.createdAt !== undefined && object.createdAt !== null ? Timestamp.fromPartial(object.createdAt) : undefined
    message.token = object.token ?? ''
    return message
  },
}

function createBaseTokenResponse(): TokenResponse {
  return { id: '', name: '', expiresAt: undefined, createdAt: undefined }
}

export const TokenResponse = {
  encode(message: TokenResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id)
    }
    if (message.name !== '') {
      writer.uint32(802).string(message.name)
    }
    if (message.expiresAt !== undefined) {
      Timestamp.encode(message.expiresAt, writer.uint32(810).fork()).ldelim()
    }
    if (message.createdAt !== undefined) {
      Timestamp.encode(message.createdAt, writer.uint32(818).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TokenResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseTokenResponse()
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
          message.expiresAt = Timestamp.decode(reader, reader.uint32())
          break
        case 102:
          message.createdAt = Timestamp.decode(reader, reader.uint32())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): TokenResponse {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      name: isSet(object.name) ? String(object.name) : '',
      expiresAt: isSet(object.expiresAt) ? fromJsonTimestamp(object.expiresAt) : undefined,
      createdAt: isSet(object.createdAt) ? fromJsonTimestamp(object.createdAt) : undefined,
    }
  },

  toJSON(message: TokenResponse): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.name !== undefined && (obj.name = message.name)
    message.expiresAt !== undefined && (obj.expiresAt = fromTimestamp(message.expiresAt).toISOString())
    message.createdAt !== undefined && (obj.createdAt = fromTimestamp(message.createdAt).toISOString())
    return obj
  },

  create<I extends Exact<DeepPartial<TokenResponse>, I>>(base?: I): TokenResponse {
    return TokenResponse.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<TokenResponse>, I>>(object: I): TokenResponse {
    const message = createBaseTokenResponse()
    message.id = object.id ?? ''
    message.name = object.name ?? ''
    message.expiresAt =
      object.expiresAt !== undefined && object.expiresAt !== null ? Timestamp.fromPartial(object.expiresAt) : undefined
    message.createdAt =
      object.createdAt !== undefined && object.createdAt !== null ? Timestamp.fromPartial(object.createdAt) : undefined
    return message
  },
}

function createBaseTokenListResponse(): TokenListResponse {
  return { data: [] }
}

export const TokenListResponse = {
  encode(message: TokenListResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.data) {
      TokenResponse.encode(v!, writer.uint32(8002).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TokenListResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseTokenListResponse()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1000:
          message.data.push(TokenResponse.decode(reader, reader.uint32()))
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): TokenListResponse {
    return { data: Array.isArray(object?.data) ? object.data.map((e: any) => TokenResponse.fromJSON(e)) : [] }
  },

  toJSON(message: TokenListResponse): unknown {
    const obj: any = {}
    if (message.data) {
      obj.data = message.data.map(e => (e ? TokenResponse.toJSON(e) : undefined))
    } else {
      obj.data = []
    }
    return obj
  },

  create<I extends Exact<DeepPartial<TokenListResponse>, I>>(base?: I): TokenListResponse {
    return TokenListResponse.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<TokenListResponse>, I>>(object: I): TokenListResponse {
    const message = createBaseTokenListResponse()
    message.data = object.data?.map(e => TokenResponse.fromPartial(e)) || []
    return message
  },
}

function createBaseAuditLogListRequest(): AuditLogListRequest {
  return { accessedBy: '', pageSize: 0, pageNumber: 0, createdTo: undefined }
}

export const AuditLogListRequest = {
  encode(message: AuditLogListRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.accessedBy !== '') {
      writer.uint32(18).string(message.accessedBy)
    }
    if (message.pageSize !== 0) {
      writer.uint32(800).uint32(message.pageSize)
    }
    if (message.pageNumber !== 0) {
      writer.uint32(808).uint32(message.pageNumber)
    }
    if (message.keyword !== undefined) {
      writer.uint32(818).string(message.keyword)
    }
    if (message.createdFrom !== undefined) {
      Timestamp.encode(message.createdFrom, writer.uint32(826).fork()).ldelim()
    }
    if (message.createdTo !== undefined) {
      Timestamp.encode(message.createdTo, writer.uint32(834).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AuditLogListRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseAuditLogListRequest()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 2:
          message.accessedBy = reader.string()
          break
        case 100:
          message.pageSize = reader.uint32()
          break
        case 101:
          message.pageNumber = reader.uint32()
          break
        case 102:
          message.keyword = reader.string()
          break
        case 103:
          message.createdFrom = Timestamp.decode(reader, reader.uint32())
          break
        case 104:
          message.createdTo = Timestamp.decode(reader, reader.uint32())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): AuditLogListRequest {
    return {
      accessedBy: isSet(object.accessedBy) ? String(object.accessedBy) : '',
      pageSize: isSet(object.pageSize) ? Number(object.pageSize) : 0,
      pageNumber: isSet(object.pageNumber) ? Number(object.pageNumber) : 0,
      keyword: isSet(object.keyword) ? String(object.keyword) : undefined,
      createdFrom: isSet(object.createdFrom) ? fromJsonTimestamp(object.createdFrom) : undefined,
      createdTo: isSet(object.createdTo) ? fromJsonTimestamp(object.createdTo) : undefined,
    }
  },

  toJSON(message: AuditLogListRequest): unknown {
    const obj: any = {}
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
    message.pageSize !== undefined && (obj.pageSize = Math.round(message.pageSize))
    message.pageNumber !== undefined && (obj.pageNumber = Math.round(message.pageNumber))
    message.keyword !== undefined && (obj.keyword = message.keyword)
    message.createdFrom !== undefined && (obj.createdFrom = fromTimestamp(message.createdFrom).toISOString())
    message.createdTo !== undefined && (obj.createdTo = fromTimestamp(message.createdTo).toISOString())
    return obj
  },

  create<I extends Exact<DeepPartial<AuditLogListRequest>, I>>(base?: I): AuditLogListRequest {
    return AuditLogListRequest.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<AuditLogListRequest>, I>>(object: I): AuditLogListRequest {
    const message = createBaseAuditLogListRequest()
    message.accessedBy = object.accessedBy ?? ''
    message.pageSize = object.pageSize ?? 0
    message.pageNumber = object.pageNumber ?? 0
    message.keyword = object.keyword ?? undefined
    message.createdFrom =
      object.createdFrom !== undefined && object.createdFrom !== null
        ? Timestamp.fromPartial(object.createdFrom)
        : undefined
    message.createdTo =
      object.createdTo !== undefined && object.createdTo !== null ? Timestamp.fromPartial(object.createdTo) : undefined
    return message
  },
}

function createBaseAuditLogListCountResponse(): AuditLogListCountResponse {
  return { count: 0 }
}

export const AuditLogListCountResponse = {
  encode(message: AuditLogListCountResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.count !== 0) {
      writer.uint32(800).uint32(message.count)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AuditLogListCountResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseAuditLogListCountResponse()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 100:
          message.count = reader.uint32()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): AuditLogListCountResponse {
    return { count: isSet(object.count) ? Number(object.count) : 0 }
  },

  toJSON(message: AuditLogListCountResponse): unknown {
    const obj: any = {}
    message.count !== undefined && (obj.count = Math.round(message.count))
    return obj
  },

  create<I extends Exact<DeepPartial<AuditLogListCountResponse>, I>>(base?: I): AuditLogListCountResponse {
    return AuditLogListCountResponse.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<AuditLogListCountResponse>, I>>(object: I): AuditLogListCountResponse {
    const message = createBaseAuditLogListCountResponse()
    message.count = object.count ?? 0
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

  create<I extends Exact<DeepPartial<AuditLogResponse>, I>>(base?: I): AuditLogResponse {
    return AuditLogResponse.fromPartial(base ?? {})
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

  create<I extends Exact<DeepPartial<AuditLogListResponse>, I>>(base?: I): AuditLogListResponse {
    return AuditLogListResponse.fromPartial(base ?? {})
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

  create<I extends Exact<DeepPartial<CreateTeamRequest>, I>>(base?: I): CreateTeamRequest {
    return CreateTeamRequest.fromPartial(base ?? {})
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

  create<I extends Exact<DeepPartial<UpdateTeamRequest>, I>>(base?: I): UpdateTeamRequest {
    return UpdateTeamRequest.fromPartial(base ?? {})
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

  create<I extends Exact<DeepPartial<UpdateUserRoleInTeamRequest>, I>>(base?: I): UpdateUserRoleInTeamRequest {
    return UpdateUserRoleInTeamRequest.fromPartial(base ?? {})
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
  return { id: '', accessedBy: '', email: '', firstName: '' }
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
        case 2:
          message.accessedBy = reader.string()
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
      accessedBy: isSet(object.accessedBy) ? String(object.accessedBy) : '',
      email: isSet(object.email) ? String(object.email) : '',
      firstName: isSet(object.firstName) ? String(object.firstName) : '',
      lastName: isSet(object.lastName) ? String(object.lastName) : undefined,
    }
  },

  toJSON(message: InviteUserRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
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
    message.accessedBy = object.accessedBy ?? ''
    message.email = object.email ?? ''
    message.firstName = object.firstName ?? ''
    message.lastName = object.lastName ?? undefined
    return message
  },
}

function createBaseReinviteUserRequest(): ReinviteUserRequest {
  return { id: '', accessedBy: '', userId: '' }
}

export const ReinviteUserRequest = {
  encode(message: ReinviteUserRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
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

  fromJSON(object: any): ReinviteUserRequest {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      accessedBy: isSet(object.accessedBy) ? String(object.accessedBy) : '',
      userId: isSet(object.userId) ? String(object.userId) : '',
    }
  },

  toJSON(message: ReinviteUserRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
    message.userId !== undefined && (obj.userId = message.userId)
    return obj
  },

  create<I extends Exact<DeepPartial<ReinviteUserRequest>, I>>(base?: I): ReinviteUserRequest {
    return ReinviteUserRequest.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<ReinviteUserRequest>, I>>(object: I): ReinviteUserRequest {
    const message = createBaseReinviteUserRequest()
    message.id = object.id ?? ''
    message.accessedBy = object.accessedBy ?? ''
    message.userId = object.userId ?? ''
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

  create<I extends Exact<DeepPartial<DeleteUserFromTeamRequest>, I>>(base?: I): DeleteUserFromTeamRequest {
    return DeleteUserFromTeamRequest.fromPartial(base ?? {})
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

  create<I extends Exact<DeepPartial<AccessRequest>, I>>(base?: I): AccessRequest {
    return AccessRequest.fromPartial(base ?? {})
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

function createBaseProductDetailsReponse(): ProductDetailsReponse {
  return { id: '', audit: undefined, name: '', type: 0, deletable: false, versions: [] }
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
    if (message.deletable === true) {
      writer.uint32(824).bool(message.deletable)
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
        case 103:
          message.deletable = reader.bool()
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
      deletable: isSet(object.deletable) ? Boolean(object.deletable) : false,
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
    message.deletable !== undefined && (obj.deletable = message.deletable)
    if (message.versions) {
      obj.versions = message.versions.map(e => (e ? VersionResponse.toJSON(e) : undefined))
    } else {
      obj.versions = []
    }
    return obj
  },

  create<I extends Exact<DeepPartial<ProductDetailsReponse>, I>>(base?: I): ProductDetailsReponse {
    return ProductDetailsReponse.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<ProductDetailsReponse>, I>>(object: I): ProductDetailsReponse {
    const message = createBaseProductDetailsReponse()
    message.id = object.id ?? ''
    message.audit =
      object.audit !== undefined && object.audit !== null ? AuditResponse.fromPartial(object.audit) : undefined
    message.name = object.name ?? ''
    message.description = object.description ?? undefined
    message.type = object.type ?? 0
    message.deletable = object.deletable ?? false
    message.versions = object.versions?.map(e => VersionResponse.fromPartial(e)) || []
    return message
  },
}

function createBaseProductReponse(): ProductReponse {
  return { id: '', audit: undefined, name: '', type: 0, versionCount: 0 }
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
    if (message.versionCount !== 0) {
      writer.uint32(824).uint32(message.versionCount)
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
        case 103:
          message.versionCount = reader.uint32()
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
      versionCount: isSet(object.versionCount) ? Number(object.versionCount) : 0,
    }
  },

  toJSON(message: ProductReponse): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.audit !== undefined && (obj.audit = message.audit ? AuditResponse.toJSON(message.audit) : undefined)
    message.name !== undefined && (obj.name = message.name)
    message.description !== undefined && (obj.description = message.description)
    message.type !== undefined && (obj.type = productTypeToJSON(message.type))
    message.versionCount !== undefined && (obj.versionCount = Math.round(message.versionCount))
    return obj
  },

  create<I extends Exact<DeepPartial<ProductReponse>, I>>(base?: I): ProductReponse {
    return ProductReponse.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<ProductReponse>, I>>(object: I): ProductReponse {
    const message = createBaseProductReponse()
    message.id = object.id ?? ''
    message.audit =
      object.audit !== undefined && object.audit !== null ? AuditResponse.fromPartial(object.audit) : undefined
    message.name = object.name ?? ''
    message.description = object.description ?? undefined
    message.type = object.type ?? 0
    message.versionCount = object.versionCount ?? 0
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

  create<I extends Exact<DeepPartial<ProductListResponse>, I>>(base?: I): ProductListResponse {
    return ProductListResponse.fromPartial(base ?? {})
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

  create<I extends Exact<DeepPartial<CreateProductRequest>, I>>(base?: I): CreateProductRequest {
    return CreateProductRequest.fromPartial(base ?? {})
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

  create<I extends Exact<DeepPartial<UpdateProductRequest>, I>>(base?: I): UpdateProductRequest {
    return UpdateProductRequest.fromPartial(base ?? {})
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

  create<I extends Exact<DeepPartial<RegistryResponse>, I>>(base?: I): RegistryResponse {
    return RegistryResponse.fromPartial(base ?? {})
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

  create<I extends Exact<DeepPartial<RegistryListResponse>, I>>(base?: I): RegistryListResponse {
    return RegistryListResponse.fromPartial(base ?? {})
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

  create<I extends Exact<DeepPartial<HubRegistryDetails>, I>>(base?: I): HubRegistryDetails {
    return HubRegistryDetails.fromPartial(base ?? {})
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

  create<I extends Exact<DeepPartial<V2RegistryDetails>, I>>(base?: I): V2RegistryDetails {
    return V2RegistryDetails.fromPartial(base ?? {})
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
  return { user: '', token: '', imageNamePrefix: '', namespace: 0 }
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
    if (message.namespace !== 0) {
      writer.uint32(840).int32(message.namespace)
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
        case 105:
          message.namespace = reader.int32() as any
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
      namespace: isSet(object.namespace) ? registryNamespaceFromJSON(object.namespace) : 0,
    }
  },

  toJSON(message: GitlabRegistryDetails): unknown {
    const obj: any = {}
    message.user !== undefined && (obj.user = message.user)
    message.token !== undefined && (obj.token = message.token)
    message.imageNamePrefix !== undefined && (obj.imageNamePrefix = message.imageNamePrefix)
    message.url !== undefined && (obj.url = message.url)
    message.apiUrl !== undefined && (obj.apiUrl = message.apiUrl)
    message.namespace !== undefined && (obj.namespace = registryNamespaceToJSON(message.namespace))
    return obj
  },

  create<I extends Exact<DeepPartial<GitlabRegistryDetails>, I>>(base?: I): GitlabRegistryDetails {
    return GitlabRegistryDetails.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<GitlabRegistryDetails>, I>>(object: I): GitlabRegistryDetails {
    const message = createBaseGitlabRegistryDetails()
    message.user = object.user ?? ''
    message.token = object.token ?? ''
    message.imageNamePrefix = object.imageNamePrefix ?? ''
    message.url = object.url ?? undefined
    message.apiUrl = object.apiUrl ?? undefined
    message.namespace = object.namespace ?? 0
    return message
  },
}

function createBaseGithubRegistryDetails(): GithubRegistryDetails {
  return { user: '', token: '', imageNamePrefix: '', namespace: 0 }
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
    if (message.namespace !== 0) {
      writer.uint32(824).int32(message.namespace)
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
        case 103:
          message.namespace = reader.int32() as any
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
      namespace: isSet(object.namespace) ? registryNamespaceFromJSON(object.namespace) : 0,
    }
  },

  toJSON(message: GithubRegistryDetails): unknown {
    const obj: any = {}
    message.user !== undefined && (obj.user = message.user)
    message.token !== undefined && (obj.token = message.token)
    message.imageNamePrefix !== undefined && (obj.imageNamePrefix = message.imageNamePrefix)
    message.namespace !== undefined && (obj.namespace = registryNamespaceToJSON(message.namespace))
    return obj
  },

  create<I extends Exact<DeepPartial<GithubRegistryDetails>, I>>(base?: I): GithubRegistryDetails {
    return GithubRegistryDetails.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<GithubRegistryDetails>, I>>(object: I): GithubRegistryDetails {
    const message = createBaseGithubRegistryDetails()
    message.user = object.user ?? ''
    message.token = object.token ?? ''
    message.imageNamePrefix = object.imageNamePrefix ?? ''
    message.namespace = object.namespace ?? 0
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

  create<I extends Exact<DeepPartial<GoogleRegistryDetails>, I>>(base?: I): GoogleRegistryDetails {
    return GoogleRegistryDetails.fromPartial(base ?? {})
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

function createBaseUncheckedRegistryDetails(): UncheckedRegistryDetails {
  return { url: '' }
}

export const UncheckedRegistryDetails = {
  encode(message: UncheckedRegistryDetails, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.url !== '') {
      writer.uint32(802).string(message.url)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UncheckedRegistryDetails {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseUncheckedRegistryDetails()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 100:
          message.url = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): UncheckedRegistryDetails {
    return { url: isSet(object.url) ? String(object.url) : '' }
  },

  toJSON(message: UncheckedRegistryDetails): unknown {
    const obj: any = {}
    message.url !== undefined && (obj.url = message.url)
    return obj
  },

  create<I extends Exact<DeepPartial<UncheckedRegistryDetails>, I>>(base?: I): UncheckedRegistryDetails {
    return UncheckedRegistryDetails.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<UncheckedRegistryDetails>, I>>(object: I): UncheckedRegistryDetails {
    const message = createBaseUncheckedRegistryDetails()
    message.url = object.url ?? ''
    return message
  },
}

function createBaseCreateRegistryRequest(): CreateRegistryRequest {
  return { accessedBy: '', name: '' }
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
    if (message.unchecked !== undefined) {
      UncheckedRegistryDetails.encode(message.unchecked, writer.uint32(1642).fork()).ldelim()
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
        case 205:
          message.unchecked = UncheckedRegistryDetails.decode(reader, reader.uint32())
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
      unchecked: isSet(object.unchecked) ? UncheckedRegistryDetails.fromJSON(object.unchecked) : undefined,
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
    message.unchecked !== undefined &&
      (obj.unchecked = message.unchecked ? UncheckedRegistryDetails.toJSON(message.unchecked) : undefined)
    return obj
  },

  create<I extends Exact<DeepPartial<CreateRegistryRequest>, I>>(base?: I): CreateRegistryRequest {
    return CreateRegistryRequest.fromPartial(base ?? {})
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
    message.unchecked =
      object.unchecked !== undefined && object.unchecked !== null
        ? UncheckedRegistryDetails.fromPartial(object.unchecked)
        : undefined
    return message
  },
}

function createBaseUpdateRegistryRequest(): UpdateRegistryRequest {
  return { id: '', accessedBy: '', name: '' }
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
    if (message.unchecked !== undefined) {
      UncheckedRegistryDetails.encode(message.unchecked, writer.uint32(1642).fork()).ldelim()
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
        case 205:
          message.unchecked = UncheckedRegistryDetails.decode(reader, reader.uint32())
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
      unchecked: isSet(object.unchecked) ? UncheckedRegistryDetails.fromJSON(object.unchecked) : undefined,
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
    message.unchecked !== undefined &&
      (obj.unchecked = message.unchecked ? UncheckedRegistryDetails.toJSON(message.unchecked) : undefined)
    return obj
  },

  create<I extends Exact<DeepPartial<UpdateRegistryRequest>, I>>(base?: I): UpdateRegistryRequest {
    return UpdateRegistryRequest.fromPartial(base ?? {})
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
    message.unchecked =
      object.unchecked !== undefined && object.unchecked !== null
        ? UncheckedRegistryDetails.fromPartial(object.unchecked)
        : undefined
    return message
  },
}

function createBaseRegistryDetailsResponse(): RegistryDetailsResponse {
  return { id: '', audit: undefined, name: '', inUse: false }
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
    if (message.inUse === true) {
      writer.uint32(824).bool(message.inUse)
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
    if (message.unchecked !== undefined) {
      UncheckedRegistryDetails.encode(message.unchecked, writer.uint32(1642).fork()).ldelim()
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
        case 103:
          message.inUse = reader.bool()
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
        case 205:
          message.unchecked = UncheckedRegistryDetails.decode(reader, reader.uint32())
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
      inUse: isSet(object.inUse) ? Boolean(object.inUse) : false,
      hub: isSet(object.hub) ? HubRegistryDetails.fromJSON(object.hub) : undefined,
      v2: isSet(object.v2) ? V2RegistryDetails.fromJSON(object.v2) : undefined,
      gitlab: isSet(object.gitlab) ? GitlabRegistryDetails.fromJSON(object.gitlab) : undefined,
      github: isSet(object.github) ? GithubRegistryDetails.fromJSON(object.github) : undefined,
      google: isSet(object.google) ? GoogleRegistryDetails.fromJSON(object.google) : undefined,
      unchecked: isSet(object.unchecked) ? UncheckedRegistryDetails.fromJSON(object.unchecked) : undefined,
    }
  },

  toJSON(message: RegistryDetailsResponse): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.audit !== undefined && (obj.audit = message.audit ? AuditResponse.toJSON(message.audit) : undefined)
    message.name !== undefined && (obj.name = message.name)
    message.description !== undefined && (obj.description = message.description)
    message.icon !== undefined && (obj.icon = message.icon)
    message.inUse !== undefined && (obj.inUse = message.inUse)
    message.hub !== undefined && (obj.hub = message.hub ? HubRegistryDetails.toJSON(message.hub) : undefined)
    message.v2 !== undefined && (obj.v2 = message.v2 ? V2RegistryDetails.toJSON(message.v2) : undefined)
    message.gitlab !== undefined &&
      (obj.gitlab = message.gitlab ? GitlabRegistryDetails.toJSON(message.gitlab) : undefined)
    message.github !== undefined &&
      (obj.github = message.github ? GithubRegistryDetails.toJSON(message.github) : undefined)
    message.google !== undefined &&
      (obj.google = message.google ? GoogleRegistryDetails.toJSON(message.google) : undefined)
    message.unchecked !== undefined &&
      (obj.unchecked = message.unchecked ? UncheckedRegistryDetails.toJSON(message.unchecked) : undefined)
    return obj
  },

  create<I extends Exact<DeepPartial<RegistryDetailsResponse>, I>>(base?: I): RegistryDetailsResponse {
    return RegistryDetailsResponse.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<RegistryDetailsResponse>, I>>(object: I): RegistryDetailsResponse {
    const message = createBaseRegistryDetailsResponse()
    message.id = object.id ?? ''
    message.audit =
      object.audit !== undefined && object.audit !== null ? AuditResponse.fromPartial(object.audit) : undefined
    message.name = object.name ?? ''
    message.description = object.description ?? undefined
    message.icon = object.icon ?? undefined
    message.inUse = object.inUse ?? false
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
    message.unchecked =
      object.unchecked !== undefined && object.unchecked !== null
        ? UncheckedRegistryDetails.fromPartial(object.unchecked)
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

  create<I extends Exact<DeepPartial<CreateVersionRequest>, I>>(base?: I): CreateVersionRequest {
    return CreateVersionRequest.fromPartial(base ?? {})
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

  create<I extends Exact<DeepPartial<UpdateVersionRequest>, I>>(base?: I): UpdateVersionRequest {
    return UpdateVersionRequest.fromPartial(base ?? {})
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

  create<I extends Exact<DeepPartial<VersionResponse>, I>>(base?: I): VersionResponse {
    return VersionResponse.fromPartial(base ?? {})
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

  create<I extends Exact<DeepPartial<VersionListResponse>, I>>(base?: I): VersionListResponse {
    return VersionListResponse.fromPartial(base ?? {})
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
    deletable: false,
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
    if (message.deletable === true) {
      writer.uint32(848).bool(message.deletable)
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
        case 106:
          message.deletable = reader.bool()
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
      deletable: isSet(object.deletable) ? Boolean(object.deletable) : false,
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
    message.deletable !== undefined && (obj.deletable = message.deletable)
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

  create<I extends Exact<DeepPartial<VersionDetailsResponse>, I>>(base?: I): VersionDetailsResponse {
    return VersionDetailsResponse.fromPartial(base ?? {})
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
    message.deletable = object.deletable ?? false
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

  create<I extends Exact<DeepPartial<IncreaseVersionRequest>, I>>(base?: I): IncreaseVersionRequest {
    return IncreaseVersionRequest.fromPartial(base ?? {})
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

function createBaseImportContainer(): ImportContainer {
  return { volume: '', command: '', environment: [] }
}

export const ImportContainer = {
  encode(message: ImportContainer, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.volume !== '') {
      writer.uint32(802).string(message.volume)
    }
    if (message.command !== '') {
      writer.uint32(810).string(message.command)
    }
    for (const v of message.environment) {
      UniqueKeyValue.encode(v!, writer.uint32(8002).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ImportContainer {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseImportContainer()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 100:
          message.volume = reader.string()
          break
        case 101:
          message.command = reader.string()
          break
        case 1000:
          message.environment.push(UniqueKeyValue.decode(reader, reader.uint32()))
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): ImportContainer {
    return {
      volume: isSet(object.volume) ? String(object.volume) : '',
      command: isSet(object.command) ? String(object.command) : '',
      environment: Array.isArray(object?.environment)
        ? object.environment.map((e: any) => UniqueKeyValue.fromJSON(e))
        : [],
    }
  },

  toJSON(message: ImportContainer): unknown {
    const obj: any = {}
    message.volume !== undefined && (obj.volume = message.volume)
    message.command !== undefined && (obj.command = message.command)
    if (message.environment) {
      obj.environment = message.environment.map(e => (e ? UniqueKeyValue.toJSON(e) : undefined))
    } else {
      obj.environment = []
    }
    return obj
  },

  create<I extends Exact<DeepPartial<ImportContainer>, I>>(base?: I): ImportContainer {
    return ImportContainer.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<ImportContainer>, I>>(object: I): ImportContainer {
    const message = createBaseImportContainer()
    message.volume = object.volume ?? ''
    message.command = object.command ?? ''
    message.environment = object.environment?.map(e => UniqueKeyValue.fromPartial(e)) || []
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
    if (message.importContainer !== undefined) {
      ImportContainer.encode(message.importContainer, writer.uint32(842).fork()).ldelim()
    }
    if (message.user !== undefined) {
      writer.uint32(848).int64(message.user)
    }
    if (message.TTY !== undefined) {
      writer.uint32(856).bool(message.TTY)
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
          message.importContainer = ImportContainer.decode(reader, reader.uint32())
          break
        case 106:
          message.user = longToNumber(reader.int64() as Long)
          break
        case 107:
          message.TTY = reader.bool()
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
      importContainer: isSet(object.importContainer) ? ImportContainer.fromJSON(object.importContainer) : undefined,
      user: isSet(object.user) ? Number(object.user) : undefined,
      TTY: isSet(object.TTY) ? Boolean(object.TTY) : undefined,
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
    message.importContainer !== undefined &&
      (obj.importContainer = message.importContainer ? ImportContainer.toJSON(message.importContainer) : undefined)
    message.user !== undefined && (obj.user = Math.round(message.user))
    message.TTY !== undefined && (obj.TTY = message.TTY)
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
    message.importContainer =
      object.importContainer !== undefined && object.importContainer !== null
        ? ImportContainer.fromPartial(object.importContainer)
        : undefined
    message.user = object.user ?? undefined
    message.TTY = object.TTY ?? undefined
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

  create<I extends Exact<DeepPartial<ImageListResponse>, I>>(base?: I): ImageListResponse {
    return ImageListResponse.fromPartial(base ?? {})
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

  create<I extends Exact<DeepPartial<OrderVersionImagesRequest>, I>>(base?: I): OrderVersionImagesRequest {
    return OrderVersionImagesRequest.fromPartial(base ?? {})
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

  create<I extends Exact<DeepPartial<RegistryImages>, I>>(base?: I): RegistryImages {
    return RegistryImages.fromPartial(base ?? {})
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

  create<I extends Exact<DeepPartial<AddImagesToVersionRequest>, I>>(base?: I): AddImagesToVersionRequest {
    return AddImagesToVersionRequest.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<AddImagesToVersionRequest>, I>>(object: I): AddImagesToVersionRequest {
    const message = createBaseAddImagesToVersionRequest()
    message.accessedBy = object.accessedBy ?? ''
    message.versionId = object.versionId ?? ''
    message.images = object.images?.map(e => RegistryImages.fromPartial(e)) || []
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
      ImageContainerConfig.encode(message.config, writer.uint32(818).fork()).ldelim()
    }
    if (message.resetSection !== undefined) {
      writer.uint32(826).string(message.resetSection)
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
          message.config = ImageContainerConfig.decode(reader, reader.uint32())
          break
        case 103:
          message.resetSection = reader.string()
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
      config: isSet(object.config) ? ImageContainerConfig.fromJSON(object.config) : undefined,
      resetSection: isSet(object.resetSection) ? String(object.resetSection) : undefined,
    }
  },

  toJSON(message: PatchImageRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
    message.tag !== undefined && (obj.tag = message.tag)
    message.config !== undefined &&
      (obj.config = message.config ? ImageContainerConfig.toJSON(message.config) : undefined)
    message.resetSection !== undefined && (obj.resetSection = message.resetSection)
    return obj
  },

  create<I extends Exact<DeepPartial<PatchImageRequest>, I>>(base?: I): PatchImageRequest {
    return PatchImageRequest.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<PatchImageRequest>, I>>(object: I): PatchImageRequest {
    const message = createBasePatchImageRequest()
    message.id = object.id ?? ''
    message.accessedBy = object.accessedBy ?? ''
    message.tag = object.tag ?? undefined
    message.config =
      object.config !== undefined && object.config !== null
        ? ImageContainerConfig.fromPartial(object.config)
        : undefined
    message.resetSection = object.resetSection ?? undefined
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

  create<I extends Exact<DeepPartial<CreateNodeRequest>, I>>(base?: I): CreateNodeRequest {
    return CreateNodeRequest.fromPartial(base ?? {})
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

  create<I extends Exact<DeepPartial<UpdateNodeRequest>, I>>(base?: I): UpdateNodeRequest {
    return UpdateNodeRequest.fromPartial(base ?? {})
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
  return { id: '', accessedBy: '', type: 0, scriptType: 0 }
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
        case 2:
          message.accessedBy = reader.string()
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
      accessedBy: isSet(object.accessedBy) ? String(object.accessedBy) : '',
      type: isSet(object.type) ? nodeTypeFromJSON(object.type) : 0,
      rootPath: isSet(object.rootPath) ? String(object.rootPath) : undefined,
      scriptType: isSet(object.scriptType) ? nodeScriptTypeFromJSON(object.scriptType) : 0,
      dagentTraefik: isSet(object.dagentTraefik) ? DagentTraefikOptions.fromJSON(object.dagentTraefik) : undefined,
    }
  },

  toJSON(message: GenerateScriptRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
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
    message.accessedBy = object.accessedBy ?? ''
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
  return { id: '', accessedBy: '', command: undefined }
}

export const NodeContainerCommandRequest = {
  encode(message: NodeContainerCommandRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id)
    }
    if (message.accessedBy !== '') {
      writer.uint32(18).string(message.accessedBy)
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
        case 2:
          message.accessedBy = reader.string()
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
      accessedBy: isSet(object.accessedBy) ? String(object.accessedBy) : '',
      command: isSet(object.command) ? ContainerCommandRequest.fromJSON(object.command) : undefined,
    }
  },

  toJSON(message: NodeContainerCommandRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
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
    message.accessedBy = object.accessedBy ?? ''
    message.command =
      object.command !== undefined && object.command !== null
        ? ContainerCommandRequest.fromPartial(object.command)
        : undefined
    return message
  },
}

function createBaseNodeDeleteContainersRequest(): NodeDeleteContainersRequest {
  return { id: '', accessedBy: '', containers: undefined }
}

export const NodeDeleteContainersRequest = {
  encode(message: NodeDeleteContainersRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id)
    }
    if (message.accessedBy !== '') {
      writer.uint32(18).string(message.accessedBy)
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
        case 2:
          message.accessedBy = reader.string()
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
      accessedBy: isSet(object.accessedBy) ? String(object.accessedBy) : '',
      containers: isSet(object.containers) ? DeleteContainersRequest.fromJSON(object.containers) : undefined,
    }
  },

  toJSON(message: NodeDeleteContainersRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
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
    message.accessedBy = object.accessedBy ?? ''
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

  create<I extends Exact<DeepPartial<WatchContainerStateRequest>, I>>(base?: I): WatchContainerStateRequest {
    return WatchContainerStateRequest.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<WatchContainerStateRequest>, I>>(object: I): WatchContainerStateRequest {
    const message = createBaseWatchContainerStateRequest()
    message.accessedBy = object.accessedBy ?? ''
    message.nodeId = object.nodeId ?? ''
    message.prefix = object.prefix ?? undefined
    return message
  },
}

function createBaseWatchContainerLogRequest(): WatchContainerLogRequest {
  return { accessedBy: '', id: '' }
}

export const WatchContainerLogRequest = {
  encode(message: WatchContainerLogRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.accessedBy !== '') {
      writer.uint32(18).string(message.accessedBy)
    }
    if (message.id !== '') {
      writer.uint32(802).string(message.id)
    }
    if (message.dockerId !== undefined) {
      writer.uint32(1602).string(message.dockerId)
    }
    if (message.prefixName !== undefined) {
      ContainerIdentifier.encode(message.prefixName, writer.uint32(1610).fork()).ldelim()
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
        case 2:
          message.accessedBy = reader.string()
          break
        case 100:
          message.id = reader.string()
          break
        case 200:
          message.dockerId = reader.string()
          break
        case 201:
          message.prefixName = ContainerIdentifier.decode(reader, reader.uint32())
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
      accessedBy: isSet(object.accessedBy) ? String(object.accessedBy) : '',
      id: isSet(object.id) ? String(object.id) : '',
      dockerId: isSet(object.dockerId) ? String(object.dockerId) : undefined,
      prefixName: isSet(object.prefixName) ? ContainerIdentifier.fromJSON(object.prefixName) : undefined,
    }
  },

  toJSON(message: WatchContainerLogRequest): unknown {
    const obj: any = {}
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
    message.id !== undefined && (obj.id = message.id)
    message.dockerId !== undefined && (obj.dockerId = message.dockerId)
    message.prefixName !== undefined &&
      (obj.prefixName = message.prefixName ? ContainerIdentifier.toJSON(message.prefixName) : undefined)
    return obj
  },

  create<I extends Exact<DeepPartial<WatchContainerLogRequest>, I>>(base?: I): WatchContainerLogRequest {
    return WatchContainerLogRequest.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<WatchContainerLogRequest>, I>>(object: I): WatchContainerLogRequest {
    const message = createBaseWatchContainerLogRequest()
    message.accessedBy = object.accessedBy ?? ''
    message.id = object.id ?? ''
    message.dockerId = object.dockerId ?? undefined
    message.prefixName =
      object.prefixName !== undefined && object.prefixName !== null
        ? ContainerIdentifier.fromPartial(object.prefixName)
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

  create<I extends Exact<DeepPartial<CreateDeploymentRequest>, I>>(base?: I): CreateDeploymentRequest {
    return CreateDeploymentRequest.fromPartial(base ?? {})
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

  create<I extends Exact<DeepPartial<UpdateDeploymentRequest>, I>>(base?: I): UpdateDeploymentRequest {
    return UpdateDeploymentRequest.fromPartial(base ?? {})
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
      UniqueKeyValueList.encode(message.environment, writer.uint32(802).fork()).ldelim()
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
          message.environment = UniqueKeyValueList.decode(reader, reader.uint32())
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
      environment: isSet(object.environment) ? UniqueKeyValueList.fromJSON(object.environment) : undefined,
      instance: isSet(object.instance) ? PatchInstanceRequest.fromJSON(object.instance) : undefined,
    }
  },

  toJSON(message: PatchDeploymentRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
    message.environment !== undefined &&
      (obj.environment = message.environment ? UniqueKeyValueList.toJSON(message.environment) : undefined)
    message.instance !== undefined &&
      (obj.instance = message.instance ? PatchInstanceRequest.toJSON(message.instance) : undefined)
    return obj
  },

  create<I extends Exact<DeepPartial<PatchDeploymentRequest>, I>>(base?: I): PatchDeploymentRequest {
    return PatchDeploymentRequest.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<PatchDeploymentRequest>, I>>(object: I): PatchDeploymentRequest {
    const message = createBasePatchDeploymentRequest()
    message.id = object.id ?? ''
    message.accessedBy = object.accessedBy ?? ''
    message.environment =
      object.environment !== undefined && object.environment !== null
        ? UniqueKeyValueList.fromPartial(object.environment)
        : undefined
    message.instance =
      object.instance !== undefined && object.instance !== null
        ? PatchInstanceRequest.fromPartial(object.instance)
        : undefined
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
    if (message.config !== undefined) {
      InstanceContainerConfig.encode(message.config, writer.uint32(802).fork()).ldelim()
    }
    if (message.resetSection !== undefined) {
      writer.uint32(826).string(message.resetSection)
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
          message.config = InstanceContainerConfig.decode(reader, reader.uint32())
          break
        case 103:
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
      accessedBy: isSet(object.accessedBy) ? String(object.accessedBy) : '',
      config: isSet(object.config) ? InstanceContainerConfig.fromJSON(object.config) : undefined,
      resetSection: isSet(object.resetSection) ? String(object.resetSection) : undefined,
    }
  },

  toJSON(message: PatchInstanceRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
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
    message.accessedBy = object.accessedBy ?? ''
    message.config =
      object.config !== undefined && object.config !== null
        ? InstanceContainerConfig.fromPartial(object.config)
        : undefined
    message.resetSection = object.resetSection ?? undefined
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

  create<I extends Exact<DeepPartial<DeploymentListResponse>, I>>(base?: I): DeploymentListResponse {
    return DeploymentListResponse.fromPartial(base ?? {})
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
    versionType: 0,
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
    if (message.versionType !== 0) {
      writer.uint32(880).int32(message.versionType)
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
        case 110:
          message.versionType = reader.int32() as any
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
      versionType: isSet(object.versionType) ? versionTypeFromJSON(object.versionType) : 0,
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
    message.versionType !== undefined && (obj.versionType = versionTypeToJSON(message.versionType))
    return obj
  },

  create<I extends Exact<DeepPartial<DeploymentResponse>, I>>(base?: I): DeploymentResponse {
    return DeploymentResponse.fromPartial(base ?? {})
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
    message.versionType = object.versionType ?? 0
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

  create<I extends Exact<DeepPartial<DeploymentListByVersionResponse>, I>>(base?: I): DeploymentListByVersionResponse {
    return DeploymentListByVersionResponse.fromPartial(base ?? {})
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

  create<I extends Exact<DeepPartial<DeploymentByVersionResponse>, I>>(base?: I): DeploymentByVersionResponse {
    return DeploymentByVersionResponse.fromPartial(base ?? {})
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

  create<I extends Exact<DeepPartial<DeploymentDetailsResponse>, I>>(base?: I): DeploymentDetailsResponse {
    return DeploymentDetailsResponse.fromPartial(base ?? {})
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

function createBaseDeploymentEventResponse(): DeploymentEventResponse {
  return { type: 0, createdAt: undefined }
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

  create<I extends Exact<DeepPartial<DeploymentEventResponse>, I>>(base?: I): DeploymentEventResponse {
    return DeploymentEventResponse.fromPartial(base ?? {})
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
  return { status: 0, data: [] }
}

export const DeploymentEventListResponse = {
  encode(message: DeploymentEventListResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.status !== 0) {
      writer.uint32(800).int32(message.status)
    }
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
        case 100:
          message.status = reader.int32() as any
          break
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
      status: isSet(object.status) ? deploymentStatusFromJSON(object.status) : 0,
      data: Array.isArray(object?.data) ? object.data.map((e: any) => DeploymentEventResponse.fromJSON(e)) : [],
    }
  },

  toJSON(message: DeploymentEventListResponse): unknown {
    const obj: any = {}
    message.status !== undefined && (obj.status = deploymentStatusToJSON(message.status))
    if (message.data) {
      obj.data = message.data.map(e => (e ? DeploymentEventResponse.toJSON(e) : undefined))
    } else {
      obj.data = []
    }
    return obj
  },

  create<I extends Exact<DeepPartial<DeploymentEventListResponse>, I>>(base?: I): DeploymentEventListResponse {
    return DeploymentEventListResponse.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<DeploymentEventListResponse>, I>>(object: I): DeploymentEventListResponse {
    const message = createBaseDeploymentEventListResponse()
    message.status = object.status ?? 0
    message.data = object.data?.map(e => DeploymentEventResponse.fromPartial(e)) || []
    return message
  },
}

function createBaseDeploymentListSecretsRequest(): DeploymentListSecretsRequest {
  return { id: '', accessedBy: '', instanceId: '' }
}

export const DeploymentListSecretsRequest = {
  encode(message: DeploymentListSecretsRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id)
    }
    if (message.accessedBy !== '') {
      writer.uint32(18).string(message.accessedBy)
    }
    if (message.instanceId !== '') {
      writer.uint32(26).string(message.instanceId)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DeploymentListSecretsRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseDeploymentListSecretsRequest()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string()
          break
        case 2:
          message.accessedBy = reader.string()
          break
        case 3:
          message.instanceId = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): DeploymentListSecretsRequest {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      accessedBy: isSet(object.accessedBy) ? String(object.accessedBy) : '',
      instanceId: isSet(object.instanceId) ? String(object.instanceId) : '',
    }
  },

  toJSON(message: DeploymentListSecretsRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
    message.instanceId !== undefined && (obj.instanceId = message.instanceId)
    return obj
  },

  create<I extends Exact<DeepPartial<DeploymentListSecretsRequest>, I>>(base?: I): DeploymentListSecretsRequest {
    return DeploymentListSecretsRequest.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<DeploymentListSecretsRequest>, I>>(object: I): DeploymentListSecretsRequest {
    const message = createBaseDeploymentListSecretsRequest()
    message.id = object.id ?? ''
    message.accessedBy = object.accessedBy ?? ''
    message.instanceId = object.instanceId ?? ''
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

  create<I extends Exact<DeepPartial<CreateNotificationRequest>, I>>(base?: I): CreateNotificationRequest {
    return CreateNotificationRequest.fromPartial(base ?? {})
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

  create<I extends Exact<DeepPartial<CreateNotificationResponse>, I>>(base?: I): CreateNotificationResponse {
    return CreateNotificationResponse.fromPartial(base ?? {})
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

  create<I extends Exact<DeepPartial<UpdateNotificationRequest>, I>>(base?: I): UpdateNotificationRequest {
    return UpdateNotificationRequest.fromPartial(base ?? {})
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

  create<I extends Exact<DeepPartial<NotificationDetailsResponse>, I>>(base?: I): NotificationDetailsResponse {
    return NotificationDetailsResponse.fromPartial(base ?? {})
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

  create<I extends Exact<DeepPartial<NotificationResponse>, I>>(base?: I): NotificationResponse {
    return NotificationResponse.fromPartial(base ?? {})
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

  create<I extends Exact<DeepPartial<NotificationListResponse>, I>>(base?: I): NotificationListResponse {
    return NotificationListResponse.fromPartial(base ?? {})
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

function createBaseTemplateResponse(): TemplateResponse {
  return { id: '', name: '', description: '', technologies: [] }
}

export const TemplateResponse = {
  encode(message: TemplateResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id)
    }
    if (message.name !== '') {
      writer.uint32(802).string(message.name)
    }
    if (message.description !== '') {
      writer.uint32(810).string(message.description)
    }
    for (const v of message.technologies) {
      writer.uint32(8002).string(v!)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TemplateResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseTemplateResponse()
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
        case 1000:
          message.technologies.push(reader.string())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): TemplateResponse {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      name: isSet(object.name) ? String(object.name) : '',
      description: isSet(object.description) ? String(object.description) : '',
      technologies: Array.isArray(object?.technologies) ? object.technologies.map((e: any) => String(e)) : [],
    }
  },

  toJSON(message: TemplateResponse): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.name !== undefined && (obj.name = message.name)
    message.description !== undefined && (obj.description = message.description)
    if (message.technologies) {
      obj.technologies = message.technologies.map(e => e)
    } else {
      obj.technologies = []
    }
    return obj
  },

  create<I extends Exact<DeepPartial<TemplateResponse>, I>>(base?: I): TemplateResponse {
    return TemplateResponse.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<TemplateResponse>, I>>(object: I): TemplateResponse {
    const message = createBaseTemplateResponse()
    message.id = object.id ?? ''
    message.name = object.name ?? ''
    message.description = object.description ?? ''
    message.technologies = object.technologies?.map(e => e) || []
    return message
  },
}

function createBaseTemplateListResponse(): TemplateListResponse {
  return { data: [] }
}

export const TemplateListResponse = {
  encode(message: TemplateListResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.data) {
      TemplateResponse.encode(v!, writer.uint32(8002).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TemplateListResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseTemplateListResponse()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1000:
          message.data.push(TemplateResponse.decode(reader, reader.uint32()))
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): TemplateListResponse {
    return { data: Array.isArray(object?.data) ? object.data.map((e: any) => TemplateResponse.fromJSON(e)) : [] }
  },

  toJSON(message: TemplateListResponse): unknown {
    const obj: any = {}
    if (message.data) {
      obj.data = message.data.map(e => (e ? TemplateResponse.toJSON(e) : undefined))
    } else {
      obj.data = []
    }
    return obj
  },

  create<I extends Exact<DeepPartial<TemplateListResponse>, I>>(base?: I): TemplateListResponse {
    return TemplateListResponse.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<TemplateListResponse>, I>>(object: I): TemplateListResponse {
    const message = createBaseTemplateListResponse()
    message.data = object.data?.map(e => TemplateResponse.fromPartial(e)) || []
    return message
  },
}

function createBaseCreateProductFromTemplateRequest(): CreateProductFromTemplateRequest {
  return { id: '', accessedBy: '', name: '', description: '', type: 0 }
}

export const CreateProductFromTemplateRequest = {
  encode(message: CreateProductFromTemplateRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id)
    }
    if (message.accessedBy !== '') {
      writer.uint32(18).string(message.accessedBy)
    }
    if (message.name !== '') {
      writer.uint32(802).string(message.name)
    }
    if (message.description !== '') {
      writer.uint32(810).string(message.description)
    }
    if (message.type !== 0) {
      writer.uint32(816).int32(message.type)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CreateProductFromTemplateRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseCreateProductFromTemplateRequest()
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
          message.type = reader.int32() as any
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): CreateProductFromTemplateRequest {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      accessedBy: isSet(object.accessedBy) ? String(object.accessedBy) : '',
      name: isSet(object.name) ? String(object.name) : '',
      description: isSet(object.description) ? String(object.description) : '',
      type: isSet(object.type) ? productTypeFromJSON(object.type) : 0,
    }
  },

  toJSON(message: CreateProductFromTemplateRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
    message.name !== undefined && (obj.name = message.name)
    message.description !== undefined && (obj.description = message.description)
    message.type !== undefined && (obj.type = productTypeToJSON(message.type))
    return obj
  },

  create<I extends Exact<DeepPartial<CreateProductFromTemplateRequest>, I>>(
    base?: I,
  ): CreateProductFromTemplateRequest {
    return CreateProductFromTemplateRequest.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<CreateProductFromTemplateRequest>, I>>(
    object: I,
  ): CreateProductFromTemplateRequest {
    const message = createBaseCreateProductFromTemplateRequest()
    message.id = object.id ?? ''
    message.accessedBy = object.accessedBy ?? ''
    message.name = object.name ?? ''
    message.description = object.description ?? ''
    message.type = object.type ?? 0
    return message
  },
}

function createBaseTemplateImageResponse(): TemplateImageResponse {
  return { data: new Uint8Array() }
}

export const TemplateImageResponse = {
  encode(message: TemplateImageResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.data.length !== 0) {
      writer.uint32(10).bytes(message.data)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TemplateImageResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseTemplateImageResponse()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.data = reader.bytes()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): TemplateImageResponse {
    return { data: isSet(object.data) ? bytesFromBase64(object.data) : new Uint8Array() }
  },

  toJSON(message: TemplateImageResponse): unknown {
    const obj: any = {}
    message.data !== undefined &&
      (obj.data = base64FromBytes(message.data !== undefined ? message.data : new Uint8Array()))
    return obj
  },

  create<I extends Exact<DeepPartial<TemplateImageResponse>, I>>(base?: I): TemplateImageResponse {
    return TemplateImageResponse.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<TemplateImageResponse>, I>>(object: I): TemplateImageResponse {
    const message = createBaseTemplateImageResponse()
    message.data = object.data ?? new Uint8Array()
    return message
  },
}

function createBaseDashboardActiveNodes(): DashboardActiveNodes {
  return { id: '', name: '', address: '', version: '' }
}

export const DashboardActiveNodes = {
  encode(message: DashboardActiveNodes, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id)
    }
    if (message.name !== '') {
      writer.uint32(802).string(message.name)
    }
    if (message.address !== '') {
      writer.uint32(810).string(message.address)
    }
    if (message.version !== '') {
      writer.uint32(818).string(message.version)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DashboardActiveNodes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseDashboardActiveNodes()
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
          message.address = reader.string()
          break
        case 102:
          message.version = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): DashboardActiveNodes {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      name: isSet(object.name) ? String(object.name) : '',
      address: isSet(object.address) ? String(object.address) : '',
      version: isSet(object.version) ? String(object.version) : '',
    }
  },

  toJSON(message: DashboardActiveNodes): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.name !== undefined && (obj.name = message.name)
    message.address !== undefined && (obj.address = message.address)
    message.version !== undefined && (obj.version = message.version)
    return obj
  },

  create<I extends Exact<DeepPartial<DashboardActiveNodes>, I>>(base?: I): DashboardActiveNodes {
    return DashboardActiveNodes.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<DashboardActiveNodes>, I>>(object: I): DashboardActiveNodes {
    const message = createBaseDashboardActiveNodes()
    message.id = object.id ?? ''
    message.name = object.name ?? ''
    message.address = object.address ?? ''
    message.version = object.version ?? ''
    return message
  },
}

function createBaseDashboardDeployment(): DashboardDeployment {
  return { id: '', product: '', version: '', node: '', changelog: '', productId: '', versionId: '' }
}

export const DashboardDeployment = {
  encode(message: DashboardDeployment, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== '') {
      writer.uint32(10).string(message.id)
    }
    if (message.product !== '') {
      writer.uint32(802).string(message.product)
    }
    if (message.version !== '') {
      writer.uint32(810).string(message.version)
    }
    if (message.node !== '') {
      writer.uint32(818).string(message.node)
    }
    if (message.changelog !== '') {
      writer.uint32(826).string(message.changelog)
    }
    if (message.deployedAt !== undefined) {
      Timestamp.encode(message.deployedAt, writer.uint32(834).fork()).ldelim()
    }
    if (message.productId !== '') {
      writer.uint32(842).string(message.productId)
    }
    if (message.versionId !== '') {
      writer.uint32(850).string(message.versionId)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DashboardDeployment {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseDashboardDeployment()
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
          message.version = reader.string()
          break
        case 102:
          message.node = reader.string()
          break
        case 103:
          message.changelog = reader.string()
          break
        case 104:
          message.deployedAt = Timestamp.decode(reader, reader.uint32())
          break
        case 105:
          message.productId = reader.string()
          break
        case 106:
          message.versionId = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): DashboardDeployment {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      product: isSet(object.product) ? String(object.product) : '',
      version: isSet(object.version) ? String(object.version) : '',
      node: isSet(object.node) ? String(object.node) : '',
      changelog: isSet(object.changelog) ? String(object.changelog) : '',
      deployedAt: isSet(object.deployedAt) ? fromJsonTimestamp(object.deployedAt) : undefined,
      productId: isSet(object.productId) ? String(object.productId) : '',
      versionId: isSet(object.versionId) ? String(object.versionId) : '',
    }
  },

  toJSON(message: DashboardDeployment): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.product !== undefined && (obj.product = message.product)
    message.version !== undefined && (obj.version = message.version)
    message.node !== undefined && (obj.node = message.node)
    message.changelog !== undefined && (obj.changelog = message.changelog)
    message.deployedAt !== undefined && (obj.deployedAt = fromTimestamp(message.deployedAt).toISOString())
    message.productId !== undefined && (obj.productId = message.productId)
    message.versionId !== undefined && (obj.versionId = message.versionId)
    return obj
  },

  create<I extends Exact<DeepPartial<DashboardDeployment>, I>>(base?: I): DashboardDeployment {
    return DashboardDeployment.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<DashboardDeployment>, I>>(object: I): DashboardDeployment {
    const message = createBaseDashboardDeployment()
    message.id = object.id ?? ''
    message.product = object.product ?? ''
    message.version = object.version ?? ''
    message.node = object.node ?? ''
    message.changelog = object.changelog ?? ''
    message.deployedAt =
      object.deployedAt !== undefined && object.deployedAt !== null
        ? Timestamp.fromPartial(object.deployedAt)
        : undefined
    message.productId = object.productId ?? ''
    message.versionId = object.versionId ?? ''
    return message
  },
}

function createBaseDashboardResponse(): DashboardResponse {
  return {
    users: 0,
    auditLogEntries: 0,
    products: 0,
    versions: 0,
    deployments: 0,
    failedDeployments: 0,
    nodes: [],
    latestDeployments: [],
    auditLog: [],
  }
}

export const DashboardResponse = {
  encode(message: DashboardResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.users !== 0) {
      writer.uint32(800).uint32(message.users)
    }
    if (message.auditLogEntries !== 0) {
      writer.uint32(808).uint32(message.auditLogEntries)
    }
    if (message.products !== 0) {
      writer.uint32(816).uint32(message.products)
    }
    if (message.versions !== 0) {
      writer.uint32(824).uint32(message.versions)
    }
    if (message.deployments !== 0) {
      writer.uint32(832).uint32(message.deployments)
    }
    if (message.failedDeployments !== 0) {
      writer.uint32(840).uint32(message.failedDeployments)
    }
    for (const v of message.nodes) {
      DashboardActiveNodes.encode(v!, writer.uint32(8002).fork()).ldelim()
    }
    for (const v of message.latestDeployments) {
      DashboardDeployment.encode(v!, writer.uint32(8010).fork()).ldelim()
    }
    for (const v of message.auditLog) {
      AuditLogResponse.encode(v!, writer.uint32(8018).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DashboardResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseDashboardResponse()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 100:
          message.users = reader.uint32()
          break
        case 101:
          message.auditLogEntries = reader.uint32()
          break
        case 102:
          message.products = reader.uint32()
          break
        case 103:
          message.versions = reader.uint32()
          break
        case 104:
          message.deployments = reader.uint32()
          break
        case 105:
          message.failedDeployments = reader.uint32()
          break
        case 1000:
          message.nodes.push(DashboardActiveNodes.decode(reader, reader.uint32()))
          break
        case 1001:
          message.latestDeployments.push(DashboardDeployment.decode(reader, reader.uint32()))
          break
        case 1002:
          message.auditLog.push(AuditLogResponse.decode(reader, reader.uint32()))
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): DashboardResponse {
    return {
      users: isSet(object.users) ? Number(object.users) : 0,
      auditLogEntries: isSet(object.auditLogEntries) ? Number(object.auditLogEntries) : 0,
      products: isSet(object.products) ? Number(object.products) : 0,
      versions: isSet(object.versions) ? Number(object.versions) : 0,
      deployments: isSet(object.deployments) ? Number(object.deployments) : 0,
      failedDeployments: isSet(object.failedDeployments) ? Number(object.failedDeployments) : 0,
      nodes: Array.isArray(object?.nodes) ? object.nodes.map((e: any) => DashboardActiveNodes.fromJSON(e)) : [],
      latestDeployments: Array.isArray(object?.latestDeployments)
        ? object.latestDeployments.map((e: any) => DashboardDeployment.fromJSON(e))
        : [],
      auditLog: Array.isArray(object?.auditLog) ? object.auditLog.map((e: any) => AuditLogResponse.fromJSON(e)) : [],
    }
  },

  toJSON(message: DashboardResponse): unknown {
    const obj: any = {}
    message.users !== undefined && (obj.users = Math.round(message.users))
    message.auditLogEntries !== undefined && (obj.auditLogEntries = Math.round(message.auditLogEntries))
    message.products !== undefined && (obj.products = Math.round(message.products))
    message.versions !== undefined && (obj.versions = Math.round(message.versions))
    message.deployments !== undefined && (obj.deployments = Math.round(message.deployments))
    message.failedDeployments !== undefined && (obj.failedDeployments = Math.round(message.failedDeployments))
    if (message.nodes) {
      obj.nodes = message.nodes.map(e => (e ? DashboardActiveNodes.toJSON(e) : undefined))
    } else {
      obj.nodes = []
    }
    if (message.latestDeployments) {
      obj.latestDeployments = message.latestDeployments.map(e => (e ? DashboardDeployment.toJSON(e) : undefined))
    } else {
      obj.latestDeployments = []
    }
    if (message.auditLog) {
      obj.auditLog = message.auditLog.map(e => (e ? AuditLogResponse.toJSON(e) : undefined))
    } else {
      obj.auditLog = []
    }
    return obj
  },

  create<I extends Exact<DeepPartial<DashboardResponse>, I>>(base?: I): DashboardResponse {
    return DashboardResponse.fromPartial(base ?? {})
  },

  fromPartial<I extends Exact<DeepPartial<DashboardResponse>, I>>(object: I): DashboardResponse {
    const message = createBaseDashboardResponse()
    message.users = object.users ?? 0
    message.auditLogEntries = object.auditLogEntries ?? 0
    message.products = object.products ?? 0
    message.versions = object.versions ?? 0
    message.deployments = object.deployments ?? 0
    message.failedDeployments = object.failedDeployments ?? 0
    message.nodes = object.nodes?.map(e => DashboardActiveNodes.fromPartial(e)) || []
    message.latestDeployments = object.latestDeployments?.map(e => DashboardDeployment.fromPartial(e)) || []
    message.auditLog = object.auditLog?.map(e => AuditLogResponse.fromPartial(e)) || []
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
  new (address: string, credentials: ChannelCredentials, options?: Partial<ClientOptions>): CruxProductClient
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
  new (address: string, credentials: ChannelCredentials, options?: Partial<ClientOptions>): CruxRegistryClient
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
  getNodes: handleUnaryCall<AccessRequest, NodeListResponse>
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
  new (address: string, credentials: ChannelCredentials, options?: Partial<ClientOptions>): CruxProductVersionClient
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
  new (address: string, credentials: ChannelCredentials, options?: Partial<ClientOptions>): CruxImageClient
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
  getDeploymentSecrets: {
    path: '/crux.CruxDeployment/GetDeploymentSecrets',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: DeploymentListSecretsRequest) =>
      Buffer.from(DeploymentListSecretsRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => DeploymentListSecretsRequest.decode(value),
    responseSerialize: (value: ListSecretsResponse) => Buffer.from(ListSecretsResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => ListSecretsResponse.decode(value),
  },
  copyDeploymentSafe: {
    path: '/crux.CruxDeployment/CopyDeploymentSafe',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: IdRequest) => Buffer.from(IdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => IdRequest.decode(value),
    responseSerialize: (value: CreateEntityResponse) => Buffer.from(CreateEntityResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => CreateEntityResponse.decode(value),
  },
  copyDeploymentUnsafe: {
    path: '/crux.CruxDeployment/CopyDeploymentUnsafe',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: IdRequest) => Buffer.from(IdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => IdRequest.decode(value),
    responseSerialize: (value: CreateEntityResponse) => Buffer.from(CreateEntityResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => CreateEntityResponse.decode(value),
  },
  startDeployment: {
    path: '/crux.CruxDeployment/StartDeployment',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: IdRequest) => Buffer.from(IdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => IdRequest.decode(value),
    responseSerialize: (value: Empty) => Buffer.from(Empty.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Empty.decode(value),
  },
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
  getDeploymentsByVersionId: handleUnaryCall<IdRequest, DeploymentListByVersionResponse>
  createDeployment: handleUnaryCall<CreateDeploymentRequest, CreateEntityResponse>
  updateDeployment: handleUnaryCall<UpdateDeploymentRequest, UpdateEntityResponse>
  patchDeployment: handleUnaryCall<PatchDeploymentRequest, UpdateEntityResponse>
  deleteDeployment: handleUnaryCall<IdRequest, Empty>
  getDeploymentDetails: handleUnaryCall<IdRequest, DeploymentDetailsResponse>
  getDeploymentEvents: handleUnaryCall<IdRequest, DeploymentEventListResponse>
  getDeploymentList: handleUnaryCall<AccessRequest, DeploymentListResponse>
  getDeploymentSecrets: handleUnaryCall<DeploymentListSecretsRequest, ListSecretsResponse>
  copyDeploymentSafe: handleUnaryCall<IdRequest, CreateEntityResponse>
  copyDeploymentUnsafe: handleUnaryCall<IdRequest, CreateEntityResponse>
  startDeployment: handleUnaryCall<IdRequest, Empty>
  subscribeToDeploymentEvents: handleServerStreamingCall<IdRequest, DeploymentProgressMessage>
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
  getDeploymentSecrets(
    request: DeploymentListSecretsRequest,
    callback: (error: ServiceError | null, response: ListSecretsResponse) => void,
  ): ClientUnaryCall
  getDeploymentSecrets(
    request: DeploymentListSecretsRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: ListSecretsResponse) => void,
  ): ClientUnaryCall
  getDeploymentSecrets(
    request: DeploymentListSecretsRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: ListSecretsResponse) => void,
  ): ClientUnaryCall
  copyDeploymentSafe(
    request: IdRequest,
    callback: (error: ServiceError | null, response: CreateEntityResponse) => void,
  ): ClientUnaryCall
  copyDeploymentSafe(
    request: IdRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: CreateEntityResponse) => void,
  ): ClientUnaryCall
  copyDeploymentSafe(
    request: IdRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: CreateEntityResponse) => void,
  ): ClientUnaryCall
  copyDeploymentUnsafe(
    request: IdRequest,
    callback: (error: ServiceError | null, response: CreateEntityResponse) => void,
  ): ClientUnaryCall
  copyDeploymentUnsafe(
    request: IdRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: CreateEntityResponse) => void,
  ): ClientUnaryCall
  copyDeploymentUnsafe(
    request: IdRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: CreateEntityResponse) => void,
  ): ClientUnaryCall
  startDeployment(request: IdRequest, callback: (error: ServiceError | null, response: Empty) => void): ClientUnaryCall
  startDeployment(
    request: IdRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  startDeployment(
    request: IdRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
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
  reinviteUserToTeam: handleUnaryCall<ReinviteUserRequest, CreateEntityResponse>
  deleteUserFromTeam: handleUnaryCall<DeleteUserFromTeamRequest, Empty>
  acceptTeamInvitation: handleUnaryCall<IdRequest, Empty>
  declineTeamInvitation: handleUnaryCall<IdRequest, Empty>
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
  new (address: string, credentials: ChannelCredentials, options?: Partial<ClientOptions>): CruxTeamClient
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
  new (address: string, credentials: ChannelCredentials, options?: Partial<ClientOptions>): CruxNotificationClient
  service: typeof CruxNotificationService
}

export type CruxAuditService = typeof CruxAuditService
export const CruxAuditService = {
  getAuditLog: {
    path: '/crux.CruxAudit/GetAuditLog',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: AuditLogListRequest) => Buffer.from(AuditLogListRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => AuditLogListRequest.decode(value),
    responseSerialize: (value: AuditLogListResponse) => Buffer.from(AuditLogListResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => AuditLogListResponse.decode(value),
  },
  getAuditLogListCount: {
    path: '/crux.CruxAudit/GetAuditLogListCount',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: AuditLogListRequest) => Buffer.from(AuditLogListRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => AuditLogListRequest.decode(value),
    responseSerialize: (value: AuditLogListCountResponse) =>
      Buffer.from(AuditLogListCountResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => AuditLogListCountResponse.decode(value),
  },
} as const

export interface CruxAuditServer extends UntypedServiceImplementation {
  getAuditLog: handleUnaryCall<AuditLogListRequest, AuditLogListResponse>
  getAuditLogListCount: handleUnaryCall<AuditLogListRequest, AuditLogListCountResponse>
}

export interface CruxAuditClient extends Client {
  getAuditLog(
    request: AuditLogListRequest,
    callback: (error: ServiceError | null, response: AuditLogListResponse) => void,
  ): ClientUnaryCall
  getAuditLog(
    request: AuditLogListRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: AuditLogListResponse) => void,
  ): ClientUnaryCall
  getAuditLog(
    request: AuditLogListRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: AuditLogListResponse) => void,
  ): ClientUnaryCall
  getAuditLogListCount(
    request: AuditLogListRequest,
    callback: (error: ServiceError | null, response: AuditLogListCountResponse) => void,
  ): ClientUnaryCall
  getAuditLogListCount(
    request: AuditLogListRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: AuditLogListCountResponse) => void,
  ): ClientUnaryCall
  getAuditLogListCount(
    request: AuditLogListRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: AuditLogListCountResponse) => void,
  ): ClientUnaryCall
}

export const CruxAuditClient = makeGenericClientConstructor(CruxAuditService, 'crux.CruxAudit') as unknown as {
  new (address: string, credentials: ChannelCredentials, options?: Partial<ClientOptions>): CruxAuditClient
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
  new (address: string, credentials: ChannelCredentials, options?: Partial<ClientOptions>): CruxHealthClient
  service: typeof CruxHealthService
}

export type CruxTemplateService = typeof CruxTemplateService
export const CruxTemplateService = {
  getTemplates: {
    path: '/crux.CruxTemplate/GetTemplates',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: AccessRequest) => Buffer.from(AccessRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => AccessRequest.decode(value),
    responseSerialize: (value: TemplateListResponse) => Buffer.from(TemplateListResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => TemplateListResponse.decode(value),
  },
  createProductFromTemplate: {
    path: '/crux.CruxTemplate/CreateProductFromTemplate',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: CreateProductFromTemplateRequest) =>
      Buffer.from(CreateProductFromTemplateRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => CreateProductFromTemplateRequest.decode(value),
    responseSerialize: (value: CreateEntityResponse) => Buffer.from(CreateEntityResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => CreateEntityResponse.decode(value),
  },
  getImage: {
    path: '/crux.CruxTemplate/GetImage',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: IdRequest) => Buffer.from(IdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => IdRequest.decode(value),
    responseSerialize: (value: TemplateImageResponse) => Buffer.from(TemplateImageResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => TemplateImageResponse.decode(value),
  },
} as const

export interface CruxTemplateServer extends UntypedServiceImplementation {
  getTemplates: handleUnaryCall<AccessRequest, TemplateListResponse>
  createProductFromTemplate: handleUnaryCall<CreateProductFromTemplateRequest, CreateEntityResponse>
  getImage: handleUnaryCall<IdRequest, TemplateImageResponse>
}

export interface CruxTemplateClient extends Client {
  getTemplates(
    request: AccessRequest,
    callback: (error: ServiceError | null, response: TemplateListResponse) => void,
  ): ClientUnaryCall
  getTemplates(
    request: AccessRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: TemplateListResponse) => void,
  ): ClientUnaryCall
  getTemplates(
    request: AccessRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: TemplateListResponse) => void,
  ): ClientUnaryCall
  createProductFromTemplate(
    request: CreateProductFromTemplateRequest,
    callback: (error: ServiceError | null, response: CreateEntityResponse) => void,
  ): ClientUnaryCall
  createProductFromTemplate(
    request: CreateProductFromTemplateRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: CreateEntityResponse) => void,
  ): ClientUnaryCall
  createProductFromTemplate(
    request: CreateProductFromTemplateRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: CreateEntityResponse) => void,
  ): ClientUnaryCall
  getImage(
    request: IdRequest,
    callback: (error: ServiceError | null, response: TemplateImageResponse) => void,
  ): ClientUnaryCall
  getImage(
    request: IdRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: TemplateImageResponse) => void,
  ): ClientUnaryCall
  getImage(
    request: IdRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: TemplateImageResponse) => void,
  ): ClientUnaryCall
}

export const CruxTemplateClient = makeGenericClientConstructor(CruxTemplateService, 'crux.CruxTemplate') as unknown as {
  new (address: string, credentials: ChannelCredentials, options?: Partial<ClientOptions>): CruxTemplateClient
  service: typeof CruxTemplateService
}

export type CruxDashboardService = typeof CruxDashboardService
export const CruxDashboardService = {
  getDashboard: {
    path: '/crux.CruxDashboard/GetDashboard',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: AccessRequest) => Buffer.from(AccessRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => AccessRequest.decode(value),
    responseSerialize: (value: DashboardResponse) => Buffer.from(DashboardResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => DashboardResponse.decode(value),
  },
} as const

export interface CruxDashboardServer extends UntypedServiceImplementation {
  getDashboard: handleUnaryCall<AccessRequest, DashboardResponse>
}

export interface CruxDashboardClient extends Client {
  getDashboard(
    request: AccessRequest,
    callback: (error: ServiceError | null, response: DashboardResponse) => void,
  ): ClientUnaryCall
  getDashboard(
    request: AccessRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: DashboardResponse) => void,
  ): ClientUnaryCall
  getDashboard(
    request: AccessRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: DashboardResponse) => void,
  ): ClientUnaryCall
}

export const CruxDashboardClient = makeGenericClientConstructor(
  CruxDashboardService,
  'crux.CruxDashboard',
) as unknown as {
  new (address: string, credentials: ChannelCredentials, options?: Partial<ClientOptions>): CruxDashboardClient
  service: typeof CruxDashboardService
}

export type CruxTokenService = typeof CruxTokenService
export const CruxTokenService = {
  generateToken: {
    path: '/crux.CruxToken/GenerateToken',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: GenerateTokenRequest) => Buffer.from(GenerateTokenRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => GenerateTokenRequest.decode(value),
    responseSerialize: (value: GenerateTokenResponse) => Buffer.from(GenerateTokenResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => GenerateTokenResponse.decode(value),
  },
  getTokenList: {
    path: '/crux.CruxToken/GetTokenList',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: AccessRequest) => Buffer.from(AccessRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => AccessRequest.decode(value),
    responseSerialize: (value: TokenListResponse) => Buffer.from(TokenListResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => TokenListResponse.decode(value),
  },
  deleteToken: {
    path: '/crux.CruxToken/DeleteToken',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: IdRequest) => Buffer.from(IdRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => IdRequest.decode(value),
    responseSerialize: (value: Empty) => Buffer.from(Empty.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Empty.decode(value),
  },
} as const

export interface CruxTokenServer extends UntypedServiceImplementation {
  generateToken: handleUnaryCall<GenerateTokenRequest, GenerateTokenResponse>
  getTokenList: handleUnaryCall<AccessRequest, TokenListResponse>
  deleteToken: handleUnaryCall<IdRequest, Empty>
}

export interface CruxTokenClient extends Client {
  generateToken(
    request: GenerateTokenRequest,
    callback: (error: ServiceError | null, response: GenerateTokenResponse) => void,
  ): ClientUnaryCall
  generateToken(
    request: GenerateTokenRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: GenerateTokenResponse) => void,
  ): ClientUnaryCall
  generateToken(
    request: GenerateTokenRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: GenerateTokenResponse) => void,
  ): ClientUnaryCall
  getTokenList(
    request: AccessRequest,
    callback: (error: ServiceError | null, response: TokenListResponse) => void,
  ): ClientUnaryCall
  getTokenList(
    request: AccessRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: TokenListResponse) => void,
  ): ClientUnaryCall
  getTokenList(
    request: AccessRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: TokenListResponse) => void,
  ): ClientUnaryCall
  deleteToken(request: IdRequest, callback: (error: ServiceError | null, response: Empty) => void): ClientUnaryCall
  deleteToken(
    request: IdRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
  deleteToken(
    request: IdRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall
}

export const CruxTokenClient = makeGenericClientConstructor(CruxTokenService, 'crux.CruxToken') as unknown as {
  new (address: string, credentials: ChannelCredentials, options?: Partial<ClientOptions>): CruxTokenClient
  service: typeof CruxTokenService
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

function bytesFromBase64(b64: string): Uint8Array {
  if (tsProtoGlobalThis.Buffer) {
    return Uint8Array.from(tsProtoGlobalThis.Buffer.from(b64, 'base64'))
  } else {
    const bin = tsProtoGlobalThis.atob(b64)
    const arr = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; ++i) {
      arr[i] = bin.charCodeAt(i)
    }
    return arr
  }
}

function base64FromBytes(arr: Uint8Array): string {
  if (tsProtoGlobalThis.Buffer) {
    return tsProtoGlobalThis.Buffer.from(arr).toString('base64')
  } else {
    const bin: string[] = []
    arr.forEach(byte => {
      bin.push(String.fromCharCode(byte))
    })
    return tsProtoGlobalThis.btoa(bin.join(''))
  }
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
