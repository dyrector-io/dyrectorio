import { Injectable } from '@nestjs/common'
import { Identity } from '@ory/kratos-client'
import { DeploymentStatusEnum } from '@prisma/client'
import PrismaService from 'src/services/prisma.service'
import AuditService from '../audit/audit.service'
import DashboardResponse from './dashboard.dto'
import DashboardMapper from './dashboard.mapper'

@Injectable()
export default class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: DashboardMapper,
    private readonly auditService: AuditService,
  ) {}

  public async getDashboard(identity: Identity): Promise<DashboardResponse> {
    const team = await this.prisma.usersOnTeams.findFirstOrThrow({
      select: {
        teamId: true,
      },
      where: {
        active: true,
        userId: identity.id,
      },
    })

    const teamFilter = {
      where: {
        teamId: team.teamId,
      },
    }

    const users = await this.prisma.usersOnTeams.count(teamFilter)
    const auditLogEntries = await this.prisma.auditLog.count(teamFilter)
    const products = await this.prisma.product.count(teamFilter)

    const versions = await this.prisma.version.count({
      where: {
        product: {
          teamId: team.teamId,
        },
      },
    })

    const deployments = await this.prisma.deployment.count({
      where: {
        version: {
          product: {
            teamId: team.teamId,
          },
        },
      },
    })

    const failedDeployments = await this.prisma.deployment.count({
      where: {
        version: {
          product: {
            teamId: team.teamId,
          },
        },
        status: DeploymentStatusEnum.failed,
      },
    })

    const activeNodes = await this.prisma.node.findMany({
      ...teamFilter,
      select: {
        id: true,
        name: true,
      },
    })

    const latestDeployments = await this.prisma.deployment.findMany({
      where: {
        version: {
          product: {
            teamId: team.teamId,
          },
        },
      },
      select: {
        id: true,
        createdAt: true,
        version: {
          select: {
            name: true,
            id: true,
            changelog: true,
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        node: {
          select: {
            name: true,
          },
        },
      },
      take: 2,
      orderBy: { createdAt: 'desc' },
    })

    const auditTo = new Date()
    const auditFrom = new Date(auditTo)
    auditFrom.setMonth(auditTo.getMonth() - 1)

    const auditLog = await this.auditService.getAuditLog(
      {
        skip: 0,
        take: 10,
        from: auditFrom,
        to: auditTo,
      },
      identity,
    )

    return {
      users,
      auditLogEntries,
      products,
      versions,
      deployments,
      failedDeployments,
      nodes: this.mapper.nodesToProto(activeNodes),
      latestDeployments: this.mapper.deploymentsToProto(latestDeployments),
      auditLog: auditLog.items,
    }
  }
}
