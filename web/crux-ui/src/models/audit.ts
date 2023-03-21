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

const AUDIT_LOG_EVENT_PREFIX = '/crux.Crux'
export const beautifyAuditLogEvent = (event: string): string => {
  let parts = event.split(AUDIT_LOG_EVENT_PREFIX)
  if (parts.length < 2) {
    return event
  }

  parts = parts[1].split('/')
  return parts.length < 2 ? parts[1] : `${parts[0]}: ${parts[1]}`
}
