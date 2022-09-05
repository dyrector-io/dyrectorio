import { Identity } from '@ory/kratos-client'
import { REGISTRY_GITHUB_URL, REGISTRY_GITLAB_URLS, REGISTRY_HUB_URL } from './const'
import { ContainerConfig, Environment, InstanceContainerConfig } from './models-config'

// TODO(polaroi8d): refactor the models.ts

export type DyoApiError = DyoErrorDto & {
  status: number
}

export const PRODUCT_TYPE_VALUES = ['simple', 'complex'] as const
export type ProductType = typeof PRODUCT_TYPE_VALUES[number]

export const VERSION_TYPE_VALUES = ['incremental', 'rolling'] as const
export type VersionType = typeof VERSION_TYPE_VALUES[number]

export type VersionImage = {
  id: string
  name: string
  tag: string
  registryId: string
  order: number
  config: ContainerConfig
}

export type PatchVersionImage = {
  tag?: string
  config?: Partial<ContainerConfig>
}

export type ContainerState = 'created' | 'restarting' | 'running' | 'removing' | 'paused' | 'exited' | 'dead'

export type Container = {
  id: string
  name: string
  date: string
  state: ContainerState
}

export type Instance = {
  id: string
  image: VersionImage
  state?: ContainerState
  overriddenConfig?: Partial<InstanceContainerConfig>
}

export type DeploymentStatus = 'preparing' | 'in_progress' | 'successful' | 'failed' | 'obsolate'

export type DeploymentByVersion = {
  id: string
  name: string
  nodeId: string
  nodeName: string
  date: string
  prefix: string
  status: DeploymentStatus
}

export type DeploymentDetails = {
  id: string
  versionId: string
  nodeId: string
  name: string
  description?: string | undefined
  prefix: string
  updatedAt: string
  environment: Environment
  status: DeploymentStatus
  instances: Instance[]
}

export type Deployment = {
  id: string
  name: string
  productId: string
  product: string
  versionId: string
  version: string
  node: string
  status: DeploymentStatus
  nodeId: string
}

export type DeploymentRoot = DeploymentDetails & {
  product: ProductDetails
  version: VersionDetails
  node: DyoNode
}

export type DeploymentEventType = 'log' | 'deploymentStatus' | 'containerStatus'

export type InstanceStatus = {
  instanceId: string
  state: ContainerState
}

export type DeploymentEvent = {
  type: DeploymentEventType
  value: string[] | DeploymentStatus | InstanceStatus
  createdAt: string
}

export type CreateDeployment = {
  nodeId: string
}

export type DeploymentCreated = {
  id: string
}

export type PatchInstance = {
  instanceId: string
  config: Partial<ContainerConfig>
}

export type PatchDeployment = {
  id: string
  environment?: Environment
  instance?: PatchInstance
}

export type UpdateDeployment = {
  name: string
  description?: string
  prefix: string
}

export type Version = {
  id: string
  name: string
  changelog?: string
  type: VersionType
  default: boolean
  increasable: boolean
  updatedAt: string
}

export type EditableVersion = Omit<Version, 'default'>

export type IncreaseVersion = {
  name: string
  changelog?: string
}

export type UpdateVersion = IncreaseVersion

export type CreateVersion = UpdateVersion & {
  type: VersionType
}

export type VersionDetails = Version & {
  mutable: boolean
  images: VersionImage[]
  deployments: DeploymentByVersion[]
}

export type VersionAddSectionState = 'image' | 'deployment' | 'none'

export const VERSION_SECTIONS_STATE_VALUES = ['images', 'deployments', 'reorder'] as const
export type VersionSectionsState = typeof VERSION_SECTIONS_STATE_VALUES[number]

export type Product = {
  id: string
  name: string
  description?: string
  type: ProductType
  updatedAt: string
}

export type EditableProduct = Product & {
  changelog?: string
}

export type ProductDetails = Product & {
  createdAt: string
  versions: Version[]
}

export type UpdateProduct = {
  name: string
  description?: string
  changelog?: string
}

export type CreateProduct = UpdateProduct & {
  type: ProductType
}

export type NodeStatus = 'connecting' | 'unreachable' | 'running'

export type DyoNode = {
  id: string
  icon?: string
  name: string
  description?: string
  address?: string
  status: NodeStatus
  connectedAt?: string
  version?: string
  type: NodeType
}

export type DyoNodeInstall = {
  command: string
  expireAt: string
  script: string
}

export type DyoNodeDetails = DyoNode & {
  hasToken: boolean
  install?: DyoNodeInstall
}

export type CreateDyoNode = {
  icon?: string
  name: string
  description?: string
}

export const NODE_TYPE_VALUES = ['docker', 'k8s'] as const
export type NodeType = typeof NODE_TYPE_VALUES[number]

export type UpdateDyoNode = CreateDyoNode & {
  address: string
}

export type DyoNodeScript = {
  content: string
}

export type Registry = {
  id: string
  icon?: string
  name: string
  description?: string
  url: string
  type: RegistryType
}

export const REGISTRY_TYPE_VALUES = ['v2', 'hub', 'gitlab', 'github', 'google'] as const
export type RegistryType = typeof REGISTRY_TYPE_VALUES[number]

export type HubRegistryDetails = {
  type: 'hub'
  imageNamePrefix: string
}

export type V2RegistryDetails = {
  type: 'v2'
  url: string
  isPrivate: boolean
  user?: string
  token?: string
}

export type GitlabRegistryDetails = {
  type: 'gitlab'
  imageNamePrefix: string
  user: string
  token: string
  selfManaged: boolean
  url?: string
  apiUrl?: string
}

export type GithubRegistryDetails = {
  type: 'github'
  imageNamePrefix: string
  user: string
  token: string
}

export type GoogleRegistryDetails = {
  type: 'google'
  url: string
  imageNamePrefix: string
  isPrivate: boolean
  user?: string
  token?: string
}

export type RegistryDetails = Omit<Registry, 'url'> &
  (HubRegistryDetails | V2RegistryDetails | GitlabRegistryDetails | GithubRegistryDetails | GoogleRegistryDetails) & {
    updatedAt: string
  }

export type UpdateRegistry = RegistryDetails
export type CreateRegistry = UpdateRegistry

export type AuditLog = {
  identityName: string
  date: string
  event: string
  info?: any
}

export type ServiceStatus = 'unavailable' | 'disrupted' | 'operational'

export type ServiceInfo = {
  status: ServiceStatus
  version?: string
}
export const DEFAULT_SERVICE_INFO: ServiceInfo = {
  status: 'unavailable',
  version: null,
}

export type CruxHealth = ServiceInfo & {
  lastMigration?: string
}
export const DEFAULT_CRUX_HEALTH: CruxHealth = {
  ...DEFAULT_SERVICE_INFO,
  lastMigration: null,
}

export type DyoServiceInfo = {
  app: ServiceInfo
  crux: ServiceInfo
  database: ServiceInfo
  kratos: ServiceInfo
}

export type DyoErrorDto = {
  error: string
  property?: string
  value?: any
  description: string
}

export type UnavailableErrorType = 'crux' | 'kratos'

export type UnavailableErrorDto = DyoErrorDto & {
  error: UnavailableErrorType
}

export type DyoFetchError = DyoErrorDto & {
  status: number
}

// ws - common

export const WS_TYPE_DYO_ERROR = 'dyo-error'
export type DyoErrorMessage = DyoApiError

// ws - nodes

export const WS_TYPE_GET_NODE_STATUS_LIST = 'get-node-status-list'
export type GetNodeStatusListMessage = {
  nodeIds: string[]
}

export const WS_TYPE_NODE_STATUS = 'node-status'
export type NodeStatusMessage = {
  nodeId: string
  status: NodeStatus
  address?: string
}

export const WS_TYPE_NODE_STATUSES = 'node-status-list'

export const WS_TYPE_WATCH_CONTAINER_STATUS = 'watch-container-status'
export const WS_TYPE_STOP_WATCHING_CONTAINER_STATUS = 'stop-watching-container-status'
export type WatchContainerStatusMessage = {
  prefix?: string
}

export const WS_TYPE_CONTAINER_STATUS_LIST = 'container-status-list'
export type ContainerListMessage = Container[]

// ws - registries

export type FindImageResult = {
  name: string
}

export const WS_TYPE_FIND_IMAGE = 'find-image'
export type FindImageMessage = {
  registryId: string
  filter: string
}

export const WS_TYPE_FIND_IMAGE_RESULT = 'find-image-result'
export type FindImageResultMessage = {
  registryId: string
  images: FindImageResult[]
}

export const WS_TYPE_REGISTRY_FETCH_IMAGE_TAGS = 'fetch-image-tags'
export type FetchImageTagsMessage = RegistryImages

export type RegistryImageTags = {
  name: string
  tags: string[]
}

export const WS_TYPE_REGISTRY_IMAGE_TAGS = 'registry-image-tags'
export type RegistryImageTagsMessage = {
  registryId: string
  images: RegistryImageTags[]
}

// ws - images

export type RegistryImages = {
  registryId: string
  images: string[]
}

export const WS_TYPE_ADD_IMAGES = 'add-images'
export type AddImagesMessage = {
  registryImages: RegistryImages[]
}

export const WS_TYPE_DELETE_IMAGE = 'delete-image'
export type DeleteImageMessage = {
  imageId: string
}

export const WS_TYPE_IMAGE_DELETED = 'image-deleted'
export type ImageDeletedMessage = {
  imageId: string
}

export const WS_TYPE_IMAGES_ADDED = 'images-added'
export type ImagesAddedMessage = {
  images: VersionImage[]
}

export const WS_TYPE_PATCH_IMAGE = 'patch-image'
export type PatchImageMessage = PatchVersionImage & {
  id: string
}

export const WS_TYPE_ORDER_IMAGES = 'order-images'
export type OrderImagesMessage = string[]

export const WS_TYPE_IMAGES_WERE_REORDERED = 'images-were-reordered'
export type ImagesWereReorderedMessage = string[]

export const WS_TYPE_IMAGE_UPDATED = 'image-updated'
export type ImageUpdateMessage = PatchImageMessage

export const WS_TYPE_GET_IMAGE = 'get-image'
export type GetImageMessage = {
  id: string
}

export const WS_TYPE_IMAGE = 'image'
export type ImageMessage = VersionImage

// ws - deployment

export const WS_TYPE_PATCH_DEPLOYMENT_ENV = 'patch-deployment-env'
export type PatchDeploymentEnvMessage = Environment

export const WS_TYPE_DEPLOYMENT_ENV_UPDATED = 'deployment-env-updated'
export type DeploymentEnvUpdatedMessage = Environment

export const WS_TYPE_PATCH_INSTANCE = 'patch-instance'
export type PatchInstanceMessage = Partial<InstanceContainerConfig> & {
  instanceId: string
}

export const WS_TYPE_INSTANCE_UPDATED = 'instance-updated'
export type InstanceUpdatedMessage = InstanceContainerConfig & {
  instanceId: string
}

export const WS_TYPE_GET_INSTANCE = 'get-instance'
export type GetInstanceMessage = {
  id: string
}

export const WS_TYPE_INSTANCE = 'instance'
export type InstanceMessage = Instance

export const WS_TYPE_INSTANCES_ADDED = 'instances-added'
export type InstancesAddedMessage = Instance[]

export type DeploymentEditEventMessage = InstancesAddedMessage | ImageDeletedMessage

export const WS_TYPE_FETCH_DEPLOYMENT_EVENTS = 'fetch-deployment-events'
export type FetchDeploymentEventsMessage = {
  id: string
}

export const WS_TYPE_DEPLOYMENT_EVENT = 'deployment-event'
export const WS_TYPE_DEPLOYMENT_EVENT_LIST = 'deployment-event-list'
export type DeploymentEventMessage = DeploymentEvent

export const WS_TYPE_START_DEPLOYMENT = 'start-deployment'
export type StartDeploymentMessage = {
  id: string
}

export const WS_TYPE_DEPLOYMENT_FINISHED = 'deployment-finished'

// user

export const USER_ROLE_VALUES = ['owner', 'admin', 'user'] as const
export type UserRole = typeof USER_ROLE_VALUES[number]

export type UserStatus = 'pending' | 'verified'

export type User = {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
}

export type InviteUser = {
  email: string
}

export type IdentityTraits = {
  email: string
  name?: IdentityTraitsName
}

export type IdentityTraitsName = {
  first?: string
  last?: string
}

export type UserMeta = {
  user: User
  activeTeamId?: string
  teams: UserMetaTeam[]
  invitations: UserMetaTeam[]
}

export type UserMetaTeam = {
  id: string
  name: string
}

// team
export type SelectTeam = {
  id: string
}

export type CreateTeam = {
  name: string
}
export type UpdateTeam = CreateTeam

export type TeamStatistics = {
  users: number
  products: number
  nodes: number
  versions: number
  deployments: number
}
export const DEFAULT_TEAM_STATISTICS: TeamStatistics = {
  users: 1,
  products: 0,
  nodes: 0,
  versions: 0,
  deployments: 0,
}

export type Team = UserMetaTeam & {
  statistics: TeamStatistics
}

export type TeamDetails = Team & {
  users: User[]
}

export type ActiveTeamDetails = UserMetaTeam & {
  users: User[]
}

// auth

export type Login = {
  flow: string
  csrfToken: string
  captcha?: string
  email: string
  password: string
}

export type Logout = {
  url: string
}

export type Register = {
  flow: string
  csrfToken: string
  captcha?: string
  email: string
  password: string
}

export type RecoverEmail = {
  flow: string
  csrfToken: string
  captcha?: string
  email: string
  token?: string
}

export type VerifyEmail = {
  flow: string
  csrfToken: string
  captcha?: string
  email: string
  token?: string
}

export type EditProfile = {
  flow: string
  csrfToken: string
  email: string
  firstName: string
  lastName: string
}

export type ChangePassword = {
  flow: string
  csrfToken: string
  password: string
}

export type UserName = {
  first?: string
  last?: string
}

export type UserTraits = {
  email: string
  name?: UserName
}

export const NOTIFICATION_TYPE_VALUES = ['discord', 'slack', 'teams'] as const
export type NotificationType = typeof NOTIFICATION_TYPE_VALUES[number]

export type CreateNotification = {
  name: string
  url: string
  type: NotificationType
  active: boolean
}

export type UpdateNotification = CreateNotification & {
  id: string
}

export type NotificationDetails = CreateNotification & {
  id: string
  creator: string
}

export const roleToText = (role: UserRole) => {
  switch (role) {
    case 'owner':
      return 'common:role.owner'
    case 'admin':
      return 'common:role.admin'
    default:
      return 'common:role.user'
  }
}

export const selectedTeamOf = (meta: UserMeta): UserMetaTeam => {
  const team = meta.teams.find(it => it.id === meta.activeTeamId)
  return team
}

export const userIsAdmin = (user: User): boolean => user.role === 'owner' || user.role === 'admin'
export const userIsOwner = (user: User): boolean => user.role === 'owner'

export const nameOfIdentity = (identity: Identity): string => {
  const traits = identity.traits as IdentityTraits
  return `${traits?.name?.first ?? ''} ${traits?.name?.last ?? ''}`
}

export const productDetailsToEditableProduct = (product: ProductDetails) =>
  ({
    ...product,
    changelog: product.type === 'simple' ? product.versions[0].changelog : null,
  } as EditableProduct)

export const updateProductDetailsWithEditableProduct = (product: ProductDetails, edit: EditableProduct) => {
  const newProduct = {
    ...product,
    ...edit,
  }

  if (product.type === 'simple') {
    const version = product.versions[0]

    newProduct.versions = [
      {
        ...version,
        changelog: edit.changelog,
      },
    ]
  }

  return newProduct
}

export const deploymentIsMutable = (status: DeploymentStatus) => status === 'preparing' || status === 'failed'

const AUDIT_LOG_EVENT_PREFIX = '/crux.Crux'
export const beautifyAuditLogEvent = (event: string): string => {
  let parts = event.split(AUDIT_LOG_EVENT_PREFIX)
  if (parts.length < 2) {
    return event
  }

  parts = parts[1].split('/')
  return parts.length < 2 ? parts[1] : `${parts[0]}: ${parts[1]}`
}

export const registryUrlOf = (it: RegistryDetails) => {
  switch (it.type) {
    case 'hub':
      return REGISTRY_HUB_URL
    case 'v2':
    case 'google':
      return it.url
    case 'gitlab':
      return it.selfManaged ? it.url : REGISTRY_GITLAB_URLS.registryUrl
    case 'github':
      return REGISTRY_GITHUB_URL
    default:
      return null
  }
}

export const registryDetailsToRegistry = (it: RegistryDetails): Registry => ({
  ...it,
  url: registryUrlOf(it),
})
