import { InstanceContainerConfigData, UniqueKeyValue } from "src/shared/models"
import { DeploymentEventDto, InstanceDto } from "./deploy.dto"
import { ImageConfigProperty } from "../image/image.const"

export const WS_TYPE_FETCH_DEPLOYMENT_EVENTS = 'fetch-deployment-events'

export const WS_TYPE_DEPLOYMENT_EVENT = 'deployment-event'
export type DeploymentEventMessage = DeploymentEventDto

export const WS_TYPE_DEPLOYMENT_EVENT_LIST = 'deployment-event-list'
export type DeploymentEventListMessage = DeploymentEventMessage[]

export const WS_TYPE_PATCH_INSTANCE = 'patch-instance'
export type PatchInstanceMessage = {
  instanceId: string
  config?: Partial<InstanceContainerConfigData>
  resetSection?: ImageConfigProperty
}

export const WS_TYPE_PATCH_RECEIVED = 'patch-received'

export const WS_TYPE_PATCH_DEPLOYMENT_ENV = 'patch-deployment-env'
export type PatchDeploymentEnvMessage = UniqueKeyValue[]

export const WS_TYPE_DEPLOYMENT_ENV_UPDATED = 'deployment-env-updated'
export type DeploymentEnvUpdatedMessage = UniqueKeyValue[]

export const WS_TYPE_GET_INSTANCE = 'get-instance'
export type GetInstanceMessage = {
  id: string
}

export const WS_TYPE_INSTANCE = 'instance'
export type InstanceMessage = InstanceDto & {}

export const WS_TYPE_GET_INSTANCE_SECRETS = 'get-instance-secrets'
export type GetInstanceSecretsMessage = {
  id: string
}

export const WS_TYPE_INSTANCE_SECRETS = 'instance-secrets'
export type InstanceSecretsMessage = {
  instanceId: string
  keys: string[]
}
