import { Metadata, ServerUnaryCall } from '@grpc/grpc-js'
import { UsePipes, Controller, UseGuards, UseInterceptors } from '@nestjs/common'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorator'
import { Empty } from 'src/grpc/protobuf/proto/common'
import {
  ActiveTeamDetailsResponse,
  AllTeamsResponse,
  CreateEntityResponse,
  CreateTeamRequest,
  CruxTeamController,
  CruxTeamControllerMethods,
  DeleteUserFromTeamRequest,
  IdRequest,
  InviteUserRequest,
  ReinviteUserRequest,
  TeamDetailsResponse,
  UpdateTeamRequest,
  UpdateUserRoleInTeamRequest,
  UserMetaResponse,
} from 'src/grpc/protobuf/proto/crux'
import CommonGrpcErrorInterceptor from 'src/interceptors/grpc.error.interceptor'
import GrpcLoggerInterceptor from 'src/interceptors/grpc.logger.interceptor'
import GrpcUserInterceptor, { getIdentity } from 'src/interceptors/grpc.user.interceptor'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'
import TeamRoleGuard, { TeamRoleRequired } from './guards/team.role.guard'
import TeamSelectGuard from './guards/team.select.guard'
import TeamReinviteUserValidationPipe from './pipes/team.reinvite-pipe'
import TeamUpdateUserRoleValidationPipe from './pipes/team.update-user-role.pipe'
import TeamService from './team.service'

@Controller()
@CruxTeamControllerMethods()
@UseGuards(TeamRoleGuard)
@UseInterceptors(GrpcLoggerInterceptor, GrpcUserInterceptor, CommonGrpcErrorInterceptor, PrismaErrorInterceptor)
export default class TeamController implements CruxTeamController {
  constructor(private service: TeamService) {}

  @AuditLogLevel('disabled')
  @TeamRoleRequired('none')
  async createTeam(
    request: CreateTeamRequest,
    metadata: Metadata,
    rest: ServerUnaryCall<CreateTeamRequest, Promise<CreateEntityResponse>>,
  ): Promise<CreateEntityResponse> {
    return await this.service.createTeam(request, rest, getIdentity(metadata))
  }

  @TeamRoleRequired('owner')
  async updateTeam(request: UpdateTeamRequest, metadata: Metadata): Promise<Empty> {
    return await this.service.updateTeam(request, getIdentity(metadata))
  }

  @AuditLogLevel('disabled')
  @TeamRoleRequired('owner')
  async deleteTeam(request: IdRequest): Promise<Empty> {
    return await this.service.deleteTeam(request)
  }

  @TeamRoleRequired('admin')
  @UsePipes(TeamUpdateUserRoleValidationPipe)
  async updateUserRole(request: UpdateUserRoleInTeamRequest, metadata: Metadata): Promise<Empty> {
    return await this.service.updateUserRole(request, getIdentity(metadata))
  }

  @TeamRoleRequired('admin')
  async inviteUserToTeam(request: InviteUserRequest, metadata: Metadata): Promise<CreateEntityResponse> {
    return await this.service.inviteUserToTeam(request, getIdentity(metadata))
  }

  @TeamRoleRequired('admin')
  @UsePipes(TeamReinviteUserValidationPipe)
  async reinviteUserToTeam(request: ReinviteUserRequest, metadata: Metadata): Promise<CreateEntityResponse> {
    return await this.service.reinviteUserToTeam(request, getIdentity(metadata))
  }

  @TeamRoleRequired('none')
  @AuditLogLevel('disabled')
  async acceptTeamInvitation(
    request: IdRequest,
    metadata: Metadata,
    rest: ServerUnaryCall<IdRequest, Promise<void>>,
  ): Promise<void> {
    return await this.service.acceptTeamInvitation(request, rest, getIdentity(metadata))
  }

  @TeamRoleRequired('none')
  @AuditLogLevel('disabled')
  async declineTeamInvitation(request: IdRequest, metadata: Metadata): Promise<void> {
    return await this.service.declineTeamInvitation(request, getIdentity(metadata))
  }

  @AuditLogLevel('disabled')
  @TeamRoleRequired('none')
  @UseGuards(TeamSelectGuard)
  async selectTeam(request: IdRequest, metadata: Metadata): Promise<void> {
    return await this.service.selectTeam(request, getIdentity(metadata))
  }

  @AuditLogLevel('disabled')
  @TeamRoleRequired('none')
  async getActiveTeamByUser(_: Empty, metadata: Metadata): Promise<ActiveTeamDetailsResponse> {
    return await this.service.getActiveTeamByUserId(getIdentity(metadata))
  }

  @AuditLogLevel('disabled')
  @TeamRoleRequired('none')
  async getUserMeta(_: Empty, metadata: Metadata): Promise<UserMetaResponse> {
    return await this.service.getUserMeta(getIdentity(metadata))
  }

  @TeamRoleRequired('admin')
  async deleteUserFromTeam(request: DeleteUserFromTeamRequest): Promise<void> {
    return await this.service.deleteUserFromTeam(request)
  }

  async getAllTeams(_: Empty, metadata: Metadata): Promise<AllTeamsResponse> {
    return await this.service.getAllTeams(getIdentity(metadata))
  }

  async getTeamById(request: IdRequest): Promise<TeamDetailsResponse> {
    return await this.service.getTeamById(request)
  }
}
