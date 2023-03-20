import { ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsBoolean, IsDate, IsIn, IsOptional, IsString, IsUrl, IsUUID } from 'class-validator'

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
  @IsUUID()
  id: string

  @IsString()
  name: string

  @IsString()
  @IsOptional()
  description?: string

  @IsString()
  @IsOptional()
  icon?: string

  @IsUrl()
  url: string

  @ApiProperty({
    enum: REGISTRY_TYPE_VALUES,
  })
  @IsString()
  @IsIn(REGISTRY_TYPE_VALUES)
  type: RegistryType
}

export class RegistryList {
  data: RegistryDto[]
}

export class HubRegistryDetails {
  @IsString()
  imageNamePrefix: string
}

export class V2RegistryDetails {
  @IsUrl()
  url: string

  @IsString()
  @IsOptional()
  user?: string

  @IsString()
  @IsOptional()
  token?: string
}

export class GitlabRegistryDetails {
  @IsString()
  user: string

  @IsString()
  token: string

  @IsString()
  imageNamePrefix: string

  @IsUrl()
  @IsOptional()
  url?: string

  @IsUrl()
  @IsOptional()
  apiUrl?: string

  @ApiProperty({
    enum: GITLAB_NAMESPACE_VALUES,
  })
  @IsString()
  @IsIn(GITLAB_NAMESPACE_VALUES)
  namespace: RegistryNamespace
}

export class GithubRegistryDetails {
  @IsString()
  user: string

  @IsString()
  token: string

  @IsString()
  imageNamePrefix: string

  @ApiProperty({
    enum: GITHUB_NAMESPACE_VALUES,
  })
  @IsString()
  @IsIn(GITHUB_NAMESPACE_VALUES)
  namespace: RegistryNamespace
}

export class GoogleRegistryDetails {
  @IsUrl()
  url: string

  @IsString()
  @IsOptional()
  user?: string

  @IsString()
  @IsOptional()
  token?: string

  @IsString()
  imageNamePrefix: string
}

export class UncheckedRegistryDetails {
  @IsUrl()
  url: string
}

export class RegistryDetails {
  @IsUUID()
  id: string

  @IsString()
  name: string

  @IsString()
  @IsOptional()
  description?: string

  @IsString()
  @IsOptional()
  icon?: string

  @IsBoolean()
  inUse: boolean

  @Type(() => Date)
  @IsDate()
  createdAt: Date

  @Type(() => Date)
  @IsDate()
  updatedAt: Date

  @IsOptional()
  hub?: HubRegistryDetails

  @IsOptional()
  v2?: V2RegistryDetails

  @IsOptional()
  gitlab?: GitlabRegistryDetails

  @IsOptional()
  github?: GithubRegistryDetails

  @IsOptional()
  google?: GoogleRegistryDetails

  @IsOptional()
  unchecked?: UncheckedRegistryDetails
}

export class CreateRegistry {
  @IsString()
  name: string

  @IsString()
  @IsOptional()
  description?: string

  @IsString()
  @IsOptional()
  icon?: string

  @IsOptional()
  hub?: HubRegistryDetails

  @IsOptional()
  v2?: V2RegistryDetails

  @IsOptional()
  gitlab?: GitlabRegistryDetails

  @IsOptional()
  github?: GithubRegistryDetails

  @IsOptional()
  google?: GoogleRegistryDetails

  @IsOptional()
  unchecked?: UncheckedRegistryDetails
}

export class TestRegistry {
  name: string

  description?: string

  icon?: string

  @ApiProperty({
    oneOf: [
      { $ref: getSchemaPath(HubRegistryDetails) },
      { $ref: getSchemaPath(V2RegistryDetails) },
      { $ref: getSchemaPath(GitlabRegistryDetails) },
      { $ref: getSchemaPath(GithubRegistryDetails) },
      { $ref: getSchemaPath(GoogleRegistryDetails) },
      { $ref: getSchemaPath(UncheckedRegistryDetails) },
    ],
  })
  details:
    | HubRegistryDetails
    | V2RegistryDetails
    | GitlabRegistryDetails
    | GithubRegistryDetails
    | GoogleRegistryDetails
    | UncheckedRegistryDetails
}

export class UpdateRegistry {
  @IsString()
  name: string

  @IsString()
  @IsOptional()
  description?: string

  @IsString()
  @IsOptional()
  icon?: string

  @IsOptional()
  hub?: HubRegistryDetails

  @IsOptional()
  v2?: V2RegistryDetails

  @IsOptional()
  gitlab?: GitlabRegistryDetails

  @IsOptional()
  github?: GithubRegistryDetails

  @IsOptional()
  google?: GoogleRegistryDetails

  @IsOptional()
  unchecked?: UncheckedRegistryDetails
}
