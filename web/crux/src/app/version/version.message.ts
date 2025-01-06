import { AddImagesDto, ImageDetailsDto } from '../image/image.dto'

export const WS_TYPE_GET_IMAGE = 'get-image'
export type GetImageMessage = {
  id: string
}

export const WS_TYPE_IMAGE = 'image'
export type ImageMessage = ImageDetailsDto

export const WS_TYPE_ADD_IMAGES = 'add-images'
export type AddImagesMessage = {
  registryImages: AddImagesDto[]
}

export const WS_TYPE_SET_IMAGE_TAG = 'set-image-tag'
export const WS_TYPE_IMAGE_TAG_UPDATED = 'image-tag-updated'
export type ImageTagMessage = {
  imageId: string
  tag: string
}

export const WS_TYPE_IMAGES_ADDED = 'images-added'
export type ImagesAddedMessage = {
  images: ImageDetailsDto[]
}

export const WS_TYPE_DELETE_IMAGE = 'delete-image'
export type DeleteImageMessage = {
  imageId: string
}

export const WS_TYPE_IMAGE_DELETED = 'image-deleted'
export type ImageDeletedMessage = {
  imageId: string
}

export const WS_TYPE_IMAGES_WERE_REORDERED = 'images-were-reordered'
export const WS_TYPE_ORDER_IMAGES = 'order-images'
export type OrderImagesMessage = string[]
