import { IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator'
import DateAuditProperties from 'src/shared/dtos/audit-dates'

export enum ProductTypeDto {
  simple = 'simple',
  complex = 'complex',
}

export class ProductsDto extends DateAuditProperties {
  @IsUUID()
  id: string

  @IsString()
  name: string

  @IsString()
  @IsOptional()
  description?: string | undefined

  @IsEnum(ProductTypeDto)
  type: ProductTypeDto
}

export class ProductListDetailsDto extends ProductsDto {
  @IsNumber()
  @IsOptional()
  versionCount: number
}

export class ProductListDto {
  data: ProductListDetailsDto[]
}

export class CreateProductDto {
  @IsString()
  name: string

  @IsString()
  @IsOptional()
  description?: string

  @IsEnum(ProductTypeDto)
  type: ProductTypeDto
}

export class UpdateProductDto extends CreateProductDto {
  @IsUUID()
  id: string
}
