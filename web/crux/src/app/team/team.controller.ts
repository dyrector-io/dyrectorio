import { Metadata, ServerUnaryCall } from '@grpc/grpc-js'
import { Controller, UseGuards, UseInterceptors } from '@nestjs/common'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorators'
import { AuditLoggerInterceptor } from 'src/interceptors/audit-logger.interceptor'
import { GrpcContextLogger } from 'src/interceptors/grpc-context-logger.interceptor'
import { PrismaErrorInterceptor } from 'src/interceptors/prisma-error-interceptor'
import {
  AccessRequest,
  CreateEntityResponse,
  CreateTeamRequest,
  CruxTeamController,
  CruxTeamControllerMethods,
  Empty,
  IdRequest,
  TeamDetailsResponse,
  UpdateActiveTeamRequest,
  UserInviteRequest,
  UserMetaResponse,
} from 'src/grpc/protobuf/proto/crux'
import { TeamRoleGuard, TeamRoleRequired } from './guards/team.role.guard'
import { TeamSelectGuard } from './guards/team.select.guard'
import { TeamService } from './team.service'

@Controller()
@CruxTeamControllerMethods()
@UseInterceptors(PrismaErrorInterceptor, GrpcContextLogger, AuditLoggerInterceptor)
@UseGuards(TeamRoleGuard)
export class TeamController implements CruxTeamController {
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
  async updateActiveTeam(request: UpdateActiveTeamRequest): Promise<Empty> {
    return await this.service.updateActiveTeam(request)
  }

  @TeamRoleRequired('owner')
  async deleteActiveTeam(request: AccessRequest): Promise<void> {
    return await this.service.deleteActiveTeam(request)
  }

  @TeamRoleRequired('owner')
  async inviteUserToTheActiveTeam(request: UserInviteRequest): Promise<CreateEntityResponse> {
    return await this.service.inviteUserToTheActiveTeam(request)
  }

  @TeamRoleRequired('none')
  @AuditLogLevel('disabled')
  async acceptTeamInvite(
    request: IdRequest,
    _: Metadata,
    rest: ServerUnaryCall<IdRequest, Promise<void>>,
  ): Promise<void> {
    return await this.service.acceptTeamInvite(request, rest)
  }

  @AuditLogLevel('disabled')
  @TeamRoleRequired('none')
  @UseGuards(TeamSelectGuard)
  async selectTeam(request: IdRequest): Promise<void> {
    return await this.service.selectTeam(request)
  }

  @AuditLogLevel('disabled')
  @TeamRoleRequired('none')
  async getActiveTeamByUser(request: AccessRequest): Promise<TeamDetailsResponse> {
    return await this.service.getActiveTeamByUserId(request)
  }

  @AuditLogLevel('disabled')
  @TeamRoleRequired('none')
  async getUserMeta(request: AccessRequest): Promise<UserMetaResponse> {
    return await this.service.getUserMeta(request)
  }

  @TeamRoleRequired('owner')
  async deleteUserFromTheActiveTeam(request: IdRequest): Promise<void> {
    return await this.service.deleteUserFromTeam(request)
  }
}
