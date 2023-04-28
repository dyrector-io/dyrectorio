import { ApiProperty } from '@nestjs/swagger'
import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator'
import { ProductTypeDto, PRODUCT_TYPE_VALUES } from '../shared/shared.dto'

export class TemplateDto {
  @IsUUID()
  id: string

  @IsString()
  name: string

  @IsString()
  @IsOptional()
  description?: string

  @IsString({
    each: true,
  })
  technologies: string[]
}

export class CreateProductFromTemplateDto {
  @IsString()
  id: string

  @IsString()
  name: string

  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({ enum: PRODUCT_TYPE_VALUES })
  @IsIn(PRODUCT_TYPE_VALUES)
  type: ProductTypeDto
}
