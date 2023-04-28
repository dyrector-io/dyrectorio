import { Controller, Get, HttpCode } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Identity } from '@ory/kratos-client'
import { IdentityFromRequest } from '../token/jwt-auth.guard'
import { DashboardDto } from './dashboard.dto'
import DashboardService from './dashboard.service'

@Controller('dashboard')
@ApiTags('dashboard')
export default class DashboardHttpController {
  constructor(private service: DashboardService) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({
    description:
      'Response should include `users`, number of `auditLogEntries`, `products`, `versions`, `deployments`, `failedDeployments`, details of `nodes`, `latestDeployments` and `auditLog` entries.',
    summary: 'Fetch dashboard data of latest activities.',
  })
  @ApiOkResponse({ type: DashboardDto, description: 'Dashboard data listed.' })
  async getDashboard(@IdentityFromRequest() identity: Identity): Promise<DashboardDto> {
    return await this.service.getDashboard(identity)
  }
}
