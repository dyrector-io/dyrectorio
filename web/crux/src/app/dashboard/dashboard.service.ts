import { Injectable } from '@nestjs/common'
import { DeploymentStatusEnum } from '@prisma/client'
import { toTimestamp } from 'src/domain/utils'
import { AccessRequest, DashboardResponse } from 'src/grpc/protobuf/proto/crux'
import PrismaService from 'src/services/prisma.service'
import AuditService from '../audit/audit.service'
import DashboardMapper from './dashboard.mapper'

@Injectable()
export default class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: DashboardMapper,
    private readonly auditService: AuditService,
  ) {}

  public async getDashboard(request: AccessRequest): Promise<DashboardResponse> {
    const team = await this.prisma.usersOnTeams.findFirstOrThrow({
      select: {
        teamId: true,
      },
      where: {
        active: true,
        userId: request.accessedBy,
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

    const auditLog = await this.auditService.getAuditLog({
      accessedBy: request.accessedBy,
      pageNumber: 0,
      pageSize: 10,
      createdTo: toTimestamp(new Date()),
    })

    return {
      users,
      auditLogEntries,
      products,
      versions,
      deployments,
      failedDeployments,
      nodes: this.mapper.nodesToGrpc(activeNodes),
      latestDeployments: this.mapper.deploymentsToGrpc(latestDeployments),
      auditLog: auditLog.data,
    }
  }
}
