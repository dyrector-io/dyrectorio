import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDate } from 'class-validator'

export enum VersionType {
  incremental = 'incremental',
  rolling = 'rolling',
}

export class VersionDto {
  id: string

  name: string

  changelog?: string

  type: VersionType

  default: boolean

  increasable: boolean

  @Type(() => Date)
  @IsDate()
  @ApiProperty()
  updatedAt: Date
}
