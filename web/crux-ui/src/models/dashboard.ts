import { AuditLog } from './audit'

export type Dashboard = {
  users: number
  auditLogEntries: number
  projects: number
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
  project: string
  version: string
  node: string
  changelog: string
  deployedAt: string
  projectId: string
  versionId: string
}
