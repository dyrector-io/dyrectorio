import { AuditLog } from './audit'

export type Dashboard = {
  users: number
  auditLogEntries: number
  products: number
  versions: number
  deployments: number
  failedDeployments: number
  nodes: DashboardActiveNodes[]
  latestDeployments: DashboardDeployment[]
  auditLog: AuditLog[]
}

export type DashboardActiveNodes = {
  id: string
  name: string
  address: string
  version: string
}

export type DashboardDeployment = {
  id: string
  product: string
  version: string
  node: string
  changelog: string
  deployedAt: string
  productId: string
  versionId: string
}
