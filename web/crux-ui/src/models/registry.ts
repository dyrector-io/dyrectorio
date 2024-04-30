import { REGISTRY_GITHUB_URL, REGISTRY_GITLAB_URLS, REGISTRY_HUB_URL } from '@app/const'

export const REGISTRY_TYPE_VALUES = ['v2', 'hub', 'gitlab', 'github', 'google', 'unchecked'] as const
export type RegistryType = (typeof REGISTRY_TYPE_VALUES)[number]

export const PUBLIC_REGISTRY_TYPES: RegistryType[] = ['hub', 'v2', 'google']

export const GITHUB_NAMESPACE_VALUES = ['organization', 'user'] as const
export const GITLAB_NAMESPACE_VALUES = ['group', 'project'] as const
export type GitlabNamespace = (typeof GITLAB_NAMESPACE_VALUES)[number]
export type GithubNamespace = (typeof GITHUB_NAMESPACE_VALUES)[number]
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
  imageUrlPrefix: string
}

export type RegistryDetailsBase = Omit<Registry, 'url'> & {
  updatedAt: string
  inUse: boolean
  registryToken?: RegistryToken | null
}

export type RegistryToken = {
  id: string
  createdAt: string
  expiresAt?: string | null
}

export type CreateRegistryToken = {
  expirationInDays?: number
}

export type RegistryTokenCreated = RegistryToken & {
  token: string
  config: string
}

type EditableRegistryCredentials = {
  changeCredentials: boolean
  user: string
  token: string
}

type HubRegistryDetailsBase = {
  type: 'hub'
  imageNamePrefix: string
  public: boolean
}

export type HubRegistryDetails = RegistryDetailsBase & HubRegistryDetailsBase
export type EditableHubRegistryDetails = EditableRegistryCredentials & HubRegistryDetails

type V2RegistryDetailsBase = {
  type: 'v2'
  url: string
  public: boolean
}

export type V2RegistryDetails = RegistryDetailsBase & V2RegistryDetailsBase
export type EditableV2RegistryDetails = EditableRegistryCredentials & V2RegistryDetails

type GitlabRegistryDetailsBase = {
  type: 'gitlab'
  imageNamePrefix: string
  selfManaged?: boolean
  namespace: RegistryNamespace
  url?: string
  apiUrl?: string
}

export type GitlabRegistryDetails = RegistryDetailsBase & GitlabRegistryDetailsBase
export type EditableGitlabRegistryDetails = EditableRegistryCredentials & GitlabRegistryDetails

type GithubRegistryDetailsBase = {
  type: 'github'
  imageNamePrefix: string
  namespace: RegistryNamespace
}

export type GithubRegistryDetails = RegistryDetailsBase & GithubRegistryDetailsBase
export type EditableGithubRegistryDetails = EditableRegistryCredentials & GithubRegistryDetails

type GoogleRegistryDetailsBase = {
  type: 'google'
  url: string
  imageNamePrefix: string
  public: boolean
}

export type GoogleRegistryDetails = RegistryDetailsBase & GoogleRegistryDetailsBase
export type EditableGoogleRegistryDetails = EditableRegistryCredentials & GoogleRegistryDetails

type UncheckedRegistryDetailsBase = {
  type: 'unchecked'
  local?: boolean
  url: string
}

export type UncheckedRegistryDetails = RegistryDetailsBase & UncheckedRegistryDetailsBase

type UpsertDetailsDto<T> = Omit<T & Partial<EditableRegistryCredentials>, 'type' | 'changeCredentials'>

export type RegistryDetails = RegistryDetailsBase &
  (
    | HubRegistryDetails
    | V2RegistryDetails
    | GitlabRegistryDetails
    | GithubRegistryDetails
    | GoogleRegistryDetails
    | UncheckedRegistryDetails
  )

export type EditableRegistry = RegistryDetailsBase &
  EditableRegistryCredentials &
  (
    | EditableHubRegistryDetails
    | EditableV2RegistryDetails
    | EditableGitlabRegistryDetails
    | EditableGithubRegistryDetails
    | EditableGoogleRegistryDetails
    | UncheckedRegistryDetails
  )

// crux dto
export type RegistryDetailsDto = RegistryDetails & {
  createdAt: string
  details: Omit<
    | HubRegistryDetailsBase
    | V2RegistryDetailsBase
    | GitlabRegistryDetailsBase
    | GithubRegistryDetailsBase
    | GoogleRegistryDetailsBase
    | UncheckedRegistryDetailsBase,
    'type'
  >
}

type UpsertRegistryDtoBase = Omit<
  RegistryDetails,
  'id' | 'updatedAt' | 'createdAt' | 'inUse' | 'token' | 'changeCredentials' | 'imageUrlPrefix'
>
export type CreateRegistryDto = UpsertRegistryDtoBase & {
  details: Omit<
    | ((
        | HubRegistryDetailsBase
        | V2RegistryDetailsBase
        | GitlabRegistryDetailsBase
        | GithubRegistryDetailsBase
        | GoogleRegistryDetailsBase
      ) &
        Partial<EditableRegistryCredentials>)
    | UncheckedRegistryDetailsBase,
    'type' | 'changeCredentials'
  >
}
export type UpdateRegistryDto = CreateRegistryDto

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

export const registryDetailsDtoToUI = (dto: RegistryDetailsDto): RegistryDetails => {
  const registry = {
    id: dto.id,
    inUse: dto.inUse,
    name: dto.name,
    description: dto.description,
    icon: dto.icon ?? null,
    updatedAt: dto.updatedAt ?? dto.createdAt,
    type: dto.type,
    registryToken: dto.registryToken,
    changeCredentials: false,
  }

  switch (dto.type) {
    case 'hub':
    case 'v2':
    case 'google': {
      const details = dto.details as HubRegistryDetails | V2RegistryDetails | GoogleRegistryDetails

      return {
        ...registry,
        ...details,
      }
    }
    case 'gitlab': {
      const details = dto.details as GitlabRegistryDetails
      return {
        ...registry,
        ...details,
        selfManaged: !!details.apiUrl,
        namespace: details.namespace,
      }
    }
    case 'github': {
      const details = dto.details as GithubRegistryDetails
      return {
        ...registry,
        ...details,
        namespace: details.namespace,
      }
    }
    case 'unchecked': {
      const details = dto.details as UncheckedRegistryDetails
      return {
        ...registry,
        ...details,
        local: details.url === '',
      }
    }
    default:
      throw new Error(`Unknown registry type on: ${dto}`)
  }
}

export const editableRegistryToDto = (ui: EditableRegistry): CreateRegistryDto => {
  const dto: UpsertRegistryDtoBase = {
    name: ui.name,
    description: ui.description,
    icon: ui.icon,
    type: ui.type,
  }

  switch (ui.type) {
    case 'hub': {
      const details: UpsertDetailsDto<HubRegistryDetailsBase> = {
        imageNamePrefix: ui.imageNamePrefix,
        public: ui.public,
        user: !ui.public && ui.changeCredentials ? ui.user : null,
        token: !ui.public && ui.changeCredentials ? ui.token : null,
      }

      return {
        ...dto,
        details,
      }
    }
    case 'v2': {
      const details: UpsertDetailsDto<V2RegistryDetailsBase> = {
        url: ui.url,
        public: ui.public,
        user: !ui.public && ui.changeCredentials ? ui.user : null,
        token: !ui.public && ui.changeCredentials ? ui.token : null,
      }

      return {
        ...dto,
        details,
      }
    }
    case 'google': {
      const details: UpsertDetailsDto<GoogleRegistryDetailsBase> = {
        imageNamePrefix: ui.imageNamePrefix,
        url: ui.url,
        public: ui.public,
        user: !ui.public && ui.changeCredentials ? ui.user : null,
        token: !ui.public && ui.changeCredentials ? ui.token : null,
      }

      return {
        ...dto,
        details,
      }
    }
    case 'gitlab': {
      const details: UpsertDetailsDto<GitlabRegistryDetailsBase> = {
        imageNamePrefix: ui.imageNamePrefix,
        url: ui.selfManaged ? ui.url : null,
        apiUrl: ui.selfManaged ? ui.apiUrl : null,
        namespace: ui.namespace,
        user: ui.changeCredentials ? ui.user : null,
        token: ui.changeCredentials ? ui.token : null,
      }

      return {
        ...dto,
        details,
      }
    }
    case 'github': {
      const details: UpsertDetailsDto<GithubRegistryDetailsBase> = {
        imageNamePrefix: ui.imageNamePrefix,
        namespace: ui.namespace,
        user: ui.changeCredentials ? ui.user : null,
        token: ui.changeCredentials ? ui.token : null,
      }

      return {
        ...dto,
        details,
      }
    }
    case 'unchecked': {
      const details: Omit<UncheckedRegistryDetailsBase, 'type'> = {
        url: ui.url,
        local: ui.local,
      }

      return {
        ...dto,
        details,
      }
    }
    default:
      throw new Error(`Unknown registry type on: ${dto}`)
  }
}

export const imageUrlOfImageName = (image: string): string => {
  let [name] = image.split(':')

  if (name.includes('.') && !name.includes('docker.io') && !name.includes(REGISTRY_HUB_URL)) {
    return name
  }

  // hub image

  name = name.replace('index.docker.io/', '').replace('docker.io/', '').replace(REGISTRY_HUB_URL, '')

  if (name.includes('/') || name.startsWith('library')) {
    return `${REGISTRY_HUB_URL}/${name}`
  }

  return `${REGISTRY_HUB_URL}/library/${name}`
}

export const findRegistryByUrl = (registries: Registry[], url: string) =>
  registries.filter(it => it.type !== 'unchecked').find(it => url.startsWith(it.imageUrlPrefix))
