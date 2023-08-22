import { Audit } from './audit'
import { DeploymentStatus, DyoApiError, slugify } from './common'
import {
  ContainerIdentifier,
  ContainerState,
  InstanceContainerConfigData,
  UniqueKey,
  UniqueKeyValue,
} from './container'
import { ImageConfigProperty, ImageDeletedMessage } from './image'
import { Instance } from './instance'
import { DyoNode } from './node'
import { BasicProject, ProjectDetails } from './project'
import { BasicVersion, VersionDetails, VersionType } from './version'

export type EnvironmentToConfigBundleNameMap = Record<string, string>

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

export const DEPLOYMENT_EVENT_TYPE_VALUES = ['log', 'deployment-status', 'container-state'] as const
export type DeploymentEventType = (typeof DEPLOYMENT_EVENT_TYPE_VALUES)[number]

export type DeploymentEventContainerState = {
  instanceId: string
  state: ContainerState
}

export type DeploymentEvent = {
  type: DeploymentEventType
  log?: string[]
  deploymentStatus?: DeploymentStatus
  containerState?: DeploymentEventContainerState
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

export const WS_TYPE_PATCH_DEPLOYMENT_ENV = 'patch-deployment-env'
export type PatchDeploymentEnvMessage = {
  environment?: UniqueKeyValue[]
  configBundleIds?: string[]
}

export const WS_TYPE_DEPLOYMENT_ENV_UPDATED = 'deployment-env-updated'
export type DeploymentEnvUpdatedMessage = {
  environment?: UniqueKeyValue[]
  configBundleIds?: string[]
  configBundleEnvironment: EnvironmentToConfigBundleNameMap
}

export const WS_TYPE_PATCH_INSTANCE = 'patch-instance'
export type PatchInstanceMessage = {
  instanceId: string
  config?: Partial<InstanceContainerConfigData>
  resetSection?: ImageConfigProperty
}

export const WS_TYPE_INSTANCE_UPDATED = 'instance-updated'
export type InstanceUpdatedMessage = InstanceContainerConfigData & {
  instanceId: string
}

export const WS_TYPE_GET_INSTANCE = 'get-instance'
export type GetInstanceMessage = {
  id: string
}

export const WS_TYPE_INSTANCE = 'instance'
export type InstanceMessage = Instance & {}

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
