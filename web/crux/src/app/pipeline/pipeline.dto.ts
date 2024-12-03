import { ApiProperty, OmitType } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDate, IsIn, IsOptional, IsPositive, IsString, IsUUID, ValidateNested } from 'class-validator'
import {
  AZURE_DEV_OPS_RUN_RESULT_VALUES,
  AZURE_DEV_OPS_RUN_STATE_VALUES,
  AZURE_DEV_OPS_STATE_CHANGED_EVENT_TYPE_VALUES,
  AzureDevOpsRunResult,
  AzureDevOpsRunState,
} from 'src/domain/pipeline'
import { PaginatedList, PaginationQuery } from 'src/shared/dtos/paginating'
import { AuditDto } from '../audit/audit.dto'
import { UniqueKeyValueDto } from '../container/container.dto'
import { BasicRegistryDto } from '../registry/registry.dto'
import { BasicUserDto } from '../team/user.dto'

export const PIPELINE_TYPE_VALUES = ['gitlab', 'github', 'azure'] as const
export type PipelineTypeDto = (typeof PIPELINE_TYPE_VALUES)[number]

export const PIPELINE_RUN_STATUS_VALUES = ['unknown', 'queued', 'running', 'successful', 'failed'] as const
export type PipelineRunStatusDto = (typeof PIPELINE_RUN_STATUS_VALUES)[number]

export const PIPELINE_TRIGGER_EVENT_VALUES = ['image-push', 'image-pull'] as const
export type PipelineTriggerEventDto = (typeof PIPELINE_TRIGGER_EVENT_VALUES)[number]

export class PipelineRunQueryDto extends PaginationQuery {}

export class BasicPipelineDto {
  @IsUUID()
  id: string

  @IsString()
  name: string

  @ApiProperty({ enum: PIPELINE_TYPE_VALUES })
  @IsIn(PIPELINE_TYPE_VALUES)
  type: PipelineTypeDto
}

export class PipelineRunDto {
  @IsUUID()
  id: string

  @Type(() => Date)
  @IsDate()
  startedAt: Date

  @IsOptional()
  @ValidateNested()
  startedBy?: BasicUserDto

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  finishedAt?: Date | null

  @ApiProperty({ enum: PIPELINE_RUN_STATUS_VALUES })
  @IsIn(PIPELINE_RUN_STATUS_VALUES)
  status: PipelineRunStatusDto
}

export class PaginatedPipelineRunListDto extends PaginatedList<PipelineRunDto> {
  @Type(() => PipelineRunDto)
  items: PipelineRunDto[]

  total: number
}

export class PipelineEventWatcherFiltersDto {
  @IsString()
  @IsOptional()
  imageNameStartsWith: string
}

export class CreatePipelineEventWatcherDto {
  @IsString()
  name: string

  @ApiProperty({ enum: PIPELINE_TRIGGER_EVENT_VALUES })
  @IsIn(PIPELINE_TRIGGER_EVENT_VALUES)
  event: PipelineTriggerEventDto

  @ValidateNested()
  filters: PipelineEventWatcherFiltersDto

  @IsUUID()
  registryId: string

  @ValidateNested({ each: true })
  triggerInputs: UniqueKeyValueDto[]
}

export class UpdatePipelineEventWatcherDto extends CreatePipelineEventWatcherDto {}

export class PipelineEventWatcherDto extends OmitType(CreatePipelineEventWatcherDto, ['registryId']) {
  @IsUUID()
  id: string

  @Type(() => Date)
  @IsDate()
  createdAt: Date

  @ValidateNested()
  registry: BasicRegistryDto
}

export class AzureDevOpsRepositoryDto {
  @IsString()
  organization: string

  @IsString()
  project: string

  @IsString()
  @IsOptional()
  branch?: string
}

export class PipelineTriggerDto {
  @IsString()
  name: string

  @ValidateNested({ each: true })
  inputs: UniqueKeyValueDto[]
}

export class PipelineDto extends BasicPipelineDto {
  @IsString()
  @IsOptional()
  description?: string | null

  @IsString()
  @IsOptional()
  icon?: string | null

  @Type(() => AzureDevOpsRepositoryDto)
  @ValidateNested()
  repository: AzureDevOpsRepositoryDto

  @IsString()
  trigger: string

  @Type(() => PipelineRunDto)
  @ValidateNested()
  @IsOptional()
  lastRun?: PipelineRunDto | null
}

export class PipelineDetailsDto extends OmitType(PipelineDto, ['trigger']) {
  @Type(() => AuditDto)
  @ValidateNested()
  audit: AuditDto

  @Type(() => PipelineTriggerDto)
  @ValidateNested()
  trigger: PipelineTriggerDto

  @ValidateNested({ each: true })
  eventWatchers: PipelineEventWatcherDto[]
}

export class CreatePipelineDto extends OmitType(PipelineDetailsDto, ['id', 'audit']) {
  @IsString()
  token: string
}

export class UpdatePipelineDto extends OmitType(CreatePipelineDto, ['token']) {
  @IsString()
  @IsOptional()
  token?: string | null
}

export class TriggerPipelineDto {
  @IsOptional()
  @ValidateNested({ each: true })
  inputs: UniqueKeyValueDto[]
}

export class AzureDevOpsRunDto {
  @IsPositive()
  id: number

  @ApiProperty({ enum: AZURE_DEV_OPS_RUN_STATE_VALUES })
  @IsIn(AZURE_DEV_OPS_RUN_STATE_VALUES)
  state: AzureDevOpsRunState

  @ApiProperty({ enum: AZURE_DEV_OPS_RUN_RESULT_VALUES })
  @IsIn(AZURE_DEV_OPS_RUN_RESULT_VALUES)
  @IsOptional()
  result: AzureDevOpsRunResult

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  finishedDate?: Date | null
}

export class AzureDevOpsResourceDto {
  @Type(() => AzureDevOpsRunDto)
  @ValidateNested()
  run: AzureDevOpsRunDto
}

export class AzurePipelineStateDto {
  @ApiProperty({ enum: AZURE_DEV_OPS_STATE_CHANGED_EVENT_TYPE_VALUES })
  @IsIn(AZURE_DEV_OPS_STATE_CHANGED_EVENT_TYPE_VALUES)
  eventType: string

  @Type(() => AzureDevOpsResourceDto)
  @ValidateNested()
  resource: AzureDevOpsResourceDto
}
