import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator'
import DateAuditProperties from 'src/shared/dtos/audit-dates'
import { VersionDto } from '../version/version.dto'

export enum ProductTypeDto {
  simple = 'simple',
  complex = 'complex',
}

export class BasicProductDto extends DateAuditProperties {
  @IsUUID()
  id: string

  @IsString()
  name: string

  @IsString()
  @IsOptional()
  description?: string | undefined

  @IsEnum(ProductTypeDto)
  type: ProductTypeDto

  @IsNumber()
  @IsOptional()
  versionCount?: number
}

export class ProductDetailsDto extends BasicProductDto {
  @IsBoolean()
  deletable: boolean

  versions: VersionDto[]
}

export class ProductListDto {
  data: BasicProductDto[]
}

export class UpdateProductDto {
  @IsString()
  name: string

  @IsString()
  @IsOptional()
  description?: string

  @IsString()
  @IsOptional()
  changelog?: string
}

export class CreateProductDto extends UpdateProductDto {
  @IsEnum(ProductTypeDto)
  type: ProductTypeDto
}
