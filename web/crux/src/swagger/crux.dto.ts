/* eslint-disable */

import { RestartPolicy, NetworkMode, DeploymentStrategy, ExposeStrategy, InstanceContainerConfig } from '@prisma/client'
import { Observable } from 'rxjs'
import {
  DriverType,
  HealthCheckConfig,
  ResourceConfig,
  Ingress,
  ConfigContainer,
  ContainerCommandRequest,
  DeleteContainersRequest,
  ContainerIdentifier,
  DeploymentStatus,
  InstanceDeploymentItem,
  ContainerState,
  ContainerStateListMessage,
  ContainerLogMessage,
  ListSecretsResponse,
} from '../grpc/protobuf/proto/common'
import {
  TokenResponse,
  AuditLogResponse,
  UserRole,
  ActiveTeamUser,
  TeamResponse,
  UserStatus,
  UserResponse,
  TeamStatistics,
  TeamWithStatsResponse,
  AuditResponse,
  ProductType,
  VersionResponse,
  ProductReponse,
  RegistryType,
  RegistryResponse,
  RegistryNamespace,
  HubRegistryDetails,
  V2RegistryDetails,
  GitlabRegistryDetails,
  GithubRegistryDetails,
  GoogleRegistryDetails,
  UncheckedRegistryDetails,
  VersionType,
  ImageResponse,
  DeploymentByVersionResponse,
  VolumeLink,
  Port,
  PortRangeBinding,
  Volume,
  LogConfig,
  UniqueKeyList,
  UniqueKeyValueList,
  ImportContainer,
  PortList,
  PortRangeBindingList,
  VolumeList,
  InitContainerList,
  CommonContainerConfig,
  DagentContainerConfig,
  CraneContainerConfig,
  UniqueSecretKeyList,
  UniqueSecretKeyValueList,
  ImageContainerConfig,
  RegistryImages,
  NodeConnectionStatus,
  NodeType,
  NodeInstallResponse,
  NodeScriptResponse,
  NodeResponse,
  NodeScriptType,
  DagentTraefikOptions,
  InstanceResponse,
  InstancesCreatedEventList,
  PatchInstanceRequest,
  DeploymentResponse,
  DeploymentEventType,
  DeploymentEventLog,
  DeploymentEventContainerState,
  DeploymentEventResponse,
  NotificationType,
  NotificationEventType,
  NotificationResponse,
  ServiceStatus,
  TemplateResponse,
  DashboardActiveNodes,
  DashboardDeployment,
  ProductListResponse,
  CreateEntityResponse,
  UpdateEntityResponse,
  ProductDetailsReponse,
  RegistryListResponse,
  RegistryDetailsResponse,
  NodeListResponse,
  NodeDetailsResponse,
  NodeEventMessage,
  VersionListResponse,
  VersionDetailsResponse,
  ImageListResponse,
  DeploymentListByVersionResponse,
  DeploymentDetailsResponse,
  DeploymentEventListResponse,
  DeploymentListResponse,
  DeploymentProgressMessage,
  DeploymentEditEventMessage,
  ActiveTeamDetailsResponse,
  UserMetaResponse,
  AllTeamsResponse,
  TeamDetailsResponse,
  CreateNotificationResponse,
  NotificationListResponse,
  NotificationDetailsResponse,
  AuditLogListResponse,
  AuditLogListCountResponse,
  HealthResponse,
  TemplateListResponse,
  TemplateImageResponse,
  DashboardResponse,
  GenerateTokenResponse,
  TokenListResponse,
} from '../grpc/protobuf/proto/crux'
import {
  UniqueKey,
  UniqueKeyValue,
  InitContainer,
  PortRange,
  VolumeType,
  UniqueSecretKey,
  UniqueSecretKeyValue,
  Marker,
} from '../shared/models'

export class ServiceIdRequestDto {
  id: string
}
export class IdRequestDto {
  id: string
  accessedBy: string
}
export class AuditResponseDto {
  createdBy: string
  createdAt: any
  updatedBy: string | undefined
  updatedAt: any
}
export class CreateEntityResponseDto {
  id: string
  createdAt: any
}
export class UpdateEntityResponseDto {
  updatedAt: any
}
export class GenerateTokenRequestDto {
  accessedBy: string
  name: string
  expirationInDays: number
}
export class GenerateTokenResponseDto {
  id: string
  name: string
  expiresAt: any
  createdAt: any
  token: string
}
export class TokenResponseDto {
  id: string
  name: string
  expiresAt: any
  createdAt: any
}
export class TokenListResponseDto {
  data: TokenResponse[]
}
export class AuditLogListRequestDto {
  accessedBy: string
  pageSize: number
  pageNumber: number
  keyword: string | undefined
  createdFrom: any
  createdTo: any
}
export class AuditLogListCountResponseDto {
  count: number
}
export class AuditLogResponseDto {
  createdAt: any
  userId: string
  identityEmail: string
  serviceCall: string
  data: string | undefined
}
export class AuditLogListResponseDto {
  data: AuditLogResponse[]
}
export class CreateTeamRequestDto {
  accessedBy: string
  name: string
}
export class UpdateTeamRequestDto {
  id: string
  accessedBy: string
  name: string
}
export class UpdateUserRoleInTeamRequestDto {
  id: string
  accessedBy: string
  userId: string
  role: UserRole
}
export class InviteUserRequestDto {
  id: string
  accessedBy: string
  email: string
  firstName: string
  lastName: string | undefined
}
export class ReinviteUserRequestDto {
  id: string
  accessedBy: string
  userId: string
}
export class DeleteUserFromTeamRequestDto {
  id: string
  accessedBy: string
  userId: string
}
export class AccessRequestDto {
  accessedBy: string
}
export class UserMetaResponseDto {
  user: ActiveTeamUser | undefined
  teams: TeamResponse[]
  invitations: TeamResponse[]
}
export class ActiveTeamUserDto {
  activeTeamId: string
  role: UserRole
  status: UserStatus
}
export class TeamResponseDto {
  id: string
  name: string
}
export class ActiveTeamDetailsResponseDto {
  id: string
  name: string
  users: UserResponse[]
}
export class TeamStatisticsDto {
  users: number
  products: number
  nodes: number
  versions: number
  deployments: number
}
export class TeamWithStatsResponseDto {
  id: string
  name: string
  statistics: TeamStatistics | undefined
}
export class TeamDetailsResponseDto {
  id: string
  name: string
  statistics: TeamStatistics | undefined
  users: UserResponse[]
}
export class AllTeamsResponseDto {
  data: TeamWithStatsResponse[]
}
export class UserResponseDto {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  lastLogin: any
}
export class ProductDetailsReponseDto {
  id: string
  audit: AuditResponse | undefined
  name: string
  description: string | undefined
  type: ProductType
  deletable: boolean
  versions: VersionResponse[]
}
export class ProductReponseDto {
  id: string
  audit: AuditResponse | undefined
  name: string
  description: string | undefined
  type: ProductType
  versionCount: number
}
export class ProductListResponseDto {
  data: ProductReponse[]
}
export class CreateProductRequestDto {
  accessedBy: string
  name: string
  description: string | undefined
  type: ProductType
}
export class UpdateProductRequestDto {
  id: string
  accessedBy: string
  name: string
  description: string | undefined
  changelog: string | undefined
}
export class RegistryResponseDto {
  id: string
  audit: AuditResponse | undefined
  name: string
  description: string | undefined
  icon: string | undefined
  url: string
  type: RegistryType
}
export class RegistryListResponseDto {
  data: RegistryResponse[]
}
export class HubRegistryDetailsDto {
  imageNamePrefix: string
}
export class V2RegistryDetailsDto {
  url: string
  user: string | undefined
  token: string | undefined
}
export class GitlabRegistryDetailsDto {
  user: string
  token: string
  imageNamePrefix: string
  url: string | undefined
  apiUrl: string | undefined
  namespace: RegistryNamespace
}
export class GithubRegistryDetailsDto {
  user: string
  token: string
  imageNamePrefix: string
  namespace: RegistryNamespace
}
export class GoogleRegistryDetailsDto {
  url: string
  user: string | undefined
  token: string | undefined
  imageNamePrefix: string
}
export class UncheckedRegistryDetailsDto {
  url: string
}
export class CreateRegistryRequestDto {
  accessedBy: string
  name: string
  description: string | undefined
  icon: string | undefined
  hub: HubRegistryDetails | undefined
  v2: V2RegistryDetails | undefined
  gitlab: GitlabRegistryDetails | undefined
  github: GithubRegistryDetails | undefined
  google: GoogleRegistryDetails | undefined
  unchecked: UncheckedRegistryDetails | undefined
}
export class UpdateRegistryRequestDto {
  id: string
  accessedBy: string
  name: string
  description: string | undefined
  icon: string | undefined
  hub: HubRegistryDetails | undefined
  v2: V2RegistryDetails | undefined
  gitlab: GitlabRegistryDetails | undefined
  github: GithubRegistryDetails | undefined
  google: GoogleRegistryDetails | undefined
  unchecked: UncheckedRegistryDetails | undefined
}
export class RegistryDetailsResponseDto {
  id: string
  audit: AuditResponse | undefined
  name: string
  description: string | undefined
  icon: string | undefined
  inUse: boolean
  hub: HubRegistryDetails | undefined
  v2: V2RegistryDetails | undefined
  gitlab: GitlabRegistryDetails | undefined
  github: GithubRegistryDetails | undefined
  google: GoogleRegistryDetails | undefined
  unchecked: UncheckedRegistryDetails | undefined
}
export class CreateVersionRequestDto {
  accessedBy: string
  productId: string
  name: string
  changelog: string | undefined
  type: VersionType
}
export class UpdateVersionRequestDto {
  id: string
  accessedBy: string
  name: string
  changelog: string | undefined
}
export class VersionResponseDto {
  id: string
  audit: AuditResponse | undefined
  name: string
  changelog: string
  default: boolean
  type: VersionType
  increasable: boolean
}
export class VersionListResponseDto {
  data: VersionResponse[]
}
export class VersionDetailsResponseDto {
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
export class IncreaseVersionRequestDto {
  id: string
  accessedBy: string
  name: string
  changelog: string | undefined
}
export class VolumeLinkDto {
  id: string
  name: string
  path: string
}
export class InitContainerDto {
  id: string
  name: string
  image: string
  useParentConfig: boolean
  volumes: VolumeLink[]
  command: UniqueKey[]
  args: UniqueKey[]
  environment: UniqueKeyValue[]
}
export class InitContainerListDto {
  data: InitContainer[]
}
export class ImportContainerDto {
  volume: string
  command: string
  environment: UniqueKeyValue[]
}
export class LogConfigDto {
  driver: DriverType
  options: UniqueKeyValue[]
}
export class PortDto {
  id: string
  internal: number
  external: number | undefined
}
export class PortListDto {
  data: Port[]
}
export class PortRangeDto {
  from: number
  to: number
}
export class PortRangeBindingDto {
  id: string
  internal: PortRange | undefined
  external: PortRange | undefined
}
export class PortRangeBindingListDto {
  data: PortRangeBinding[]
}
export class VolumeDto {
  id: string
  name: string
  path: string
  size: string | undefined
  type: VolumeType | undefined
  class: string | undefined
}
export class VolumeListDto {
  data: Volume[]
}
export class UniqueKeyListDto {
  data: UniqueKey[]
}
export class UniqueKeyValueDto {
  id: string
  key: string
  value: string
}
export class UniqueKeyValueListDto {
  data: UniqueKeyValue[]
}
export class UniqueSecretKeyDto {
  id: string
  key: string
  required: boolean
}
export class UniqueSecretKeyListDto {
  data: UniqueSecretKey[]
}
export class UniqueSecretKeyValueDto {
  id: string
  key: string
  value: string
  required: boolean
  encrypted: boolean
  publicKey: string | undefined
}
export class UniqueSecretKeyValueListDto {
  data: UniqueSecretKeyValue[]
}
export class MarkerDto {
  deployment: UniqueKeyValue[]
  service: UniqueKeyValue[]
  ingress: UniqueKeyValue[]
}
export class DagentContainerConfigDto {
  logConfig: LogConfig | undefined
  restartPolicy: RestartPolicy | undefined
  networkMode: NetworkMode | undefined
  networks: UniqueKeyList | undefined
  labels: UniqueKeyValueList | undefined
}
export class CraneContainerConfigDto {
  deploymentStatregy: DeploymentStrategy | undefined
  healthCheckConfig: HealthCheckConfig | undefined
  resourceConfig: ResourceConfig | undefined
  proxyHeaders: boolean | undefined
  useLoadBalancer: boolean | undefined
  annotations: Marker | undefined
  labels: Marker | undefined
  customHeaders: UniqueKeyList | undefined
  extraLBAnnotations: UniqueKeyValueList | undefined
}
export class CommonContainerConfigDto {
  name: string | undefined
  expose: ExposeStrategy | undefined
  ingress: Ingress | undefined
  configContainer: ConfigContainer | undefined
  importContainer: ImportContainer | undefined
  user: number | undefined
  TTY: boolean | undefined
  ports: PortList | undefined
  portRanges: PortRangeBindingList | undefined
  volumes: VolumeList | undefined
  commands: UniqueKeyList | undefined
  args: UniqueKeyList | undefined
  environment: UniqueKeyValueList | undefined
  initContainers: InitContainerList | undefined
}
export class ImageContainerConfigDto {
  common: CommonContainerConfig | undefined
  dagent: DagentContainerConfig | undefined
  crane: CraneContainerConfig | undefined
  secrets: UniqueSecretKeyList | undefined
}
export class InstanceContainerConfigDto {
  common: CommonContainerConfig | undefined
  dagent: DagentContainerConfig | undefined
  crane: CraneContainerConfig | undefined
  secrets: UniqueSecretKeyValueList | undefined
}
export class ImageResponseDto {
  id: string
  name: string
  tag: string
  order: number
  registryId: string
  config: ImageContainerConfig | undefined
  createdAt: any
  registryName: string
  registryType: RegistryType
}
export class ImageListResponseDto {
  data: ImageResponse[]
}
export class OrderVersionImagesRequestDto {
  accessedBy: string
  versionId: string
  imageIds: string[]
}
export class RegistryImagesDto {
  registryId: string
  imageNames: string[]
}
export class AddImagesToVersionRequestDto {
  accessedBy: string
  versionId: string
  images: RegistryImages[]
}
export class PatchImageRequestDto {
  id: string
  accessedBy: string
  tag: string | undefined
  config: ImageContainerConfig | undefined
}
export class NodeResponseDto {
  id: string
  audit: AuditResponse | undefined
  name: string
  description: string | undefined
  icon: string | undefined
  address: string | undefined
  status: NodeConnectionStatus
  connectedAt: any
  version: string | undefined
  type: NodeType
}
export class NodeDetailsResponseDto {
  id: string
  audit: AuditResponse | undefined
  name: string
  description: string | undefined
  icon: string | undefined
  address: string | undefined
  status: NodeConnectionStatus
  hasToken: boolean
  connectedAt: any
  install: NodeInstallResponse | undefined
  script: NodeScriptResponse | undefined
  version: string | undefined
  type: NodeType
}
export class NodeListResponseDto {
  data: NodeResponse[]
}
export class CreateNodeRequestDto {
  accessedBy: string
  name: string
  description: string | undefined
  icon: string | undefined
}
export class UpdateNodeRequestDto {
  id: string
  accessedBy: string
  name: string
  description: string | undefined
  icon: string | undefined
}
export class DagentTraefikOptionsDto {
  acmeEmail: string
}
export class GenerateScriptRequestDto {
  id: string
  accessedBy: string
  type: NodeType
  rootPath: string | undefined
  scriptType: NodeScriptType
  dagentTraefik: DagentTraefikOptions | undefined
}
export class NodeInstallResponseDto {
  command: string
  expireAt: any
}
export class NodeScriptResponseDto {
  content: string
}
export class NodeContainerCommandRequestDto {
  id: string
  accessedBy: string
  command: ContainerCommandRequest | undefined
}
export class NodeDeleteContainersRequestDto {
  id: string
  accessedBy: string
  containers: DeleteContainersRequest | undefined
}
export class NodeEventMessageDto {
  id: string
  status: NodeConnectionStatus
  address: string | undefined
  version: string | undefined
  connectedAt: any
  error: string | undefined
}
export class WatchContainerStateRequestDto {
  accessedBy: string
  nodeId: string
  prefix: string | undefined
}
export class WatchContainerLogRequestDto {
  accessedBy: string
  id: string
  dockerId: string | undefined
  prefixName: ContainerIdentifier | undefined
}
export class DeploymentProgressMessageDto {
  id: string
  status: DeploymentStatus | undefined
  instance: InstanceDeploymentItem | undefined
  log: string[]
}
export class InstancesCreatedEventListDto {
  data: InstanceResponse[]
}
export class DeploymentEditEventMessageDto {
  instancesCreated: InstancesCreatedEventList | undefined
  imageIdDeleted: string | undefined
}
export class CreateDeploymentRequestDto {
  accessedBy: string
  versionId: string
  nodeId: string
  note: string | undefined
  prefix: string
}
export class UpdateDeploymentRequestDto {
  id: string
  accessedBy: string
  note: string | undefined
  prefix: string
}
export class PatchDeploymentRequestDto {
  id: string
  accessedBy: string
  environment: UniqueKeyValueList | undefined
  instance: PatchInstanceRequest | undefined
}
export class InstanceResponseDto {
  id: string
  audit: AuditResponse | undefined
  image: ImageResponse | undefined
  state: ContainerState | undefined
  config: InstanceContainerConfig | undefined
}
export class PatchInstanceRequestDto {
  id: string
  accessedBy: string
  config: InstanceContainerConfig | undefined
}
export class DeploymentListResponseDto {
  data: DeploymentResponse[]
}
export class DeploymentResponseDto {
  id: string
  product: string
  productId: string
  version: string
  versionId: string
  node: string
  status: DeploymentStatus
  nodeId: string
  note: string | undefined
  prefix: string
  updatedAt: any
  versionType: VersionType
}
export class DeploymentListByVersionResponseDto {
  data: DeploymentByVersionResponse[]
}
export class DeploymentByVersionResponseDto {
  id: string
  audit: AuditResponse | undefined
  prefix: string
  nodeId: string
  nodeName: string
  status: DeploymentStatus
  nodeStatus: NodeConnectionStatus
  note: string | undefined
}
export class DeploymentDetailsResponseDto {
  id: string
  audit: AuditResponse | undefined
  productVersionId: string
  nodeId: string
  note: string | undefined
  prefix: string
  environment: UniqueKeyValue[]
  status: DeploymentStatus
  publicKey: string | undefined
  instances: InstanceResponse[]
}
export class DeploymentEventContainerStateDto {
  instanceId: string
  state: ContainerState
}
export class DeploymentEventLogDto {
  log: string[]
}
export class DeploymentEventResponseDto {
  type: DeploymentEventType
  createdAt: any
  log: DeploymentEventLog | undefined
  deploymentStatus: DeploymentStatus | undefined
  containerStatus: DeploymentEventContainerState | undefined
}
export class DeploymentEventListResponseDto {
  status: DeploymentStatus
  data: DeploymentEventResponse[]
}
export class DeploymentListSecretsRequestDto {
  id: string
  accessedBy: string
  instanceId: string
}
export class CreateNotificationRequestDto {
  accessedBy: string
  name: string
  url: string
  type: NotificationType
  active: boolean
  events: NotificationEventType[]
}
export class CreateNotificationResponseDto {
  id: string
  creator: string
}
export class UpdateNotificationRequestDto {
  id: string
  accessedBy: string
  name: string
  url: string
  type: NotificationType
  active: boolean
  events: NotificationEventType[]
}
export class NotificationDetailsResponseDto {
  id: string
  audit: AuditResponse | undefined
  name: string
  url: string
  type: NotificationType
  active: boolean
  events: NotificationEventType[]
}
export class NotificationResponseDto {
  id: string
  audit: AuditResponse | undefined
  name: string
  url: string
  type: NotificationType
  active: boolean
  events: NotificationEventType[]
}
export class NotificationListResponseDto {
  data: NotificationResponse[]
}
export class HealthResponseDto {
  status: ServiceStatus
  cruxVersion: string
  lastMigration: string | undefined
}
export class TemplateResponseDto {
  id: string
  name: string
  description: string
}
export class TemplateListResponseDto {
  data: TemplateResponse[]
}
export class CreateProductFromTemplateRequestDto {
  id: string
  accessedBy: string
  name: string
  description: string
  type: ProductType
}
export class TemplateImageResponseDto {
  data: Uint8Array
}
export class DashboardActiveNodesDto {
  id: string
  name: string
  address: string
  version: string
}
export class DashboardDeploymentDto {
  id: string
  product: string
  version: string
  node: string
  changelog: string
  deployedAt: any
  productId: string
  versionId: string
}
export class DashboardResponseDto {
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
export class CruxProductClientDto {
  getProducts: Observable<ProductListResponse>
  createProduct: Observable<CreateEntityResponse>
  updateProduct: Observable<UpdateEntityResponse>
  deleteProduct: any
  getProductDetails: Observable<ProductDetailsReponse>
}
export class CruxProductControllerDto {
  getProducts: Promise<ProductListResponse> | Observable<ProductListResponse> | ProductListResponse
  createProduct: Promise<CreateEntityResponse> | Observable<CreateEntityResponse> | CreateEntityResponse
  updateProduct: Promise<UpdateEntityResponse> | Observable<UpdateEntityResponse> | UpdateEntityResponse
  deleteProduct: any
  getProductDetails: Promise<ProductDetailsReponse> | Observable<ProductDetailsReponse> | ProductDetailsReponse
}
export class CruxRegistryClientDto {
  getRegistries: Observable<RegistryListResponse>
  createRegistry: Observable<CreateEntityResponse>
  updateRegistry: Observable<UpdateEntityResponse>
  deleteRegistry: any
  getRegistryDetails: Observable<RegistryDetailsResponse>
}
export class CruxRegistryControllerDto {
  getRegistries: Promise<RegistryListResponse> | Observable<RegistryListResponse> | RegistryListResponse
  createRegistry: Promise<CreateEntityResponse> | Observable<CreateEntityResponse> | CreateEntityResponse
  updateRegistry: Promise<UpdateEntityResponse> | Observable<UpdateEntityResponse> | UpdateEntityResponse
  deleteRegistry: any
  getRegistryDetails: Promise<RegistryDetailsResponse> | Observable<RegistryDetailsResponse> | RegistryDetailsResponse
}
export class CruxNodeClientDto {
  getNodes: Observable<NodeListResponse>
  createNode: Observable<CreateEntityResponse>
  updateNode: any
  deleteNode: any
  getNodeDetails: Observable<NodeDetailsResponse>
  generateScript: Observable<NodeInstallResponse>
  getScript: Observable<NodeScriptResponse>
  discardScript: any
  revokeToken: any
  updateNodeAgent: any
  sendContainerCommand: any
  deleteContainers: any
  subscribeNodeEventChannel: Observable<NodeEventMessage>
  watchContainerState: Observable<ContainerStateListMessage>
  subscribeContainerLogChannel: Observable<ContainerLogMessage>
}
export class CruxNodeControllerDto {
  getNodes: Promise<NodeListResponse> | Observable<NodeListResponse> | NodeListResponse
  createNode: Promise<CreateEntityResponse> | Observable<CreateEntityResponse> | CreateEntityResponse
  updateNode: any
  deleteNode: any
  getNodeDetails: Promise<NodeDetailsResponse> | Observable<NodeDetailsResponse> | NodeDetailsResponse
  generateScript: Promise<NodeInstallResponse> | Observable<NodeInstallResponse> | NodeInstallResponse
  getScript: Promise<NodeScriptResponse> | Observable<NodeScriptResponse> | NodeScriptResponse
  discardScript: any
  revokeToken: any
  updateNodeAgent: any
  sendContainerCommand: any
  deleteContainers: any
  subscribeNodeEventChannel: Observable<NodeEventMessage>
  watchContainerState: Observable<ContainerStateListMessage>
  subscribeContainerLogChannel: Observable<ContainerLogMessage>
}
export class CruxProductVersionClientDto {
  getVersionsByProductId: Observable<VersionListResponse>
  createVersion: Observable<CreateEntityResponse>
  updateVersion: Observable<UpdateEntityResponse>
  deleteVersion: any
  setDefaultVersion: any
  getVersionDetails: Observable<VersionDetailsResponse>
  increaseVersion: Observable<CreateEntityResponse>
}
export class CruxProductVersionControllerDto {
  getVersionsByProductId: Promise<VersionListResponse> | Observable<VersionListResponse> | VersionListResponse
  createVersion: Promise<CreateEntityResponse> | Observable<CreateEntityResponse> | CreateEntityResponse
  updateVersion: Promise<UpdateEntityResponse> | Observable<UpdateEntityResponse> | UpdateEntityResponse
  deleteVersion: any
  setDefaultVersion: any
  getVersionDetails: Promise<VersionDetailsResponse> | Observable<VersionDetailsResponse> | VersionDetailsResponse
  increaseVersion: Promise<CreateEntityResponse> | Observable<CreateEntityResponse> | CreateEntityResponse
}
export class CruxImageClientDto {
  getImagesByVersionId: Observable<ImageListResponse>
  addImagesToVersion: Observable<ImageListResponse>
  orderImages: any
  patchImage: any
  deleteImage: any
  getImageDetails: Observable<ImageResponse>
}
export class CruxImageControllerDto {
  getImagesByVersionId: Promise<ImageListResponse> | Observable<ImageListResponse> | ImageListResponse
  addImagesToVersion: Promise<ImageListResponse> | Observable<ImageListResponse> | ImageListResponse
  orderImages: any
  patchImage: any
  deleteImage: any
  getImageDetails: Promise<ImageResponse> | Observable<ImageResponse> | ImageResponse
}
export class CruxDeploymentClientDto {
  getDeploymentsByVersionId: Observable<DeploymentListByVersionResponse>
  createDeployment: Observable<CreateEntityResponse>
  updateDeployment: Observable<UpdateEntityResponse>
  patchDeployment: Observable<UpdateEntityResponse>
  deleteDeployment: any
  getDeploymentDetails: Observable<DeploymentDetailsResponse>
  getDeploymentEvents: Observable<DeploymentEventListResponse>
  getDeploymentList: Observable<DeploymentListResponse>
  getDeploymentSecrets: Observable<ListSecretsResponse>
  copyDeploymentSafe: Observable<CreateEntityResponse>
  copyDeploymentUnsafe: Observable<CreateEntityResponse>
  startDeployment: any
  subscribeToDeploymentEvents: Observable<DeploymentProgressMessage>
  subscribeToDeploymentEditEvents: Observable<DeploymentEditEventMessage>
}
export class CruxDeploymentControllerDto {
  getDeploymentsByVersionId:
    | Promise<DeploymentListByVersionResponse>
    | Observable<DeploymentListByVersionResponse>
    | DeploymentListByVersionResponse
  createDeployment: Promise<CreateEntityResponse> | Observable<CreateEntityResponse> | CreateEntityResponse
  updateDeployment: Promise<UpdateEntityResponse> | Observable<UpdateEntityResponse> | UpdateEntityResponse
  patchDeployment: Promise<UpdateEntityResponse> | Observable<UpdateEntityResponse> | UpdateEntityResponse
  deleteDeployment: any
  getDeploymentDetails:
    | Promise<DeploymentDetailsResponse>
    | Observable<DeploymentDetailsResponse>
    | DeploymentDetailsResponse
  getDeploymentEvents:
    | Promise<DeploymentEventListResponse>
    | Observable<DeploymentEventListResponse>
    | DeploymentEventListResponse
  getDeploymentList: Promise<DeploymentListResponse> | Observable<DeploymentListResponse> | DeploymentListResponse
  getDeploymentSecrets: Promise<ListSecretsResponse> | Observable<ListSecretsResponse> | ListSecretsResponse
  copyDeploymentSafe: Promise<CreateEntityResponse> | Observable<CreateEntityResponse> | CreateEntityResponse
  copyDeploymentUnsafe: Promise<CreateEntityResponse> | Observable<CreateEntityResponse> | CreateEntityResponse
  startDeployment: any
  subscribeToDeploymentEvents: Observable<DeploymentProgressMessage>
  subscribeToDeploymentEditEvents: Observable<DeploymentEditEventMessage>
}
export class CruxTeamClientDto {
  createTeam: Observable<CreateEntityResponse>
  getActiveTeamByUser: Observable<ActiveTeamDetailsResponse>
  updateTeam: any
  deleteTeam: any
  updateUserRole: any
  inviteUserToTeam: Observable<CreateEntityResponse>
  reinviteUserToTeam: Observable<CreateEntityResponse>
  deleteUserFromTeam: any
  acceptTeamInvitation: any
  declineTeamInvitation: any
  selectTeam: any
  getUserMeta: Observable<UserMetaResponse>
  getAllTeams: Observable<AllTeamsResponse>
  getTeamById: Observable<TeamDetailsResponse>
}
export class CruxTeamControllerDto {
  createTeam: Promise<CreateEntityResponse> | Observable<CreateEntityResponse> | CreateEntityResponse
  getActiveTeamByUser:
    | Promise<ActiveTeamDetailsResponse>
    | Observable<ActiveTeamDetailsResponse>
    | ActiveTeamDetailsResponse
  updateTeam: any
  deleteTeam: any
  updateUserRole: any
  inviteUserToTeam: Promise<CreateEntityResponse> | Observable<CreateEntityResponse> | CreateEntityResponse
  reinviteUserToTeam: Promise<CreateEntityResponse> | Observable<CreateEntityResponse> | CreateEntityResponse
  deleteUserFromTeam: any
  acceptTeamInvitation: any
  declineTeamInvitation: any
  selectTeam: any
  getUserMeta: Promise<UserMetaResponse> | Observable<UserMetaResponse> | UserMetaResponse
  getAllTeams: Promise<AllTeamsResponse> | Observable<AllTeamsResponse> | AllTeamsResponse
  getTeamById: Promise<TeamDetailsResponse> | Observable<TeamDetailsResponse> | TeamDetailsResponse
}
export class CruxNotificationClientDto {
  createNotification: Observable<CreateNotificationResponse>
  updateNotification: Observable<UpdateEntityResponse>
  deleteNotification: any
  getNotificationList: Observable<NotificationListResponse>
  getNotificationDetails: Observable<NotificationDetailsResponse>
  testNotification: any
}
export class CruxNotificationControllerDto {
  createNotification:
    | Promise<CreateNotificationResponse>
    | Observable<CreateNotificationResponse>
    | CreateNotificationResponse
  updateNotification: Promise<UpdateEntityResponse> | Observable<UpdateEntityResponse> | UpdateEntityResponse
  deleteNotification: any
  getNotificationList:
    | Promise<NotificationListResponse>
    | Observable<NotificationListResponse>
    | NotificationListResponse
  getNotificationDetails:
    | Promise<NotificationDetailsResponse>
    | Observable<NotificationDetailsResponse>
    | NotificationDetailsResponse
  testNotification: any
}
export class CruxAuditClientDto {
  getAuditLog: Observable<AuditLogListResponse>
  getAuditLogListCount: Observable<AuditLogListCountResponse>
}
export class CruxAuditControllerDto {
  getAuditLog: Promise<AuditLogListResponse> | Observable<AuditLogListResponse> | AuditLogListResponse
  getAuditLogListCount:
    | Promise<AuditLogListCountResponse>
    | Observable<AuditLogListCountResponse>
    | AuditLogListCountResponse
}
export class CruxHealthClientDto {
  getHealth: Observable<HealthResponse>
}
export class CruxHealthControllerDto {
  getHealth: Promise<HealthResponse> | Observable<HealthResponse> | HealthResponse
}
export class CruxTemplateClientDto {
  getTemplates: Observable<TemplateListResponse>
  createProductFromTemplate: Observable<CreateEntityResponse>
  getImage: Observable<TemplateImageResponse>
}
export class CruxTemplateControllerDto {
  getTemplates: Promise<TemplateListResponse> | Observable<TemplateListResponse> | TemplateListResponse
  createProductFromTemplate: Promise<CreateEntityResponse> | Observable<CreateEntityResponse> | CreateEntityResponse
  getImage: Promise<TemplateImageResponse> | Observable<TemplateImageResponse> | TemplateImageResponse
}
export class CruxDashboardClientDto {
  getDashboard: Observable<DashboardResponse>
}
export class CruxDashboardControllerDto {
  getDashboard: Promise<DashboardResponse> | Observable<DashboardResponse> | DashboardResponse
}
export class CruxTokenClientDto {
  generateToken: Observable<GenerateTokenResponse>
  getTokenList: Observable<TokenListResponse>
  deleteToken: any
}
export class CruxTokenControllerDto {
  generateToken: Promise<GenerateTokenResponse> | Observable<GenerateTokenResponse> | GenerateTokenResponse
  getTokenList: Promise<TokenListResponse> | Observable<TokenListResponse> | TokenListResponse
  deleteToken: any
}
