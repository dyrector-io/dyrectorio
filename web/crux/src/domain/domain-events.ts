import { ConfigBundle } from '@prisma/client'
import { ImageDetails } from 'src/app/image/image.mapper'
import { ContainerConfigData } from './container'

// container
export const CONTAINER_CONFIG_EVENT_UPDATE = 'container-config.update'
export const CONTAINER_CONFIG_ANY = 'container-config.*'
export type ContainerConfigUpdatedEvent = {
  id: string
  patch: ContainerConfigData
}

// image
export const IMAGE_EVENT_ADD = 'image.add'
export const IMAGE_EVENT_DELETE = 'image.delete'
export const IMAGE_EVENT_ANY = 'image.*'

export type ImageEvent = {
  versionId: string
}

export type ImagesAddedEvent = ImageEvent & {
  images: ImageDetails[]
}

export type ImageDeletedEvent = Omit<ImagesAddedEvent, 'images'> & {
  imageId: string
  instances: {
    id: string
    configId: string
    deploymentId: string
  }[]
}

// deployment
export type DeploymentEditEvent = {
  deploymentId: string
}

export const DEPLOYMENT_EVENT_INSTACE_CREATE = 'deployment.instance.create'
export const DEPLOYMENT_EVENT_INSTACE_DELETE = 'deployment.instance.delete'

export type InstanceDetails = {
  id: string
  configId: string
  image: ImageDetails
}

export type InstancesCreatedEvent = DeploymentEditEvent & {
  instances: InstanceDetails[]
}

export type InstanceDeletedEvent = DeploymentEditEvent & Omit<InstanceDetails, 'image'>

export const DEPLOYMENT_EVENT_CONFIG_BUNDLES_UPDATE = 'deployment.config-bundles.update'
export type DeploymentConfigBundlesUpdatedEvent = DeploymentEditEvent & {
  bundles: ConfigBundle[]
}
