import { REGISTRY_GITHUB_URL, REGISTRY_GITLAB_URLS, REGISTRY_HUB_URL } from '@app/const'

export const REGISTRY_TYPE_VALUES = ['v2', 'hub', 'gitlab', 'github', 'google', 'unchecked'] as const
export type RegistryType = typeof REGISTRY_TYPE_VALUES[number]

export const GITHUB_NAMESPACE_VALUES = ['organization', 'user'] as const
export const GITLAB_NAMESPACE_VALUES = ['group', 'project'] as const
export type GitlabNamespace = typeof GITLAB_NAMESPACE_VALUES[number]
export type GithubNamespace = typeof GITHUB_NAMESPACE_VALUES[number]
export type RegistryNamespace = GitlabNamespace | GithubNamespace

export type Registry = {
  id: string
  icon?: string
  name: string
  description?: string
  url: string
  type: RegistryType
}

export type BasicRegistry = Registry

export type RegistryDetailsBase = {
  inUse: boolean
}

type HubRegistryDetailsDto = {
  type: 'hub'
  imageNamePrefix: string
}
export type HubRegistryDetails = RegistryDetailsBase & HubRegistryDetailsDto

type V2RegistryDetailsDto = {
  type: 'v2'
  url: string
  private: boolean
  user?: string
  token?: string
}
export type V2RegistryDetails = RegistryDetailsBase & V2RegistryDetailsDto

type GitlabRegistryDetailsDto = {
  type: 'gitlab'
  imageNamePrefix: string
  user: string
  token: string
  selfManaged: boolean
  namespace: RegistryNamespace
  url?: string
  apiUrl?: string
}
export type GitlabRegistryDetails = RegistryDetailsBase & GitlabRegistryDetailsDto

type GithubRegistryDetailsDto = {
  type: 'github'
  imageNamePrefix: string
  user: string
  token: string
  namespace: RegistryNamespace
}
export type GithubRegistryDetails = RegistryDetailsBase & GithubRegistryDetailsDto

type GoogleRegistryDetailsDto = {
  type: 'google'
  url: string
  imageNamePrefix: string
  private: boolean
  user?: string
  token?: string
}
export type GoogleRegistryDetails = RegistryDetailsBase & GoogleRegistryDetailsDto

type UncheckedRegistryDetailsDto = {
  type: 'unchecked'
  url: string
}
export type UncheckedRegistryDetails = RegistryDetailsBase & UncheckedRegistryDetailsDto

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
    inUse: boolean
  }

export type UpdateRegistry = RegistryDetails
export type CreateRegistry = UpdateRegistry

// crux dto
export class RegistryDetailsDto {
  id: string

  name: string

  description?: string

  icon?: string

  inUse: boolean

  createdAt: string

  updatedAt: string

  hub?: HubRegistryDetailsDto

  v2?: V2RegistryDetailsDto

  gitlab?: GitlabRegistryDetailsDto

  github?: GithubRegistryDetailsDto

  google?: GoogleRegistryDetailsDto

  unchecked?: UncheckedRegistryDetailsDto
}

export class CreateRegistryDto {
  name: string

  description?: string

  icon?: string

  hub?: HubRegistryDetailsDto

  v2?: V2RegistryDetailsDto

  gitlab?: GitlabRegistryDetailsDto

  github?: GithubRegistryDetailsDto

  google?: GoogleRegistryDetailsDto

  unchecked?: UncheckedRegistryDetailsDto
}

export class UpdateRegistryDto {
  name: string

  description?: string

  icon?: string

  hub?: HubRegistryDetailsDto

  v2?: V2RegistryDetailsDto

  gitlab?: GitlabRegistryDetailsDto

  github?: GithubRegistryDetailsDto

  google?: GoogleRegistryDetailsDto

  unchecked?: UncheckedRegistryDetailsDto
}

export class RegistryListDto {
  data: BasicRegistry[]
}

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

// mappers

export const registryUrlOf = (it: RegistryDetails) => {
  switch (it.type) {
    case 'hub':
      return REGISTRY_HUB_URL
    case 'v2':
    case 'google':
    case 'unchecked':
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

export const registryDetailDtoToUI = (dto: RegistryDetailsDto): RegistryDetails => ({
  id: dto.id,
  inUse: dto.inUse,
  name: dto.name,
  description: dto.description,
  icon: dto.icon ?? null,
  updatedAt: dto.updatedAt ?? dto.createdAt,
  ...(dto.hub
    ? {
        type: 'hub',
        ...dto.hub,
      }
    : dto.v2
    ? {
        type: 'v2',
        ...dto.v2,
        private: !!dto.v2.user,
      }
    : dto.gitlab
    ? {
        type: 'gitlab',
        ...dto.gitlab,
        selfManaged: !!dto.gitlab.apiUrl,
        namespace: dto.gitlab.namespace,
      }
    : dto.github
    ? {
        type: 'github',
        ...dto.github,
        namespace: dto.github.namespace,
      }
    : dto.unchecked
    ? {
        type: 'unchecked',
        ...dto.unchecked,
      }
    : {
        type: 'google',
        ...dto.google,
        private: !!dto.google.user,
      }),
})

export const registryCreateToDto = (ui: CreateRegistry): CreateRegistryDto => ({
  name: ui.name,
  description: ui.description,
  icon: ui.icon,
  hub:
    ui.type !== 'hub'
      ? null
      : {
          type: 'hub',
          imageNamePrefix: ui.imageNamePrefix,
        },
  v2:
    ui.type !== 'v2'
      ? null
      : {
          type: 'v2',
          url: ui.url,
          user: ui.user,
          token: ui.token,
          private: ui.private,
        },
  gitlab:
    ui.type !== 'gitlab'
      ? null
      : {
          type: 'gitlab',
          user: ui.user,
          token: ui.token,
          imageNamePrefix: ui.imageNamePrefix,
          url: ui.selfManaged ? ui.url : null,
          apiUrl: ui.selfManaged ? ui.apiUrl : null,
          namespace: ui.namespace,
          selfManaged: ui.selfManaged,
        },
  github:
    ui.type !== 'github'
      ? null
      : {
          type: 'github',
          user: ui.user,
          token: ui.token,
          imageNamePrefix: ui.imageNamePrefix,
          namespace: ui.namespace,
        },
  google:
    ui.type !== 'google'
      ? null
      : {
          type: 'google',
          url: ui.url,
          imageNamePrefix: ui.imageNamePrefix,
          user: ui.user,
          token: ui.token,
          private: ui.private,
        },
  unchecked:
    ui.type !== 'unchecked'
      ? null
      : {
          type: 'unchecked',
          url: ui.url,
        },
})
