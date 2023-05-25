export type Audit = {
  updatedAt: string
  updatedBy?: string | null
  createdBy: string
  createdAt: string
}

export const AUDIT_LOG_CONTEXT_VALUES = ['http', 'ws', 'rpc'] as const
export type AuditLogContext = typeof AUDIT_LOG_CONTEXT_VALUES[number]

export const AUDIT_LOG_REQUEST_METHOD_VALUES = ['get', 'post', 'put', 'patch', 'delete'] as const
export type AuditLogRequestMethod = typeof AUDIT_LOG_REQUEST_METHOD_VALUES[number]

export type AuditLog = {
  email: string
  createdAt: string
  context: AuditLogContext
  method?: AuditLogRequestMethod
  event: string
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

export const auditToMethod = (audit: AuditLog): string => {
  switch (audit.context) {
    case 'ws':
      return 'WebSocket'
    case 'http':
      return audit.method?.toUpperCase() ?? ''
    default:
      return 'gRpc'
  }
}
