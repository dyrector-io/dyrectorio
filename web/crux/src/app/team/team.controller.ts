import { Metadata } from '@grpc/grpc-js'
import { Controller, UseGuards, UsePipes } from '@nestjs/common'
import { Identity } from '@ory/kratos-client'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorator'
import UseGrpcInterceptors from 'src/decorators/grpc-interceptors.decorator'
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
import { IdentityAwareServerSurfaceCall, IdentityFromGrpcCall } from 'src/shared/user-access.guard'
import TeamRoleGuard, { TeamRoleRequired } from './guards/team.role.guard'
import TeamSelectGuard from './guards/team.select.guard'
import TeamReinviteUserValidationPipe from './pipes/team.reinvite-pipe'
import TeamUpdateUserRoleValidationPipe from './pipes/team.update-user-role.pipe'
import TeamService from './team.service'

@Controller()
@CruxTeamControllerMethods()
@UseGuards(TeamRoleGuard)
@UseGrpcInterceptors()
export default class TeamController implements CruxTeamController {
  constructor(private service: TeamService) {}

  @AuditLogLevel('disabled')
  @TeamRoleRequired('none')
  async createTeam(
    request: CreateTeamRequest,
    _: Metadata,
    call: IdentityAwareServerSurfaceCall,
  ): Promise<CreateEntityResponse> {
    return await this.service.createTeam(request, call)
  }

  @TeamRoleRequired('owner')
  async updateTeam(
    request: UpdateTeamRequest,
    _: Metadata,
    @IdentityFromGrpcCall() identity: Identity,
  ): Promise<Empty> {
    return await this.service.updateTeam(request, identity)
  }

  @AuditLogLevel('disabled')
  @TeamRoleRequired('owner')
  async deleteTeam(request: IdRequest): Promise<Empty> {
    return await this.service.deleteTeam(request)
  }

  @TeamRoleRequired('admin')
  @UsePipes(TeamUpdateUserRoleValidationPipe)
  async updateUserRole(
    request: UpdateUserRoleInTeamRequest,
    _: Metadata,
    @IdentityFromGrpcCall() identity: Identity,
  ): Promise<Empty> {
    return await this.service.updateUserRole(request, identity)
  }

  @TeamRoleRequired('admin')
  async inviteUserToTeam(
    request: InviteUserRequest,
    _: Metadata,
    @IdentityFromGrpcCall() identity: Identity,
  ): Promise<CreateEntityResponse> {
    return await this.service.inviteUserToTeam(request, identity)
  }

  @TeamRoleRequired('admin')
  @UsePipes(TeamReinviteUserValidationPipe)
  async reinviteUserToTeam(
    request: ReinviteUserRequest,
    _: Metadata,
    @IdentityFromGrpcCall() identity: Identity,
  ): Promise<CreateEntityResponse> {
    return await this.service.reinviteUserToTeam(request, identity)
  }

  @TeamRoleRequired('none')
  @AuditLogLevel('disabled')
  async acceptTeamInvitation(request: IdRequest, _: Metadata, call: IdentityAwareServerSurfaceCall): Promise<void> {
    return await this.service.acceptTeamInvitation(request, call)
  }

  @TeamRoleRequired('none')
  @AuditLogLevel('disabled')
  async declineTeamInvitation(
    request: IdRequest,
    _: Metadata,
    @IdentityFromGrpcCall() identity: Identity,
  ): Promise<void> {
    return await this.service.declineTeamInvitation(request, identity)
  }

  @AuditLogLevel('disabled')
  @TeamRoleRequired('none')
  @UseGuards(TeamSelectGuard)
  async selectTeam(request: IdRequest, _: Metadata, @IdentityFromGrpcCall() identity: Identity): Promise<void> {
    return await this.service.selectTeam(request, identity)
  }

  @AuditLogLevel('disabled')
  @TeamRoleRequired('none')
  async getActiveTeamByUser(
    _: Empty,
    __: Metadata,
    @IdentityFromGrpcCall() identity: Identity,
  ): Promise<ActiveTeamDetailsResponse> {
    return await this.service.getActiveTeamByUserId(identity)
  }

  @AuditLogLevel('disabled')
  @TeamRoleRequired('none')
  async getUserMeta(_: Empty, __: Metadata, @IdentityFromGrpcCall() identity: Identity): Promise<UserMetaResponse> {
    return await this.service.getUserMeta(identity)
  }

  @TeamRoleRequired('admin')
  async deleteUserFromTeam(request: DeleteUserFromTeamRequest): Promise<void> {
    return await this.service.deleteUserFromTeam(request)
  }

  async getAllTeams(_: Empty, __: Metadata, @IdentityFromGrpcCall() identity: Identity): Promise<AllTeamsResponse> {
    return await this.service.getAllTeams(identity)
  }

  async getTeamById(request: IdRequest): Promise<TeamDetailsResponse> {
    return await this.service.getTeamById(request)
  }
}
