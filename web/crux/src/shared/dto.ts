/* eslint-disable import/prefer-default-export */
/* eslint-disable @typescript-eslint/lines-between-class-members */
export class AuditDto {
  createdBy: string
  createdAt: Date
  updatedBy?: string
  updatedAt: Date
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
