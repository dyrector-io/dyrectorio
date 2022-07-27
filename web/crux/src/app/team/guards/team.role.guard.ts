import { CanActivate, ExecutionContext, Injectable, SetMetadata } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PrismaService } from 'src/services/prisma.service'
import { AccessRequest } from 'src/grpc/protobuf/proto/crux'

const TEAM_ROLE = 'team-role'

export type TeamRole = 'none' | 'member' | 'owner'

export const TeamRoleRequired = (role: TeamRole = 'member') => SetMetadata(TEAM_ROLE, role)

@Injectable()
export class TeamRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const role = this.reflector.get<TeamRole>(TEAM_ROLE, context.getHandler()) ?? 'member'

    if (role === 'none') {
      return true
    }

    const request = context.getArgByIndex<AccessRequest>(0)

    const team = await this.prisma.usersOnTeams.findFirst({
      rejectOnNotFound: false,
      where: {
        userId: request.accessedBy,
        active: true,
      },
    })

    return role === 'owner' ? team?.owner : !!team
  }
}
