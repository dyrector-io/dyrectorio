import { Controller, Get, UseInterceptors } from '@nestjs/common'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'
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
  @ApiOkResponse({
    type: HealthDto,
  })
  async getHealth(): Promise<HealthDto> {
    return this.service.getCruxHealth()
  }
}
