import { Injectable } from '@nestjs/common'
import { Identity } from '@ory/kratos-client'
import { Team, UserInvitation, UserRoleEnum, UsersOnTeams } from '@prisma/client'
import {
  ActiveTeamDetailsResponse,
  TeamDetailsResponse,
  UserResponse,
  UserRole,
  UserStatus,
} from 'src/grpc/protobuf/proto/crux'
import { IdentityTraits, nameOfIdentity } from 'src/shared/model'

@Injectable()
export class TeamMapper {
  private userToGrpc(user: UsersOnTeams, identities: Map<string, Identity>): UserResponse {
    const identity = identities.get(user.userId)
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
      role: this.roleToGrpc(user.role),
      status: UserStatus.VERIFIED,
    }
  }

  private invitationToUserGrpc(inv: UserInvitation, identities: Map<string, Identity>): UserResponse {
    const identity = identities.get(inv.userId)

    return {
      id: inv.userId,
      email: inv.email,
      name: nameOfIdentity(identity),
      role: UserRole.USER,
      status: UserStatus.PENDING,
    }
  }

  private teamUsersToGrpc(team: TeamWithUsersAndInvitations, identities: Map<string, Identity>): UserResponse[] {
    const users = team.users.map(it => this.userToGrpc(it, identities)).filter(it => !!it)
    const invitations = team.invitations.map(it => this.invitationToUserGrpc(it, identities)).filter(it => !!it)

    return users.concat(invitations)
  }

  activeTeamDetailsToGrpc(
    team: TeamWithUsersAndInvitations,
    identities: Map<string, Identity>,
  ): ActiveTeamDetailsResponse {
    return {
      ...team,
      users: this.teamUsersToGrpc(team, identities),
    }
  }

  teamDetailsToGrpc(team: TeamDetails, identities: Map<string, Identity>): TeamDetailsResponse {
    return {
      id: team.id,
      name: team.name,
      users: this.teamUsersToGrpc(team, identities),
      statistics: {
        users: team._count.users + team._count.invitations,
        products: team._count.products,
        nodes: team._count.nodes,
        versions: team.products.flatMap(it => it._count.versions).reduce((prev, it) => prev + it, 0),
        deployments: team.products
          .flatMap(it => it.versions)
          .flatMap(it => it._count.deployments)
          .reduce((prev, it) => prev + it, 0),
      },
    }
  }

  roleToGrpc(role: UserRoleEnum): UserRole {
    switch (role) {
      case 'owner':
        return UserRole.OWNER
      case 'admin':
        return UserRole.ADMIN
      default:
        return UserRole.USER
    }
  }

  roleToDb(role: UserRole): UserRoleEnum {
    switch (role) {
      case UserRole.OWNER:
        return 'owner'
      case UserRole.ADMIN:
        return 'admin'
      default:
        return 'user'
    }
  }
}

type TeamWithUsersAndInvitations = Team & {
  users: UsersOnTeams[]
  invitations: UserInvitation[]
}

type TeamDetails = TeamWithUsersAndInvitations & {
  products: {
    _count: {
      versions: number
    }
    versions: {
      _count: {
        deployments: number
      }
    }[]
  }[]
  _count: {
    registries: number
    products: number
    nodes: number
    users: number
    invitations: number
  }
}
