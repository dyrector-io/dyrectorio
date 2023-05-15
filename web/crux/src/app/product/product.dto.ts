import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsBoolean, IsIn, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator'
import { VersionDto } from '../version/version.dto'
import { AuditDto } from '../audit/audit.dto'

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

export class ProductDto extends BasicProductDto {
  @IsUUID()
  @IsOptional()
  @ApiProperty()
  description?: string | null

  @Type(() => AuditDto)
  audit: AuditDto
}

export class ProductListItemDto extends ProductDto {
  @IsNumber()
  @IsOptional()
  versionCount?: number
}

export class ProductDetailsDto extends ProductDto {
  @IsBoolean()
  deletable: boolean

  @Type(() => VersionDto)
  versions: VersionDto[]
}

export class UpdateProductDto {
  @IsString()
  name: string

  @IsString()
  @IsOptional()
  description?: string | null

  @IsString()
  @IsOptional()
  changelog?: string | null
}

export class CreateProductDto extends UpdateProductDto {
  @ApiProperty({ enum: PRODUCT_TYPE_VALUES })
  @IsIn(PRODUCT_TYPE_VALUES)
  type: ProductTypeDto
}
