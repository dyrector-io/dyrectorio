import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsBoolean, IsIn, IsNumber, IsString, IsUUID } from 'class-validator'
import { AuditDto } from 'src/shared/dtos/audit'
import { VersionDto } from '../version/version.dto'

export const PRODUCT_TYPE_VALUES = ['simple', 'complex'] as const
export type ProductTypeDto = (typeof PRODUCT_TYPE_VALUES)[number]

export class ProductDto extends AuditDto {
  @IsUUID()
  id: string

  @IsString()
  name: string

  @IsString()
  description?: string

  @ApiProperty({
    enum: PRODUCT_TYPE_VALUES,
  })
  @IsString()
  @IsIn(PRODUCT_TYPE_VALUES)
  type: ProductTypeDto

  @IsNumber()
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
  description?: string

  @IsString()
  changelog?: string
}

export class CreateProductDto extends UpdateProductDto {
  @ApiProperty({
    enum: PRODUCT_TYPE_VALUES,
  })
  @IsString()
  @IsIn(PRODUCT_TYPE_VALUES)
  type: ProductTypeDto
}
