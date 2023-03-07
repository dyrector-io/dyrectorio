export type AuditLog = {
  identityEmail: string
  date: string
  serviceCall: string
  data?: any
}

export type AuditLogListRequest = {
  pageNumber: number
  pageSize: number
  keyword?: string
  createdFrom?: string
  createdTo: string
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
