import { Controller, Get, UseInterceptors } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import HttpLoggerInterceptor from 'src/interceptors/http.logger.interceptor'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'
import HealthService from './health.service'
import { HealthDto } from './health.dto'

const ROUTE_HEALTH = 'health'

@Controller(ROUTE_HEALTH)
@ApiTags(ROUTE_HEALTH)
@UseInterceptors(HttpLoggerInterceptor, PrismaErrorInterceptor)
export default class HealthHttpController {
  constructor(private service: HealthService) {}

  @Get()
  @ApiOperation({
    description: 'Response should include `status`, `version` of the platform and `lastMigration` of database.',
    summary: 'Return service status of the platform.',
  })
  @ApiOkResponse({
    type: HealthDto,
    description: 'Service status listed.',
  })
  async getHealth(): Promise<HealthDto> {
    return this.service.getCruxHealth()
  }
}
