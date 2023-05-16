import { Injectable } from '@nestjs/common'
import { AuditDto } from './audit.dto'

@Injectable()
export default class AuditMapper {
  toDto(it: Audit): AuditDto {
    return {
      createdAt: it.createdAt,
      createdBy: it.createdBy,
      updatedAt: it.updatedAt,
      updatedBy: it.updatedBy ? it.updatedBy : it.createdBy,
    }
  }
}

type Audit = {
  createdAt: Date
  createdBy: string
  updatedAt: Date
  updatedBy: string
}
