import { Controller, Get } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { DisableTeamAccessGuard } from 'src/guards/team-access.guard'
import { DisableAuth } from '../token/jwt-auth.guard'
import { HealthDto } from './health.dto'
import HealthService from './health.service'

const ROUTE_HEALTH = 'health'

@Controller(ROUTE_HEALTH)
@ApiTags(ROUTE_HEALTH)
@DisableTeamAccessGuard()
export default class HealthHttpController {
  constructor(private service: HealthService) {}

  @Get()
  @ApiOperation({
    description: 'Response should include `status`, `version` of the platform and `lastMigration` of database.',
    summary: 'Return service status of the platform.',
  })
  @ApiOkResponse({
    type: HealthDto,
    description: 'Service status.',
  })
  @DisableAuth()
  async getHealth(): Promise<HealthDto> {
    return this.service.getCruxHealth()
  }
}
