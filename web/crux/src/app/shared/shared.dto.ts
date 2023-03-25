import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDate, IsIn, IsString, IsUUID } from 'class-validator'
import { NodeType, NODE_TYPE_VALUES } from 'src/shared/models'

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
  updatedBy?: string
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

export const PRODUCT_TYPE_VALUES = ['simple', 'complex'] as const
export type ProductTypeDto = (typeof PRODUCT_TYPE_VALUES)[number]

export class BasicProductDto {
  @IsUUID()
  id: string

  @IsString()
  name: string

  @ApiProperty({ enum: PRODUCT_TYPE_VALUES })
  @IsString()
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

  @ApiProperty({
    enum: VERSION_TYPE_VALUES,
  })
  @IsString()
  @IsIn(VERSION_TYPE_VALUES)
  type: VersionTypeDto
}
