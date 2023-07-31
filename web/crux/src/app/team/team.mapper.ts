import { Injectable } from '@nestjs/common'
import { Identity, Session } from '@ory/kratos-client'
import { Team, UserInvitation, UserRoleEnum, UsersOnTeams } from '@prisma/client'
import { IdentityTraits, invitationExpired, nameOfIdentity, nameOrEmailOfIdentity } from 'src/domain/identity'
import { BasicTeamDto, TeamDetailsDto, TeamDto, TeamStatisticsDto } from './team.dto'
import { UserDto, UserMetaDto } from './user.dto'

@Injectable()
export default class TeamMapper {
  toDto(team: TeamWithStatistics): TeamDto {
    return {
      ...this.toBasicDto(team),
      statistics: this.statisticsToDto(team),
    }
  }

  toBasicDto(it: TeamWithBasicData): BasicTeamDto {
    return {
      id: it.id,
      name: it.name,
      slug: it.slug,
    }
  }

  detailsToDto(team: TeamDetails, identities: Map<string, Identity>, sessions: Map<string, Session[]>): TeamDetailsDto {
    return {
      ...this.toDto(team),
      users: this.teamUsersToUserDtos(team, identities, sessions),
    }
  }

  toUserMetaDto(teams: MetaTeam[], invitations: MetaInvitation[], identity: Identity): UserMetaDto {
    return {
      user: {
        id: identity.id,
        name: nameOrEmailOfIdentity(identity),
      },
      teams: teams.map(it => ({
        id: it.teamId,
        name: it.team.name,
        slug: it.team.slug,
        role: it.role,
      })),
      invitations: invitations.map(it => it.team),
    }
  }

  private statisticsToDto(team: TeamWithStatistics): TeamStatisticsDto {
    return {
      users: team._count.users + team._count.invitations,
      projects: team._count.projects,
      nodes: team._count.nodes,
      versions: team.projects.flatMap(it => it._count.versions).reduce((prev, it) => prev + it, 0),
      deployments: team.projects
        .flatMap(it => it.versions)
        .flatMap(it => it._count.deployments)
        .reduce((prev, it) => prev + it, 0),
    }
  }

  userToDto(team: UsersOnTeams, identity: Identity, session: Session): UserDto {
    const traits = identity.traits as IdentityTraits
    if (!traits) {
      return null
    }

    return {
      id: identity.id,
      name: nameOfIdentity(identity),
      email: traits.email,
      role: team.role,
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
  projects: number
  nodes: number
  users: number
  invitations: number
}

type TeamWithStatistics = Team & {
  projects: {
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

type TeamWithBasicData = Pick<Team, 'id' | 'name' | 'slug'>

type MetaTeam = UsersOnTeams & {
  team: TeamWithBasicData
  role: UserRoleEnum
}

type MetaInvitation = {
  team: TeamWithBasicData
}
