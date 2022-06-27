import { Logger } from '@app/logger'
import {
  CreateTeam,
  IdentityTraits,
  InviteUser,
  nameOfIdentity,
  Team,
  User,
  UserMeta,
  UserRole,
  UserStatus,
} from '@app/models'
import {
  AccessRequest,
  CreateEntityResponse,
  CreateTeamRequest,
  CruxTeamClient,
  Empty,
  IdRequest,
  TeamDetailsResponse,
  UserInviteRequest,
  UserMetaResponse,
  UserResponse,
  UserRole as ProtoUserRole,
  userRoleToJSON,
  UserStatus as ProtoUserStatus,
  userStatusToJSON,
} from '@app/models/proto/crux'
import { Identity } from '@ory/kratos-client'
import { protomisify } from '@server/crux/grpc-connection'
import { DyoApiError } from '@server/error-middleware'
import { RegistryConnections } from '@server/registry-api/registry-connections'

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

  async getActiveTeam(): Promise<Team> {
    const req = {
      accessedBy: this.identity.id,
    } as AccessRequest

    try {
      const res = await protomisify<AccessRequest, TeamDetailsResponse>(this.client, this.client.getActiveTeamByUser)(
        AccessRequest,
        req,
      )

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

    const traits = this.identity.traits as IdentityTraits

    return {
      id: res.id,
      name: dto.name,
      users: [
        {
          id: this.identity.id,
          name: nameOfIdentity(this.identity),
          email: traits.email,
          role: 'owner',
          status: 'verified',
        },
      ],
    }
  }

  async selectTeam(teamId: string): Promise<void> {
    const req: IdRequest = {
      id: teamId,
      accessedBy: this.identity.id,
    }

    await protomisify<IdRequest, Empty>(this.client, this.client.selectTeam)(IdRequest, req)
  }

  async deleteActiveTeam(): Promise<void> {
    const req: AccessRequest = {
      accessedBy: this.identity.id,
    }

    await protomisify<AccessRequest, Empty>(this.client, this.client.deleteActiveTeam)(AccessRequest, req)
  }

  async inviteUser(dto: InviteUser): Promise<User> {
    const req: UserInviteRequest = {
      email: dto.email,
      accessedBy: this.identity.id,
    }

    const res = await protomisify<UserInviteRequest, CreateEntityResponse>(
      this.client,
      this.client.inviteUserToTheActiveTeam,
    )(UserInviteRequest, req)

    return {
      id: res.id,
      email: dto.email,
      name: null,
      role: 'user',
      status: 'pending',
    }
  }

  async deleteUser(targetId: string): Promise<void> {
    const req: IdRequest = {
      id: targetId,
      accessedBy: this.identity.id,
    }

    await protomisify<IdRequest, Empty>(this.client, this.client.deleteUserFromTheActiveTeam)(IdRequest, req)
    this.registryConnections.resetAuthorization(this.identity)
  }

  async acceptInvitation(teamId: string): Promise<void> {
    const req: IdRequest = {
      id: teamId,
      accessedBy: this.identity.id,
    }

    await protomisify<IdRequest, Empty>(this.client, this.client.acceptTeamInvite)(IdRequest, req)
  }
}

export default DyoTeamService

export const userToDto = (user: UserResponse): User => {
  return {
    ...user,
    status: userStatusToDto(user.status),
    role: userRoleToDto(user.role),
  }
}

export const userRoleToDto = (role: ProtoUserRole): UserRole => userRoleToJSON(role).toLocaleLowerCase() as UserRole
export const userStatusToDto = (status: ProtoUserStatus): UserStatus =>
  userStatusToJSON(status).toLocaleLowerCase() as UserStatus
