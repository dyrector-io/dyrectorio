import { ContainerConfigData } from './container'
import { BasicRegistry, RegistryImages } from './registry'

export type VersionImage = {
  id: string
  name: string
  tag: string
  order: number
  config: ContainerConfigData
  createdAt: string
  registry: BasicRegistry
}

export type PatchVersionImage = {
  tag?: string
  config?: Partial<ContainerConfigData>
  resetSection?: ImageConfigProperty
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
  'domain',
  'expose',
  'user',
  'tty',
  'configContainer',
  'ports',
  'portRanges',
  'volumes',
  'commands',
  'args',
  'initContainers',
  'storage',
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

export const CRANE_CONFIG_FILTER_VALUES = CRANE_CONFIG_PROPERTIES.filter(it => it !== 'extraLBAnnotations')

export type CommonConfigProperty = typeof COMMON_CONFIG_PROPERTIES[number]
export type CraneConfigProperty = typeof CRANE_CONFIG_PROPERTIES[number]
export type DagentConfigProperty = typeof DAGENT_CONFIG_PROPERTIES[number]
export type ImageConfigProperty = typeof ALL_CONFIG_PROPERTIES[number]

export type BaseImageConfigFilterType = 'all' | 'common' | 'dagent' | 'crane'

export const filterContains = (
  filter: CommonConfigProperty | CraneConfigProperty | DagentConfigProperty,
  filters: ImageConfigProperty[],
): boolean => filters.includes(filter)

export const filterEmpty = (filterValues: string[], filters: ImageConfigProperty[]): boolean =>
  filterValues.filter(x => filters.includes(x as ImageConfigProperty)).length > 0

export const configToFilters = <T extends ContainerConfigData>(
  current: ImageConfigProperty[],
  configData: T,
): ImageConfigProperty[] => {
  const newFilters = ALL_CONFIG_PROPERTIES.filter(it => {
    const value = configData[it]

    if (typeof value === 'number') {
      return value !== null && value !== undefined
    }

    if (!value) {
      return false
    }

    if (Array.isArray(value) && value.length < 1) {
      return false
    }

    if (typeof value === 'object') {
      return Object.keys(value).length > 0
    }

    return true
  })

  const missing = newFilters.filter(it => !current.includes(it))
  return missing.length < 1 ? current : current.concat(missing)
}

export const imageName = (name: string, tag?: string): string => {
  if (!tag) {
    return name
  }

  return `${name}:${tag}`
}
