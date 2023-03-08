import { Type } from 'class-transformer'
import { IsDate, IsString } from 'class-validator'
import { PaginatedList, PaginationQuery } from 'src/shared/paginating'

export class AuditLogQuery extends PaginationQuery {
  readonly filter?: string

  @Type(() => Date)
  @IsDate()
  readonly from: Date

  @Type(() => Date)
  @IsDate()
  readonly to: Date
}

export class AuditLogListDto extends PaginatedList<AuditLogDto> {}

// TODO(@polaroi8d) Remove the Dto after removing gRPC
export class AuditLogDto {
  @Type(() => Date)
  @IsDate()
  createdAt: Date

  @IsString()
  userId: string

  @IsString()
  email: string

  @IsString()
  serviceCall: string

  data?: object
}
