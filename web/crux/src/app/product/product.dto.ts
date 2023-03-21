import { Type } from 'class-transformer'
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator'
import { AuditDto } from 'src/shared/dtos/audit'
import { VersionDto } from '../version/version.dto'

export enum ProductTypeDto {
  simple = 'simple',
  complex = 'complex',
}

export class ProductDto extends AuditDto {
  @IsUUID()
  id: string

  @IsString()
  name: string

  @IsString()
  @IsOptional()
  description?: string

  @IsEnum(ProductTypeDto)
  type: ProductTypeDto

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
  description?: string

  @IsString()
  @IsOptional()
  changelog?: string
}

export class CreateProductDto extends UpdateProductDto {
  @IsEnum(ProductTypeDto)
  type: ProductTypeDto
}
