import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsBoolean, IsIn, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator'
import { VersionDto } from '../version/version.dto'
import { AuditDto } from '../audit/audit.dto'

export const PROJECT_TYPE_VALUES = ['simple', 'complex'] as const
export type ProjectTypeDto = (typeof PROJECT_TYPE_VALUES)[number]

export class BasicProjectDto {
  @IsUUID()
  id: string

  @IsString()
  name: string

  @ApiProperty({ enum: PROJECT_TYPE_VALUES })
  @IsIn(PROJECT_TYPE_VALUES)
  type: ProjectTypeDto
}

export class ProjectDto extends BasicProjectDto {
  @IsUUID()
  @IsOptional()
  @ApiProperty()
  description?: string | null

  @Type(() => AuditDto)
  audit: AuditDto
}

export class ProjectListItemDto extends ProjectDto {
  @IsNumber()
  @IsOptional()
  versionCount?: number
}

export class ProjectDetailsDto extends ProjectDto {
  @IsBoolean()
  deletable: boolean

  @Type(() => VersionDto)
  versions: VersionDto[]
}

export class UpdateProjectDto {
  @IsString()
  name: string

  @IsString()
  @IsOptional()
  description?: string | null

  @IsString()
  @IsOptional()
  changelog?: string | null
}

export class CreateProjectDto extends UpdateProjectDto {
  @ApiProperty({ enum: PROJECT_TYPE_VALUES })
  @IsIn(PROJECT_TYPE_VALUES)
  type: ProjectTypeDto
}
