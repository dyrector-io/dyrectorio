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
import { ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger'
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
  @ApiOkResponse({ type: UserMetaDto })
  async getUserMeta(@SessionFromRequest() session: Session): Promise<UserMetaDto> {
    return await this.service.getUserMeta(session)
  }

  @Post(ROUTE_ACTIVE_TEAM)
  @HttpCode(204)
  @ApiBody({ type: ActivateTeamDto })
  async activateTeam(@Body() request: ActivateTeamDto, @IdentityFromRequest() identity: Identity): Promise<void> {
    await this.service.activateTeam(request, identity)
  }

  @Post(`${ROUTE_INVITATIONS}/${ROUTE_TEAM_ID}`)
  @HttpCode(204)
  @UuidParams([PARAM_TEAM_ID])
  async acceptTeamInvitation(@TeamId() teamId: string, @IdentityFromRequest() identity: Identity): Promise<void> {
    await this.service.acceptTeamInvitation(teamId, identity)
  }

  @Delete(`${ROUTE_INVITATIONS}/${ROUTE_TEAM_ID}`)
  @HttpCode(204)
  @UuidParams([PARAM_TEAM_ID])
  async declineTeamInvitation(@TeamId() teamId: string, @IdentityFromRequest() identity: Identity): Promise<void> {
    await this.service.declineTeamInvitation(teamId, identity)
  }
}
