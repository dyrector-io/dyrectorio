import { Type } from 'class-transformer'
import { IsDate } from 'class-validator'
import { AuditLogDto } from '../audit/audit.dto'
import { BasicNodeDto } from '../shared/shared.dto'

export class DashboardDeploymentDto {
  id: string

  product: string

  version: string

  node: string

  changelog: string

  @IsDate()
  @Type(() => Date)
  deployedAt: Date

  productId: string

  versionId: string
}

export class DashboardDto {
  users: number

  auditLogEntries: number

  products: number

  versions: number

  deployments: number

  failedDeployments: number

  nodes: BasicNodeDto[]

  latestDeployments: DashboardDeploymentDto[]

  auditLog: AuditLogDto[]
}
