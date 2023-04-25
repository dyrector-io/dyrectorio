import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import { ApiBody, ApiOperation, ApiOkResponse, ApiNoContentResponse, ApiTags } from '@nestjs/swagger'
import { Identity, Session } from '@ory/kratos-client'
import HttpLoggerInterceptor from 'src/interceptors/http.logger.interceptor'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'
import UuidValidationGuard from 'src/guards/uuid-params.validation.guard'
import UuidParams from 'src/decorators/api-params.decorator'
import CreatedWithLocationInterceptor from '../shared/created-with-location.interceptor'
import JwtAuthGuard, { IdentityFromRequest, SessionFromRequest } from '../token/jwt-auth.guard'
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
@UsePipes(
  new ValidationPipe({
    // TODO(@robot9706): Move to global pipes after removing gRPC
    transform: true,
  }),
)
@UseInterceptors(HttpLoggerInterceptor, PrismaErrorInterceptor, CreatedWithLocationInterceptor)
@UseGuards(JwtAuthGuard, UuidValidationGuard)
export default class UserHttpController {
  constructor(private service: TeamService) {}

  @Post()
  @ApiOperation({
    description:
      "Response should include an array of `user` `data`, `activeTeamId`, `teams`, and `invitations`.",
    summary: "Create a new user.",
  })
  @ApiOkResponse({ type: UserMetaDto, description: 'New user created.' })
  async getUserMeta(@SessionFromRequest() session: Session): Promise<UserMetaDto> {
    return await this.service.getUserMeta(session)
  }

  @Post(ROUTE_ACTIVE_TEAM)
  @HttpCode(204)
  @ApiOperation({
    description:
      "Request must include `teamID`.",
    summary: "Create a new team.",
  })
  @ApiBody({ type: ActivateTeamDto })
  @ApiNoContentResponse({ description: 'New team created.' })
  async activateTeam(@Body() request: ActivateTeamDto, @IdentityFromRequest() identity: Identity): Promise<void> {
    await this.service.activateTeam(request, identity)
  }

  @Post(`${ROUTE_INVITATIONS}/${ROUTE_TEAM_ID}`)
  @HttpCode(204)
<<<<<<< HEAD
  @ApiNoContentResponse({ description: 'Accept invitation to a team.' })
  @UuidParams(PARAM_TEAM_ID)
=======
  @ApiOperation({
    description:
      "Request must include `teamID`.",
    summary: "Accept invitation to a team.",
  })
  @ApiNoContentResponse({ description: 'Invitation accepted.' })
>>>>>>> 5d447b6a (feat(crux): improve openapi docs)
  async acceptTeamInvitation(@TeamId() teamId: string, @IdentityFromRequest() identity: Identity): Promise<void> {
    await this.service.acceptTeamInvitation(teamId, identity)
  }

  @Delete(`${ROUTE_INVITATIONS}/${ROUTE_TEAM_ID}`)
  @HttpCode(204)
<<<<<<< HEAD
  @ApiNoContentResponse({ description: 'Reject invitation to a team.' })
  @UuidParams(PARAM_TEAM_ID)
=======
  @ApiOperation({
    description:
      "Request must include `teamID`.",
    summary: "Decline invitation to a team.",
  })
  @ApiNoContentResponse({ description: 'Invitation declined.' })
>>>>>>> 5d447b6a (feat(crux): improve openapi docs)
  async declineTeamInvitation(@TeamId() teamId: string, @IdentityFromRequest() identity: Identity): Promise<void> {
    await this.service.declineTeamInvitation(teamId, identity)
  }
}
