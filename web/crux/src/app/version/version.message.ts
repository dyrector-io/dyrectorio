import { ContainerConfigData } from "src/shared/models"
import { AddImagesDto, ImageDto, PatchImageDto } from "../image/image.dto"
import { ImageConfigProperty } from "../image/image.const"

export const WS_TYPE_GET_IMAGE = 'get-image'
export type GetImageMessage = {
  id: string
}

export const WS_TYPE_IMAGE = 'image'
export type ImageMessage = ImageDto

export const WS_TYPE_ADD_IMAGES = 'add-images'
export type AddImagesMessage = {
  registryImages: AddImagesDto[]
}

export const WS_TYPE_IMAGES_ADDED = 'images-added'
export type ImagesAddedMessage = {
  images: ImageDto[]
}

export const WS_TYPE_DELETE_IMAGE = 'delete-image'
export type DeleteImageMessage = {
  imageId: string
}

export const WS_TYPE_IMAGE_DELETED = 'image-deleted'
export type ImageDeletedMessage = {
  imageId: string
}

export const WS_TYPE_PATCH_IMAGE = 'patch-image'
export type PatchImageMessage = PatchImageDto & {
  id: string
  resetSection?: ImageConfigProperty
}

export const WS_TYPE_PATCH_RECEIVED = 'patch-received'

export const WS_TYPE_ORDER_IMAGES = 'order-images'
export type OrderImagesMessage = string[]

