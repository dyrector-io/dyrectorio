import { Type } from 'class-transformer'
import { IsBoolean, IsEnum, IsString, IsUUID } from 'class-validator'
import { AuditDto } from 'src/shared/dtos/audit'
import BasicDeploymentWithNodeDto from '../deploy/deploy.dto'
import ImageDto from '../image/image.dto'

export enum VersionTypeDto {
  incremental = 'incremental',
  rolling = 'rolling',
}

export class BasicVersionDto {
  @IsUUID()
  id: string

  @IsString()
  name: string

  @IsEnum(VersionTypeDto)
  type: VersionTypeDto
}

export class VersionDto extends BasicVersionDto {
  @Type(() => AuditDto)
  audit: AuditDto

  @IsString()
  changelog: string

  @IsBoolean()
  default: boolean

  @IsBoolean()
  increasable: boolean
}

export class UpdateVersionDto {
  @IsString()
  name: string

  @IsString()
  changelog?: string
}

export class CreateVersionDto extends UpdateVersionDto {
  @IsEnum(VersionTypeDto)
  type: VersionTypeDto
}

export class IncreaseVersionDto extends UpdateVersionDto {}

export class VersionDetailsDto extends VersionDto {
  @IsBoolean()
  mutable: boolean

  @IsBoolean()
  deletable: boolean

  @Type(() => ImageDto)
  images: ImageDto[]

  deployments: BasicDeploymentWithNodeDto[]
}
