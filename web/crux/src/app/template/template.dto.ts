import { ApiProperty } from '@nestjs/swagger'
import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator'
import { PROJECT_TYPE_VALUES, ProjectTypeDto } from '../project/project.dto'

export class TemplateDto {
  @IsUUID()
  id: string

  @IsString()
  name: string

  @IsString()
  @IsOptional()
  description?: string

  @IsString({
    each: true,
  })
  technologies: string[]
}

export class CreateProjectFromTemplateDto {
  @IsString()
  id: string

  @IsString()
  teamSlug: string

  @IsString()
  name: string

  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({ enum: PROJECT_TYPE_VALUES })
  @IsIn(PROJECT_TYPE_VALUES)
  type: ProjectTypeDto
}
