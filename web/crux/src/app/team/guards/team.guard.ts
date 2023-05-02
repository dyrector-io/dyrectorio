import { CanActivate, ExecutionContext, Injectable, SetMetadata } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { identityOfRequest } from 'src/app/token/jwt-auth.guard'
import { userIsAdmin, userIsOwner } from 'src/domain/user'
import PrismaService from 'src/services/prisma.service'

const TEAM_ROLE = 'team-role'

export type TeamRole = 'none' | 'user' | 'admin' | 'owner'

export const TeamRoleRequired = (role: TeamRole = 'user') => SetMetadata(TEAM_ROLE, role)

@Injectable()
export default class TeamGuard implements CanActivate {
  constructor(private prisma: PrismaService, private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const teamId = req.params.teamId as string

    const requiredRole = this.reflector.get<TeamRole>(TEAM_ROLE, context.getHandler()) ?? 'user'

    if (!teamId) {
      return requiredRole === 'none'
    }

    const identity = identityOfRequest(context)

    const userOnTeam = await this.prisma.usersOnTeams.findUniqueOrThrow({
      where: {
        userId_teamId: {
          userId: identity.id,
          teamId,
        },
      },
    })

    switch (requiredRole) {
      case 'owner':
        return userIsOwner(userOnTeam)
      case 'admin':
        return userIsAdmin(userOnTeam)
      case 'user':
        return !!userOnTeam
      default:
        return false
    }
  }
}
