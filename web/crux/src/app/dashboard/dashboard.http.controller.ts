import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common'
import { ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { DashboardDto } from './dashboard.dto'
import DashboardService from './dashboard.service'

const ROUTE_TEAM_SLUG = ':teamSlug'
const PARAM_TEAM_SLUG = 'teamSlug'
const TeamSlug = () => Param(PARAM_TEAM_SLUG)

@Controller(`${ROUTE_TEAM_SLUG}/dashboard`)
@ApiTags('dashboard')
export default class DashboardHttpController {
  constructor(private service: DashboardService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description:
      '`teamSlug` is required in URL. Response should include `users`, number of `auditLogEntries`, `projects`, `versions`, `deployments`, `failedDeployments`, details of `nodes`, `latestDeployments` and `auditLog` entries.',
    summary: 'Fetch dashboard data of latest activities.',
  })
  @ApiOkResponse({ type: DashboardDto, description: 'Dashboard data listed.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for the dashboard.' })
  async getDashboard(@TeamSlug() teamSlug: string): Promise<DashboardDto> {
    return await this.service.getDashboard(teamSlug)
  }
}
