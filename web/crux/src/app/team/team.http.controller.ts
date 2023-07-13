import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { Identity } from '@ory/kratos-client'
import UuidParams from 'src/decorators/api-params.decorator'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorator'
import { API_CREATED_LOCATION_HEADERS } from 'src/shared/const'
import { CreatedResponse, CreatedWithLocation } from '../../interceptors/created-with-location.decorator'
import { AuthorizedHttpRequest, IdentityFromRequest } from '../token/jwt-auth.guard'
import TeamGuard, { TeamRoleRequired } from './guards/team.guard'
import TeamInviteUserValitationInterceptor from './interceptors/team.invite.interceptor'
import TeamReinviteUserValidationInterceptor from './interceptors/team.reinvite.interceptor'
import TeamOwnerImmutabilityValidationInterceptor from './interceptors/team.team-owner-immutability.interceptor'
import { CreateTeamDto, InviteUserDto, TeamDetailsDto, TeamDto, UpdateTeamDto, UpdateUserRoleDto } from './team.dto'
import TeamService from './team.service'
import { UserDto } from './user.dto'

const PARAM_TEAM_ID = 'teamId'
const PARAM_USER_ID = 'userId'
const TeamId = () => Param(PARAM_TEAM_ID)
const UserId = () => Param(PARAM_USER_ID)

const ROUTE_TEAMS = 'teams'
const ROUTE_TEAM_ID = ':teamId'
const ROUTE_USERS = 'users'
const ROUTE_USER_ID = ':userId'

@Controller(ROUTE_TEAMS)
@ApiTags(ROUTE_TEAMS)
@UseGuards(TeamGuard)
export default class TeamHttpController {
  constructor(private service: TeamService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description:
      'List of teams consist of `name`, `id`, and `statistics`, including number of `users`, `projects`, `nodes`, `versions`, and `deployments`.</br></br>Teams are the shared entity of multiple users. The purpose of teams is to separate users, nodes and projects based on their needs within an organization. Team owners can assign roles. More details about teams here.',
    summary: 'Fetch data of teams the user is a member of.',
  })
  @ApiOkResponse({ type: TeamDto, isArray: true, description: 'List of teams and their statistics.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for teams.' })
  @TeamRoleRequired('none')
  async getTeams(@IdentityFromRequest() identity: Identity): Promise<TeamDto[]> {
    return await this.service.getTeams(identity)
  }

  @Get(ROUTE_TEAM_ID)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description:
      "Get the details of a team. Request must include `teamId`, which is the ID of the team they'd like to get the data of. Data of teams consist of `name`, `id`, and `statistics`, including number of `users`, `projects`, `nodes`, `versions`, and `deployments`. Response should include user details, as well, including `name`, `id`, `role`, `status`, `email`, and `lastLogin`.",
    summary: 'Fetch data of a team the user is a member of.',
  })
  @ApiOkResponse({ type: TeamDetailsDto, description: 'Details of the team.' })
  @ApiBadRequestResponse({ description: 'Bad request for team details.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for team details.' })
  @ApiNotFoundResponse({ description: 'Team not found.' })
  @UuidParams(PARAM_TEAM_ID)
  async getTeamById(@TeamId() teamId: string): Promise<TeamDetailsDto> {
    return await this.service.getTeamById(teamId)
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @AuditLogLevel('disabled')
  @ApiOperation({
    description:
      'Request must include `name`, which is going to be the name of the newly made team. Response should include `name`, `id`, and `statistics`, including number of `users`, `projects`, `nodes`, `versions`, and `deployments`.',
    summary: 'Create new team.',
  })
  @CreatedWithLocation()
  @ApiBody({ type: CreateTeamDto })
  @ApiCreatedResponse({
    type: TeamDto,
    headers: API_CREATED_LOCATION_HEADERS,
    description: 'New team created.',
  })
  @ApiBadRequestResponse({ description: 'Bad request for team creation.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for team creation.' })
  @ApiConflictResponse({ description: 'Team name taken.' })
  @TeamRoleRequired('none')
  async createTeam(
    @Body() request: CreateTeamDto,
    @IdentityFromRequest() identity: Identity,
    @Request() httpRequest: AuthorizedHttpRequest,
  ): Promise<CreatedResponse<TeamDto>> {
    const team = await this.service.createTeam(request, identity, httpRequest)

    return {
      url: `/${ROUTE_TEAMS}/${team.id}`,
      body: team,
    }
  }

  @Put(ROUTE_TEAM_ID)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBody({ type: UpdateTeamDto })
  @ApiOperation({
    description: 'Request must include `teamId` and `name`. Admin access required for a successful request.',
    summary: "Modify a team's name.",
  })
  @TeamRoleRequired('admin')
  @ApiNoContentResponse({ description: 'Team name modified.' })
  @ApiBadRequestResponse({ description: 'Bad request for team modification.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for team modification.' })
  @ApiNotFoundResponse({ description: 'Team not found.' })
  @ApiConflictResponse({ description: 'Team name taken.' })
  @UuidParams(PARAM_TEAM_ID)
  async updateTeam(
    @TeamId() teamId: string,
    @Body() request: UpdateTeamDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<void> {
    await this.service.updateTeam(teamId, request, identity)
  }

  @Delete(ROUTE_TEAM_ID)
  @HttpCode(HttpStatus.NO_CONTENT)
  @AuditLogLevel('disabled')
  @ApiOperation({
    description: 'Request must include `teamId`. Owner access required for successful request.',
    summary: 'Deletes a team.',
  })
  @TeamRoleRequired('owner')
  @ApiNoContentResponse({ description: 'Team deleted.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for team delete.' })
  @ApiNotFoundResponse({ description: 'Team not found.' })
  @UuidParams(PARAM_TEAM_ID)
  @AuditLogLevel('disabled')
  async deleteTeam(@TeamId() teamId: string): Promise<void> {
    await this.service.deleteTeam(teamId)
  }

  // Users endpoints

  @Post(`${ROUTE_TEAM_ID}/${ROUTE_USERS}`)
  @HttpCode(HttpStatus.CREATED)
  @CreatedWithLocation()
  @ApiOperation({
    description:
      "Request must include `teamId`, email and `firstName`. Admin access required for a successful request.</br></br>Response should include new user's `name`, `id`, `role`, `status`, `email`, and `lastLogin`. Admin access required for a successful request.",
    summary: 'Invite a new user to the team.',
  })
  @ApiBody({ type: InviteUserDto })
  @ApiCreatedResponse({
    type: UserDto,
    headers: API_CREATED_LOCATION_HEADERS,
    description: 'User invited.',
  })
  @ApiBadRequestResponse({ description: 'Bad request for user invitation.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for user invitation.' })
  @ApiConflictResponse({ description: 'User is already invited to or already in the team.' })
  @UseInterceptors(TeamInviteUserValitationInterceptor)
  @TeamRoleRequired('admin')
  @UuidParams(PARAM_TEAM_ID)
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
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBody({ type: UpdateUserRoleDto })
  @ApiOperation({
    description:
      'Promotes or demotes the user. Request must include `teamId`, `userId` and `role`. Admin access required for a successful request.',
    summary: 'Edit user role.',
  })
  @TeamRoleRequired('admin')
  @UseInterceptors(TeamOwnerImmutabilityValidationInterceptor)
  @ApiNoContentResponse({ description: "User's role modified." })
  @ApiBadRequestResponse({ description: 'Bad request for user role modification.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for user role modification.' })
  @ApiNotFoundResponse({ description: 'User not found.' })
  @UuidParams(PARAM_TEAM_ID, PARAM_USER_ID)
  async updateUserRoleInTeam(
    @TeamId() teamId: string,
    @UserId() userId: string,
    @Body() request: UpdateUserRoleDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<void> {
    await this.service.updateUserRole(teamId, userId, request, identity)
  }

  @Delete(`${ROUTE_TEAM_ID}/${ROUTE_USERS}/leave`)
  @HttpCode(HttpStatus.NO_CONTENT)
  @AuditLogLevel('disabled')
  @TeamRoleRequired('user')
  @ApiOperation({
    description: 'Removes the current user from the team. Request must include `teamId`.',
    summary: 'Remove the current user from the team.',
  })
  @ApiNoContentResponse({ description: 'User removed from a team.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for user removal.' })
  @ApiNotFoundResponse({ description: 'User not found.' })
  @UuidParams(PARAM_TEAM_ID)
  async leaveTeam(
    @TeamId() teamId: string,
    @IdentityFromRequest() identity: Identity,
    @Request() httpRequest: AuthorizedHttpRequest,
  ): Promise<void> {
    await this.service.leaveTeam(teamId, identity, httpRequest)
  }

  @Delete(`${ROUTE_TEAM_ID}/${ROUTE_USERS}/${ROUTE_USER_ID}`)
  @HttpCode(HttpStatus.NO_CONTENT)
  @TeamRoleRequired('admin')
  @ApiOperation({
    description:
      'Removes the user from the team. Request must include `teamId`, `userId`. Admin access required for a successful request.',
    summary: 'Remove a user from the team.',
  })
  @UseInterceptors(TeamOwnerImmutabilityValidationInterceptor)
  @ApiNoContentResponse({ description: 'User removed from a team.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for user removal.' })
  @ApiNotFoundResponse({ description: 'User not found.' })
  @UuidParams(PARAM_TEAM_ID, PARAM_USER_ID)
  async deleteUserFromTeam(@TeamId() teamId: string, @UserId() userId: string): Promise<void> {
    await this.service.deleteUserFromTeam(teamId, userId)
  }

  @Post(`${ROUTE_TEAM_ID}/${ROUTE_USERS}/${ROUTE_USER_ID}/reinvite`)
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseInterceptors(TeamReinviteUserValidationInterceptor)
  @ApiOperation({
    description:
      "This call sends a new invitation link to a user who hasn't accepted invitation to a team.</br></br>Request must include `teamId`, `userId`. Admin access required for a successful request.",
    summary: 'Reinvite user with a pending invite status to a team.',
  })
  @TeamRoleRequired('admin')
  @ApiNoContentResponse({ description: 'New invite link sent.' })
  @ApiBadRequestResponse({ description: 'Bad request for reinvitation.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for reinvitation.' })
  @UuidParams(PARAM_TEAM_ID, PARAM_USER_ID)
  async reinviteUser(
    @TeamId() teamId: string,
    @UserId() userId: string,
    @IdentityFromRequest() identity: Identity,
  ): Promise<void> {
    await this.service.reinviteUserToTeam(teamId, userId, identity)
  }
}
