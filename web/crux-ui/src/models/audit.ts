export type Audit = {
  updatedAt: string
  updatedBy?: string | null
  createdBy: string
  createdAt: string
}

export type AuditLog = {
  email: string
  createdAt: string
  serviceCall: string
  data?: any
}

export type AuditLogList = {
  items: AuditLog[]
  total: number
}

export type AuditLogQuery = {
  skip: number
  take: number
  from: string
  to: string
  filter?: string
}
