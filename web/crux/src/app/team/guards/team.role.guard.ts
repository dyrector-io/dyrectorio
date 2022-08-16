import { CanActivate, ExecutionContext, Injectable, SetMetadata } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { userIsAdmin, userIsOwner } from 'src/domain/user'
import { IdRequest } from 'src/grpc/protobuf/proto/crux'
import { PrismaService } from 'src/services/prisma.service'

const TEAM_ROLE = 'team-role'

export type TeamRole = 'none' | 'user' | 'admin' | 'owner'

export const TeamRoleRequired = (role: TeamRole = 'user') => SetMetadata(TEAM_ROLE, role)

@Injectable()
export class TeamRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const role = this.reflector.get<TeamRole>(TEAM_ROLE, context.getHandler()) ?? 'user'

    if (role === 'none') {
      return true
    }

    const request = context.getArgByIndex<IdRequest>(0)

    const getActiveTeam = async () =>
      await this.prisma.usersOnTeams.findFirst({
        where: {
          userId: request.accessedBy,
          active: true,
        },
      })

    const getTeamById = async () =>
      await this.prisma.usersOnTeams.findUnique({
        where: {
          userId_teamId: {
            userId: request.accessedBy,
            teamId: request.id,
          },
        },
      })

    const userOnTeam = await (request.id ? getTeamById() : getActiveTeam())

    switch (role) {
      case 'owner':
        return userIsOwner(userOnTeam)
      case 'admin':
        return userIsAdmin(userOnTeam)
      default:
        return !!userOnTeam
    }
  }
}
