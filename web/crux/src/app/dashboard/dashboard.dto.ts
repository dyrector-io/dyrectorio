import { AuditLogDto } from '../audit/audit.dto'
import { BasicNodeDto } from '../node/node.dto'

export default class DashboardDto {
  users: number

  auditLogEntries: number

  products: number

  versions: number

  deployments: number

  failedDeployments: number

  nodes: BasicNodeDto[]

  latestDeployments: any[] // TODO(@polaroi8d): Need to change the any types to the correct types

  auditLog: AuditLogDto[]
}
