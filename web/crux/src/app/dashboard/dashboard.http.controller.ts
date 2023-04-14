import { Controller, Get, HttpCode, UseGuards, UseInterceptors } from '@nestjs/common'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { Identity } from '@ory/kratos-client'
import HttpLoggerInterceptor from 'src/interceptors/http.logger.interceptor'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'
import JwtAuthGuard, { IdentityFromRequest } from '../token/jwt-auth.guard'
import DashboardDto from './dashboard.dto'
import DashboardService from './dashboard.service'

@Controller('dashboard')
@ApiTags('dashboard')
@UseGuards(JwtAuthGuard)
@UseInterceptors(HttpLoggerInterceptor, PrismaErrorInterceptor)
export default class DashboardController {
  constructor(private service: DashboardService) {}

  @Get()
  @HttpCode(200)
  @ApiOkResponse({ type: DashboardDto })
  async getDashboard(@IdentityFromRequest() identity: Identity): Promise<DashboardDto> {
    return await this.service.getDashboard(identity)
  }
}
