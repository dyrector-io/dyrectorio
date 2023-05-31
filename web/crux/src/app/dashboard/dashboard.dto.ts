import { Type } from 'class-transformer'
import { IsDate } from 'class-validator'
import { AuditLogDto } from '../audit/audit.dto'
import { BasicNodeDto } from '../node/node.dto'

export class DashboardDeploymentDto {
  id: string

  project: string

  version: string

  node: string

  changelog: string

  @IsDate()
  @Type(() => Date)
  deployedAt: Date

  projectId: string

  versionId: string
}

export class DashboardDto {
  users: number

  auditLogEntries: number

  projects: number

  versions: number

  deployments: number

  failedDeployments: number

  nodes: BasicNodeDto[]

  latestDeployments: DashboardDeploymentDto[]

  auditLog: AuditLogDto[]
}
