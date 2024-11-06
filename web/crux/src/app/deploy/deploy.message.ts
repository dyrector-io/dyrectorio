import { ConfigBundleDto } from '../config.bundle/config.bundle.dto'
import { ImageDto } from '../image/image.dto'
import { DeploymentEventDto, InstanceDto } from './deploy.dto'

export const WS_TYPE_FETCH_DEPLOYMENT_EVENTS = 'fetch-deployment-events'

export const WS_TYPE_DEPLOYMENT_EVENT = 'deployment-event'
export type DeploymentEventMessage = DeploymentEventDto

export const WS_TYPE_DEPLOYMENT_EVENT_LIST = 'deployment-event-list'
export type DeploymentEventListMessage = DeploymentEventMessage[]

export const WS_TYPE_DEPLOYMENT_BUNDLES_UPDATED = 'deployment-bundles-updated'
export type DeploymentBundlesUpdatedMessage = {
  bundles: ConfigBundleDto[]
}

export const WS_TYPE_GET_INSTANCE = 'get-instance'
export type GetInstanceMessage = {
  id: string
}

export const WS_TYPE_INSTANCE = 'instance'
export type InstanceMessage = InstanceDto

export const WS_TYPE_GET_INSTANCE_SECRETS = 'get-instance-secrets'
export type GetInstanceSecretsMessage = {
  id: string
}

export const WS_TYPE_INSTANCE_SECRETS = 'instance-secrets'
export type InstanceSecretsMessage = {
  instanceId: string
  keys: string[]
}

type InstanceCreatedMessage = {
  id: string
  configId: string
  image: ImageDto
}
export const WS_TYPE_INSTANCES_ADDED = 'instances-added'
export type InstancesAddedMessage = InstanceCreatedMessage[]

export const WS_TYPE_INSTANCE_DELETED = 'instance-deleted'
export type InstanceDeletedMessage = {
  instanceId: string
  configId: string
}
