import { Controller, Get, HttpCode } from '@nestjs/common'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { Identity } from '@ory/kratos-client'
import { IdentityFromRequest } from '../token/jwt-auth.guard'
import { DashboardDto } from './dashboard.dto'
import DashboardService from './dashboard.service'

@Controller('dashboard')
@ApiTags('dashboard')
export default class DashboardController {
  constructor(private service: DashboardService) {}

  @Get()
  @HttpCode(200)
  @ApiOkResponse({ type: DashboardDto, description: 'Fetch dashboard data of latest activities.' })
  async getDashboard(@IdentityFromRequest() identity: Identity): Promise<DashboardDto> {
    return await this.service.getDashboard(identity)
  }
}
