import { Injectable } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import { DashboardDto } from './dashboard.dto'
import DashboardMapper, { DashboardTeam } from './dashboard.mapper'

type DashboardTeamComponents = Pick<DashboardTeam, 'deployment' | 'version' | 'image' | 'project'>

@Injectable()
export default class DashboardService {
  constructor(private readonly prisma: PrismaService, private readonly mapper: DashboardMapper) {}

  public async getDashboard(teamSlug: string): Promise<DashboardDto> {
    const team = await this.prisma.team.findFirstOrThrow({
      where: {
        slug: teamSlug,
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

    let dashboardTeam: DashboardTeam = {
      ...team,
      project: null,
      version: null,
      image: null,
      deployment: null,
    }

    let components = await this.dashboardFromDeployment(teamSlug)

    if (!components) {
      components = await this.dashboardFromVersion(teamSlug)

      if (!components) {
        components = await this.dashboardFromProject(teamSlug)
      }
    }

    if (components) {
      dashboardTeam = {
        ...dashboardTeam,
        ...components,
      }
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

  private async dashboardFromDeployment(teamSlug: string): Promise<DashboardTeamComponents> {
    const deployment = await this.prisma.deployment.findFirst({
      where: {
        version: {
          project: {
            team: {
              slug: teamSlug,
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

    if (!deployment) {
      return null
    }

    const {
      version,
      version: {
        images: [image],
        project,
      },
    } = deployment

    return {
      project,
      version,
      image,
      deployment,
    }
  }

  private async dashboardFromVersion(teamSlug: string): Promise<DashboardTeamComponents> {
    const version = await this.prisma.version.findFirst({
      where: {
        project: {
          team: {
            slug: teamSlug,
          },
        },
      },
      orderBy: [
        {
          images: {
            _count: 'desc',
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

    if (!version) {
      return null
    }

    const {
      images: [image],
      project,
    } = version

    return {
      project,
      version,
      image,
      deployment: null,
    }
  }

  private async dashboardFromProject(teamSlug: string): Promise<DashboardTeamComponents> {
    const project = await this.prisma.project.findFirst({
      where: {
        team: {
          slug: teamSlug,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      select: {
        id: true,
      },
    })

    if (!project) {
      return null
    }

    return {
      project,
      version: null,
      image: null,
      deployment: null,
    }
  }
}
