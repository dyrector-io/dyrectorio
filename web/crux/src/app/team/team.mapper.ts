import { Injectable } from '@nestjs/common'
import { Identity, Session } from '@ory/kratos-client'
import { Team, UserInvitation, UsersOnTeams } from '@prisma/client'
import { IdentityTraits, invitationExpired, nameOfIdentity } from 'src/domain/identity'
import SharedMapper from '../shared/shared.mapper'
import { TeamDetailsDto, TeamDto, TeamStatisticsDto } from './team.dto'
import { UserDto, UserMetaDto } from './user.dto'

@Injectable()
export default class TeamMapper {
  constructor(private sharedMapper: SharedMapper) {}

  toDto(team: TeamWithStatistics): TeamDto {
    return {
      ...this.sharedMapper.teamToBasicDto(team),
      statistics: this.statisticsToDto(team),
    }
  }

  detailsToDto(team: TeamDetails, identities: Map<string, Identity>, sessions: Map<string, Session[]>): TeamDetailsDto {
    return {
      ...this.toDto(team),
      users: this.teamUsersToUserDtos(team, identities, sessions),
    }
  }

  toUserMetaDto(teams: MetaTeam[], invitations: MetaInvitation[], identity: Identity): UserMetaDto {
    const activeTeam = teams.find(it => it.active)

    return {
      activeTeamId: activeTeam?.teamId,
      user: !activeTeam ? null : this.userToDto(activeTeam, identity, null),
      teams: teams.map(it => it.team),
      invitations: invitations.map(it => it.team),
    }
  }

  private statisticsToDto(team: TeamWithStatistics): TeamStatisticsDto {
    return {
      users: team._count.users + team._count.invitations,
      products: team._count.products,
      nodes: team._count.nodes,
      versions: team.products.flatMap(it => it._count.versions).reduce((prev, it) => prev + it, 0),
      deployments: team.products
        .flatMap(it => it.versions)
        .flatMap(it => it._count.deployments)
        .reduce((prev, it) => prev + it, 0),
    }
  }

  userToDto(activeTeam: UsersOnTeams, identity: Identity, session: Session): UserDto {
    const traits = identity.traits as IdentityTraits
    if (!traits) {
      return null
    }

    return {
      id: identity.id,
      name: nameOfIdentity(identity),
      email: traits.email,
      role: activeTeam.role,
      status: 'verified',
      lastLogin: session ? new Date(session.authenticated_at) : null,
    }
  }

  private invitationToUserDto(inv: UserInvitation, identities: Map<string, Identity>): UserDto {
    const identity = identities.get(inv.userId)

    const now = new Date().getTime()
    return {
      id: inv.userId,
      email: inv.email,
      name: nameOfIdentity(identity),
      role: 'user',
      status: inv.status === 'pending' && invitationExpired(inv.createdAt, now) ? 'expired' : inv.status,
    }
  }

  private teamUsersToUserDtos(
    team: TeamDetails,
    identities: Map<string, Identity>,
    sessions: Map<string, Session[]>,
  ): UserDto[] {
    const users = team.users
      .map(user => {
        const identity = identities.get(user.userId)
        if (!identity) {
          return null
        }

        const userSessions = sessions.get(user.userId) ?? []
        const lastSession = userSessions
          .filter(it => !!it.authenticated_at)
          .sort((a, b) => new Date(b.authenticated_at).getTime() - new Date(a.authenticated_at).getTime())
          .shift()

        return this.userToDto(user, identity, lastSession)
      })
      .filter(it => !!it)
    const invitations = team.invitations.map(it => this.invitationToUserDto(it, identities)).filter(it => !!it)

    return users.concat(invitations)
  }
}

export type TeamWithUsers = Team & {
  users: UsersOnTeams[]
}

type TeamStatistics = {
  registries: number
  products: number
  nodes: number
  users: number
  invitations: number
}

type TeamWithStatistics = Team & {
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
  _count: TeamStatistics
}

type TeamDetails = TeamWithUsers &
  TeamWithStatistics & {
    invitations: UserInvitation[]
  }

type TeamWithIdAndName = Pick<Team, 'id' | 'name'>

type MetaTeam = UsersOnTeams & {
  team: TeamWithIdAndName
}

type MetaInvitation = {
  team: TeamWithIdAndName
}
