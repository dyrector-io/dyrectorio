import { DeploymentStatus } from './common'
import { InstanceContainerConfigData } from './container'
import { UniqueKeyValue } from './grpc/protobuf/proto/crux'
import { ImageConfigFilterType, ImageDeletedMessage } from './image'
import { Instance, InstanceStatus, PatchInstance } from './instance'
import { DyoNode } from './node'
import { ProductDetails } from './product'
import { VersionDetails, VersionType } from './version'

export type DeploymentDetails = {
  id: string
  versionId: string
  nodeId: string
  note?: string | undefined
  prefix: string
  updatedAt: string
  environment: UniqueKeyValue[]
  status: DeploymentStatus
  publicKey?: string
  instances: Instance[]
}

export type Deployment = {
  id: string
  productId: string
  product: string
  versionId: string
  version: string
  node: string
  status: DeploymentStatus
  nodeId: string
  note?: string
  prefix: string
  updatedAt: string
  type: VersionType
}

export type DeploymentRoot = DeploymentDetails & {
  product: ProductDetails
  version: VersionDetails
  node: DyoNode
}

export type DeploymentEventType = 'log' | 'deploymentStatus' | 'containerStatus'

export type DeploymentEvent = {
  type: DeploymentEventType
  value: string[] | DeploymentStatus | InstanceStatus
  createdAt: string
}

export type CreateDeployment = {
  nodeId: string
  prefix: string
  note?: string | undefined
}

export type DeploymentCreated = {
  id: string
}

export type PatchDeployment = {
  id: string
  environment?: UniqueKeyValue[]
  instance?: PatchInstance
}

export type UpdateDeployment = {
  note?: string
  prefix: string
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

// ws

export const WS_TYPE_PATCH_DEPLOYMENT_ENV = 'patch-deployment-env'
export type PatchDeploymentEnvMessage = UniqueKeyValue[]

export const WS_TYPE_DEPLOYMENT_ENV_UPDATED = 'deployment-env-updated'
export type DeploymentEnvUpdatedMessage = UniqueKeyValue[]

export const WS_TYPE_PATCH_INSTANCE = 'patch-instance'
export type PatchInstanceMessage = {
  instanceId: string
  config?: Partial<InstanceContainerConfigData>
  resetSection?: ImageConfigFilterType
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

export const WS_TYPE_GET_DEPLOYMENT_SECRETS = 'deployment-secret-list'
export type DeploymentGetSecretListMessage = {
  instanceId: string
}

export const WS_TYPE_DEPLOYMENT_SECRETS = 'deployment-secrets'
export type DeploymentSecretListMessage = {
  instanceId: string
  keys: string[]
}

export const deploymentIsMutable = (status: DeploymentStatus, type: VersionType): boolean => {
  switch (status) {
    case 'preparing':
      return true
    case 'successful':
    case 'failed':
      return type === 'rolling'
    default:
      return false
  }
}

export const deploymentIsDeployable = (status: DeploymentStatus, type: VersionType): boolean => {
  switch (status) {
    case 'preparing':
    case 'obsolete':
      return true
    case 'successful':
    case 'failed':
      return type === 'rolling'
    default:
      return false
  }
}

export const deploymentIsDeletable = (status: DeploymentStatus): boolean => status !== 'in_progress'

export const deploymentIsCopiable = (status: DeploymentStatus, type: VersionType) =>
  type !== 'rolling' && status !== 'in_progress' && status !== 'preparing'

export const deploymentLogVisible = (status: DeploymentStatus) => {
  switch (status) {
    case 'failed':
    case 'successful':
    case 'in_progress':
      return true
    default:
      return false
  }
}

export const productNameToDeploymentPrefix = (name: string) => name.replaceAll(/( |\.)/g, '-').toLocaleLowerCase()
