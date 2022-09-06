import { Logger } from '@app/logger'
import {
  ActiveTeamDetails,
  CreateTeam,
  DEFAULT_TEAM_STATISTICS,
  DyoApiError,
  IdentityTraits,
  InviteUser,
  nameOfIdentity,
  Team,
  TeamDetails,
  UpdateTeam,
  User,
  UserMeta,
  UserRole,
} from '@app/models'
import {
  AccessRequest,
  ActiveTeamDetailsResponse,
  AllTeamsResponse,
  CreateEntityResponse,
  CreateTeamRequest,
  CruxTeamClient,
  DeleteUserFromTeamRequest,
  Empty,
  IdRequest,
  InviteUserRequest,
  TeamDetailsResponse,
  UpdateTeamRequest,
  UpdateUserRoleInTeamRequest,
  UserMetaResponse,
} from '@app/models/grpc/protobuf/proto/crux'
import { Identity } from '@ory/kratos-client'
import { protomisify } from '@server/crux/grpc-connection'
/* eslint-disable import/no-cycle */
import { RegistryConnections } from '@server/registry-api/registry-connections'
import { userRoleToDto, userRoleToGrpc, userStatusToDto, userToDto } from './mappers/team-mappers'

class DyoTeamService {
  private logger = new Logger(DyoTeamService.name)

  constructor(
    private client: CruxTeamClient,
    private identity: Identity,
    private registryConnections: RegistryConnections,
  ) {}

  async getUserMeta(): Promise<UserMeta> {
    const req = {
      accessedBy: this.identity.id,
    } as AccessRequest

    const res = await protomisify<AccessRequest, UserMetaResponse>(this.client, this.client.getUserMeta)(
      AccessRequest,
      req,
    )

    const traits = this.identity.traits as IdentityTraits

    return {
      activeTeamId: res.user?.activeTeamId,
      user: {
        id: this.identity.id,
        name: nameOfIdentity(this.identity),
        email: traits.email,
        status: !res.user ? null : userStatusToDto(res.user.status),
        role: !res.user ? null : userRoleToDto(res.user.role),
      },
      teams: res.teams,
      invitations: res.invitations,
    }
  }

  async getActiveTeam(): Promise<ActiveTeamDetails> {
    const req = {
      accessedBy: this.identity.id,
    } as AccessRequest

    try {
      const res = await protomisify<AccessRequest, ActiveTeamDetailsResponse>(
        this.client,
        this.client.getActiveTeamByUser,
      )(AccessRequest, req)

      return {
        ...res,
        users: res.users.map(userToDto),
      }
    } catch (err) {
      const error = err as DyoApiError
      if (error.status === 404) {
        return null
      }

      throw error
    }
  }

  async createTeam(dto: CreateTeam): Promise<Team> {
    const req: CreateTeamRequest = {
      name: dto.name,
      accessedBy: this.identity.id,
    }

    const res = await protomisify<CreateTeamRequest, CreateEntityResponse>(this.client, this.client.createTeam)(
      CreateTeamRequest,
      req,
    )

    return {
      id: res.id,
      name: dto.name,
      statistics: DEFAULT_TEAM_STATISTICS,
    }
  }

  async updateTeam(teamId: string, dto: UpdateTeam): Promise<void> {
    const req: UpdateTeamRequest = {
      id: teamId,
      name: dto.name,
      accessedBy: this.identity.id,
    }

    await protomisify<UpdateTeamRequest, Empty>(this.client, this.client.updateTeam)(UpdateTeamRequest, req)
  }

  async updateUserRole(teamId: string, userId: string, role: UserRole): Promise<void> {
    const req: UpdateUserRoleInTeamRequest = {
      id: teamId,
      accessedBy: this.identity.id,
      userId,
      role: userRoleToGrpc(role),
    }

    await protomisify<UpdateUserRoleInTeamRequest, Empty>(this.client, this.client.updateUserRole)(
      UpdateUserRoleInTeamRequest,
      req,
    )
  }

  async selectTeam(teamId: string): Promise<void> {
    const req: IdRequest = {
      id: teamId,
      accessedBy: this.identity.id,
    }

    await protomisify<IdRequest, Empty>(this.client, this.client.selectTeam)(IdRequest, req)
  }

  async deleteTeam(teamId: string): Promise<void> {
    const req: IdRequest = {
      id: teamId,
      accessedBy: this.identity.id,
    }

    await protomisify<AccessRequest, Empty>(this.client, this.client.deleteTeam)(IdRequest, req)
  }

  async inviteUser(teamId: string, dto: InviteUser): Promise<User> {
    const req: InviteUserRequest = {
      id: teamId,
      email: dto.email,
      accessedBy: this.identity.id,
    }

    const res = await protomisify<InviteUserRequest, CreateEntityResponse>(this.client, this.client.inviteUserToTeam)(
      InviteUserRequest,
      req,
    )

    return {
      id: res.id,
      email: dto.email,
      name: null,
      role: 'user',
      status: 'pending',
    }
  }

  async deleteUser(teamId: string, userId: string): Promise<void> {
    const req: DeleteUserFromTeamRequest = {
      id: teamId,
      userId,
      accessedBy: this.identity.id,
    }

    await protomisify<DeleteUserFromTeamRequest, Empty>(this.client, this.client.deleteUserFromTeam)(
      DeleteUserFromTeamRequest,
      req,
    )

    this.registryConnections.resetAuthorization(this.identity)
  }

  async acceptInvitation(teamId: string): Promise<void> {
    const req: IdRequest = {
      id: teamId,
      accessedBy: this.identity.id,
    }

    await protomisify<IdRequest, Empty>(this.client, this.client.acceptTeamInvite)(IdRequest, req)
  }

  async getAllTeams(): Promise<Team[]> {
    const req: AccessRequest = {
      accessedBy: this.identity.id,
    }

    const res = await protomisify<AccessRequest, AllTeamsResponse>(this.client, this.client.getAllTeams)(
      AccessRequest,
      req,
    )

    return res.data
  }

  async getTeamById(teamId: string): Promise<TeamDetails> {
    const req: IdRequest = {
      id: teamId,
      accessedBy: this.identity.id,
    }

    const res = await protomisify<IdRequest, TeamDetailsResponse>(this.client, this.client.getTeamById)(IdRequest, req)

    return {
      ...res,
      users: res.users.map(userToDto),
    }
  }
}

export default DyoTeamService
