import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDate, IsOptional, IsUUID } from 'class-validator'

export default class DateAuditProperties {
  @Type(() => Date)
  @IsDate()
  @ApiProperty()
  createdAt: Date

  @IsUUID()
  @ApiProperty()
  createdBy: string

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  @ApiProperty()
  updatedAt: Date

  @IsUUID()
  @IsOptional()
  @ApiProperty()
  updatedBy: string
}
