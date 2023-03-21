import { ApiExtraModels, ApiProperty, getSchemaPath, refs } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsBoolean,
  IsDate,
  IsIn,
  IsNotEmptyObject,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
} from 'class-validator'

export const REGISTRY_TYPE_VALUES = ['v2', 'hub', 'gitlab', 'github', 'google', 'unchecked'] as const
export type RegistryType = (typeof REGISTRY_TYPE_VALUES)[number]

export class BasicRegistryDto {
  @IsUUID()
  id: string

  @IsString()
  name: string

  // TODO (@polaroi8d): Missing the enum and the validator
  type: RegistryType
}

export const GITHUB_NAMESPACE_VALUES = ['organization', 'user'] as const
export const GITLAB_NAMESPACE_VALUES = ['group', 'project'] as const
export type GitlabNamespace = (typeof GITLAB_NAMESPACE_VALUES)[number]
export type GithubNamespace = (typeof GITHUB_NAMESPACE_VALUES)[number]

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

interface Test {}

export class HubRegistryDetailsDto implements Test {
  @IsString()
  @ApiProperty()
  imageNamePrefix: string
}

export class V2RegistryDetailsDto implements Test {
  @IsUrl()
  url: string

  @IsString()
  @IsOptional()
  user?: string

  @IsString()
  @IsOptional()
  token?: string
}

export class GitlabRegistryDetailsDto {
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
  namespace: GitlabNamespace
}

export class GithubRegistryDetailsDto {
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
  namespace: GithubNamespace
}

export class GoogleRegistryDetailsDto {
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

export class UncheckedRegistryDetailsDto {
  @IsUrl()
  url: string
}

const RegistryDetailsOneOf = () =>
  ApiProperty({
    oneOf: [
      { $ref: getSchemaPath(HubRegistryDetailsDto) },
      { $ref: getSchemaPath(V2RegistryDetailsDto) },
      { $ref: getSchemaPath(GitlabRegistryDetailsDto) },
      { $ref: getSchemaPath(GithubRegistryDetailsDto) },
      { $ref: getSchemaPath(GoogleRegistryDetailsDto) },
      { $ref: getSchemaPath(UncheckedRegistryDetailsDto) },
    ],
  })

const RegistryDetailsExtraModels = () =>
  ApiExtraModels(
    HubRegistryDetailsDto,
    V2RegistryDetailsDto,
    GitlabRegistryDetailsDto,
    GithubRegistryDetailsDto,
    GoogleRegistryDetailsDto,
    UncheckedRegistryDetailsDto,
  )

@RegistryDetailsExtraModels()
export class RegistryDetailsDto {
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

  @IsString()
  @IsIn(REGISTRY_TYPE_VALUES)
  @ApiProperty({
    enum: GITLAB_NAMESPACE_VALUES,
  })
  type: RegistryType

  @RegistryDetailsOneOf()
  @IsNotEmptyObject()
  details:
    | HubRegistryDetailsDto
    | V2RegistryDetailsDto
    | GitlabRegistryDetailsDto
    | GithubRegistryDetailsDto
    | GoogleRegistryDetailsDto
    | UncheckedRegistryDetailsDto
}

@RegistryDetailsExtraModels()
export class CreateRegistryDto {
  @IsString()
  name: string

  @IsString()
  @IsOptional()
  description?: string

  @IsString()
  @IsOptional()
  icon?: string

  @IsString()
  @IsIn(REGISTRY_TYPE_VALUES)
  @ApiProperty({
    enum: GITLAB_NAMESPACE_VALUES,
  })
  type: RegistryType

  @RegistryDetailsOneOf()
  @IsNotEmptyObject()
  details:
    | HubRegistryDetailsDto
    | V2RegistryDetailsDto
    | GitlabRegistryDetailsDto
    | GithubRegistryDetailsDto
    | GoogleRegistryDetailsDto
    | UncheckedRegistryDetailsDto
}

@RegistryDetailsExtraModels()
export class UpdateRegistryDto {
  @IsString()
  name: string

  @IsString()
  @IsOptional()
  description?: string

  @IsString()
  @IsOptional()
  icon?: string

  @IsString()
  @IsIn(REGISTRY_TYPE_VALUES)
  @ApiProperty({
    enum: GITLAB_NAMESPACE_VALUES,
  })
  type: RegistryType

  @RegistryDetailsOneOf()
  @IsNotEmptyObject()
  details:
    | HubRegistryDetailsDto
    | V2RegistryDetailsDto
    | GitlabRegistryDetailsDto
    | GithubRegistryDetailsDto
    | GoogleRegistryDetailsDto
    | UncheckedRegistryDetailsDto
}
