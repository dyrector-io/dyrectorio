import { ContainerConfig, ContainerConfigData, ContainerConfigKey } from './container'
import { BasicRegistry, imageName, RegistryImages } from './registry'

export const ENVIRONMENT_VALUE_TYPES = ['string', 'boolean', 'int'] as const
export type EnvironmentValueType = (typeof ENVIRONMENT_VALUE_TYPES)[number]

export type EnvironmentRule = {
  type: EnvironmentValueType
  required?: boolean
  default?: string
}

export type VersionImage = {
  id: string
  name: string
  tag: string
  order: number
  config: ContainerConfig
  createdAt: string
  registry: BasicRegistry
  labels: Record<string, string>
}

export type PatchVersionImage = {
  tag?: string
  config?: Partial<ContainerConfigData>
  resetSection?: ContainerConfigKey
}

export type ViewState = 'editor' | 'json'

export type AddImages = {
  registryId: string
  images: string[]
}

// ws
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

export const WS_TYPE_SET_IMAGE_TAG = 'set-image-tag'
export const WS_TYPE_IMAGE_TAG_UPDATED = 'image-tag-updated'
export type ImageTagMessage = {
  imageId: string
  tag: string
}

export const WS_TYPE_ORDER_IMAGES = 'order-images'
export type OrderImagesMessage = string[]

export const WS_TYPE_IMAGES_WERE_REORDERED = 'images-were-reordered'
export type ImagesWereReorderedMessage = string[]

export const WS_TYPE_GET_IMAGE = 'get-image'
export type GetImageMessage = {
  id: string
}

export const WS_TYPE_IMAGE = 'image'
export type ImageMessage = VersionImage

export const imageNameOf = (image: VersionImage): string => imageName(image.name, image.tag)

export const containerNameOfImage = (image: VersionImage) => image.config.name ?? image.name
