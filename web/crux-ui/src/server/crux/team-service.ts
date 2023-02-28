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
import { Empty } from '@app/models/grpc/protobuf/proto/common'
import {
  ActiveTeamDetailsResponse,
  AllTeamsResponse,
  CreateEntityResponse,
  CreateTeamRequest,
  CruxTeamClient,
  DeleteUserFromTeamRequest,
  IdRequest,
  InviteUserRequest,
  ReinviteUserRequest,
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
    private cookie: string,
  ) {}

  async getUserMeta(): Promise<UserMeta> {
    const res = await protomisify<Empty, UserMetaResponse>(this.client, this.client.getUserMeta, this.cookie)(Empty, {})

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
    try {
      const res = await protomisify<Empty, ActiveTeamDetailsResponse>(
        this.client,
        this.client.getActiveTeamByUser,
        this.cookie,
      )(Empty, {})

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
    }

    const res = await protomisify<CreateTeamRequest, CreateEntityResponse>(
      this.client,
      this.client.createTeam,
      this.cookie,
    )(CreateTeamRequest, req)

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
    }

    await protomisify<UpdateTeamRequest, Empty>(
      this.client,
      this.client.updateTeam,
      this.cookie,
    )(UpdateTeamRequest, req)
  }

  async updateUserRole(teamId: string, userId: string, role: UserRole): Promise<void> {
    const req: UpdateUserRoleInTeamRequest = {
      id: teamId,
      userId,
      role: userRoleToGrpc(role),
    }

    await protomisify<UpdateUserRoleInTeamRequest, Empty>(
      this.client,
      this.client.updateUserRole,
      this.cookie,
    )(UpdateUserRoleInTeamRequest, req)
  }

  async selectTeam(teamId: string): Promise<void> {
    const req: IdRequest = {
      id: teamId,
    }

    await protomisify<IdRequest, Empty>(this.client, this.client.selectTeam, this.cookie)(IdRequest, req)
  }

  async deleteTeam(teamId: string): Promise<void> {
    const req: IdRequest = {
      id: teamId,
    }

    await protomisify<IdRequest, Empty>(this.client, this.client.deleteTeam, this.cookie)(IdRequest, req)
  }

  async inviteUser(teamId: string, dto: InviteUser): Promise<User> {
    const req: InviteUserRequest = {
      id: teamId,
      ...dto,
    }

    const res = await protomisify<InviteUserRequest, CreateEntityResponse>(
      this.client,
      this.client.inviteUserToTeam,
      this.cookie,
    )(InviteUserRequest, req)

    let name = dto.firstName
    if (dto.lastName) {
      name += ` ${dto.lastName}`
    }

    return {
      id: res.id,
      email: dto.email,
      name,
      role: 'user',
      status: 'pending',
    }
  }

  async deleteUser(teamId: string, userId: string): Promise<void> {
    const req: DeleteUserFromTeamRequest = {
      id: teamId,
      userId,
    }

    await protomisify<DeleteUserFromTeamRequest, Empty>(
      this.client,
      this.client.deleteUserFromTeam,
      this.cookie,
    )(DeleteUserFromTeamRequest, req)

    this.registryConnections.resetAuthorization(this.identity)
  }

  async reinviteUser(teamId: string, userId: string): Promise<void> {
    const req: ReinviteUserRequest = {
      id: teamId,
      userId,
    }

    await protomisify<ReinviteUserRequest, Empty>(
      this.client,
      this.client.reinviteUserToTeam,
      this.cookie,
    )(ReinviteUserRequest, req)
  }

  async acceptInvitation(teamId: string): Promise<void> {
    const req: IdRequest = {
      id: teamId,
    }

    await protomisify<IdRequest, Empty>(this.client, this.client.acceptTeamInvitation, this.cookie)(IdRequest, req)
  }

  async declineInvitation(teamId: string): Promise<void> {
    const req: IdRequest = {
      id: teamId,
    }

    await protomisify<IdRequest, Empty>(this.client, this.client.declineTeamInvitation, this.cookie)(IdRequest, req)
  }

  async getAllTeams(): Promise<Team[]> {
    const res = await protomisify<Empty, AllTeamsResponse>(this.client, this.client.getAllTeams, this.cookie)(Empty, {})

    return res.data
  }

  async getTeamById(teamId: string): Promise<TeamDetails> {
    const req: IdRequest = {
      id: teamId,
    }

    const res = await protomisify<IdRequest, TeamDetailsResponse>(
      this.client,
      this.client.getTeamById,
      this.cookie,
    )(IdRequest, req)

    return {
      ...res,
      users: res.users.map(userToDto),
    }
  }
}

export default DyoTeamService
