import { Injectable } from '@nestjs/common'
import { Identity } from '@ory/kratos-client'
import PrismaService from 'src/services/prisma.service'
import { DashboardDto } from './dashboard.dto'
import DashboardMapper from './dashboard.mapper'

@Injectable()
export default class DashboardService {
  constructor(private readonly prisma: PrismaService, private readonly mapper: DashboardMapper) {}

  public async getDashboard(identity: Identity): Promise<DashboardDto> {
    const team = await this.prisma.team.findFirstOrThrow({
      where: {
        users: {
          some: {
            active: true,
            userId: identity.id,
          },
        },
      },
      select: {
        id: true,
        _count: {
          select: {
            users: true,
            auditLog: true,
            projects: true,
          },
        },
        nodes: {
          select: {
            id: true,
          },
          take: 1,
          orderBy: {
            createdAt: 'asc',
          },
        },
        projects: {
          select: {
            id: true,
            versions: {
              select: {
                id: true,
                images: {
                  select: {
                    id: true,
                  },
                  take: 1,
                  orderBy: {
                    createdAt: 'asc',
                  },
                },
                deployments: {
                  select: {
                    id: true,
                    status: true,
                  },
                  take: 1,
                  orderBy: {
                    createdAt: 'asc',
                  },
                },
              },
              take: 1,
              orderBy: {
                createdAt: 'asc',
              },
            },
          },
          take: 1,
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    })

    const versions = this.prisma.version.count({
      where: {
        project: {
          teamId: team.id,
        },
      },
    })

    const deployments = this.prisma.deployment.count({
      where: {
        version: {
          project: {
            teamId: team.id,
          },
        },
      },
    })

    const failedDeployments = this.prisma.deployment.count({
      where: {
        status: 'failed',
        version: {
          project: {
            teamId: team.id,
          },
        },
      },
    })

    const onboard = this.mapper.teamToOnboard(team)

    return {
      ...team._count,
      versions: await versions,
      deployments: await deployments,
      failedDeployments: await failedDeployments,
      onboarding: onboard,
    }
  }
}
