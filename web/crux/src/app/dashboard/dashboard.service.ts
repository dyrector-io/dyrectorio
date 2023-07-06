import { Injectable } from '@nestjs/common'
import { Identity } from '@ory/kratos-client'
import PrismaService from 'src/services/prisma.service'
import { DashboardDto } from './dashboard.dto'
import DashboardMapper, { DashboardTeam } from './dashboard.mapper'

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
      },
    })

    const dashboardTeam: DashboardTeam = {
      ...team,
      project: null,
      version: null,
      image: null,
      deployment: null,
    }

    await this.dashboardFromDeployment(dashboardTeam, identity)

    if (dashboardTeam.version == null) {
      await this.dashboardFromVersion(dashboardTeam, identity)
    }
    if (dashboardTeam.project == null) {
      await this.dashboardFromProject(dashboardTeam, identity)
    }

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

    const onboard = this.mapper.teamToOnboard(dashboardTeam)

    return {
      ...team._count,
      versions: await versions,
      deployments: await deployments,
      failedDeployments: await failedDeployments,
      onboarding: onboard,
    }
  }

  private async dashboardFromDeployment(dashboardTeam: DashboardTeam, identity: Identity) {
    const deployment = await this.prisma.deployment.findFirst({
      where: {
        version: {
          project: {
            team: {
              users: {
                some: {
                  userId: identity.id,
                  active: true,
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      select: {
        id: true,
        status: true,
        node: {
          select: {
            id: true,
          },
        },
        version: {
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
            project: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    })

    if (deployment) {
      dashboardTeam.deployment = deployment
      dashboardTeam.version = deployment.version
      dashboardTeam.image = deployment.version.images[0]
      dashboardTeam.project = deployment.version.project
    }
  }

  private async dashboardFromVersion(dashboardTeam: DashboardTeam, identity: Identity) {
    const version = await this.prisma.version.findFirst({
      where: {
        project: {
          team: {
            users: {
              some: {
                userId: identity.id,
                active: true,
              },
            },
          },
        },
      },
      orderBy: [
        {
          images: {
            _count: "desc",
          },
        },
        {
          createdAt: 'asc',
        },
      ],
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
        project: {
          select: {
            id: true,
          },
        },
      },
    })

    if (version) {
      dashboardTeam.version = version
      dashboardTeam.image = version.images[0]
      dashboardTeam.project = version.project
    }
  }

  private async dashboardFromProject(dashboardTeam: DashboardTeam, identity: Identity) {
    const project = await this.prisma.project.findFirst({
      where: {
        team: {
          users: {
            some: {
              userId: identity.id,
              active: true,
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      select: {
        id: true,
      },
    })

    if (project) {
      dashboardTeam.project = project
    }
  }
}
