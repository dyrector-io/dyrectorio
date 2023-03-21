/* eslint-disable */
import { Metadata } from '@grpc/grpc-js'
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices'
import { Observable } from 'rxjs'
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

export interface ImageListResponse {
  data: ImageResponse[]
}

export interface OrderVersionImagesRequest {
  versionId: string
  imageIds: string[]
}

export interface RegistryImages {
  registryId: string
  imageNames: string[]
}

export interface AddImagesToVersionRequest {
  versionId: string
  images: RegistryImages[]
}

export interface PatchImageRequest {
  id: string
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

export interface CreateDeploymentRequest {
  versionId: string
  nodeId: string
  note?: string | undefined
  prefix: string
}

export interface UpdateDeploymentRequest {
  id: string
  note?: string | undefined
  prefix: string
}

export interface PatchDeploymentRequest {
  id: string
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
  instanceId: string
}

export interface CreateNotificationRequest {
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
  name: string
  description: string
  type: ProductType
}

export interface TemplateImageResponse {
  data: Uint8Array
}

export interface StorageResponse {
  id: string
  audit: AuditResponse | undefined
  name: string
  description?: string | undefined
  icon?: string | undefined
  url: string
}

export interface StorageListResponse {
  data: StorageResponse[]
}

export interface CreateStorageRequest {
  name: string
  description?: string | undefined
  icon?: string | undefined
  url: string
  accessKey?: string | undefined
  secretKey?: string | undefined
}

export interface UpdateStorageRequest {
  id: string
  name: string
  description?: string | undefined
  icon?: string | undefined
  url: string
  accessKey?: string | undefined
  secretKey?: string | undefined
}

export interface StorageDetailsResponse {
  id: string
  audit: AuditResponse | undefined
  name: string
  description?: string | undefined
  icon?: string | undefined
  url: string
  accessKey?: string | undefined
  secretKey?: string | undefined
  inUse: boolean
}

export interface StorageOptionResponse {
  id: string
  name: string
}

export interface StorageOptionListResponse {
  data: StorageOptionResponse[]
}

export const CRUX_PACKAGE_NAME = 'crux'

function createBaseServiceIdRequest(): ServiceIdRequest {
  return { id: '' }
}

export const ServiceIdRequest = {
  fromJSON(object: any): ServiceIdRequest {
    return { id: isSet(object.id) ? String(object.id) : '' }
  },

  toJSON(message: ServiceIdRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    return obj
  },
}

function createBaseIdRequest(): IdRequest {
  return { id: '' }
}

export const IdRequest = {
  fromJSON(object: any): IdRequest {
    return { id: isSet(object.id) ? String(object.id) : '' }
  },

  toJSON(message: IdRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    return obj
  },
}

function createBaseAuditResponse(): AuditResponse {
  return { createdBy: '', createdAt: undefined }
}

export const AuditResponse = {
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
}

function createBaseCreateEntityResponse(): CreateEntityResponse {
  return { id: '', createdAt: undefined }
}

export const CreateEntityResponse = {
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
}

function createBaseUpdateEntityResponse(): UpdateEntityResponse {
  return { updatedAt: undefined }
}

export const UpdateEntityResponse = {
  fromJSON(object: any): UpdateEntityResponse {
    return { updatedAt: isSet(object.updatedAt) ? fromJsonTimestamp(object.updatedAt) : undefined }
  },

  toJSON(message: UpdateEntityResponse): unknown {
    const obj: any = {}
    message.updatedAt !== undefined && (obj.updatedAt = fromTimestamp(message.updatedAt).toISOString())
    return obj
  },
}

function createBaseCreateTeamRequest(): CreateTeamRequest {
  return { name: '' }
}

export const CreateTeamRequest = {
  fromJSON(object: any): CreateTeamRequest {
    return { name: isSet(object.name) ? String(object.name) : '' }
  },

  toJSON(message: CreateTeamRequest): unknown {
    const obj: any = {}
    message.name !== undefined && (obj.name = message.name)
    return obj
  },
}

function createBaseUpdateTeamRequest(): UpdateTeamRequest {
  return { id: '', name: '' }
}

export const UpdateTeamRequest = {
  fromJSON(object: any): UpdateTeamRequest {
    return { id: isSet(object.id) ? String(object.id) : '', name: isSet(object.name) ? String(object.name) : '' }
  },

  toJSON(message: UpdateTeamRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.name !== undefined && (obj.name = message.name)
    return obj
  },
}

function createBaseUpdateUserRoleInTeamRequest(): UpdateUserRoleInTeamRequest {
  return { id: '', userId: '', role: 0 }
}

export const UpdateUserRoleInTeamRequest = {
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
}

function createBaseInviteUserRequest(): InviteUserRequest {
  return { id: '', email: '', firstName: '' }
}

export const InviteUserRequest = {
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
}

function createBaseReinviteUserRequest(): ReinviteUserRequest {
  return { id: '', userId: '' }
}

export const ReinviteUserRequest = {
  fromJSON(object: any): ReinviteUserRequest {
    return { id: isSet(object.id) ? String(object.id) : '', userId: isSet(object.userId) ? String(object.userId) : '' }
  },

  toJSON(message: ReinviteUserRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.userId !== undefined && (obj.userId = message.userId)
    return obj
  },
}

function createBaseDeleteUserFromTeamRequest(): DeleteUserFromTeamRequest {
  return { id: '', userId: '' }
}

export const DeleteUserFromTeamRequest = {
  fromJSON(object: any): DeleteUserFromTeamRequest {
    return { id: isSet(object.id) ? String(object.id) : '', userId: isSet(object.userId) ? String(object.userId) : '' }
  },

  toJSON(message: DeleteUserFromTeamRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.userId !== undefined && (obj.userId = message.userId)
    return obj
  },
}

function createBaseUserMetaResponse(): UserMetaResponse {
  return { user: undefined, teams: [], invitations: [] }
}

export const UserMetaResponse = {
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
}

function createBaseActiveTeamUser(): ActiveTeamUser {
  return { activeTeamId: '', role: 0, status: 0 }
}

export const ActiveTeamUser = {
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
}

function createBaseTeamResponse(): TeamResponse {
  return { id: '', name: '' }
}

export const TeamResponse = {
  fromJSON(object: any): TeamResponse {
    return { id: isSet(object.id) ? String(object.id) : '', name: isSet(object.name) ? String(object.name) : '' }
  },

  toJSON(message: TeamResponse): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.name !== undefined && (obj.name = message.name)
    return obj
  },
}

function createBaseActiveTeamDetailsResponse(): ActiveTeamDetailsResponse {
  return { id: '', name: '', users: [] }
}

export const ActiveTeamDetailsResponse = {
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
}

function createBaseTeamStatistics(): TeamStatistics {
  return { users: 0, products: 0, nodes: 0, versions: 0, deployments: 0 }
}

export const TeamStatistics = {
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
}

function createBaseTeamWithStatsResponse(): TeamWithStatsResponse {
  return { id: '', name: '', statistics: undefined }
}

export const TeamWithStatsResponse = {
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
}

function createBaseTeamDetailsResponse(): TeamDetailsResponse {
  return { id: '', name: '', statistics: undefined, users: [] }
}

export const TeamDetailsResponse = {
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
}

function createBaseAllTeamsResponse(): AllTeamsResponse {
  return { data: [] }
}

export const AllTeamsResponse = {
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
}

function createBaseUserResponse(): UserResponse {
  return { id: '', name: '', email: '', role: 0, status: 0 }
}

export const UserResponse = {
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
}

function createBaseVolumeLink(): VolumeLink {
  return { id: '', name: '', path: '' }
}

export const VolumeLink = {
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
}

function createBaseInitContainer(): InitContainer {
  return { id: '', name: '', image: '', useParentConfig: false, volumes: [], command: [], args: [], environment: [] }
}

export const InitContainer = {
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
}

function createBaseInitContainerList(): InitContainerList {
  return { data: [] }
}

export const InitContainerList = {
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
}

function createBaseLogConfig(): LogConfig {
  return { driver: 0, options: [] }
}

export const LogConfig = {
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
}

function createBasePort(): Port {
  return { id: '', internal: 0 }
}

export const Port = {
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
}

function createBasePortList(): PortList {
  return { data: [] }
}

export const PortList = {
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
}

function createBasePortRange(): PortRange {
  return { from: 0, to: 0 }
}

export const PortRange = {
  fromJSON(object: any): PortRange {
    return { from: isSet(object.from) ? Number(object.from) : 0, to: isSet(object.to) ? Number(object.to) : 0 }
  },

  toJSON(message: PortRange): unknown {
    const obj: any = {}
    message.from !== undefined && (obj.from = Math.round(message.from))
    message.to !== undefined && (obj.to = Math.round(message.to))
    return obj
  },
}

function createBasePortRangeBinding(): PortRangeBinding {
  return { id: '', internal: undefined, external: undefined }
}

export const PortRangeBinding = {
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
}

function createBasePortRangeBindingList(): PortRangeBindingList {
  return { data: [] }
}

export const PortRangeBindingList = {
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
}

function createBaseVolume(): Volume {
  return { id: '', name: '', path: '' }
}

export const Volume = {
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
}

function createBaseVolumeList(): VolumeList {
  return { data: [] }
}

export const VolumeList = {
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
}

function createBaseUniqueKeyList(): UniqueKeyList {
  return { data: [] }
}

export const UniqueKeyList = {
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
}

function createBaseUniqueKeyValue(): UniqueKeyValue {
  return { id: '', key: '', value: '' }
}

export const UniqueKeyValue = {
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
}

function createBaseUniqueKeyValueList(): UniqueKeyValueList {
  return { data: [] }
}

export const UniqueKeyValueList = {
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
}

function createBaseUniqueSecretKey(): UniqueSecretKey {
  return { id: '', key: '', required: false }
}

export const UniqueSecretKey = {
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
}

function createBaseUniqueSecretKeyList(): UniqueSecretKeyList {
  return { data: [] }
}

export const UniqueSecretKeyList = {
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
}

function createBaseUniqueSecretKeyValue(): UniqueSecretKeyValue {
  return { id: '', key: '', value: '', required: false, encrypted: false }
}

export const UniqueSecretKeyValue = {
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
}

function createBaseUniqueSecretKeyValueList(): UniqueSecretKeyValueList {
  return { data: [] }
}

export const UniqueSecretKeyValueList = {
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
}

function createBaseMarker(): Marker {
  return { deployment: [], service: [], ingress: [] }
}

export const Marker = {
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
}

function createBaseContainerStorage(): ContainerStorage {
  return {}
}

export const ContainerStorage = {
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
}

function createBaseDagentContainerConfig(): DagentContainerConfig {
  return {}
}

export const DagentContainerConfig = {
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
}

function createBaseCraneContainerConfig(): CraneContainerConfig {
  return {}
}

export const CraneContainerConfig = {
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
}

function createBaseCommonContainerConfig(): CommonContainerConfig {
  return {}
}

export const CommonContainerConfig = {
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
}

function createBaseImageContainerConfig(): ImageContainerConfig {
  return {}
}

export const ImageContainerConfig = {
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
}

function createBaseInstanceContainerConfig(): InstanceContainerConfig {
  return {}
}

export const InstanceContainerConfig = {
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
}

function createBaseImageListResponse(): ImageListResponse {
  return { data: [] }
}

export const ImageListResponse = {
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
}

function createBaseOrderVersionImagesRequest(): OrderVersionImagesRequest {
  return { versionId: '', imageIds: [] }
}

export const OrderVersionImagesRequest = {
  fromJSON(object: any): OrderVersionImagesRequest {
    return {
      versionId: isSet(object.versionId) ? String(object.versionId) : '',
      imageIds: Array.isArray(object?.imageIds) ? object.imageIds.map((e: any) => String(e)) : [],
    }
  },

  toJSON(message: OrderVersionImagesRequest): unknown {
    const obj: any = {}
    message.versionId !== undefined && (obj.versionId = message.versionId)
    if (message.imageIds) {
      obj.imageIds = message.imageIds.map(e => e)
    } else {
      obj.imageIds = []
    }
    return obj
  },
}

function createBaseRegistryImages(): RegistryImages {
  return { registryId: '', imageNames: [] }
}

export const RegistryImages = {
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
}

function createBaseAddImagesToVersionRequest(): AddImagesToVersionRequest {
  return { versionId: '', images: [] }
}

export const AddImagesToVersionRequest = {
  fromJSON(object: any): AddImagesToVersionRequest {
    return {
      versionId: isSet(object.versionId) ? String(object.versionId) : '',
      images: Array.isArray(object?.images) ? object.images.map((e: any) => RegistryImages.fromJSON(e)) : [],
    }
  },

  toJSON(message: AddImagesToVersionRequest): unknown {
    const obj: any = {}
    message.versionId !== undefined && (obj.versionId = message.versionId)
    if (message.images) {
      obj.images = message.images.map(e => (e ? RegistryImages.toJSON(e) : undefined))
    } else {
      obj.images = []
    }
    return obj
  },
}

function createBasePatchImageRequest(): PatchImageRequest {
  return { id: '' }
}

export const PatchImageRequest = {
  fromJSON(object: any): PatchImageRequest {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      tag: isSet(object.tag) ? String(object.tag) : undefined,
      config: isSet(object.config) ? ImageContainerConfig.fromJSON(object.config) : undefined,
      resetSection: isSet(object.resetSection) ? String(object.resetSection) : undefined,
    }
  },

  toJSON(message: PatchImageRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.tag !== undefined && (obj.tag = message.tag)
    message.config !== undefined &&
      (obj.config = message.config ? ImageContainerConfig.toJSON(message.config) : undefined)
    message.resetSection !== undefined && (obj.resetSection = message.resetSection)
    return obj
  },
}

function createBaseNodeResponse(): NodeResponse {
  return { id: '', audit: undefined, name: '', status: 0, type: 0, updating: false }
}

export const NodeResponse = {
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
}

function createBaseNodeDetailsResponse(): NodeDetailsResponse {
  return { id: '', audit: undefined, name: '', status: 0, hasToken: false, type: 0, updating: false }
}

export const NodeDetailsResponse = {
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
}

function createBaseNodeListResponse(): NodeListResponse {
  return { data: [] }
}

export const NodeListResponse = {
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
}

function createBaseCreateNodeRequest(): CreateNodeRequest {
  return { name: '' }
}

export const CreateNodeRequest = {
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
}

function createBaseUpdateNodeRequest(): UpdateNodeRequest {
  return { id: '', name: '' }
}

export const UpdateNodeRequest = {
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
}

function createBaseDagentTraefikOptions(): DagentTraefikOptions {
  return { acmeEmail: '' }
}

export const DagentTraefikOptions = {
  fromJSON(object: any): DagentTraefikOptions {
    return { acmeEmail: isSet(object.acmeEmail) ? String(object.acmeEmail) : '' }
  },

  toJSON(message: DagentTraefikOptions): unknown {
    const obj: any = {}
    message.acmeEmail !== undefined && (obj.acmeEmail = message.acmeEmail)
    return obj
  },
}

function createBaseGenerateScriptRequest(): GenerateScriptRequest {
  return { id: '', type: 0, scriptType: 0 }
}

export const GenerateScriptRequest = {
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
}

function createBaseNodeInstallResponse(): NodeInstallResponse {
  return { command: '', expireAt: undefined }
}

export const NodeInstallResponse = {
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
}

function createBaseNodeScriptResponse(): NodeScriptResponse {
  return { content: '' }
}

export const NodeScriptResponse = {
  fromJSON(object: any): NodeScriptResponse {
    return { content: isSet(object.content) ? String(object.content) : '' }
  },

  toJSON(message: NodeScriptResponse): unknown {
    const obj: any = {}
    message.content !== undefined && (obj.content = message.content)
    return obj
  },
}

function createBaseNodeContainerCommandRequest(): NodeContainerCommandRequest {
  return { id: '', command: undefined }
}

export const NodeContainerCommandRequest = {
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
}

function createBaseNodeDeleteContainersRequest(): NodeDeleteContainersRequest {
  return { id: '', containers: undefined }
}

export const NodeDeleteContainersRequest = {
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
}

function createBaseNodeEventMessage(): NodeEventMessage {
  return { id: '', status: 0 }
}

export const NodeEventMessage = {
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
}

function createBaseWatchContainerStateRequest(): WatchContainerStateRequest {
  return { nodeId: '' }
}

export const WatchContainerStateRequest = {
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
}

function createBaseWatchContainerLogRequest(): WatchContainerLogRequest {
  return { nodeId: '', container: undefined }
}

export const WatchContainerLogRequest = {
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
}

function createBaseDeploymentProgressMessage(): DeploymentProgressMessage {
  return { id: '', log: [] }
}

export const DeploymentProgressMessage = {
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
}

function createBaseInstancesCreatedEventList(): InstancesCreatedEventList {
  return { data: [] }
}

export const InstancesCreatedEventList = {
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
}

function createBaseDeploymentEditEventMessage(): DeploymentEditEventMessage {
  return {}
}

export const DeploymentEditEventMessage = {
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
}

function createBaseCreateDeploymentRequest(): CreateDeploymentRequest {
  return { versionId: '', nodeId: '', prefix: '' }
}

export const CreateDeploymentRequest = {
  fromJSON(object: any): CreateDeploymentRequest {
    return {
      versionId: isSet(object.versionId) ? String(object.versionId) : '',
      nodeId: isSet(object.nodeId) ? String(object.nodeId) : '',
      note: isSet(object.note) ? String(object.note) : undefined,
      prefix: isSet(object.prefix) ? String(object.prefix) : '',
    }
  },

  toJSON(message: CreateDeploymentRequest): unknown {
    const obj: any = {}
    message.versionId !== undefined && (obj.versionId = message.versionId)
    message.nodeId !== undefined && (obj.nodeId = message.nodeId)
    message.note !== undefined && (obj.note = message.note)
    message.prefix !== undefined && (obj.prefix = message.prefix)
    return obj
  },
}

function createBaseUpdateDeploymentRequest(): UpdateDeploymentRequest {
  return { id: '', prefix: '' }
}

export const UpdateDeploymentRequest = {
  fromJSON(object: any): UpdateDeploymentRequest {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      note: isSet(object.note) ? String(object.note) : undefined,
      prefix: isSet(object.prefix) ? String(object.prefix) : '',
    }
  },

  toJSON(message: UpdateDeploymentRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.note !== undefined && (obj.note = message.note)
    message.prefix !== undefined && (obj.prefix = message.prefix)
    return obj
  },
}

function createBasePatchDeploymentRequest(): PatchDeploymentRequest {
  return { id: '' }
}

export const PatchDeploymentRequest = {
  fromJSON(object: any): PatchDeploymentRequest {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      environment: isSet(object.environment) ? UniqueKeyValueList.fromJSON(object.environment) : undefined,
      instance: isSet(object.instance) ? PatchInstanceRequest.fromJSON(object.instance) : undefined,
    }
  },

  toJSON(message: PatchDeploymentRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.environment !== undefined &&
      (obj.environment = message.environment ? UniqueKeyValueList.toJSON(message.environment) : undefined)
    message.instance !== undefined &&
      (obj.instance = message.instance ? PatchInstanceRequest.toJSON(message.instance) : undefined)
    return obj
  },
}

function createBaseInstanceResponse(): InstanceResponse {
  return { id: '', audit: undefined, image: undefined }
}

export const InstanceResponse = {
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
}

function createBasePatchInstanceRequest(): PatchInstanceRequest {
  return { id: '' }
}

export const PatchInstanceRequest = {
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
}

function createBaseDeploymentListResponse(): DeploymentListResponse {
  return { data: [] }
}

export const DeploymentListResponse = {
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
}

function createBaseDeploymentListByVersionResponse(): DeploymentListByVersionResponse {
  return { data: [] }
}

export const DeploymentListByVersionResponse = {
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
}

function createBaseDeploymentByVersionResponse(): DeploymentByVersionResponse {
  return { id: '', audit: undefined, prefix: '', nodeId: '', nodeName: '', status: 0, nodeStatus: 0 }
}

export const DeploymentByVersionResponse = {
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
}

function createBaseDeploymentEventContainerState(): DeploymentEventContainerState {
  return { instanceId: '', state: 0 }
}

export const DeploymentEventContainerState = {
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
}

function createBaseDeploymentEventLog(): DeploymentEventLog {
  return { log: [] }
}

export const DeploymentEventLog = {
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
}

function createBaseDeploymentEventResponse(): DeploymentEventResponse {
  return { type: 0, createdAt: undefined }
}

export const DeploymentEventResponse = {
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
}

function createBaseDeploymentEventListResponse(): DeploymentEventListResponse {
  return { status: 0, data: [] }
}

export const DeploymentEventListResponse = {
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
}

function createBaseDeploymentListSecretsRequest(): DeploymentListSecretsRequest {
  return { id: '', instanceId: '' }
}

export const DeploymentListSecretsRequest = {
  fromJSON(object: any): DeploymentListSecretsRequest {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      instanceId: isSet(object.instanceId) ? String(object.instanceId) : '',
    }
  },

  toJSON(message: DeploymentListSecretsRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.instanceId !== undefined && (obj.instanceId = message.instanceId)
    return obj
  },
}

function createBaseCreateNotificationRequest(): CreateNotificationRequest {
  return { name: '', url: '', type: 0, active: false, events: [] }
}

export const CreateNotificationRequest = {
  fromJSON(object: any): CreateNotificationRequest {
    return {
      name: isSet(object.name) ? String(object.name) : '',
      url: isSet(object.url) ? String(object.url) : '',
      type: isSet(object.type) ? notificationTypeFromJSON(object.type) : 0,
      active: isSet(object.active) ? Boolean(object.active) : false,
      events: Array.isArray(object?.events) ? object.events.map((e: any) => notificationEventTypeFromJSON(e)) : [],
    }
  },

  toJSON(message: CreateNotificationRequest): unknown {
    const obj: any = {}
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

function createBaseCreateNotificationResponse(): CreateNotificationResponse {
  return { id: '', creator: '' }
}

export const CreateNotificationResponse = {
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
}

function createBaseUpdateNotificationRequest(): UpdateNotificationRequest {
  return { id: '', name: '', url: '', type: 0, active: false, events: [] }
}

export const UpdateNotificationRequest = {
  fromJSON(object: any): UpdateNotificationRequest {
    return {
      id: isSet(object.id) ? String(object.id) : '',
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

function createBaseNotificationDetailsResponse(): NotificationDetailsResponse {
  return { id: '', audit: undefined, name: '', url: '', type: 0, active: false, events: [] }
}

export const NotificationDetailsResponse = {
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
}

function createBaseNotificationResponse(): NotificationResponse {
  return { id: '', audit: undefined, name: '', url: '', type: 0, active: false, events: [] }
}

export const NotificationResponse = {
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
}

function createBaseNotificationListResponse(): NotificationListResponse {
  return { data: [] }
}

export const NotificationListResponse = {
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
}

function createBaseHealthResponse(): HealthResponse {
  return { status: 0, cruxVersion: '' }
}

export const HealthResponse = {
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
}

function createBaseTemplateResponse(): TemplateResponse {
  return { id: '', name: '', description: '', technologies: [] }
}

export const TemplateResponse = {
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
}

function createBaseTemplateListResponse(): TemplateListResponse {
  return { data: [] }
}

export const TemplateListResponse = {
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
}

function createBaseCreateProductFromTemplateRequest(): CreateProductFromTemplateRequest {
  return { id: '', name: '', description: '', type: 0 }
}

export const CreateProductFromTemplateRequest = {
  fromJSON(object: any): CreateProductFromTemplateRequest {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      name: isSet(object.name) ? String(object.name) : '',
      description: isSet(object.description) ? String(object.description) : '',
      type: isSet(object.type) ? productTypeFromJSON(object.type) : 0,
    }
  },

  toJSON(message: CreateProductFromTemplateRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.name !== undefined && (obj.name = message.name)
    message.description !== undefined && (obj.description = message.description)
    message.type !== undefined && (obj.type = productTypeToJSON(message.type))
    return obj
  },
}

function createBaseTemplateImageResponse(): TemplateImageResponse {
  return { data: new Uint8Array() }
}

export const TemplateImageResponse = {
  fromJSON(object: any): TemplateImageResponse {
    return { data: isSet(object.data) ? bytesFromBase64(object.data) : new Uint8Array() }
  },

  toJSON(message: TemplateImageResponse): unknown {
    const obj: any = {}
    message.data !== undefined &&
      (obj.data = base64FromBytes(message.data !== undefined ? message.data : new Uint8Array()))
    return obj
  },
}

function createBaseStorageResponse(): StorageResponse {
  return { id: '', audit: undefined, name: '', url: '' }
}

export const StorageResponse = {
  fromJSON(object: any): StorageResponse {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      audit: isSet(object.audit) ? AuditResponse.fromJSON(object.audit) : undefined,
      name: isSet(object.name) ? String(object.name) : '',
      description: isSet(object.description) ? String(object.description) : undefined,
      icon: isSet(object.icon) ? String(object.icon) : undefined,
      url: isSet(object.url) ? String(object.url) : '',
    }
  },

  toJSON(message: StorageResponse): unknown {
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

function createBaseStorageListResponse(): StorageListResponse {
  return { data: [] }
}

export const StorageListResponse = {
  fromJSON(object: any): StorageListResponse {
    return { data: Array.isArray(object?.data) ? object.data.map((e: any) => StorageResponse.fromJSON(e)) : [] }
  },

  toJSON(message: StorageListResponse): unknown {
    const obj: any = {}
    if (message.data) {
      obj.data = message.data.map(e => (e ? StorageResponse.toJSON(e) : undefined))
    } else {
      obj.data = []
    }
    return obj
  },
}

function createBaseCreateStorageRequest(): CreateStorageRequest {
  return { name: '', url: '' }
}

export const CreateStorageRequest = {
  fromJSON(object: any): CreateStorageRequest {
    return {
      name: isSet(object.name) ? String(object.name) : '',
      description: isSet(object.description) ? String(object.description) : undefined,
      icon: isSet(object.icon) ? String(object.icon) : undefined,
      url: isSet(object.url) ? String(object.url) : '',
      accessKey: isSet(object.accessKey) ? String(object.accessKey) : undefined,
      secretKey: isSet(object.secretKey) ? String(object.secretKey) : undefined,
    }
  },

  toJSON(message: CreateStorageRequest): unknown {
    const obj: any = {}
    message.name !== undefined && (obj.name = message.name)
    message.description !== undefined && (obj.description = message.description)
    message.icon !== undefined && (obj.icon = message.icon)
    message.url !== undefined && (obj.url = message.url)
    message.accessKey !== undefined && (obj.accessKey = message.accessKey)
    message.secretKey !== undefined && (obj.secretKey = message.secretKey)
    return obj
  },
}

function createBaseUpdateStorageRequest(): UpdateStorageRequest {
  return { id: '', name: '', url: '' }
}

export const UpdateStorageRequest = {
  fromJSON(object: any): UpdateStorageRequest {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      name: isSet(object.name) ? String(object.name) : '',
      description: isSet(object.description) ? String(object.description) : undefined,
      icon: isSet(object.icon) ? String(object.icon) : undefined,
      url: isSet(object.url) ? String(object.url) : '',
      accessKey: isSet(object.accessKey) ? String(object.accessKey) : undefined,
      secretKey: isSet(object.secretKey) ? String(object.secretKey) : undefined,
    }
  },

  toJSON(message: UpdateStorageRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.name !== undefined && (obj.name = message.name)
    message.description !== undefined && (obj.description = message.description)
    message.icon !== undefined && (obj.icon = message.icon)
    message.url !== undefined && (obj.url = message.url)
    message.accessKey !== undefined && (obj.accessKey = message.accessKey)
    message.secretKey !== undefined && (obj.secretKey = message.secretKey)
    return obj
  },
}

function createBaseStorageDetailsResponse(): StorageDetailsResponse {
  return { id: '', audit: undefined, name: '', url: '', inUse: false }
}

export const StorageDetailsResponse = {
  fromJSON(object: any): StorageDetailsResponse {
    return {
      id: isSet(object.id) ? String(object.id) : '',
      audit: isSet(object.audit) ? AuditResponse.fromJSON(object.audit) : undefined,
      name: isSet(object.name) ? String(object.name) : '',
      description: isSet(object.description) ? String(object.description) : undefined,
      icon: isSet(object.icon) ? String(object.icon) : undefined,
      url: isSet(object.url) ? String(object.url) : '',
      accessKey: isSet(object.accessKey) ? String(object.accessKey) : undefined,
      secretKey: isSet(object.secretKey) ? String(object.secretKey) : undefined,
      inUse: isSet(object.inUse) ? Boolean(object.inUse) : false,
    }
  },

  toJSON(message: StorageDetailsResponse): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.audit !== undefined && (obj.audit = message.audit ? AuditResponse.toJSON(message.audit) : undefined)
    message.name !== undefined && (obj.name = message.name)
    message.description !== undefined && (obj.description = message.description)
    message.icon !== undefined && (obj.icon = message.icon)
    message.url !== undefined && (obj.url = message.url)
    message.accessKey !== undefined && (obj.accessKey = message.accessKey)
    message.secretKey !== undefined && (obj.secretKey = message.secretKey)
    message.inUse !== undefined && (obj.inUse = message.inUse)
    return obj
  },
}

function createBaseStorageOptionResponse(): StorageOptionResponse {
  return { id: '', name: '' }
}

export const StorageOptionResponse = {
  fromJSON(object: any): StorageOptionResponse {
    return { id: isSet(object.id) ? String(object.id) : '', name: isSet(object.name) ? String(object.name) : '' }
  },

  toJSON(message: StorageOptionResponse): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    message.name !== undefined && (obj.name = message.name)
    return obj
  },
}

function createBaseStorageOptionListResponse(): StorageOptionListResponse {
  return { data: [] }
}

export const StorageOptionListResponse = {
  fromJSON(object: any): StorageOptionListResponse {
    return { data: Array.isArray(object?.data) ? object.data.map((e: any) => StorageOptionResponse.fromJSON(e)) : [] }
  },

  toJSON(message: StorageOptionListResponse): unknown {
    const obj: any = {}
    if (message.data) {
      obj.data = message.data.map(e => (e ? StorageOptionResponse.toJSON(e) : undefined))
    } else {
      obj.data = []
    }
    return obj
  },
}

/** Services */

export interface CruxNodeClient {
  /** CRUD */

  getNodes(request: Empty, metadata: Metadata, ...rest: any): Observable<NodeListResponse>

  createNode(request: CreateNodeRequest, metadata: Metadata, ...rest: any): Observable<CreateEntityResponse>

  updateNode(request: UpdateNodeRequest, metadata: Metadata, ...rest: any): Observable<Empty>

  deleteNode(request: IdRequest, metadata: Metadata, ...rest: any): Observable<Empty>

  getNodeDetails(request: IdRequest, metadata: Metadata, ...rest: any): Observable<NodeDetailsResponse>

  generateScript(request: GenerateScriptRequest, metadata: Metadata, ...rest: any): Observable<NodeInstallResponse>

  getScript(request: ServiceIdRequest, metadata: Metadata, ...rest: any): Observable<NodeScriptResponse>

  discardScript(request: IdRequest, metadata: Metadata, ...rest: any): Observable<Empty>

  revokeToken(request: IdRequest, metadata: Metadata, ...rest: any): Observable<Empty>

  updateNodeAgent(request: IdRequest, metadata: Metadata, ...rest: any): Observable<Empty>

  sendContainerCommand(request: NodeContainerCommandRequest, metadata: Metadata, ...rest: any): Observable<Empty>

  deleteContainers(request: NodeDeleteContainersRequest, metadata: Metadata, ...rest: any): Observable<Empty>

  subscribeNodeEventChannel(request: ServiceIdRequest, metadata: Metadata, ...rest: any): Observable<NodeEventMessage>

  watchContainerState(
    request: WatchContainerStateRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<ContainerStateListMessage>

  subscribeContainerLogChannel(
    request: WatchContainerLogRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<ContainerLogMessage>
}

/** Services */

export interface CruxNodeController {
  /** CRUD */

  getNodes(
    request: Empty,
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

  updateNodeAgent(request: IdRequest, metadata: Metadata, ...rest: any): Promise<Empty> | Observable<Empty> | Empty

  sendContainerCommand(
    request: NodeContainerCommandRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<Empty> | Observable<Empty> | Empty

  deleteContainers(
    request: NodeDeleteContainersRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<Empty> | Observable<Empty> | Empty

  subscribeNodeEventChannel(request: ServiceIdRequest, metadata: Metadata, ...rest: any): Observable<NodeEventMessage>

  watchContainerState(
    request: WatchContainerStateRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<ContainerStateListMessage>

  subscribeContainerLogChannel(
    request: WatchContainerLogRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<ContainerLogMessage>
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
      'updateNodeAgent',
      'sendContainerCommand',
      'deleteContainers',
      'subscribeNodeEventChannel',
      'watchContainerState',
      'subscribeContainerLogChannel',
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

  getDeploymentList(request: Empty, metadata: Metadata, ...rest: any): Observable<DeploymentListResponse>

  getDeploymentSecrets(
    request: DeploymentListSecretsRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<ListSecretsResponse>

  copyDeploymentSafe(request: IdRequest, metadata: Metadata, ...rest: any): Observable<CreateEntityResponse>

  copyDeploymentUnsafe(request: IdRequest, metadata: Metadata, ...rest: any): Observable<CreateEntityResponse>

  startDeployment(request: IdRequest, metadata: Metadata, ...rest: any): Observable<Empty>

  subscribeToDeploymentEvents(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<DeploymentProgressMessage>

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
    request: Empty,
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

  startDeployment(request: IdRequest, metadata: Metadata, ...rest: any): Promise<Empty> | Observable<Empty> | Empty

  subscribeToDeploymentEvents(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<DeploymentProgressMessage>

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
      'subscribeToDeploymentEvents',
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

  getActiveTeamByUser(request: Empty, metadata: Metadata, ...rest: any): Observable<ActiveTeamDetailsResponse>

  updateTeam(request: UpdateTeamRequest, metadata: Metadata, ...rest: any): Observable<Empty>

  deleteTeam(request: IdRequest, metadata: Metadata, ...rest: any): Observable<Empty>

  updateUserRole(request: UpdateUserRoleInTeamRequest, metadata: Metadata, ...rest: any): Observable<Empty>

  inviteUserToTeam(request: InviteUserRequest, metadata: Metadata, ...rest: any): Observable<CreateEntityResponse>

  reinviteUserToTeam(request: ReinviteUserRequest, metadata: Metadata, ...rest: any): Observable<CreateEntityResponse>

  deleteUserFromTeam(request: DeleteUserFromTeamRequest, metadata: Metadata, ...rest: any): Observable<Empty>

  acceptTeamInvitation(request: IdRequest, metadata: Metadata, ...rest: any): Observable<Empty>

  declineTeamInvitation(request: IdRequest, metadata: Metadata, ...rest: any): Observable<Empty>

  selectTeam(request: IdRequest, metadata: Metadata, ...rest: any): Observable<Empty>

  getUserMeta(request: Empty, metadata: Metadata, ...rest: any): Observable<UserMetaResponse>

  getAllTeams(request: Empty, metadata: Metadata, ...rest: any): Observable<AllTeamsResponse>

  getTeamById(request: IdRequest, metadata: Metadata, ...rest: any): Observable<TeamDetailsResponse>
}

export interface CruxTeamController {
  createTeam(
    request: CreateTeamRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<CreateEntityResponse> | Observable<CreateEntityResponse> | CreateEntityResponse

  getActiveTeamByUser(
    request: Empty,
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

  reinviteUserToTeam(
    request: ReinviteUserRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<CreateEntityResponse> | Observable<CreateEntityResponse> | CreateEntityResponse

  deleteUserFromTeam(
    request: DeleteUserFromTeamRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<Empty> | Observable<Empty> | Empty

  acceptTeamInvitation(request: IdRequest, metadata: Metadata, ...rest: any): Promise<Empty> | Observable<Empty> | Empty

  declineTeamInvitation(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<Empty> | Observable<Empty> | Empty

  selectTeam(request: IdRequest, metadata: Metadata, ...rest: any): Promise<Empty> | Observable<Empty> | Empty

  getUserMeta(
    request: Empty,
    metadata: Metadata,
    ...rest: any
  ): Promise<UserMetaResponse> | Observable<UserMetaResponse> | UserMetaResponse

  getAllTeams(
    request: Empty,
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
      'reinviteUserToTeam',
      'deleteUserFromTeam',
      'acceptTeamInvitation',
      'declineTeamInvitation',
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

  getNotificationList(request: Empty, metadata: Metadata, ...rest: any): Observable<NotificationListResponse>

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
    request: Empty,
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
  getTemplates(request: Empty, metadata: Metadata, ...rest: any): Observable<TemplateListResponse>

  createProductFromTemplate(
    request: CreateProductFromTemplateRequest,
    metadata: Metadata,
    ...rest: any
  ): Observable<CreateEntityResponse>

  getImage(request: IdRequest, metadata: Metadata, ...rest: any): Observable<TemplateImageResponse>
}

export interface CruxTemplateController {
  getTemplates(
    request: Empty,
    metadata: Metadata,
    ...rest: any
  ): Promise<TemplateListResponse> | Observable<TemplateListResponse> | TemplateListResponse

  createProductFromTemplate(
    request: CreateProductFromTemplateRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<CreateEntityResponse> | Observable<CreateEntityResponse> | CreateEntityResponse

  getImage(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<TemplateImageResponse> | Observable<TemplateImageResponse> | TemplateImageResponse
}

export function CruxTemplateControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ['getTemplates', 'createProductFromTemplate', 'getImage']
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

export interface CruxStorageClient {
  /** CRUD */

  getStorages(request: Empty, metadata: Metadata, ...rest: any): Observable<StorageListResponse>

  createStorage(request: CreateStorageRequest, metadata: Metadata, ...rest: any): Observable<CreateEntityResponse>

  updateStorage(request: UpdateStorageRequest, metadata: Metadata, ...rest: any): Observable<UpdateEntityResponse>

  deleteStorage(request: IdRequest, metadata: Metadata, ...rest: any): Observable<Empty>

  getStorageDetails(request: IdRequest, metadata: Metadata, ...rest: any): Observable<StorageDetailsResponse>

  getStorageOptions(request: Empty, metadata: Metadata, ...rest: any): Observable<StorageOptionListResponse>
}

export interface CruxStorageController {
  /** CRUD */

  getStorages(
    request: Empty,
    metadata: Metadata,
    ...rest: any
  ): Promise<StorageListResponse> | Observable<StorageListResponse> | StorageListResponse

  createStorage(
    request: CreateStorageRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<CreateEntityResponse> | Observable<CreateEntityResponse> | CreateEntityResponse

  updateStorage(
    request: UpdateStorageRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<UpdateEntityResponse> | Observable<UpdateEntityResponse> | UpdateEntityResponse

  deleteStorage(request: IdRequest, metadata: Metadata, ...rest: any): Promise<Empty> | Observable<Empty> | Empty

  getStorageDetails(
    request: IdRequest,
    metadata: Metadata,
    ...rest: any
  ): Promise<StorageDetailsResponse> | Observable<StorageDetailsResponse> | StorageDetailsResponse

  getStorageOptions(
    request: Empty,
    metadata: Metadata,
    ...rest: any
  ): Promise<StorageOptionListResponse> | Observable<StorageOptionListResponse> | StorageOptionListResponse
}

export function CruxStorageControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [
      'getStorages',
      'createStorage',
      'updateStorage',
      'deleteStorage',
      'getStorageDetails',
      'getStorageOptions',
    ]
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method)
      GrpcMethod('CruxStorage', method)(constructor.prototype[method], method, descriptor)
    }
    const grpcStreamMethods: string[] = []
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method)
      GrpcStreamMethod('CruxStorage', method)(constructor.prototype[method], method, descriptor)
    }
  }
}

export const CRUX_STORAGE_SERVICE_NAME = 'CruxStorage'

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
