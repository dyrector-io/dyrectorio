import { Injectable } from '@nestjs/common'
import { UsersOnTeams } from '@prisma/client'
import { PrismaService } from 'src/services/prisma.service'

@Injectable()
export class TeamRepository {
  constructor(private prisma: PrismaService) {}

  async getActiveTeamByUserId(userId: string): Promise<UsersOnTeams> {
    return await this.prisma.usersOnTeams.findFirst({
      where: {
        userId: userId,
        active: true,
      },
    })
  }

  async userHasTeam(userId: string): Promise<boolean> {
    const teams = await this.prisma.usersOnTeams.count({
      where: {
        userId: userId,
      },
    })

    return teams > 0
  }
}
