import { REGISTRY_GITHUB_URL, REGISTRY_GITLAB_URLS, REGISTRY_HUB_URL } from '@app/const'

export const REGISTRY_TYPE_VALUES = ['v2', 'hub', 'gitlab', 'github', 'google', 'unchecked'] as const
export type RegistryType = typeof REGISTRY_TYPE_VALUES[number]

export const GITHUB_NAMESPACE_VALUES = ['organization', 'user'] as const
export const GITLAB_NAMESPACE_VALUES = ['group', 'project'] as const
export type GitlabNamespace = typeof GITLAB_NAMESPACE_VALUES[number]
export type GithubNamespace = typeof GITHUB_NAMESPACE_VALUES[number]
export type RegistryNamespace = GitlabNamespace | GithubNamespace

export type BasicRegistry = {
  id: string
  name: string
  type: RegistryType
}

export type Registry = BasicRegistry & {
  icon?: string
  description?: string
  url: string
  inUse: boolean
}

export type RegistryListItem = Omit<Registry, 'inUse'>

export type RegistryDetailsBase = {
  inUse: boolean
}

export type HubRegistryDetails = RegistryDetailsBase & {
  type: 'hub'
  imageNamePrefix: string
}

export type V2RegistryDetails = RegistryDetailsBase & {
  type: 'v2'
  url: string
  private: boolean
  user?: string
  token?: string
}

export type GitlabRegistryDetails = RegistryDetailsBase & {
  type: 'gitlab'
  imageNamePrefix: string
  user: string
  token: string
  selfManaged: boolean
  namespace: RegistryNamespace
  url?: string
  apiUrl?: string
}

export type GithubRegistryDetails = RegistryDetailsBase & {
  type: 'github'
  imageNamePrefix: string
  user: string
  token: string
  namespace: RegistryNamespace
}

export type GoogleRegistryDetails = RegistryDetailsBase & {
  type: 'google'
  url: string
  imageNamePrefix: string
  private: boolean
  user?: string
  token?: string
}

export type UncheckedRegistryDetails = RegistryDetailsBase & {
  type: 'unchecked'
  url: string
}

export type RegistryDetails = Omit<Registry, 'url'> &
  (
    | HubRegistryDetails
    | V2RegistryDetails
    | GitlabRegistryDetails
    | GithubRegistryDetails
    | GoogleRegistryDetails
    | UncheckedRegistryDetails
  ) & {
    updatedAt: string
  }

export type UpdateRegistry = RegistryDetails
export type CreateRegistry = UpdateRegistry

// ws

export type RegistryImages = {
  registryId: string
  images: string[]
}

export type FindImageResult = {
  name: string
}

export const WS_TYPE_FIND_IMAGE = 'find-image'
export type FindImageMessage = {
  registryId: string
  filter: string
}

export const WS_TYPE_FIND_IMAGE_RESULT = 'find-image-result'
export type FindImageResultMessage = {
  registryId: string
  images: FindImageResult[]
}

export const WS_TYPE_REGISTRY_FETCH_IMAGE_TAGS = 'fetch-image-tags'
export type FetchImageTagsMessage = RegistryImages

export type RegistryImageTags = {
  name: string
  tags: string[]
}

export const WS_TYPE_REGISTRY_IMAGE_TAGS = 'registry-image-tags'
export type RegistryImageTagsMessage = {
  registryId: string
  images: RegistryImageTags[]
}

export const registryUrlOf = (it: RegistryDetails) => {
  switch (it.type) {
    case 'hub':
      return REGISTRY_HUB_URL
    case 'v2':
    case 'google':
      return it.url
    case 'gitlab':
      return it.selfManaged ? it.url : REGISTRY_GITLAB_URLS.registryUrl
    case 'github':
      return REGISTRY_GITHUB_URL
    default:
      return null
  }
}

export const registryDetailsToRegistry = (it: RegistryDetails): Registry => ({
  ...it,
  url: registryUrlOf(it),
})
