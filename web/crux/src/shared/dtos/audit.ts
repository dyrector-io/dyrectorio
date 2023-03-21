import { Type } from 'class-transformer'
import { IsDate, IsUUID } from 'class-validator'

export class AuditDto {
  @Type(() => Date)
  @IsDate()
  createdAt: Date

  @IsUUID()
  createdBy: string

  @Type(() => Date)
  @IsDate()
  updatedAt: Date

  @IsUUID()
  updatedBy?: string
}

type Audit = {
  createdBy: string
  createdAt: Date
  updatedBy?: string
  updatedAt: Date
}

export const toAuditDto = (it: Audit): AuditDto => ({
  createdAt: it.createdAt,
  createdBy: it.createdBy,
  updatedAt: it.updatedAt,
  updatedBy: it.updatedBy,
})
