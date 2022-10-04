import { ContainerConfig } from './container'
import {
  Editor,
  EditorLeftMessage,
  InputEditors,
  InputEditorsMessage,
  InputFocusChangeMessage,
  InputFocusMessage,
} from './editor'
import { RegistryImages } from './registry'

export type VersionImage = {
  id: string
  name: string
  tag: string
  registryId: string
  registryName: string
  order: number
  config: ContainerConfig
  createdAt: string
}

export type PatchVersionImage = {
  tag?: string
  config?: Partial<ContainerConfig>
}

export type ImageEditors = {
  imageId: string
  inputs: InputEditors[]
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

export const WS_TYPE_PATCH_IMAGE = 'patch-image'
export type PatchImageMessage = PatchVersionImage & {
  id: string
}

export const WS_TYPE_ORDER_IMAGES = 'order-images'
export type OrderImagesMessage = string[]

export const WS_TYPE_IMAGES_WERE_REORDERED = 'images-were-reordered'
export type ImagesWereReorderedMessage = string[]

export const WS_TYPE_IMAGE_UPDATED = 'image-updated'
export type ImageUpdateMessage = PatchImageMessage

export const WS_TYPE_GET_IMAGE = 'get-image'
export type GetImageMessage = {
  id: string
}

export const WS_TYPE_IMAGE = 'image'
export type ImageMessage = VersionImage & {
  editors: ImageEditors[]
}

export const WS_TYPE_FETCH_EDITORS = 'fetch-editors'
export type FetchImageEditorsMessage = {
  imageId: string
}

export type ImageEditorsMessage = InputEditorsMessage & {
  imageId: string
}

export const WS_TYPE_ALL_IMAGE_EDITORS = 'all-image-editors'
export type AllImageEditorsMessage = {
  editors: Editor[]
  imageEditors: ImageEditorsMessage[]
}

export type ImageFocusMessage = InputFocusMessage & {
  imageId: string
}

export type ImageInputFocusChangeMessage = InputFocusChangeMessage & {
  imageId: string
}

export type AffectedImage = {
  imageId: string
  affectedInputs: string[]
}
export type ImageEditorLeftMessage = EditorLeftMessage & {
  affectedImages: AffectedImage[]
}
