import { Controller, Delete, HttpCode, HttpStatus, Param, Post, Put } from '@nestjs/common'
import {
  ApiBadRequestResponse,
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
import { DisableTeamAccessGuard } from 'src/guards/team-access.guard'
import { IdentityFromRequest } from '../token/jwt-auth.guard'
import TeamService from './team.service'
import { UserMetaDto } from './user.dto'

const PARAM_TEAM_ID = 'teamId'
const TeamId = () => Param(PARAM_TEAM_ID)

const ROUTE_USERS_ME = 'users/me'
const ROUTE_INVITATIONS = 'invitations'
const ROUTE_TEAM_SLUG = ':teamSlug'
const ROUTE_PREFERENCES = 'preferences'
const ROUTE_ONBOARDING = 'onboarding'

@Controller(ROUTE_USERS_ME)
@ApiTags(ROUTE_USERS_ME)
@DisableTeamAccessGuard()
export default class UserHttpController {
  constructor(private service: TeamService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @AuditLogLevel('disabled')
  @ApiOperation({
    description: 'Response includes the `user`, `teams`, and `invitations`.',
    summary: 'Fetch the current user.',
  })
  @ApiOkResponse({ type: UserMetaDto, description: 'Fetch the current user.' })
  @ApiBadRequestResponse({ description: 'Bad request for current user.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for current user.' })
  async getUserMeta(@IdentityFromRequest() identity: Identity): Promise<UserMetaDto> {
    return await this.service.getUserMeta(identity)
  }

  @Post(`${ROUTE_INVITATIONS}/${ROUTE_TEAM_SLUG}`)
  @HttpCode(HttpStatus.NO_CONTENT)
  @AuditLogLevel('disabled')
  @ApiOperation({
    description: 'Request must include `teamSlug`.',
    summary: 'Accept invitation to a team.',
  })
  @ApiNoContentResponse({ description: 'Invitation accepted.' })
  @ApiBadRequestResponse({ description: 'Bad request for team invitation.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for team invitation.' })
  @UuidParams(PARAM_TEAM_ID)
  async acceptTeamInvitation(@TeamId() teamId: string, @IdentityFromRequest() identity: Identity): Promise<void> {
    await this.service.acceptTeamInvitation(teamId, identity)
  }

  @Delete(`${ROUTE_INVITATIONS}/${ROUTE_TEAM_SLUG}`)
  @HttpCode(HttpStatus.NO_CONTENT)
  @AuditLogLevel('disabled')
  @ApiOperation({
    description: 'Request must include `teamSlug`.',
    summary: 'Decline invitation to a team.',
  })
  @ApiNoContentResponse({ description: 'Invitation declined.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for invite declination.' })
  @ApiNotFoundResponse({ description: 'Invitation not found.' })
  @UuidParams(PARAM_TEAM_ID)
  async declineTeamInvitation(@TeamId() teamId: string, @IdentityFromRequest() identity: Identity): Promise<void> {
    await this.service.declineTeamInvitation(teamId, identity)
  }

  @Put(`${ROUTE_PREFERENCES}/${ROUTE_ONBOARDING}`)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    description: 'Enable onboarding tips.',
    summary: 'Sets the onboarding tips to visible for the user.',
  })
  @ApiNoContentResponse({ description: 'Enabled.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for onboarding tips.' })
  @AuditLogLevel('disabled')
  async enableOnboardingTips(@IdentityFromRequest() identity: Identity): Promise<void> {
    await this.service.enableOnboarding(identity)
  }

  @Delete(`${ROUTE_PREFERENCES}/${ROUTE_ONBOARDING}`)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    description: 'Disable onboarding tips.',
    summary: 'Sets the onboarding tips to hidden for the user.',
  })
  @ApiNoContentResponse({ description: 'Disabled.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for onboarding tips.' })
  @AuditLogLevel('disabled')
  async disableOnboardingTips(@IdentityFromRequest() identity: Identity): Promise<void> {
    await this.service.disableOnboarding(identity)
  }
}
