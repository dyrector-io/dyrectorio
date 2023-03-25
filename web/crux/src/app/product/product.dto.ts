import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsBoolean, IsIn, IsNumber, IsString } from 'class-validator'
import { AuditDto, BasicProductDto, ProductTypeDto, PRODUCT_TYPE_VALUES } from '../shared/shared.dto'
import { VersionDto } from '../version/version.dto'

export class ProductDto extends BasicProductDto {
  @IsString()
  description?: string

  audit: AuditDto
}

export class ProductListItemDto extends ProductDto {
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
  @ApiProperty({ enum: PRODUCT_TYPE_VALUES })
  @IsString()
  @IsIn(PRODUCT_TYPE_VALUES)
  type: ProductTypeDto
}
