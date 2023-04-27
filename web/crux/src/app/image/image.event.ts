import { ImageDto } from './image.dto'

const IMAGE_EVENT_TYPE_VALUES = ['create', 'update', 'delete'] as const
export type ImageEventType = (typeof IMAGE_EVENT_TYPE_VALUES)[number]

export class ImageEvent {
  type: ImageEventType

  versionId: string

  images?: ImageDto[]

  imageId?: string
}
