import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDate } from 'class-validator'

/* eslint-disable @typescript-eslint/lines-between-class-members */
export const REGISTRY_TYPE_VALUES = ['v2', 'hub', 'gitlab', 'github', 'google', 'unchecked'] as const
export type RegistryType = (typeof REGISTRY_TYPE_VALUES)[number]

export class BasicRegistryDto {
  id: string
  name: string
  type: RegistryType
}

export const GITHUB_NAMESPACE_VALUES = ['organization', 'user'] as const
export const GITLAB_NAMESPACE_VALUES = ['group', 'project'] as const
export type GitlabNamespace = (typeof GITLAB_NAMESPACE_VALUES)[number]
export type GithubNamespace = (typeof GITHUB_NAMESPACE_VALUES)[number]
export type RegistryNamespace = GitlabNamespace | GithubNamespace

export class RegistryDto {
  id: string

  name: string

  description?: string

  icon?: string

  url: string

  @ApiProperty({
    enum: REGISTRY_TYPE_VALUES,
  })
  type: RegistryType
}

export class RegistryList {
  data: RegistryDto[]
}

export class HubRegistryDetails {
  imageNamePrefix: string
}

export class V2RegistryDetails {
  url: string

  user?: string

  token?: string
}

export class GitlabRegistryDetails {
  user: string

  token: string

  imageNamePrefix: string

  url?: string

  apiUrl?: string

  @ApiProperty({
    enum: GITLAB_NAMESPACE_VALUES,
  })
  namespace: RegistryNamespace
}

export class GithubRegistryDetails {
  user: string

  token: string

  imageNamePrefix: string

  @ApiProperty({
    enum: GITHUB_NAMESPACE_VALUES,
  })
  namespace: RegistryNamespace
}

export class GoogleRegistryDetails {
  url: string

  user?: string

  token?: string

  imageNamePrefix: string
}

export class UncheckedRegistryDetails {
  url: string
}

export class RegistryDetails {
  id: string

  name: string

  description?: string

  icon?: string

  inUse: boolean

  @Type(() => Date)
  @IsDate()
  createdAt: Date

  @Type(() => Date)
  @IsDate()
  updatedAt: Date

  hub?: HubRegistryDetails

  v2?: V2RegistryDetails

  gitlab?: GitlabRegistryDetails

  github?: GithubRegistryDetails

  google?: GoogleRegistryDetails

  unchecked?: UncheckedRegistryDetails
}

export class CreateRegistry {
  name: string

  description?: string

  icon?: string

  hub?: HubRegistryDetails

  v2?: V2RegistryDetails

  gitlab?: GitlabRegistryDetails

  github?: GithubRegistryDetails

  google?: GoogleRegistryDetails

  unchecked?: UncheckedRegistryDetails
}

export class UpdateRegistry {
  name: string

  description?: string

  icon?: string

  hub?: HubRegistryDetails

  v2?: V2RegistryDetails

  gitlab?: GitlabRegistryDetails

  github?: GithubRegistryDetails

  google?: GoogleRegistryDetails

  unchecked?: UncheckedRegistryDetails
}
