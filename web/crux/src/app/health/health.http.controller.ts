import { Controller, Get } from '@nestjs/common'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { HealthDto } from './health.dto'
import HealthService from './health.service'

const ROUTE_HEALTH = 'health'

@Controller(ROUTE_HEALTH)
@ApiTags(ROUTE_HEALTH)
export default class HealthHttpController {
  constructor(private service: HealthService) {}

  @Get()
  @ApiOkResponse({
    type: HealthDto,
    description: 'Return service status of the platform.',
  })
  async getHealth(): Promise<HealthDto> {
    return this.service.getCruxHealth()
  }
}
