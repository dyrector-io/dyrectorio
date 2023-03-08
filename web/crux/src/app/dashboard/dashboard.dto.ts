import { AuditLogResponseDto } from '../audit/audit.dto'

export default class DashboardResponse {
  users: number

  auditLogEntries: number

  products: number

  versions: number

  deployments: number

  failedDeployments: number

  nodes: any[] // TODO(@polaroi8d): Need to change the any types to the correct types

  latestDeployments: any[] // TODO(@polaroi8d): Need to change the any types to the correct types

  auditLog: AuditLogResponseDto[]
}
