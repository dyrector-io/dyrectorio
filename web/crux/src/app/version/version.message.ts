import { AddImagesDto, ImageDetailsDto } from '../image/image.dto'

export type GetImageMessage = {
  id: string
}

export const WS_TYPE_IMAGE = 'image'
export type ImageMessage = ImageDetailsDto

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

export type DeleteImageMessage = {
  imageId: string
}

export const WS_TYPE_IMAGE_DELETED = 'image-deleted'
export type ImageDeletedMessage = {
  imageId: string
}

export const WS_TYPE_IMAGES_WERE_REORDERED = 'images-were-reordered'
export type OrderImagesMessage = string[]
