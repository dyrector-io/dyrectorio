import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { typedQuery } from 'src/domain/utils'
import PrismaService from 'src/services/prisma.service'

@Injectable()
export default class TeamRepository {
  constructor(private prisma: PrismaService) {}

  async getTeamIdBySlug(teamSlug: string): Promise<string> {
    const team = await this.prisma.team.findFirstOrThrow({
      where: {
        slug: teamSlug,
      },
      select: {
        id: true,
      },
    })

    return team.id
  }

  async userIsInTeam(teamSlug: string, userId: string): Promise<boolean> {
    const usersOnTeams = await this.prisma.usersOnTeams.count({
      where: {
        userId,
        team: {
          slug: teamSlug,
        },
      },
    })

    return usersOnTeams > 0
  }

  public readonly teamInclude = typedQuery<Prisma.TeamInclude>()({
    _count: {
      select: {
        users: true,
        invitations: true,
        projects: true,
        nodes: true,
        registries: true,
      },
    },
    projects: {
      select: {
        _count: {
          select: {
            versions: true,
          },
        },
        versions: {
          select: {
            _count: {
              select: {
                deployments: true,
              },
            },
          },
        },
      },
    },
    users: true,
    invitations: true,
  })
}
