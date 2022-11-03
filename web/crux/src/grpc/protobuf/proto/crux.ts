/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices'
import { util, configure } from 'protobufjs/minimal'
import * as Long from 'long'
import {
  DriverType,
  DeploymentStatus,
  ContainerState,
  UniqueKey,
  VolumeType,
  RestartPolicy,
  NetworkMode,
  DeploymentStrategy,
  HealthCheckConfig,
  ResourceConfig,
  ExposeStrategy,
  Ingress,
  ConfigContainer,
  InstanceDeploymentItem,
  Empty,
  ContainerStateListMessage,
  ListSecretsResponse,
  driverTypeFromJSON,
  driverTypeToJSON,
  volumeTypeFromJSON,
  volumeTypeToJSON,
  restartPolicyFromJSON,
  networkModeFromJSON,
  restartPolicyToJSON,
  networkModeToJSON,
  deploymentStrategyFromJSON,
  deploymentStrategyToJSON,
  exposeStrategyFromJSON,
  exposeStrategyToJSON,
  deploymentStatusFromJSON,
  deploymentStatusToJSON,
  containerStateFromJSON,
  containerStateToJSON,
} from './common'
import { Observable } from 'rxjs'
import { Timestamp } from '../../google/protobuf/timestamp'
import { Metadata } from '@grpc/grpc-js'

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
    default:
      return 'UNKNOWN'
  }
}

export enum UserStatus {
  USER_STATUS_UNSPECIFIED = 0,
  PENDING = 1,
  VERIFIED = 2,
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
    default:
      return 'UNKNOWN'
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
    default:
      return 'UNKNOWN'
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
    default:
      return 'UNKNOWN'
  }
}

export enum RegistryType {
  REGISTRY_TYPE_UNSPECIFIED = 0,
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
    default:
      return 'UNKNOWN'
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
    default:
      return 'UNKNOWN'
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
    default:
      return 'UNKNOWN'
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
    default:
      return 'UNKNOWN'
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
    default:
      return 'UNKNOWN'
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
    default:
      return 'UNKNOWN'
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
    default:
      return 'UNKNOWN'
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

export interface VolumeLink {
  id: string
  name: string
  path: string
}

export interface InitContainer {
  id: string
  name: string
  image: string
  useParentConfig?: boolean | undefined
  volumes: VolumeLink[]
  command: UniqueKey[]
  args: UniqueKey[]
  environment: UniqueKeyValue[]
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
  external: number
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

export interface Volume {
  id: string
  name: string
  path: string
  size?: string | undefined
  type?: VolumeType | undefined
  class?: string | undefined
}

export interface KeyList {
  data: UniqueKey[]
}

export interface UniqueKeyValue {
  id: string
  key: string
  value: string
}

export interface UniqueSecretKeyValue {
  id: string
  key: string
  value: string
  publicKey: string
  required: boolean
  encrypted?: boolean | undefined
}

export interface KeyValueList {
  data: UniqueKeyValue[]
}

export interface DagentContainerConfig {
  logConfig?: LogConfig | undefined
  restartPolicy?: RestartPolicy | undefined
  networkMode?: NetworkMode | undefined
  networks: UniqueKey[]
}

export interface CraneContainerConfig {
  deploymentStatregy?: DeploymentStrategy | undefined
  healthCheckConfig?: HealthCheckConfig | undefined
  resourceConfig?: ResourceConfig | undefined
  proxyHeaders?: boolean | undefined
  useLoadBalancer?: boolean | undefined
  customHeaders: UniqueKey[]
  extraLBAnnotations: UniqueKeyValue[]
}

export interface CommonContainerConfig {
  name: string
  expose?: ExposeStrategy | undefined
  ingress?: Ingress | undefined
  configContainer?: ConfigContainer | undefined
  importContainer?: ImportContainer | undefined
  user?: number | undefined
  TTY?: boolean | undefined
  ports: Port[]
  portRanges: PortRangeBinding[]
  volumes: Volume[]
  commands: UniqueKey[]
  args: UniqueKey[]
  environment: UniqueKeyValue[]
  secrets: UniqueSecretKeyValue[]
  initContainers: InitContainer[]
}

export interface ContainerConfig {
  common?: CommonContainerConfig | undefined
  dagent?: DagentContainerConfig | undefined
  crane?: CraneContainerConfig | undefined
  capabilities: UniqueKeyValue[]
}

export interface ImageResponse {
  id: string
  name: string
  tag: string
  order: number
  registryId: string
  config: ContainerConfig | undefined
  createdAt: Timestamp | undefined
  registryName: string
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
  config?: ContainerConfig | undefined
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
  rootPath?: string | undefined
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
  version?: string | undefined
  connectedAt?: Timestamp | undefined
}

export interface WatchContainerStateRequest {
  accessedBy: string
  nodeId: string
  prefix?: string | undefined
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

export interface InstanceResponse {
  id: string
  audit: AuditResponse | undefined
  image: ImageResponse | undefined
  state?: ContainerState | undefined
  config?: ContainerConfig | undefined
}

export interface PatchInstanceRequest {
  id: string
  accessedBy: string
  config?: ContainerConfig | undefined
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

export const CRUX_PACKAGE_NAME = 'crux'

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

const baseAuditLogListRequest: object = {
  accessedBy: '',
  pageSize: 0,
  pageNumber: 0,
}

export const AuditLogListRequest = {
  fromJSON(object: any): AuditLogListRequest {
    const message = { ...baseAuditLogListRequest } as AuditLogListRequest
    message.accessedBy = object.accessedBy !== undefined && object.accessedBy !== null ? String(object.accessedBy) : ''
    message.pageSize = object.pageSize !== undefined && object.pageSize !== null ? Number(object.pageSize) : 0
    message.pageNumber = object.pageNumber !== undefined && object.pageNumber !== null ? Number(object.pageNumber) : 0
    message.keyword = object.keyword !== undefined && object.keyword !== null ? String(object.keyword) : undefined
    message.createdFrom =
      object.createdFrom !== undefined && object.createdFrom !== null
        ? fromJsonTimestamp(object.createdFrom)
        : undefined
    message.createdTo =
      object.createdTo !== undefined && object.createdTo !== null ? fromJsonTimestamp(object.createdTo) : undefined
    return message
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
}

const baseAuditLogListCountResponse: object = { count: 0 }

export const AuditLogListCountResponse = {
  fromJSON(object: any): AuditLogListCountResponse {
    const message = {
      ...baseAuditLogListCountResponse,
    } as AuditLogListCountResponse
    message.count = object.count !== undefined && object.count !== null ? Number(object.count) : 0
    return message
  },

  toJSON(message: AuditLogListCountResponse): unknown {
    const obj: any = {}
    message.count !== undefined && (obj.count = Math.round(message.count))
    return obj
  },
}

const baseAuditLogResponse: object = {
  userId: '',
  identityEmail: '',
  serviceCall: '',
}

export const AuditLogResponse = {
  fromJSON(object: any): AuditLogResponse {
    const message = { ...baseAuditLogResponse } as AuditLogResponse
    message.createdAt =
      object.createdAt !== undefined && object.createdAt !== null ? fromJsonTimestamp(object.createdAt) : undefined
    message.userId = object.userId !== undefined && object.userId !== null ? String(object.userId) : ''
    message.identityEmail =
      object.identityEmail !== undefined && object.identityEmail !== null ? String(object.identityEmail) : ''
    message.serviceCall =
      object.serviceCall !== undefined && object.serviceCall !== null ? String(object.serviceCall) : ''
    message.data = object.data !== undefined && object.data !== null ? String(object.data) : undefined
    return message
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

const baseUpdateTeamRequest: object = { id: '', accessedBy: '', name: '' }

export const UpdateTeamRequest = {
  fromJSON(object: any): UpdateTeamRequest {
    const message = { ...baseUpdateTeamRequest } as UpdateTeamRequest
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.accessedBy = object.accessedBy !== undefined && object.accessedBy !== null ? String(object.accessedBy) : ''
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    return message
  },

  toJSON(message: UpdateTeamRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
    message.name !== undefined && (obj.name = message.name)
    return obj
  },
}

const baseUpdateUserRoleInTeamRequest: object = {
  id: '',
  accessedBy: '',
  userId: '',
  role: 0,
}

export const UpdateUserRoleInTeamRequest = {
  fromJSON(object: any): UpdateUserRoleInTeamRequest {
    const message = {
      ...baseUpdateUserRoleInTeamRequest,
    } as UpdateUserRoleInTeamRequest
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.accessedBy = object.accessedBy !== undefined && object.accessedBy !== null ? String(object.accessedBy) : ''
    message.userId = object.userId !== undefined && object.userId !== null ? String(object.userId) : ''
    message.role = object.role !== undefined && object.role !== null ? userRoleFromJSON(object.role) : 0
    return message
  },

  toJSON(message: UpdateUserRoleInTeamRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
    message.userId !== undefined && (obj.userId = message.userId)
    message.role !== undefined && (obj.role = userRoleToJSON(message.role))
    return obj
  },
}

const baseInviteUserRequest: object = { id: '', accessedBy: '', email: '' }

export const InviteUserRequest = {
  fromJSON(object: any): InviteUserRequest {
    const message = { ...baseInviteUserRequest } as InviteUserRequest
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.accessedBy = object.accessedBy !== undefined && object.accessedBy !== null ? String(object.accessedBy) : ''
    message.email = object.email !== undefined && object.email !== null ? String(object.email) : ''
    return message
  },

  toJSON(message: InviteUserRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
    message.email !== undefined && (obj.email = message.email)
    return obj
  },
}

const baseDeleteUserFromTeamRequest: object = {
  id: '',
  accessedBy: '',
  userId: '',
}

export const DeleteUserFromTeamRequest = {
  fromJSON(object: any): DeleteUserFromTeamRequest {
    const message = {
      ...baseDeleteUserFromTeamRequest,
    } as DeleteUserFromTeamRequest
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.accessedBy = object.accessedBy !== undefined && object.accessedBy !== null ? String(object.accessedBy) : ''
    message.userId = object.userId !== undefined && object.userId !== null ? String(object.userId) : ''
    return message
  },

  toJSON(message: DeleteUserFromTeamRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
    message.userId !== undefined && (obj.userId = message.userId)
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

const baseActiveTeamDetailsResponse: object = { id: '', name: '' }

export const ActiveTeamDetailsResponse = {
  fromJSON(object: any): ActiveTeamDetailsResponse {
    const message = {
      ...baseActiveTeamDetailsResponse,
    } as ActiveTeamDetailsResponse
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    message.users = (object.users ?? []).map((e: any) => UserResponse.fromJSON(e))
    return message
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
}

const baseTeamStatistics: object = {
  users: 0,
  products: 0,
  nodes: 0,
  versions: 0,
  deployments: 0,
}

export const TeamStatistics = {
  fromJSON(object: any): TeamStatistics {
    const message = { ...baseTeamStatistics } as TeamStatistics
    message.users = object.users !== undefined && object.users !== null ? Number(object.users) : 0
    message.products = object.products !== undefined && object.products !== null ? Number(object.products) : 0
    message.nodes = object.nodes !== undefined && object.nodes !== null ? Number(object.nodes) : 0
    message.versions = object.versions !== undefined && object.versions !== null ? Number(object.versions) : 0
    message.deployments =
      object.deployments !== undefined && object.deployments !== null ? Number(object.deployments) : 0
    return message
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
}

const baseTeamWithStatsResponse: object = { id: '', name: '' }

export const TeamWithStatsResponse = {
  fromJSON(object: any): TeamWithStatsResponse {
    const message = { ...baseTeamWithStatsResponse } as TeamWithStatsResponse
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    message.statistics =
      object.statistics !== undefined && object.statistics !== null
        ? TeamStatistics.fromJSON(object.statistics)
        : undefined
    return message
  },

  toJSON(message: TeamWithStatsResponse): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.name !== undefined && (obj.name = message.name)
    message.statistics !== undefined &&
      (obj.statistics = message.statistics ? TeamStatistics.toJSON(message.statistics) : undefined)
    return obj
  },
}

const baseTeamDetailsResponse: object = { id: '', name: '' }

export const TeamDetailsResponse = {
  fromJSON(object: any): TeamDetailsResponse {
    const message = { ...baseTeamDetailsResponse } as TeamDetailsResponse
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    message.statistics =
      object.statistics !== undefined && object.statistics !== null
        ? TeamStatistics.fromJSON(object.statistics)
        : undefined
    message.users = (object.users ?? []).map((e: any) => UserResponse.fromJSON(e))
    return message
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
}

const baseAllTeamsResponse: object = {}

export const AllTeamsResponse = {
  fromJSON(object: any): AllTeamsResponse {
    const message = { ...baseAllTeamsResponse } as AllTeamsResponse
    message.data = (object.data ?? []).map((e: any) => TeamWithStatsResponse.fromJSON(e))
    return message
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
    message.lastLogin =
      object.lastLogin !== undefined && object.lastLogin !== null ? fromJsonTimestamp(object.lastLogin) : undefined
    return message
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

const baseProductReponse: object = {
  id: '',
  name: '',
  type: 0,
  versionCount: 0,
}

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
    message.versionCount =
      object.versionCount !== undefined && object.versionCount !== null ? Number(object.versionCount) : 0
    return message
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

const baseRegistryResponse: object = { id: '', name: '', url: '', type: 0 }

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
    message.type = object.type !== undefined && object.type !== null ? registryTypeFromJSON(object.type) : 0
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
    message.type !== undefined && (obj.type = registryTypeToJSON(message.type))
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

const baseHubRegistryDetails: object = { imageNamePrefix: '' }

export const HubRegistryDetails = {
  fromJSON(object: any): HubRegistryDetails {
    const message = { ...baseHubRegistryDetails } as HubRegistryDetails
    message.imageNamePrefix =
      object.imageNamePrefix !== undefined && object.imageNamePrefix !== null ? String(object.imageNamePrefix) : ''
    return message
  },

  toJSON(message: HubRegistryDetails): unknown {
    const obj: any = {}
    message.imageNamePrefix !== undefined && (obj.imageNamePrefix = message.imageNamePrefix)
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
  imageNamePrefix: '',
  namespace: 0,
}

export const GitlabRegistryDetails = {
  fromJSON(object: any): GitlabRegistryDetails {
    const message = { ...baseGitlabRegistryDetails } as GitlabRegistryDetails
    message.user = object.user !== undefined && object.user !== null ? String(object.user) : ''
    message.token = object.token !== undefined && object.token !== null ? String(object.token) : ''
    message.imageNamePrefix =
      object.imageNamePrefix !== undefined && object.imageNamePrefix !== null ? String(object.imageNamePrefix) : ''
    message.url = object.url !== undefined && object.url !== null ? String(object.url) : undefined
    message.apiUrl = object.apiUrl !== undefined && object.apiUrl !== null ? String(object.apiUrl) : undefined
    message.namespace =
      object.namespace !== undefined && object.namespace !== null ? registryNamespaceFromJSON(object.namespace) : 0
    return message
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
}

const baseGithubRegistryDetails: object = {
  user: '',
  token: '',
  imageNamePrefix: '',
  namespace: 0,
}

export const GithubRegistryDetails = {
  fromJSON(object: any): GithubRegistryDetails {
    const message = { ...baseGithubRegistryDetails } as GithubRegistryDetails
    message.user = object.user !== undefined && object.user !== null ? String(object.user) : ''
    message.token = object.token !== undefined && object.token !== null ? String(object.token) : ''
    message.imageNamePrefix =
      object.imageNamePrefix !== undefined && object.imageNamePrefix !== null ? String(object.imageNamePrefix) : ''
    message.namespace =
      object.namespace !== undefined && object.namespace !== null ? registryNamespaceFromJSON(object.namespace) : 0
    return message
  },

  toJSON(message: GithubRegistryDetails): unknown {
    const obj: any = {}
    message.user !== undefined && (obj.user = message.user)
    message.token !== undefined && (obj.token = message.token)
    message.imageNamePrefix !== undefined && (obj.imageNamePrefix = message.imageNamePrefix)
    message.namespace !== undefined && (obj.namespace = registryNamespaceToJSON(message.namespace))
    return obj
  },
}

const baseGoogleRegistryDetails: object = { url: '', imageNamePrefix: '' }

export const GoogleRegistryDetails = {
  fromJSON(object: any): GoogleRegistryDetails {
    const message = { ...baseGoogleRegistryDetails } as GoogleRegistryDetails
    message.url = object.url !== undefined && object.url !== null ? String(object.url) : ''
    message.user = object.user !== undefined && object.user !== null ? String(object.user) : undefined
    message.token = object.token !== undefined && object.token !== null ? String(object.token) : undefined
    message.imageNamePrefix =
      object.imageNamePrefix !== undefined && object.imageNamePrefix !== null ? String(object.imageNamePrefix) : ''
    return message
  },

  toJSON(message: GoogleRegistryDetails): unknown {
    const obj: any = {}
    message.url !== undefined && (obj.url = message.url)
    message.user !== undefined && (obj.user = message.user)
    message.token !== undefined && (obj.token = message.token)
    message.imageNamePrefix !== undefined && (obj.imageNamePrefix = message.imageNamePrefix)
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
    message.google =
      object.google !== undefined && object.google !== null ? GoogleRegistryDetails.fromJSON(object.google) : undefined
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
    message.google !== undefined &&
      (obj.google = message.google ? GoogleRegistryDetails.toJSON(message.google) : undefined)
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
    message.google =
      object.google !== undefined && object.google !== null ? GoogleRegistryDetails.fromJSON(object.google) : undefined
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
    message.google !== undefined &&
      (obj.google = message.google ? GoogleRegistryDetails.toJSON(message.google) : undefined)
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
    message.google =
      object.google !== undefined && object.google !== null ? GoogleRegistryDetails.fromJSON(object.google) : undefined
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
    message.google !== undefined &&
      (obj.google = message.google ? GoogleRegistryDetails.toJSON(message.google) : undefined)
    return obj
  },
}

const baseCreateVersionRequest: object = {
  accessedBy: '',
  productId: '',
  name: '',
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
    message.type = object.type !== undefined && object.type !== null ? versionTypeFromJSON(object.type) : 0
    return message
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
}

const baseUpdateVersionRequest: object = { id: '', accessedBy: '', name: '' }

export const UpdateVersionRequest = {
  fromJSON(object: any): UpdateVersionRequest {
    const message = { ...baseUpdateVersionRequest } as UpdateVersionRequest
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.accessedBy = object.accessedBy !== undefined && object.accessedBy !== null ? String(object.accessedBy) : ''
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    message.changelog =
      object.changelog !== undefined && object.changelog !== null ? String(object.changelog) : undefined
    return message
  },

  toJSON(message: UpdateVersionRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
    message.name !== undefined && (obj.name = message.name)
    message.changelog !== undefined && (obj.changelog = message.changelog)
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
    message.deployments = (object.deployments ?? []).map((e: any) => DeploymentByVersionResponse.fromJSON(e))
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
      obj.deployments = message.deployments.map(e => (e ? DeploymentByVersionResponse.toJSON(e) : undefined))
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

const baseVolumeLink: object = { id: '', name: '', path: '' }

export const VolumeLink = {
  fromJSON(object: any): VolumeLink {
    const message = { ...baseVolumeLink } as VolumeLink
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    message.path = object.path !== undefined && object.path !== null ? String(object.path) : ''
    return message
  },

  toJSON(message: VolumeLink): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.name !== undefined && (obj.name = message.name)
    message.path !== undefined && (obj.path = message.path)
    return obj
  },
}

const baseInitContainer: object = { id: '', name: '', image: '' }

export const InitContainer = {
  fromJSON(object: any): InitContainer {
    const message = { ...baseInitContainer } as InitContainer
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    message.image = object.image !== undefined && object.image !== null ? String(object.image) : ''
    message.useParentConfig =
      object.useParentConfig !== undefined && object.useParentConfig !== null
        ? Boolean(object.useParentConfig)
        : undefined
    message.volumes = (object.volumes ?? []).map((e: any) => VolumeLink.fromJSON(e))
    message.command = (object.command ?? []).map((e: any) => UniqueKey.fromJSON(e))
    message.args = (object.args ?? []).map((e: any) => UniqueKey.fromJSON(e))
    message.environment = (object.environment ?? []).map((e: any) => UniqueKeyValue.fromJSON(e))
    return message
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
}

const baseImportContainer: object = { volume: '', command: '' }

export const ImportContainer = {
  fromJSON(object: any): ImportContainer {
    const message = { ...baseImportContainer } as ImportContainer
    message.volume = object.volume !== undefined && object.volume !== null ? String(object.volume) : ''
    message.command = object.command !== undefined && object.command !== null ? String(object.command) : ''
    message.environment = (object.environment ?? []).map((e: any) => UniqueKeyValue.fromJSON(e))
    return message
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
}

const baseLogConfig: object = { driver: 0 }

export const LogConfig = {
  fromJSON(object: any): LogConfig {
    const message = { ...baseLogConfig } as LogConfig
    message.driver = object.driver !== undefined && object.driver !== null ? driverTypeFromJSON(object.driver) : 0
    message.options = (object.options ?? []).map((e: any) => UniqueKeyValue.fromJSON(e))
    return message
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
}

const basePort: object = { id: '', internal: 0, external: 0 }

export const Port = {
  fromJSON(object: any): Port {
    const message = { ...basePort } as Port
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.internal = object.internal !== undefined && object.internal !== null ? Number(object.internal) : 0
    message.external = object.external !== undefined && object.external !== null ? Number(object.external) : 0
    return message
  },

  toJSON(message: Port): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.internal !== undefined && (obj.internal = Math.round(message.internal))
    message.external !== undefined && (obj.external = Math.round(message.external))
    return obj
  },
}

const basePortRange: object = { from: 0, to: 0 }

export const PortRange = {
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
}

const basePortRangeBinding: object = { id: '' }

export const PortRangeBinding = {
  fromJSON(object: any): PortRangeBinding {
    const message = { ...basePortRangeBinding } as PortRangeBinding
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.internal =
      object.internal !== undefined && object.internal !== null ? PortRange.fromJSON(object.internal) : undefined
    message.external =
      object.external !== undefined && object.external !== null ? PortRange.fromJSON(object.external) : undefined
    return message
  },

  toJSON(message: PortRangeBinding): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.internal !== undefined && (obj.internal = message.internal ? PortRange.toJSON(message.internal) : undefined)
    message.external !== undefined && (obj.external = message.external ? PortRange.toJSON(message.external) : undefined)
    return obj
  },
}

const baseVolume: object = { id: '', name: '', path: '' }

export const Volume = {
  fromJSON(object: any): Volume {
    const message = { ...baseVolume } as Volume
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    message.path = object.path !== undefined && object.path !== null ? String(object.path) : ''
    message.size = object.size !== undefined && object.size !== null ? String(object.size) : undefined
    message.type = object.type !== undefined && object.type !== null ? volumeTypeFromJSON(object.type) : undefined
    message.class = object.class !== undefined && object.class !== null ? String(object.class) : undefined
    return message
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
}

const baseKeyList: object = {}

export const KeyList = {
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

const baseUniqueSecretKeyValue: object = {
  id: '',
  key: '',
  value: '',
  publicKey: '',
  required: false,
}

export const UniqueSecretKeyValue = {
  fromJSON(object: any): UniqueSecretKeyValue {
    const message = { ...baseUniqueSecretKeyValue } as UniqueSecretKeyValue
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.key = object.key !== undefined && object.key !== null ? String(object.key) : ''
    message.value = object.value !== undefined && object.value !== null ? String(object.value) : ''
    message.publicKey = object.publicKey !== undefined && object.publicKey !== null ? String(object.publicKey) : ''
    message.required = object.required !== undefined && object.required !== null ? Boolean(object.required) : false
    message.encrypted =
      object.encrypted !== undefined && object.encrypted !== null ? Boolean(object.encrypted) : undefined
    return message
  },

  toJSON(message: UniqueSecretKeyValue): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.key !== undefined && (obj.key = message.key)
    message.value !== undefined && (obj.value = message.value)
    message.publicKey !== undefined && (obj.publicKey = message.publicKey)
    message.required !== undefined && (obj.required = message.required)
    message.encrypted !== undefined && (obj.encrypted = message.encrypted)
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

const baseDagentContainerConfig: object = {}

export const DagentContainerConfig = {
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
    message.networks = (object.networks ?? []).map((e: any) => UniqueKey.fromJSON(e))
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
      obj.networks = message.networks.map(e => (e ? UniqueKey.toJSON(e) : undefined))
    } else {
      obj.networks = []
    }
    return obj
  },
}

const baseCraneContainerConfig: object = {}

export const CraneContainerConfig = {
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
    message.customHeaders = (object.customHeaders ?? []).map((e: any) => UniqueKey.fromJSON(e))
    message.extraLBAnnotations = (object.extraLBAnnotations ?? []).map((e: any) => UniqueKeyValue.fromJSON(e))
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
    if (message.customHeaders) {
      obj.customHeaders = message.customHeaders.map(e => (e ? UniqueKey.toJSON(e) : undefined))
    } else {
      obj.customHeaders = []
    }
    if (message.extraLBAnnotations) {
      obj.extraLBAnnotations = message.extraLBAnnotations.map(e => (e ? UniqueKeyValue.toJSON(e) : undefined))
    } else {
      obj.extraLBAnnotations = []
    }
    return obj
  },
}

const baseCommonContainerConfig: object = { name: '' }

export const CommonContainerConfig = {
  fromJSON(object: any): CommonContainerConfig {
    const message = { ...baseCommonContainerConfig } as CommonContainerConfig
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    message.expose =
      object.expose !== undefined && object.expose !== null ? exposeStrategyFromJSON(object.expose) : undefined
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
    message.commands = (object.commands ?? []).map((e: any) => UniqueKey.fromJSON(e))
    message.args = (object.args ?? []).map((e: any) => UniqueKey.fromJSON(e))
    message.environment = (object.environment ?? []).map((e: any) => UniqueKeyValue.fromJSON(e))
    message.secrets = (object.secrets ?? []).map((e: any) => UniqueSecretKeyValue.fromJSON(e))
    message.initContainers = (object.initContainers ?? []).map((e: any) => InitContainer.fromJSON(e))
    return message
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
    if (message.commands) {
      obj.commands = message.commands.map(e => (e ? UniqueKey.toJSON(e) : undefined))
    } else {
      obj.commands = []
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
    if (message.secrets) {
      obj.secrets = message.secrets.map(e => (e ? UniqueSecretKeyValue.toJSON(e) : undefined))
    } else {
      obj.secrets = []
    }
    if (message.initContainers) {
      obj.initContainers = message.initContainers.map(e => (e ? InitContainer.toJSON(e) : undefined))
    } else {
      obj.initContainers = []
    }
    return obj
  },
}

const baseContainerConfig: object = {}

export const ContainerConfig = {
  fromJSON(object: any): ContainerConfig {
    const message = { ...baseContainerConfig } as ContainerConfig
    message.common =
      object.common !== undefined && object.common !== null ? CommonContainerConfig.fromJSON(object.common) : undefined
    message.dagent =
      object.dagent !== undefined && object.dagent !== null ? DagentContainerConfig.fromJSON(object.dagent) : undefined
    message.crane =
      object.crane !== undefined && object.crane !== null ? CraneContainerConfig.fromJSON(object.crane) : undefined
    message.capabilities = (object.capabilities ?? []).map((e: any) => UniqueKeyValue.fromJSON(e))
    return message
  },

  toJSON(message: ContainerConfig): unknown {
    const obj: any = {}
    message.common !== undefined &&
      (obj.common = message.common ? CommonContainerConfig.toJSON(message.common) : undefined)
    message.dagent !== undefined &&
      (obj.dagent = message.dagent ? DagentContainerConfig.toJSON(message.dagent) : undefined)
    message.crane !== undefined && (obj.crane = message.crane ? CraneContainerConfig.toJSON(message.crane) : undefined)
    if (message.capabilities) {
      obj.capabilities = message.capabilities.map(e => (e ? UniqueKeyValue.toJSON(e) : undefined))
    } else {
      obj.capabilities = []
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
  registryName: '',
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
    message.createdAt =
      object.createdAt !== undefined && object.createdAt !== null ? fromJsonTimestamp(object.createdAt) : undefined
    message.registryName =
      object.registryName !== undefined && object.registryName !== null ? String(object.registryName) : ''
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
    message.createdAt !== undefined && (obj.createdAt = fromTimestamp(message.createdAt).toISOString())
    message.registryName !== undefined && (obj.registryName = message.registryName)
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

const basePatchImageRequest: object = { id: '', accessedBy: '' }

export const PatchImageRequest = {
  fromJSON(object: any): PatchImageRequest {
    const message = { ...basePatchImageRequest } as PatchImageRequest
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.accessedBy = object.accessedBy !== undefined && object.accessedBy !== null ? String(object.accessedBy) : ''
    message.tag = object.tag !== undefined && object.tag !== null ? String(object.tag) : undefined
    message.config =
      object.config !== undefined && object.config !== null ? ContainerConfig.fromJSON(object.config) : undefined
    return message
  },

  toJSON(message: PatchImageRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
    message.tag !== undefined && (obj.tag = message.tag)
    message.config !== undefined && (obj.config = message.config ? ContainerConfig.toJSON(message.config) : undefined)
    return obj
  },
}

const baseNodeResponse: object = { id: '', name: '', status: 0, type: 0 }

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
    message.type = object.type !== undefined && object.type !== null ? nodeTypeFromJSON(object.type) : 0
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
    message.type !== undefined && (obj.type = nodeTypeToJSON(message.type))
    return obj
  },
}

const baseNodeDetailsResponse: object = {
  id: '',
  name: '',
  status: 0,
  hasToken: false,
  type: 0,
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
    message.type = object.type !== undefined && object.type !== null ? nodeTypeFromJSON(object.type) : 0
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
    message.type !== undefined && (obj.type = nodeTypeToJSON(message.type))
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

const baseGenerateScriptRequest: object = { id: '', accessedBy: '', type: 0 }

export const GenerateScriptRequest = {
  fromJSON(object: any): GenerateScriptRequest {
    const message = { ...baseGenerateScriptRequest } as GenerateScriptRequest
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.accessedBy = object.accessedBy !== undefined && object.accessedBy !== null ? String(object.accessedBy) : ''
    message.type = object.type !== undefined && object.type !== null ? nodeTypeFromJSON(object.type) : 0
    message.rootPath = object.rootPath !== undefined && object.rootPath !== null ? String(object.rootPath) : undefined
    return message
  },

  toJSON(message: GenerateScriptRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
    message.type !== undefined && (obj.type = nodeTypeToJSON(message.type))
    message.rootPath !== undefined && (obj.rootPath = message.rootPath)
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
    message.version = object.version !== undefined && object.version !== null ? String(object.version) : undefined
    message.connectedAt =
      object.connectedAt !== undefined && object.connectedAt !== null
        ? fromJsonTimestamp(object.connectedAt)
        : undefined
    return message
  },

  toJSON(message: NodeEventMessage): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.status !== undefined && (obj.status = nodeConnectionStatusToJSON(message.status))
    message.address !== undefined && (obj.address = message.address)
    message.version !== undefined && (obj.version = message.version)
    message.connectedAt !== undefined && (obj.connectedAt = fromTimestamp(message.connectedAt).toISOString())
    return obj
  },
}

const baseWatchContainerStateRequest: object = { accessedBy: '', nodeId: '' }

export const WatchContainerStateRequest = {
  fromJSON(object: any): WatchContainerStateRequest {
    const message = {
      ...baseWatchContainerStateRequest,
    } as WatchContainerStateRequest
    message.accessedBy = object.accessedBy !== undefined && object.accessedBy !== null ? String(object.accessedBy) : ''
    message.nodeId = object.nodeId !== undefined && object.nodeId !== null ? String(object.nodeId) : ''
    message.prefix = object.prefix !== undefined && object.prefix !== null ? String(object.prefix) : undefined
    return message
  },

  toJSON(message: WatchContainerStateRequest): unknown {
    const obj: any = {}
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
    message.nodeId !== undefined && (obj.nodeId = message.nodeId)
    message.prefix !== undefined && (obj.prefix = message.prefix)
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
  prefix: '',
}

export const CreateDeploymentRequest = {
  fromJSON(object: any): CreateDeploymentRequest {
    const message = {
      ...baseCreateDeploymentRequest,
    } as CreateDeploymentRequest
    message.accessedBy = object.accessedBy !== undefined && object.accessedBy !== null ? String(object.accessedBy) : ''
    message.versionId = object.versionId !== undefined && object.versionId !== null ? String(object.versionId) : ''
    message.nodeId = object.nodeId !== undefined && object.nodeId !== null ? String(object.nodeId) : ''
    message.note = object.note !== undefined && object.note !== null ? String(object.note) : undefined
    message.prefix = object.prefix !== undefined && object.prefix !== null ? String(object.prefix) : ''
    return message
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
}

const baseUpdateDeploymentRequest: object = {
  id: '',
  accessedBy: '',
  prefix: '',
}

export const UpdateDeploymentRequest = {
  fromJSON(object: any): UpdateDeploymentRequest {
    const message = {
      ...baseUpdateDeploymentRequest,
    } as UpdateDeploymentRequest
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.accessedBy = object.accessedBy !== undefined && object.accessedBy !== null ? String(object.accessedBy) : ''
    message.note = object.note !== undefined && object.note !== null ? String(object.note) : undefined
    message.prefix = object.prefix !== undefined && object.prefix !== null ? String(object.prefix) : ''
    return message
  },

  toJSON(message: UpdateDeploymentRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
    message.note !== undefined && (obj.note = message.note)
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
    message.state =
      object.state !== undefined && object.state !== null ? containerStateFromJSON(object.state) : undefined
    message.config =
      object.config !== undefined && object.config !== null ? ContainerConfig.fromJSON(object.config) : undefined
    return message
  },

  toJSON(message: InstanceResponse): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.audit !== undefined && (obj.audit = message.audit ? AuditResponse.toJSON(message.audit) : undefined)
    message.image !== undefined && (obj.image = message.image ? ImageResponse.toJSON(message.image) : undefined)
    message.state !== undefined &&
      (obj.state = message.state !== undefined ? containerStateToJSON(message.state) : undefined)
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
    message.config =
      object.config !== undefined && object.config !== null ? ContainerConfig.fromJSON(object.config) : undefined
    return message
  },

  toJSON(message: PatchInstanceRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
    message.config !== undefined && (obj.config = message.config ? ContainerConfig.toJSON(message.config) : undefined)
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
  product: '',
  productId: '',
  version: '',
  versionId: '',
  node: '',
  status: 0,
  nodeId: '',
  prefix: '',
}

export const DeploymentResponse = {
  fromJSON(object: any): DeploymentResponse {
    const message = { ...baseDeploymentResponse } as DeploymentResponse
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.product = object.product !== undefined && object.product !== null ? String(object.product) : ''
    message.productId = object.productId !== undefined && object.productId !== null ? String(object.productId) : ''
    message.version = object.version !== undefined && object.version !== null ? String(object.version) : ''
    message.versionId = object.versionId !== undefined && object.versionId !== null ? String(object.versionId) : ''
    message.node = object.node !== undefined && object.node !== null ? String(object.node) : ''
    message.status = object.status !== undefined && object.status !== null ? deploymentStatusFromJSON(object.status) : 0
    message.nodeId = object.nodeId !== undefined && object.nodeId !== null ? String(object.nodeId) : ''
    message.note = object.note !== undefined && object.note !== null ? String(object.note) : undefined
    message.prefix = object.prefix !== undefined && object.prefix !== null ? String(object.prefix) : ''
    message.updatedAt =
      object.updatedAt !== undefined && object.updatedAt !== null ? fromJsonTimestamp(object.updatedAt) : undefined
    return message
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
}

const baseDeploymentListByVersionResponse: object = {}

export const DeploymentListByVersionResponse = {
  fromJSON(object: any): DeploymentListByVersionResponse {
    const message = {
      ...baseDeploymentListByVersionResponse,
    } as DeploymentListByVersionResponse
    message.data = (object.data ?? []).map((e: any) => DeploymentByVersionResponse.fromJSON(e))
    return message
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
}

const baseDeploymentByVersionResponse: object = {
  id: '',
  prefix: '',
  nodeId: '',
  nodeName: '',
  status: 0,
  nodeStatus: 0,
}

export const DeploymentByVersionResponse = {
  fromJSON(object: any): DeploymentByVersionResponse {
    const message = {
      ...baseDeploymentByVersionResponse,
    } as DeploymentByVersionResponse
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.audit =
      object.audit !== undefined && object.audit !== null ? AuditResponse.fromJSON(object.audit) : undefined
    message.prefix = object.prefix !== undefined && object.prefix !== null ? String(object.prefix) : ''
    message.nodeId = object.nodeId !== undefined && object.nodeId !== null ? String(object.nodeId) : ''
    message.nodeName = object.nodeName !== undefined && object.nodeName !== null ? String(object.nodeName) : ''
    message.status = object.status !== undefined && object.status !== null ? deploymentStatusFromJSON(object.status) : 0
    message.nodeStatus =
      object.nodeStatus !== undefined && object.nodeStatus !== null
        ? nodeConnectionStatusFromJSON(object.nodeStatus)
        : 0
    message.note = object.note !== undefined && object.note !== null ? String(object.note) : undefined
    return message
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
}

const baseDeploymentDetailsResponse: object = {
  id: '',
  productVersionId: '',
  nodeId: '',
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
    message.note = object.note !== undefined && object.note !== null ? String(object.note) : undefined
    message.prefix = object.prefix !== undefined && object.prefix !== null ? String(object.prefix) : ''
    message.environment = (object.environment ?? []).map((e: any) => UniqueKeyValue.fromJSON(e))
    message.status = object.status !== undefined && object.status !== null ? deploymentStatusFromJSON(object.status) : 0
    message.publicKey =
      object.publicKey !== undefined && object.publicKey !== null ? String(object.publicKey) : undefined
    message.instances = (object.instances ?? []).map((e: any) => InstanceResponse.fromJSON(e))
    return message
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
}

const baseDeploymentEventContainerState: object = { instanceId: '', state: 0 }

export const DeploymentEventContainerState = {
  fromJSON(object: any): DeploymentEventContainerState {
    const message = {
      ...baseDeploymentEventContainerState,
    } as DeploymentEventContainerState
    message.instanceId = object.instanceId !== undefined && object.instanceId !== null ? String(object.instanceId) : ''
    message.state = object.state !== undefined && object.state !== null ? containerStateFromJSON(object.state) : 0
    return message
  },

  toJSON(message: DeploymentEventContainerState): unknown {
    const obj: any = {}
    message.instanceId !== undefined && (obj.instanceId = message.instanceId)
    message.state !== undefined && (obj.state = containerStateToJSON(message.state))
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
        ? DeploymentEventContainerState.fromJSON(object.containerStatus)
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
        ? DeploymentEventContainerState.toJSON(message.containerStatus)
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

const baseDeploymentListSecretsRequest: object = {
  id: '',
  accessedBy: '',
  instanceId: '',
}

export const DeploymentListSecretsRequest = {
  fromJSON(object: any): DeploymentListSecretsRequest {
    const message = {
      ...baseDeploymentListSecretsRequest,
    } as DeploymentListSecretsRequest
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.accessedBy = object.accessedBy !== undefined && object.accessedBy !== null ? String(object.accessedBy) : ''
    message.instanceId = object.instanceId !== undefined && object.instanceId !== null ? String(object.instanceId) : ''
    return message
  },

  toJSON(message: DeploymentListSecretsRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.accessedBy !== undefined && (obj.accessedBy = message.accessedBy)
    message.instanceId !== undefined && (obj.instanceId = message.instanceId)
    return obj
  },
}

const baseCreateNotificationRequest: object = {
  accessedBy: '',
  name: '',
  url: '',
  type: 0,
  active: false,
  events: 0,
}

export const CreateNotificationRequest = {
  fromJSON(object: any): CreateNotificationRequest {
    const message = {
      ...baseCreateNotificationRequest,
    } as CreateNotificationRequest
    message.accessedBy = object.accessedBy !== undefined && object.accessedBy !== null ? String(object.accessedBy) : ''
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    message.url = object.url !== undefined && object.url !== null ? String(object.url) : ''
    message.type = object.type !== undefined && object.type !== null ? notificationTypeFromJSON(object.type) : 0
    message.active = object.active !== undefined && object.active !== null ? Boolean(object.active) : false
    message.events = (object.events ?? []).map((e: any) => notificationEventTypeFromJSON(e))
    return message
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
}

const baseCreateNotificationResponse: object = { id: '', creator: '' }

export const CreateNotificationResponse = {
  fromJSON(object: any): CreateNotificationResponse {
    const message = {
      ...baseCreateNotificationResponse,
    } as CreateNotificationResponse
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.creator = object.creator !== undefined && object.creator !== null ? String(object.creator) : ''
    return message
  },

  toJSON(message: CreateNotificationResponse): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.creator !== undefined && (obj.creator = message.creator)
    return obj
  },
}

const baseUpdateNotificationRequest: object = {
  id: '',
  accessedBy: '',
  name: '',
  url: '',
  type: 0,
  active: false,
  events: 0,
}

export const UpdateNotificationRequest = {
  fromJSON(object: any): UpdateNotificationRequest {
    const message = {
      ...baseUpdateNotificationRequest,
    } as UpdateNotificationRequest
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.accessedBy = object.accessedBy !== undefined && object.accessedBy !== null ? String(object.accessedBy) : ''
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    message.url = object.url !== undefined && object.url !== null ? String(object.url) : ''
    message.type = object.type !== undefined && object.type !== null ? notificationTypeFromJSON(object.type) : 0
    message.active = object.active !== undefined && object.active !== null ? Boolean(object.active) : false
    message.events = (object.events ?? []).map((e: any) => notificationEventTypeFromJSON(e))
    return message
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
}

const baseNotificationDetailsResponse: object = {
  id: '',
  name: '',
  url: '',
  type: 0,
  active: false,
  events: 0,
}

export const NotificationDetailsResponse = {
  fromJSON(object: any): NotificationDetailsResponse {
    const message = {
      ...baseNotificationDetailsResponse,
    } as NotificationDetailsResponse
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.audit =
      object.audit !== undefined && object.audit !== null ? AuditResponse.fromJSON(object.audit) : undefined
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    message.url = object.url !== undefined && object.url !== null ? String(object.url) : ''
    message.type = object.type !== undefined && object.type !== null ? notificationTypeFromJSON(object.type) : 0
    message.active = object.active !== undefined && object.active !== null ? Boolean(object.active) : false
    message.events = (object.events ?? []).map((e: any) => notificationEventTypeFromJSON(e))
    return message
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
}

const baseNotificationResponse: object = {
  id: '',
  name: '',
  url: '',
  type: 0,
  active: false,
  events: 0,
}

export const NotificationResponse = {
  fromJSON(object: any): NotificationResponse {
    const message = { ...baseNotificationResponse } as NotificationResponse
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.audit =
      object.audit !== undefined && object.audit !== null ? AuditResponse.fromJSON(object.audit) : undefined
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    message.url = object.url !== undefined && object.url !== null ? String(object.url) : ''
    message.type = object.type !== undefined && object.type !== null ? notificationTypeFromJSON(object.type) : 0
    message.active = object.active !== undefined && object.active !== null ? Boolean(object.active) : false
    message.events = (object.events ?? []).map((e: any) => notificationEventTypeFromJSON(e))
    return message
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
}

const baseNotificationListResponse: object = {}

export const NotificationListResponse = {
  fromJSON(object: any): NotificationListResponse {
    const message = {
      ...baseNotificationListResponse,
    } as NotificationListResponse
    message.data = (object.data ?? []).map((e: any) => NotificationResponse.fromJSON(e))
    return message
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
}

const baseHealthResponse: object = { status: 0, cruxVersion: '' }

export const HealthResponse = {
  fromJSON(object: any): HealthResponse {
    const message = { ...baseHealthResponse } as HealthResponse
    message.status = object.status !== undefined && object.status !== null ? serviceStatusFromJSON(object.status) : 0
    message.cruxVersion =
      object.cruxVersion !== undefined && object.cruxVersion !== null ? String(object.cruxVersion) : ''
    message.lastMigration =
      object.lastMigration !== undefined && object.lastMigration !== null ? String(object.lastMigration) : undefined
    return message
  },

  toJSON(message: HealthResponse): unknown {
    const obj: any = {}
    message.status !== undefined && (obj.status = serviceStatusToJSON(message.status))
    message.cruxVersion !== undefined && (obj.cruxVersion = message.cruxVersion)
    message.lastMigration !== undefined && (obj.lastMigration = message.lastMigration)
    return obj
  },
}

const baseTemplateResponse: object = { id: '', name: '', description: '' }

export const TemplateResponse = {
  fromJSON(object: any): TemplateResponse {
    const message = { ...baseTemplateResponse } as TemplateResponse
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    message.description =
      object.description !== undefined && object.description !== null ? String(object.description) : ''
    return message
  },

  toJSON(message: TemplateResponse): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.name !== undefined && (obj.name = message.name)
    message.description !== undefined && (obj.description = message.description)
    return obj
  },
}

const baseTemplateListResponse: object = {}

export const TemplateListResponse = {
  fromJSON(object: any): TemplateListResponse {
    const message = { ...baseTemplateListResponse } as TemplateListResponse
    message.data = (object.data ?? []).map((e: any) => TemplateResponse.fromJSON(e))
    return message
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
}

const baseCreateProductFromTemplateRequest: object = {
  id: '',
  accessedBy: '',
  name: '',
  description: '',
  type: 0,
}

export const CreateProductFromTemplateRequest = {
  fromJSON(object: any): CreateProductFromTemplateRequest {
    const message = {
      ...baseCreateProductFromTemplateRequest,
    } as CreateProductFromTemplateRequest
    message.id = object.id !== undefined && object.id !== null ? String(object.id) : ''
    message.accessedBy = object.accessedBy !== undefined && object.accessedBy !== null ? String(object.accessedBy) : ''
    message.name = object.name !== undefined && object.name !== null ? String(object.name) : ''
    message.description =
      object.description !== undefined && object.description !== null ? String(object.description) : ''
    message.type = object.type !== undefined && object.type !== null ? productTypeFromJSON(object.type) : 0
    return message
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

  generateScript(request: GenerateScriptRequest, metadata: Metadata, ...rest: any): Observable<NodeInstallResponse>

  getScript(request: ServiceIdRequest, metadata: Metadata, ...rest: any): Observable<NodeScriptResponse>

  discardScript(request: IdRequest, metadata: Metadata, ...rest: any): Observable<Empty>

  revokeToken(request: IdRequest, metadata: Metadata, ...rest: any): Observable<Empty>

  subscribeNodeEventChannel(request: ServiceIdRequest, metadata: Metadata, ...rest: any): Observable<NodeEventMessage>

  watchContainerState(
    request: WatchContainerStateRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<ContainerStateListMessage>
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
    request: GenerateScriptRequest,
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

  watchContainerState(
    request: WatchContainerStateRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<ContainerStateListMessage>
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
      'watchContainerState',
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

  setDefaultVersion(request: IdRequest, metadata: Metadata, ...rest: any): Observable<Empty>

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

  setDefaultVersion(request: IdRequest, metadata: Metadata, ...rest: any): Promise<Empty> | Observable<Empty> | Empty

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
      'setDefaultVersion',
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
  getDeploymentsByVersionId(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<DeploymentListByVersionResponse>

  createDeployment(request: CreateDeploymentRequest, metadata: Metadata, ...rest: any): Observable<CreateEntityResponse>

  updateDeployment(request: UpdateDeploymentRequest, metadata: Metadata, ...rest: any): Observable<UpdateEntityResponse>

  patchDeployment(request: PatchDeploymentRequest, metadata: Metadata, ...rest: any): Observable<UpdateEntityResponse>

  deleteDeployment(request: IdRequest, metadata: Metadata, ...rest: any): Observable<Empty>

  getDeploymentDetails(request: IdRequest, metadata: Metadata, ...rest: any): Observable<DeploymentDetailsResponse>

  getDeploymentEvents(request: IdRequest, metadata: Metadata, ...rest: any): Observable<DeploymentEventListResponse>

  getDeploymentList(request: AccessRequest, metadata: Metadata, ...rest: any): Observable<DeploymentListResponse>

  getDeploymentSecrets(
    request: DeploymentListSecretsRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<ListSecretsResponse>

  copyDeploymentSafe(request: IdRequest, metadata: Metadata, ...rest: any): Observable<CreateEntityResponse>

  copyDeploymentUnsafe(request: IdRequest, metadata: Metadata, ...rest: any): Observable<CreateEntityResponse>

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
  ):
    | Promise<DeploymentListByVersionResponse>
    | Observable<DeploymentListByVersionResponse>
    | DeploymentListByVersionResponse

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

  getDeploymentList(
    request: AccessRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<DeploymentListResponse> | Observable<DeploymentListResponse> | DeploymentListResponse

  getDeploymentSecrets(
    request: DeploymentListSecretsRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<ListSecretsResponse> | Observable<ListSecretsResponse> | ListSecretsResponse

  copyDeploymentSafe(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<CreateEntityResponse> | Observable<CreateEntityResponse> | CreateEntityResponse

  copyDeploymentUnsafe(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<CreateEntityResponse> | Observable<CreateEntityResponse> | CreateEntityResponse

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
      'getDeploymentList',
      'getDeploymentSecrets',
      'copyDeploymentSafe',
      'copyDeploymentUnsafe',
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

  getActiveTeamByUser(request: AccessRequest, metadata: Metadata, ...rest: any): Observable<ActiveTeamDetailsResponse>

  updateTeam(request: UpdateTeamRequest, metadata: Metadata, ...rest: any): Observable<Empty>

  deleteTeam(request: IdRequest, metadata: Metadata, ...rest: any): Observable<Empty>

  updateUserRole(request: UpdateUserRoleInTeamRequest, metadata: Metadata, ...rest: any): Observable<Empty>

  inviteUserToTeam(request: InviteUserRequest, metadata: Metadata, ...rest: any): Observable<CreateEntityResponse>

  deleteUserFromTeam(request: DeleteUserFromTeamRequest, metadata: Metadata, ...rest: any): Observable<Empty>

  acceptTeamInvite(request: IdRequest, metadata: Metadata, ...rest: any): Observable<Empty>

  selectTeam(request: IdRequest, metadata: Metadata, ...rest: any): Observable<Empty>

  getUserMeta(request: AccessRequest, metadata: Metadata, ...rest: any): Observable<UserMetaResponse>

  getAllTeams(request: AccessRequest, metadata: Metadata, ...rest: any): Observable<AllTeamsResponse>

  getTeamById(request: IdRequest, metadata: Metadata, ...rest: any): Observable<TeamDetailsResponse>
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
  ): Promise<ActiveTeamDetailsResponse> | Observable<ActiveTeamDetailsResponse> | ActiveTeamDetailsResponse

  updateTeam(request: UpdateTeamRequest, metadata: Metadata, ...rest: any): Promise<Empty> | Observable<Empty> | Empty

  deleteTeam(request: IdRequest, metadata: Metadata, ...rest: any): Promise<Empty> | Observable<Empty> | Empty

  updateUserRole(
    request: UpdateUserRoleInTeamRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<Empty> | Observable<Empty> | Empty

  inviteUserToTeam(
    request: InviteUserRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<CreateEntityResponse> | Observable<CreateEntityResponse> | CreateEntityResponse

  deleteUserFromTeam(
    request: DeleteUserFromTeamRequest,
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

  getAllTeams(
    request: AccessRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<AllTeamsResponse> | Observable<AllTeamsResponse> | AllTeamsResponse

  getTeamById(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<TeamDetailsResponse> | Observable<TeamDetailsResponse> | TeamDetailsResponse
}

export function CruxTeamControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [
      'createTeam',
      'getActiveTeamByUser',
      'updateTeam',
      'deleteTeam',
      'updateUserRole',
      'inviteUserToTeam',
      'deleteUserFromTeam',
      'acceptTeamInvite',
      'selectTeam',
      'getUserMeta',
      'getAllTeams',
      'getTeamById',
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

export interface CruxNotificationClient {
  createNotification(
    request: CreateNotificationRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<CreateNotificationResponse>

  updateNotification(
    request: UpdateNotificationRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<UpdateEntityResponse>

  deleteNotification(request: IdRequest, metadata: Metadata, ...rest: any): Observable<Empty>

  getNotificationList(request: AccessRequest, metadata: Metadata, ...rest: any): Observable<NotificationListResponse>

  getNotificationDetails(request: IdRequest, metadata: Metadata, ...rest: any): Observable<NotificationDetailsResponse>

  testNotification(request: IdRequest, metadata: Metadata, ...rest: any): Observable<Empty>
}

export interface CruxNotificationController {
  createNotification(
    request: CreateNotificationRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<CreateNotificationResponse> | Observable<CreateNotificationResponse> | CreateNotificationResponse

  updateNotification(
    request: UpdateNotificationRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<UpdateEntityResponse> | Observable<UpdateEntityResponse> | UpdateEntityResponse

  deleteNotification(request: IdRequest, metadata: Metadata, ...rest: any): Promise<Empty> | Observable<Empty> | Empty

  getNotificationList(
    request: AccessRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<NotificationListResponse> | Observable<NotificationListResponse> | NotificationListResponse

  getNotificationDetails(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<NotificationDetailsResponse> | Observable<NotificationDetailsResponse> | NotificationDetailsResponse

  testNotification(request: IdRequest, metadata: Metadata, ...rest: any): Promise<Empty> | Observable<Empty> | Empty
}

export function CruxNotificationControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [
      'createNotification',
      'updateNotification',
      'deleteNotification',
      'getNotificationList',
      'getNotificationDetails',
      'testNotification',
    ]
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method)
      GrpcMethod('CruxNotification', method)(constructor.prototype[method], method, descriptor)
    }
    const grpcStreamMethods: string[] = []
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method)
      GrpcStreamMethod('CruxNotification', method)(constructor.prototype[method], method, descriptor)
    }
  }
}

export const CRUX_NOTIFICATION_SERVICE_NAME = 'CruxNotification'

export interface CruxAuditClient {
  getAuditLog(request: AuditLogListRequest, metadata: Metadata, ...rest: any): Observable<AuditLogListResponse>

  getAuditLogListCount(
    request: AuditLogListRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<AuditLogListCountResponse>
}

export interface CruxAuditController {
  getAuditLog(
    request: AuditLogListRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<AuditLogListResponse> | Observable<AuditLogListResponse> | AuditLogListResponse

  getAuditLogListCount(
    request: AuditLogListRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<AuditLogListCountResponse> | Observable<AuditLogListCountResponse> | AuditLogListCountResponse
}

export function CruxAuditControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ['getAuditLog', 'getAuditLogListCount']
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
  getHealth(request: Empty, metadata: Metadata, ...rest: any): Observable<HealthResponse>
}

export interface CruxHealthController {
  getHealth(
    request: Empty,
    metadata: Metadata,
    ...rest: any
  ): Promise<HealthResponse> | Observable<HealthResponse> | HealthResponse
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

export interface CruxTemplateClient {
  getTemplates(request: AccessRequest, metadata: Metadata, ...rest: any): Observable<TemplateListResponse>

  createProductFromTemplate(
    request: CreateProductFromTemplateRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<CreateEntityResponse>
}

export interface CruxTemplateController {
  getTemplates(
    request: AccessRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<TemplateListResponse> | Observable<TemplateListResponse> | TemplateListResponse

  createProductFromTemplate(
    request: CreateProductFromTemplateRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<CreateEntityResponse> | Observable<CreateEntityResponse> | CreateEntityResponse
}

export function CruxTemplateControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ['getTemplates', 'createProductFromTemplate']
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method)
      GrpcMethod('CruxTemplate', method)(constructor.prototype[method], method, descriptor)
    }
    const grpcStreamMethods: string[] = []
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method)
      GrpcStreamMethod('CruxTemplate', method)(constructor.prototype[method], method, descriptor)
    }
  }
}

export const CRUX_TEMPLATE_SERVICE_NAME = 'CruxTemplate'

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
