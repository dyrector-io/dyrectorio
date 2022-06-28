import { Injectable } from '@nestjs/common'
import { Identity } from '@ory/kratos-client'
import { Team, UserInvitation, UsersOnTeams } from '@prisma/client'
import { TeamDetailsResponse, UserResponse, UserRole, UserStatus } from 'src/grpc/protobuf/proto/crux'
import { IdentityTraits, nameOfIdentity } from 'src/shared/model'

@Injectable()
export class TeamMapper {
  detailsToGrpc(team: TeamWithUsersAndInvitations, identities: Identity[]): TeamDetailsResponse {
    const users = team.users
      .map(user => {
        const identity = identities.find(it => it.id === user.userId)
        if (!identity) {
          return null
        }

        const traits = identity.traits as IdentityTraits
        if (!traits) {
          return null
        }

        return {
          id: user.userId,
          name: nameOfIdentity(identity),
          email: traits.email,
          role: user.owner ? UserRole.OWNER : UserRole.USER,
          status: UserStatus.VERIFIED,
        } as UserResponse
      })
      .filter(it => !!it)

    const invitations = team.invitations
      .map(inv => {
        const identity = identities.find(it => it.id === inv.userId)

        return {
          id: inv.userId,
          email: inv.email,
          name: nameOfIdentity(identity),
          role: UserRole.USER,
          status: UserStatus.PENDING,
        } as UserResponse
      })
      .filter(it => !!it)

    return {
      ...team,
      users: users.concat(invitations),
    }
  }
}

type TeamWithUsersAndInvitations = Team & {
  users: UsersOnTeams[]
  invitations: UserInvitation[]
}
