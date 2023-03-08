import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsInt } from 'class-validator'

/* eslint-disable @typescript-eslint/lines-between-class-members */
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
  items: T[]
  total: number
}
