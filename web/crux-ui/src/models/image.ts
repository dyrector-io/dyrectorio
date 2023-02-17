import { ContainerConfigData } from './container'
import { RegistryImages, RegistryType } from './registry'

export type VersionImage = {
  id: string
  name: string
  tag: string
  registryId: string
  registryName: string
  registryType: RegistryType
  order: number
  config: ContainerConfigData
  createdAt: string
}

export type PatchVersionImage = {
  tag?: string
  config?: Partial<ContainerConfigData>
  resetSection?: ImageConfigFilterType
}

export type ViewState = 'editor' | 'json'

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
export type ImageMessage = VersionImage

export const COMMON_CONFIG_PROPERTIES = [
  'name',
  'environment',
  'secrets',
  'capabilities',
  'ingress',
  'expose',
  'user',
  'tty',
  'importContainer',
  'configContainer',
  'ports',
  'portRanges',
  'volumes',
  'commands',
  'args',
  'initContainers',
] as const

export const CRANE_CONFIG_PROPERTIES = [
  'deploymentStrategy',
  'customHeaders',
  'proxyHeaders',
  'useLoadBalancer',
  'extraLBAnnotations',
  'healthCheckConfig',
  'resourceConfig',
  'labels',
  'annotations',
] as const

export const DAGENT_CONFIG_PROPERTIES = [
  'logConfig',
  'restartPolicy',
  'networkMode',
  'networks',
  'dockerLabels',
] as const

export const ALL_CONFIG_PROPERTIES = [
  ...COMMON_CONFIG_PROPERTIES,
  ...CRANE_CONFIG_PROPERTIES,
  ...DAGENT_CONFIG_PROPERTIES,
] as const

export type CommonConfigFilterType = typeof COMMON_CONFIG_PROPERTIES[number]
export type CraneConfigFilterType = typeof CRANE_CONFIG_PROPERTIES[number]
export type DagentConfigFilterType = typeof DAGENT_CONFIG_PROPERTIES[number]
export type ImageConfigFilterType = typeof ALL_CONFIG_PROPERTIES[number]

export const filterContains = (
  filter: CommonConfigFilterType | CraneConfigFilterType | DagentConfigFilterType,
  filters: ImageConfigFilterType[],
): boolean => filters.includes(filter)

export const filterEmpty = (filterValues: string[], filters: ImageConfigFilterType[]): boolean =>
  filterValues.filter(x => filters.includes(x as ImageConfigFilterType)).length > 0

export const imageName = (name: string, tag?: string): string => {
  if (!tag) {
    return name
  }

  return `${name}:${tag}`
}
