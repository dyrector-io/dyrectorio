import { Body, Controller, Delete, HttpCode, Param, Post } from '@nestjs/common'
import { ApiBody, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Identity } from '@ory/kratos-client'
import UuidParams from 'src/decorators/api-params.decorator'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorator'
import { IdentityFromRequest } from '../token/jwt-auth.guard'
import { ActivateTeamDto } from './team.dto'
import TeamService from './team.service'
import { UserMetaDto } from './user.dto'

const PARAM_TEAM_ID = 'teamId'
const TeamId = () => Param(PARAM_TEAM_ID)

const ROUTE_USERS_ME = 'users/me'
const ROUTE_ACTIVE_TEAM = 'active-team'
const ROUTE_INVITATIONS = 'invitations'
const ROUTE_TEAM_ID = ':teamId'

@Controller(ROUTE_USERS_ME)
@ApiTags(ROUTE_USERS_ME)
export default class UserHttpController {
  constructor(private service: TeamService) {}

  @Post()
  @HttpCode(200)
  @AuditLogLevel('disabled')
  @ApiOperation({
    description: 'Response includes the `user`, `activeTeamId`, `teams`, and `invitations`.',
    summary: 'Fetch the current user.',
  })
  @ApiOkResponse({ type: UserMetaDto, description: 'Fetch the current user.' })
  async getUserMeta(@IdentityFromRequest() identity: Identity): Promise<UserMetaDto> {
    return await this.service.getUserMeta(identity)
  }

  @Post(ROUTE_ACTIVE_TEAM)
  @HttpCode(204)
  @ApiOperation({
    description: 'Request must include `teamID`.',
    summary: 'Sets the active team.',
  })
  @ApiBody({ type: ActivateTeamDto })
  @ApiNoContentResponse({ description: 'Set the active team.' })
  async activateTeam(@Body() request: ActivateTeamDto, @IdentityFromRequest() identity: Identity): Promise<void> {
    await this.service.activateTeam(request, identity)
  }

  @Post(`${ROUTE_INVITATIONS}/${ROUTE_TEAM_ID}`)
  @HttpCode(204)
  @ApiOperation({
    description: 'Request must include `teamID`.',
    summary: 'Accept invitation to a team.',
  })
  @ApiNoContentResponse({ description: 'Invitation accepted.' })
  @UuidParams(PARAM_TEAM_ID)
  async acceptTeamInvitation(@TeamId() teamId: string, @IdentityFromRequest() identity: Identity): Promise<void> {
    await this.service.acceptTeamInvitation(teamId, identity)
  }

  @Delete(`${ROUTE_INVITATIONS}/${ROUTE_TEAM_ID}`)
  @HttpCode(204)
  @ApiOperation({
    description: 'Request must include `teamID`.',
    summary: 'Decline invitation to a team.',
  })
  @ApiNoContentResponse({ description: 'Invitation declined.' })
  @UuidParams(PARAM_TEAM_ID)
  async declineTeamInvitation(@TeamId() teamId: string, @IdentityFromRequest() identity: Identity): Promise<void> {
    await this.service.declineTeamInvitation(teamId, identity)
  }
}
