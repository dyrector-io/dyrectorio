import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsBoolean,
  IsDate,
  IsIn,
  IsNotEmptyObject,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  ValidateIf,
} from 'class-validator'

export const REGISTRY_TYPE_VALUES = ['v2', 'hub', 'gitlab', 'github', 'google', 'unchecked'] as const
export type RegistryType = (typeof REGISTRY_TYPE_VALUES)[number]

const propertyIsPresent = (property: string) => (dto: any) => {
  const value = dto[property]
  return typeof value !== 'undefined'
}

const propertyIsTrue = (property: string) => (dto: any) => {
  const value = dto[property]
  return value === true
}

const privateAndPropertyIsPresent =
  (property: string) =>
  (dto: any): boolean => {
    const pub = dto.public
    if (pub) {
      return false
    }

    return propertyIsPresent(property)(dto)
  }

export class BasicRegistryDto {
  @IsUUID()
  id: string

  @IsString()
  name: string

  @ApiProperty({ enum: REGISTRY_TYPE_VALUES })
  @IsIn(REGISTRY_TYPE_VALUES)
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
  description?: string | null

  @IsString()
  @IsOptional()
  icon?: string | null

  @IsUrl()
  url: string

  @ApiProperty({
    enum: REGISTRY_TYPE_VALUES,
  })
  @IsString()
  @IsIn(REGISTRY_TYPE_VALUES)
  type: RegistryType
}

export class HubRegistryDetailsDto {
  @IsString()
  @ApiProperty()
  imageNamePrefix: string

  @IsBoolean()
  public: boolean
}

export class V2RegistryDetailsDto {
  @IsUrl()
  url: string

  @IsBoolean()
  public: boolean
}

export class GitlabRegistryDetailsDto {
  @IsString()
  imageNamePrefix: string

  @IsUrl()
  @IsOptional()
  url?: string | null

  @IsUrl()
  @IsOptional()
  apiUrl?: string | null

  @ApiProperty({
    enum: GITLAB_NAMESPACE_VALUES,
  })
  @IsString()
  @IsIn(GITLAB_NAMESPACE_VALUES)
  namespace: GitlabNamespace
}

export class GithubRegistryDetailsDto {
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

  @IsBoolean()
  public: boolean

  @IsString()
  imageNamePrefix: string
}

export class UncheckedRegistryDetailsDto {
  @IsUrl()
  url: string
}

export class CreateHubRegistryDetailsDto extends HubRegistryDetailsDto {
  @IsString()
  @IsOptional()
  @ValidateIf(privateAndPropertyIsPresent('token'))
  user?: string

  @IsString()
  @IsOptional()
  @ValidateIf(privateAndPropertyIsPresent('user'))
  token?: string
}

export class CreateV2RegistryDetailsDto extends V2RegistryDetailsDto {
  @IsString()
  @IsOptional()
  @ValidateIf(privateAndPropertyIsPresent('token'))
  user?: string

  @IsString()
  @IsOptional()
  @ValidateIf(privateAndPropertyIsPresent('user'))
  token?: string
}

export class CreateGitlabRegistryDetailsDto extends GitlabRegistryDetailsDto {
  @IsString()
  user: string

  @IsString()
  token: string
}

export class CreateGithubRegistryDetailsDto extends GithubRegistryDetailsDto {
  @IsString()
  user: string

  @IsString()
  token: string
}

export class CreateGoogleRegistryDetailsDto extends GoogleRegistryDetailsDto {
  @IsString()
  @IsOptional()
  @ValidateIf(privateAndPropertyIsPresent('token'))
  user?: string

  @IsString()
  @IsOptional()
  @ValidateIf(privateAndPropertyIsPresent('user'))
  token?: string
}

export class CreateUncheckedRegistryDetailsDto {
  @IsUrl()
  @ValidateIf(propertyIsTrue('local'))
  url: string

  @IsBoolean()
  local: boolean
}

export class UpdateHubRegistryDetailsDto extends CreateHubRegistryDetailsDto {}

export class UpdateV2RegistryDetailsDto extends CreateV2RegistryDetailsDto {}

export class UpdateGitlabRegistryDetailsDto extends GitlabRegistryDetailsDto {
  @IsString()
  @ValidateIf(propertyIsPresent('token'))
  user?: string

  @IsString()
  @ValidateIf(propertyIsPresent('user'))
  token?: string
}

export class UpdateGithubRegistryDetailsDto extends GithubRegistryDetailsDto {
  @IsString()
  @ValidateIf(propertyIsPresent('token'))
  user?: string

  @IsString()
  @ValidateIf(propertyIsPresent('user'))
  token?: string
}

export class UpdateGoogleRegistryDetailsDto extends CreateGoogleRegistryDetailsDto {}
export class UpdateUncheckedRegistryDetailsDto extends CreateUncheckedRegistryDetailsDto {}

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
  description?: string | null

  @IsString()
  @IsOptional()
  icon?: string | null

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

const RegistryCreateDetailsOneOf = () =>
  ApiProperty({
    oneOf: [
      { $ref: getSchemaPath(CreateHubRegistryDetailsDto) },
      { $ref: getSchemaPath(CreateV2RegistryDetailsDto) },
      { $ref: getSchemaPath(CreateGitlabRegistryDetailsDto) },
      { $ref: getSchemaPath(CreateGithubRegistryDetailsDto) },
      { $ref: getSchemaPath(CreateGoogleRegistryDetailsDto) },
      { $ref: getSchemaPath(CreateUncheckedRegistryDetailsDto) },
    ],
  })

const RegistryCreateDetailsExtraModels = () =>
  ApiExtraModels(
    CreateHubRegistryDetailsDto,
    CreateV2RegistryDetailsDto,
    CreateGitlabRegistryDetailsDto,
    CreateGithubRegistryDetailsDto,
    CreateGoogleRegistryDetailsDto,
    CreateUncheckedRegistryDetailsDto,
  )

@RegistryCreateDetailsExtraModels()
export class CreateRegistryDto {
  @IsString()
  name: string

  @IsString()
  @IsOptional()
  description?: string | null

  @IsString()
  @IsOptional()
  icon?: string | null

  @IsIn(REGISTRY_TYPE_VALUES)
  @ApiProperty({
    enum: GITLAB_NAMESPACE_VALUES,
  })
  type: RegistryType

  @RegistryCreateDetailsOneOf()
  @IsNotEmptyObject()
  details:
    | CreateHubRegistryDetailsDto
    | CreateV2RegistryDetailsDto
    | CreateGitlabRegistryDetailsDto
    | CreateGithubRegistryDetailsDto
    | CreateGoogleRegistryDetailsDto
    | CreateUncheckedRegistryDetailsDto
}

const RegistryUpdateDetailsOneOf = () =>
  ApiProperty({
    oneOf: [
      { $ref: getSchemaPath(UpdateHubRegistryDetailsDto) },
      { $ref: getSchemaPath(UpdateV2RegistryDetailsDto) },
      { $ref: getSchemaPath(UpdateGitlabRegistryDetailsDto) },
      { $ref: getSchemaPath(UpdateGithubRegistryDetailsDto) },
      { $ref: getSchemaPath(UpdateGoogleRegistryDetailsDto) },
      { $ref: getSchemaPath(UpdateUncheckedRegistryDetailsDto) },
    ],
  })

const RegistryUpdateDetailsExtraModels = () =>
  ApiExtraModels(
    UpdateHubRegistryDetailsDto,
    UpdateV2RegistryDetailsDto,
    UpdateGitlabRegistryDetailsDto,
    UpdateGithubRegistryDetailsDto,
    UpdateGoogleRegistryDetailsDto,
    UpdateUncheckedRegistryDetailsDto,
  )

@RegistryUpdateDetailsExtraModels()
export class UpdateRegistryDto {
  @IsString()
  name: string

  @IsString()
  @IsOptional()
  description?: string | null

  @IsString()
  @IsOptional()
  icon?: string | null

  @IsString()
  @IsIn(REGISTRY_TYPE_VALUES)
  @ApiProperty({
    enum: GITLAB_NAMESPACE_VALUES,
  })
  type: RegistryType

  @RegistryUpdateDetailsOneOf()
  @IsNotEmptyObject()
  details:
    | UpdateHubRegistryDetailsDto
    | UpdateV2RegistryDetailsDto
    | UpdateGitlabRegistryDetailsDto
    | UpdateGithubRegistryDetailsDto
    | UpdateGoogleRegistryDetailsDto
    | UncheckedRegistryDetailsDto
}
