import { ExecutionContext, Injectable, SetMetadata } from '@nestjs/common'
import { Identity } from '@ory/kratos-client'
import { userIsAdmin, userIsOwner } from 'src/domain/user'
import { IdRequest } from 'src/grpc/protobuf/proto/crux'
import UserAccessGuard from 'src/shared/user-access.guard'

const TEAM_ROLE = 'team-role'

export type TeamRole = 'none' | 'user' | 'admin' | 'owner'

export const TeamRoleRequired = (role: TeamRole = 'user') => SetMetadata(TEAM_ROLE, role)

@Injectable()
export default class TeamRoleGuard extends UserAccessGuard<IdRequest> {
  async canActivateWithRequest(request: IdRequest, identity: Identity, context: ExecutionContext): Promise<boolean> {
    const role = this.reflector.get<TeamRole>(TEAM_ROLE, context.getHandler()) ?? 'user'

    if (role === 'none') {
      return true
    }

    const getActiveTeam = async () =>
      await this.prisma.usersOnTeams.findFirst({
        where: {
          userId: identity.id,
          active: true,
        },
      })

    const getTeamById = async () =>
      await this.prisma.usersOnTeams.findUnique({
        where: {
          userId_teamId: {
            userId: identity.id,
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
