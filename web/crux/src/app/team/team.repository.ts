import { Injectable } from '@nestjs/common'
import { Prisma, UsersOnTeams } from '@prisma/client'
import { typedQuery } from 'src/domain/utils'
import PrismaService from 'src/services/prisma.service'

@Injectable()
export default class TeamRepository {
  constructor(private prisma: PrismaService) {}

  async getActiveTeamByUserId(userId: string): Promise<UsersOnTeams> {
    return await this.prisma.usersOnTeams.findFirstOrThrow({
      where: {
        userId,
        active: true,
      },
    })
  }

  async userHasTeam(userId: string): Promise<boolean> {
    const teams = await this.prisma.usersOnTeams.count({
      where: {
        userId,
      },
    })

    return teams > 0
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
