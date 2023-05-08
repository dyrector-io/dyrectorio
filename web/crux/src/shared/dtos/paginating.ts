import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsInt, ValidateNested } from 'class-validator'

export class PaginationQuery {
  @IsInt()
  @Type(() => Number)
  @ApiProperty()
  readonly skip: number

  @IsInt()
  @Type(() => Number)
  @ApiProperty()
  readonly take: number
}

export class PaginatedList<T> {
  @ValidateNested({ each: true })
  items: T[]

  @IsInt()
  total: number
}
