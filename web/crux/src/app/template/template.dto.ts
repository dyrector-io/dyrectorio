import { ApiProperty } from '@nestjs/swagger'
import { IsIn, IsString, IsUUID } from 'class-validator'
import { ProductTypeDto, PRODUCT_TYPE_VALUES } from '../shared/shared.dto'

export class TemplateDto {
  @IsUUID()
  id: string

  @IsString()
  name: string

  @IsString()
  description?: string

  @IsString({
    each: true,
  })
  technologies: string[]
}

export class CreateProductFromTemplateDto {
  @IsUUID()
  id: string

  @IsString()
  name: string

  @IsString()
  description?: string

  @ApiProperty({ enum: PRODUCT_TYPE_VALUES })
  @IsIn(PRODUCT_TYPE_VALUES)
  type: ProductTypeDto
}
