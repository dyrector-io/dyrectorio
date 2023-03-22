import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsIn, IsString, IsUUID } from 'class-validator'
import { ProductTypeDto, PRODUCT_TYPE_VALUES } from '../product/product.dto'

export class TemplateDto {
  id: string
  name: string
  description?: string
  technologies: string[]
}

export class CreateProductFromTemplateDto {
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
}
