import { DeploymentStatus } from './common'
import { Environment } from './container'
import { ImageDeletedMessage } from './image'
import { Instance, InstanceContainerConfig, InstanceStatus, PatchInstance } from './instance'
import { DyoNode } from './node'
import { ProductDetails } from './product'
import { VersionDetails } from './version'

export type DeploymentDetails = {
  id: string
  versionId: string
  nodeId: string
  note?: string | undefined
  prefix: string
  updatedAt: string
  environment: Environment
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
  environment?: Environment
  instance?: PatchInstance
}

export type UpdateDeployment = {
  note?: string
  prefix: string
}

// ws

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

export const WS_TYPE_GET_DEPLOYMENT_SECRETS = 'deployment-secret-list'
export type DeploymentGetSecretListMessage = {
  id: string
  instanceId: string
}

export const WS_TYPE_DEPLOYMENT_SECRETS = 'deployment-secrets'
export type DeploymentSecretListMessage = {
  instanceId: string
  keys: string[]
}

export const deploymentIsMutable = (status: DeploymentStatus) => status === 'preparing' || status === 'failed'
