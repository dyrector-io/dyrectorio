import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Identity } from '@ory/kratos-client'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorator'
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
  // TODO(@polaroi8d): Refactor the auditlog after removing gRPC
  @AuditLogLevel('disabled')
  async getDashboard(@IdentityFromRequest() identity: Identity): Promise<DashboardDto> {
    return await this.service.getDashboard(identity)
  }
}
