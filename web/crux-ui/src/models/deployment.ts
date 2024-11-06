import { Audit } from './audit'
import { DeploymentStatus, DyoApiError, slugify } from './common'
import { ConfigBundleDetails } from './config-bundle'
import { ContainerIdentifier, ContainerState, UniqueKeyValue } from './container'
import { ImageDeletedMessage, VersionImage } from './image'
import { Instance } from './instance'
import { DyoNode } from './node'
import { BasicProject, ProjectDetails } from './project'
import { BasicVersion, VersionDetails, VersionType } from './version'

export type EnvironmentToConfigBundleNameMap = Record<string, string>

export type BasicDeployment = {
  id: string
  prefix: string
  status: DeploymentStatus
  protected: boolean
  audit: Audit
}

export type Deployment = {
  id: string
  audit: Audit
  prefix: string
  protected: boolean
  status: DeploymentStatus
  note?: string
  node: DyoNode
  project: BasicProject
  version: BasicVersion
}

export type DeploymentToken = {
  id: string
  name: string
  createdAt: string
  expiresAt?: string | null
}

export type CreateDeploymentToken = {
  name: string
  expirationInDays?: number
}

export type DeploymentTokenCreated = DeploymentToken & {
  token: string
  curl: string
}

export type DeploymentDetails = Deployment & {
  environment: UniqueKeyValue[]
  configBundleEnvironment: EnvironmentToConfigBundleNameMap
  publicKey?: string
  configBundleIds?: string[]
  token: DeploymentToken
  instances: Instance[]
}

export type DeploymentRoot = Omit<DeploymentDetails, 'project' | 'version' | 'node'> & {
  project: ProjectDetails
  version: VersionDetails
  node: DyoNode
}

export const DEPLOYMENT_EVENT_TYPE_VALUES = [
  'log',
  'deployment-status',
  'container-state',
  'container-progress',
] as const
export type DeploymentEventType = (typeof DEPLOYMENT_EVENT_TYPE_VALUES)[number]

export const DEPLOYMENT_LOG_LEVEL_VALUES = ['info', 'warn', 'error'] as const
export type DeploymentLogLevelDto = (typeof DEPLOYMENT_LOG_LEVEL_VALUES)[number]

export type DeploymentEventLog = {
  log: string[]
  level: DeploymentLogLevelDto
}

export type DeploymentEventContainerState = {
  instanceId: string
  state: ContainerState
}

export type DeploymentEventContainerProgress = {
  instanceId: string
  status: string
  progress: number
}

export type DeploymentEvent = {
  type: DeploymentEventType
  log?: DeploymentEventLog
  deploymentStatus?: DeploymentStatus
  containerState?: DeploymentEventContainerState
  containerProgress?: DeploymentEventContainerProgress
  createdAt: string
}

export type CreateDeployment = {
  versionId: string
  nodeId: string
  prefix: string
  protected: boolean
  note?: string | undefined
}

export type PatchDeployment = {
  id: string
  prefix?: string
  note?: string
  protected?: boolean
  environment?: UniqueKeyValue[]
}

export type CopyDeployment = {
  nodeId: string
  prefix: string
  note?: string | null
}

export type CheckDeploymentCopyResponse = {
  pendingDeployment?: string
}

export type CopyDeploymentResponse = {
  id: string
}

export type DeploymentInvalidatedSecrets = {
  instanceId: string
  invalid: string[]
}

export type StartDeployment = {
  instances?: string[]
}

// ws
export const WS_TYPE_DEPLOYMENT_BUNDLES_UPDATED = 'deployment-bundles-updated'
export type DeploymentBundlesUpdatedMessage = {
  bundles: ConfigBundleDetails[]
}

export const WS_TYPE_GET_INSTANCE = 'get-instance'
export type GetInstanceMessage = {
  id: string
}

export const WS_TYPE_INSTANCE = 'instance'
export type InstanceMessage = Instance & {}

export const WS_TYPE_INSTANCES_ADDED = 'instances-added'
type InstanceCreatedMessage = {
  id: string
  configId: string
  image: VersionImage
}
export type InstancesAddedMessage = InstanceCreatedMessage[]

export const WS_TYPE_INSTANCE_DELETED = 'instance-deleted'
export type InstanceDeletedMessage = {
  instanceId: string
  configId: string
}

export type DeploymentEditEventMessage = InstancesAddedMessage | ImageDeletedMessage

export const WS_TYPE_FETCH_DEPLOYMENT_EVENTS = 'fetch-deployment-events'
export type FetchDeploymentEventsMessage = {
  id: string
}

export const WS_TYPE_DEPLOYMENT_EVENT = 'deployment-event'
export const WS_TYPE_DEPLOYMENT_EVENT_LIST = 'deployment-event-list'
export type DeploymentEventMessage = DeploymentEvent

export const WS_TYPE_DEPLOYMENT_FINISHED = 'deployment-finished'

export const WS_TYPE_GET_INSTANCE_SECRETS = 'get-instance-secrets'
export type GetInstanceSecretsMessage = {
  id: string
}

export type InstanceSecrets = {
  container: ContainerIdentifier

  publicKey: string

  keys?: string[]
}

export const WS_TYPE_INSTANCE_SECRETS = 'instance-secrets'
export type InstanceSecretsMessage = {
  instanceId: string
  keys: string[]
}

export const deploymentIsMutable = (status: DeploymentStatus, type: VersionType): boolean => {
  switch (status) {
    case 'preparing':
    case 'failed':
      return true
    case 'successful':
      return type === 'rolling'
    default:
      return false
  }
}

export const deploymentIsDeployable = (status: DeploymentStatus, type: VersionType): boolean => {
  switch (status) {
    case 'preparing':
    case 'failed':
    case 'obsolete':
      return true
    case 'successful':
      return type === 'rolling'
    default:
      return false
  }
}

export const deploymentIsDeletable = (status: DeploymentStatus): boolean => status !== 'in-progress'

export const deploymentIsCopiable = (status: DeploymentStatus) => status !== 'in-progress'

export const deploymentLogVisible = (status: DeploymentStatus) => status !== 'preparing'

export const projectNameToDeploymentPrefix = (name: string) => slugify(name)

export const lastDeploymentStatusOfEvents = (events: DeploymentEvent[]): DeploymentStatus | null =>
  events
    .filter(it => it.type === 'deployment-status')
    .sort((one, other) => new Date(other.createdAt).getTime() - new Date(one.createdAt).getTime())
    .at(0)?.deploymentStatus ?? null

export const deploymentHasError = (dto: DyoApiError): boolean =>
  dto.error === 'rollingVersionDeployment' || dto.error === 'alreadyHavePreparing'
