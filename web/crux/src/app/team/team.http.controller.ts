import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import { ApiBody, ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { Identity } from '@ory/kratos-client'
import HttpLoggerInterceptor from 'src/interceptors/http.logger.interceptor'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'
import { API_CREATED_LOCATION_HEADERS } from 'src/shared/const'
import UuidValidationGuard from 'src/guards/uuid-params.validation.guard'
import UuidParams from 'src/decorators/api-params.decorator'
import { CreatedResponse, CreatedWithLocation } from '../shared/created-with-location.decorator'
import CreatedWithLocationInterceptor from '../shared/created-with-location.interceptor'
import JwtAuthGuard, { IdentityFromRequest } from '../token/jwt-auth.guard'
import TeamGuard, { TeamRoleRequired } from './guards/team.guard'
import TeamInviteUserValitationInterceptor from './interceptors/team.invite.interceptor'
import TeamReinviteUserValidationInterceptor from './interceptors/team.reinvite.interceptor'
import TeamOwnerImmutabilityValidationInterceptor from './interceptors/team.team-owner-immutability.interceptor'
import { CreateTeamDto, InviteUserDto, TeamDetailsDto, TeamDto, UpdateTeamDto, UpdateUserRoleDto } from './team.dto'
import TeamService from './team.service'
import { UserDto } from './user.dto'

const TeamId = () => Param('teamId')
const UserId = () => Param('userId')

const ROUTE_TEAMS = 'teams'
const ROUTE_TEAM_ID = ':teamId'
const ROUTE_USERS = 'users'
const ROUTE_USER_ID = ':userId'

@Controller(ROUTE_TEAMS)
@ApiTags(ROUTE_TEAMS)
@UsePipes(
  new ValidationPipe({
    // TODO(@robot9706): Move to global pipes after removing gRPC
    transform: true,
  }),
)
@UseInterceptors(HttpLoggerInterceptor, PrismaErrorInterceptor, CreatedWithLocationInterceptor)
@UseGuards(JwtAuthGuard, UuidValidationGuard, TeamGuard)
export default class TeamHttpController {
  constructor(private service: TeamService) {}

  @Get()
  @HttpCode(200)
  @ApiOkResponse({ type: TeamDto, isArray: true })
  @TeamRoleRequired('none')
  async getTeams(@IdentityFromRequest() identity: Identity): Promise<TeamDto[]> {
    return await this.service.getTeams(identity)
  }

  @Get(ROUTE_TEAM_ID)
  @HttpCode(200)
  @ApiOkResponse({ type: TeamDetailsDto })
  @UuidParams('teamId')
  async getTeamById(@TeamId() teamId: string): Promise<TeamDetailsDto> {
    return await this.service.getTeamById(teamId)
  }

  @Post()
  @HttpCode(201)
  @CreatedWithLocation()
  @ApiBody({ type: CreateTeamDto })
  @ApiCreatedResponse({
    type: TeamDto,
    headers: API_CREATED_LOCATION_HEADERS,
  })
  @TeamRoleRequired('none')
  async createTeam(
    @Body() request: CreateTeamDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<CreatedResponse<TeamDto>> {
    const team = await this.service.createTeam(request, identity)

    return {
      url: `/${ROUTE_TEAMS}/${team.id}`,
      body: team,
    }
  }

  @Put(ROUTE_TEAM_ID)
  @HttpCode(204)
  @ApiBody({ type: UpdateTeamDto })
  @TeamRoleRequired('admin')
  @ApiNoContentResponse()
  @UuidParams('teamId')
  async updateTeam(
    @TeamId() teamId: string,
    @Body() request: UpdateTeamDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<void> {
    await this.service.updateTeam(teamId, request, identity)
  }

  @Delete(ROUTE_TEAM_ID)
  @HttpCode(204)
  @TeamRoleRequired('owner')
  @ApiNoContentResponse()
  @UuidParams('teamId')
  async deleteTeam(@TeamId() teamId: string): Promise<void> {
    await this.service.deleteTeam(teamId)
  }

  // Users endpoints

  @Post(`${ROUTE_TEAM_ID}/${ROUTE_USERS}`)
  @HttpCode(201)
  @CreatedWithLocation()
  @ApiBody({ type: InviteUserDto })
  @ApiCreatedResponse({
    type: UserDto,
    headers: API_CREATED_LOCATION_HEADERS,
  })
  @UseInterceptors(TeamInviteUserValitationInterceptor)
  @TeamRoleRequired('admin')
  @UuidParams('teamId')
  async inviteUserToTeam(
    @TeamId() teamId: string,
    @Body() request: InviteUserDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<CreatedResponse<UserDto>> {
    const user = await this.service.inviteUserToTeam(teamId, request, identity)

    return {
      url: `${ROUTE_TEAMS}/${teamId}/${ROUTE_USERS}/${user.id}`,
      body: user,
    }
  }

  @Put(`${ROUTE_TEAM_ID}/${ROUTE_USERS}/${ROUTE_USER_ID}/role`)
  @HttpCode(204)
  @ApiBody({ type: UpdateUserRoleDto })
  @TeamRoleRequired('admin')
  @UseInterceptors(TeamOwnerImmutabilityValidationInterceptor)
  @ApiNoContentResponse()
  @UuidParams('teamId')
  @UuidParams('userId')
  async updateUserRoleInTeam(
    @TeamId() teamId: string,
    @UserId() userId: string,
    @Body() request: UpdateUserRoleDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<void> {
    await this.service.updateUserRole(teamId, userId, request, identity)
  }

  @Delete(`${ROUTE_TEAM_ID}/${ROUTE_USERS}/${ROUTE_USER_ID}`)
  @HttpCode(204)
  @TeamRoleRequired('admin')
  @UseInterceptors(TeamOwnerImmutabilityValidationInterceptor)
  @ApiNoContentResponse()
  @UuidParams('teamId')
  @UuidParams('userId')
  async deleteUserFromTeam(@TeamId() teamId: string, @UserId() userId: string): Promise<void> {
    await this.service.deleteUserFromTeam(teamId, userId)
  }

  @Post(`${ROUTE_TEAM_ID}/${ROUTE_USERS}/${ROUTE_USER_ID}/reinvite`)
  @HttpCode(204)
  @UseInterceptors(TeamReinviteUserValidationInterceptor)
  @TeamRoleRequired('admin')
  @ApiNoContentResponse()
  @UuidParams('teamId')
  @UuidParams('userId')
  async reinviteUser(
    @TeamId() teamId: string,
    @UserId() userId: string,
    @IdentityFromRequest() identity: Identity,
  ): Promise<void> {
    await this.service.reinviteUserToTeam(teamId, userId, identity)
  }
}
