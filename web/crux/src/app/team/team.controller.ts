import { Metadata, ServerUnaryCall } from '@grpc/grpc-js'
import { Body, Controller, UseGuards } from '@nestjs/common'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorators'
import { Empty } from 'src/grpc/protobuf/proto/common'
import {
  AccessRequest,
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
import TeamRoleGuard, { TeamRoleRequired } from './guards/team.role.guard'
import TeamSelectGuard from './guards/team.select.guard'
import TeamReinviteUserValidationPipe from './pipes/team.reinvite-pipe'
import TeamUpdateUserRoleValidationPipe from './pipes/team.update-user-role.pipe'
import TeamService from './team.service'

@Controller()
@CruxTeamControllerMethods()
@UseGuards(TeamRoleGuard)
export default class TeamController implements CruxTeamController {
  constructor(private service: TeamService) {}

  @AuditLogLevel('disabled')
  @TeamRoleRequired('none')
  async createTeam(
    request: CreateTeamRequest,
    _: Metadata,
    rest: ServerUnaryCall<CreateTeamRequest, Promise<CreateEntityResponse>>,
  ): Promise<CreateEntityResponse> {
    return await this.service.createTeam(request, rest)
  }

  @TeamRoleRequired('owner')
  async updateTeam(request: UpdateTeamRequest): Promise<Empty> {
    return await this.service.updateTeam(request)
  }

  @AuditLogLevel('disabled')
  @TeamRoleRequired('owner')
  async deleteTeam(request: IdRequest): Promise<Empty> {
    return await this.service.deleteTeam(request)
  }

  @TeamRoleRequired('admin')
  async updateUserRole(@Body(TeamUpdateUserRoleValidationPipe) request: UpdateUserRoleInTeamRequest): Promise<Empty> {
    return await this.service.updateUserRole(request)
  }

  @TeamRoleRequired('admin')
  async inviteUserToTeam(request: InviteUserRequest): Promise<CreateEntityResponse> {
    return await this.service.inviteUserToTeam(request)
  }

  @TeamRoleRequired('admin')
  async reinviteUserToTeam(
    @Body(TeamReinviteUserValidationPipe) request: ReinviteUserRequest,
  ): Promise<CreateEntityResponse> {
    return await this.service.reinviteUserToTeam(request)
  }

  @TeamRoleRequired('none')
  @AuditLogLevel('disabled')
  async acceptTeamInvitation(
    request: IdRequest,
    _: Metadata,
    rest: ServerUnaryCall<IdRequest, Promise<void>>,
  ): Promise<void> {
    return await this.service.acceptTeamInvitation(request, rest)
  }

  @TeamRoleRequired('none')
  @AuditLogLevel('disabled')
  async declineTeamInvitation(request: IdRequest): Promise<void> {
    return await this.service.declineTeamInvitation(request)
  }

  @AuditLogLevel('disabled')
  @TeamRoleRequired('none')
  @UseGuards(TeamSelectGuard)
  async selectTeam(request: IdRequest): Promise<void> {
    return await this.service.selectTeam(request)
  }

  @AuditLogLevel('disabled')
  @TeamRoleRequired('none')
  async getActiveTeamByUser(request: AccessRequest): Promise<ActiveTeamDetailsResponse> {
    return await this.service.getActiveTeamByUserId(request)
  }

  @AuditLogLevel('disabled')
  @TeamRoleRequired('none')
  async getUserMeta(request: AccessRequest): Promise<UserMetaResponse> {
    return await this.service.getUserMeta(request)
  }

  @TeamRoleRequired('admin')
  async deleteUserFromTeam(request: DeleteUserFromTeamRequest): Promise<void> {
    return await this.service.deleteUserFromTeam(request)
  }

  async getAllTeams(request: AccessRequest): Promise<AllTeamsResponse> {
    return await this.service.getAllTeams(request)
  }

  async getTeamById(request: IdRequest): Promise<TeamDetailsResponse> {
    return await this.service.getTeamById(request)
  }
}
