import { ImageConfigProperty } from '../image/image.const'
import { AddImagesDto, ImageDto, PatchImageDto } from '../image/image.dto'

export type GetImageMessage = {
  id: string
}

export const WS_TYPE_IMAGE = 'image'
export type ImageMessage = ImageDto

export type AddImagesMessage = {
  registryImages: AddImagesDto[]
}

export const WS_TYPE_IMAGES_ADDED = 'images-added'
export type ImagesAddedMessage = {
  images: ImageDto[]
}

export type DeleteImageMessage = {
  imageId: string
}

export const WS_TYPE_IMAGE_DELETED = 'image-deleted'
export type ImageDeletedMessage = {
  imageId: string
}

export const WS_TYPE_IMAGE_UPDATED = 'image-updated'
export type PatchImageMessage = PatchImageDto & {
  id: string
  resetSection?: ImageConfigProperty
}

export const WS_TYPE_PATCH_RECEIVED = 'patch-received'

export const WS_TYPE_IMAGES_WERE_REORDERED = 'images-were-reordered'
export type OrderImagesMessage = string[]
