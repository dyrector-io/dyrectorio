import { Controller, Get, Query, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { Identity } from '@ory/kratos-client'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorator'
import { HttpIdentityInterceptor, IdentityFromRequest } from 'src/interceptors/http.identity.interceptor'
import HttpLoggerInterceptor from 'src/interceptors/http.logger.interceptor'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'
import JwtAuthGuard from '../token/jwt-auth.guard'
import { AuditLogListDto, AuditLogQuery } from './audit.dto'
import AuditService from './audit.service'

@Controller('audit-log')
@ApiTags('audit-log')
@UseGuards(JwtAuthGuard)
@UsePipes(
  new ValidationPipe({
    transform: true,
  }),
)
@UseInterceptors(HttpLoggerInterceptor, HttpIdentityInterceptor, PrismaErrorInterceptor)
export default class AuditController {
  constructor(private service: AuditService) {}

  @Get()
  @ApiOkResponse()
  @AuditLogLevel('disabled') // TODO(@polaroi8d): Refactor the auditlog after removing gRPC
  async getAuditLog(
    @Query() query: AuditLogQuery,
    @IdentityFromRequest() identity: Identity,
  ): Promise<AuditLogListDto> {
    return await this.service.getAuditLog(query, identity)
  }
}
