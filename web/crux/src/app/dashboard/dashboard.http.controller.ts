import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Identity } from '@ory/kratos-client'
import { HttpIdentityInterceptor, IdentityFromRequest } from 'src/interceptors/http.identity.interceptor'
import HttpLoggerInterceptor from 'src/interceptors/http.logger.interceptor'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'
import JwtAuthGuard from '../token/jwt-auth.guard'
import DashboardResponse from './dashboard.dto'
import DashboardService from './dashboard.service'

@Controller('dashboard')
@ApiTags('dashboard')
@UseGuards(JwtAuthGuard)
@UseInterceptors(HttpLoggerInterceptor, HttpIdentityInterceptor, PrismaErrorInterceptor)
export default class DashboardController {
  constructor(private service: DashboardService) {}

  @Get()
  async getDashboard(@IdentityFromRequest() identity: Identity): Promise<DashboardResponse> {
    return await this.service.getDashboard(identity)
  }
}
