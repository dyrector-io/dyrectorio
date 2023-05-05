import { Controller, Get } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { HealthDto } from './health.dto'
import HealthService from './health.service'
import { DisableAuth } from '../token/jwt-auth.guard'

const ROUTE_HEALTH = 'health'

@Controller(ROUTE_HEALTH)
@ApiTags(ROUTE_HEALTH)
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
