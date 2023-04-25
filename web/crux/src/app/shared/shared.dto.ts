import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDate, IsIn, IsOptional, IsString, IsUUID } from 'class-validator'

export const NODE_CONNECTION_STATUS_VALUES = ['unreachable', 'connected'] as const
export type NodeConnectionStatus = (typeof NODE_CONNECTION_STATUS_VALUES)[number]

export const NODE_TYPE_VALUES = ['docker', 'k8s'] as const
export type NodeType = (typeof NODE_TYPE_VALUES)[number]

export type BasicProperties = 'id' | 'name' | 'type'

export class ContainerIdentifierDto {
  @IsString()
  prefix: string

  @IsString()
  name: string
}

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

export class BasicNodeDto {
  @IsUUID()
  id: string

  @IsString()
  name: string

  @ApiProperty({ enum: NODE_TYPE_VALUES })
  @IsIn(NODE_TYPE_VALUES)
  type: NodeType
}

export class BasicNodeWithStatus extends BasicNodeDto {
  @IsString()
  @IsIn(NODE_CONNECTION_STATUS_VALUES)
  @ApiProperty({
    enum: NODE_CONNECTION_STATUS_VALUES,
  })
  @IsOptional()
  status?: NodeConnectionStatus
}

export const PRODUCT_TYPE_VALUES = ['simple', 'complex'] as const
export type ProductTypeDto = (typeof PRODUCT_TYPE_VALUES)[number]

export class BasicProductDto {
  @IsUUID()
  id: string

  @IsString()
  name: string

  @ApiProperty({ enum: PRODUCT_TYPE_VALUES })
  @IsIn(PRODUCT_TYPE_VALUES)
  type: ProductTypeDto
}

export const VERSION_TYPE_VALUES = ['incremental', 'rolling'] as const
export type VersionTypeDto = (typeof VERSION_TYPE_VALUES)[number]

export class BasicVersionDto {
  @IsUUID()
  id: string

  @IsString()
  name: string

  @ApiProperty({ enum: VERSION_TYPE_VALUES })
  @IsIn(VERSION_TYPE_VALUES)
  type: VersionTypeDto
}

export class BasicTeamDto {
  @IsUUID()
  id: string

  @IsString()
  name: string
}
