import { Body, Controller, Delete, HttpCode, Param, Post, UseGuards } from '@nestjs/common'
import { ApiBody, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { Identity } from '@ory/kratos-client'
import UuidParams from 'src/decorators/api-params.decorator'
import UuidValidationGuard from 'src/guards/uuid-params.validation.guard'
import JwtAuthGuard, { IdentityFromRequest } from '../token/jwt-auth.guard'
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
@UseGuards(JwtAuthGuard, UuidValidationGuard)
export default class UserHttpController {
  constructor(private service: TeamService) {}

  @Post()
  @ApiOkResponse({ type: UserMetaDto, description: 'Fetch the logged in user.' })
  async getUserMeta(@IdentityFromRequest() identity: Identity): Promise<UserMetaDto> {
    return await this.service.getUserMeta(identity)
  }

  @Post(ROUTE_ACTIVE_TEAM)
  @HttpCode(204)
  @ApiBody({ type: ActivateTeamDto })
  @ApiNoContentResponse({ description: 'Set the active team.' })
  async activateTeam(@Body() request: ActivateTeamDto, @IdentityFromRequest() identity: Identity): Promise<void> {
    await this.service.activateTeam(request, identity)
  }

  @Post(`${ROUTE_INVITATIONS}/${ROUTE_TEAM_ID}`)
  @HttpCode(204)
  @ApiNoContentResponse({ description: 'Accept invitation to a team.' })
  @UuidParams(PARAM_TEAM_ID)
  async acceptTeamInvitation(@TeamId() teamId: string, @IdentityFromRequest() identity: Identity): Promise<void> {
    await this.service.acceptTeamInvitation(teamId, identity)
  }

  @Delete(`${ROUTE_INVITATIONS}/${ROUTE_TEAM_ID}`)
  @HttpCode(204)
  @ApiNoContentResponse({ description: 'Reject invitation to a team.' })
  @UuidParams(PARAM_TEAM_ID)
  async declineTeamInvitation(@TeamId() teamId: string, @IdentityFromRequest() identity: Identity): Promise<void> {
    await this.service.declineTeamInvitation(teamId, identity)
  }
}
