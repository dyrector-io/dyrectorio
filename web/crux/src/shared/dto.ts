/* eslint-disable import/prefer-default-export */
/* eslint-disable @typescript-eslint/lines-between-class-members */
export class AuditDto {
  createdBy: string
  createdAt: Date
  updatedBy: string | null
  updatedAt: Date | null
}

type Audit = {
  createdBy: string
  createdAt: Date
  updatedBy: string | null
  updatedAt: Date | null
}

export const toAuditDto = (it: Audit): AuditDto => ({
  createdAt: it.createdAt,
  createdBy: it.createdBy,
  updatedAt: it.updatedAt,
  updatedBy: it.updatedBy,
})
