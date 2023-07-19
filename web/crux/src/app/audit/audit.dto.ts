import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDate, IsIn, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator'
import { PaginatedList, PaginationQuery } from 'src/shared/dtos/paginating'

export class AuditDto {
  @Type(() => Date)
  @IsDate()
  createdAt: Date

  @IsUUID()
  createdBy: string

  @Type(() => Date)
  @IsDate()
  updatedAt: Date

  @IsUUID()
  updatedBy: string
}

export class AuditLogQueryDto extends PaginationQuery {
  @IsOptional()
  @IsString()
  readonly filter?: string

  @Type(() => Date)
  @IsDate()
  readonly from: Date

  @Type(() => Date)
  @IsDate()
  readonly to: Date
}

export const AUDIT_LOG_CONTEXT_VALUES = ['http', 'ws', 'rpc'] as const
export type AuditLogContextDto = (typeof AUDIT_LOG_CONTEXT_VALUES)[number]

export const AUDIT_LOG_REQUEST_METHOD_VALUES = ['get', 'post', 'put', 'patch', 'delete'] as const
export type AuditLogRequestMethodDto = (typeof AUDIT_LOG_REQUEST_METHOD_VALUES)[number]

export const AUDIT_LOG_ACTOR_TYPE_VALUES = ['user', 'deployment-token'] as const
export type AuditLogActorTypeDto = (typeof AUDIT_LOG_ACTOR_TYPE_VALUES)[number]

export class AuditLogUserDto {
  @IsString()
  id: string

  @IsString()
  email: string
}

export class AuditLogDto {
  @Type(() => Date)
  @IsDate()
  createdAt: Date

  @ApiProperty({ enum: AUDIT_LOG_REQUEST_METHOD_VALUES })
  @IsIn(AUDIT_LOG_REQUEST_METHOD_VALUES)
  actorType: AuditLogActorTypeDto

  @ValidateNested()
  @IsOptional()
  user?: AuditLogUserDto

  @IsString()
  name: string

  @ApiProperty({ enum: AUDIT_LOG_CONTEXT_VALUES })
  @IsIn(AUDIT_LOG_CONTEXT_VALUES)
  context: AuditLogContextDto

  @ApiProperty({ enum: AUDIT_LOG_REQUEST_METHOD_VALUES })
  @IsIn(AUDIT_LOG_REQUEST_METHOD_VALUES)
  @IsOptional()
  method?: AuditLogRequestMethodDto

  @IsString()
  event: string

  @IsOptional()
  data?: object
}

export class AuditLogListDto extends PaginatedList<AuditLogDto> {
  @Type(() => AuditLogDto)
  items: AuditLogDto[]

  total: number
}
