import { Controller, Get, Query, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { Identity } from '@ory/kratos-client'
import HttpLoggerInterceptor from 'src/interceptors/http.logger.interceptor'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'
import JwtAuthGuard, { IdentityFromRequest } from '../token/jwt-auth.guard'
import { AuditLogListDto, AuditLogQueryDto } from './audit.dto'
import AuditService from './audit.service'

@Controller('audit-log')
@ApiTags('audit-log')
@UseGuards(JwtAuthGuard)
@UsePipes(
  new ValidationPipe({
    // TODO(@polaroi8d): Move to global pipes after removing gRPC
    transform: true,
  }),
)
@UseInterceptors(HttpLoggerInterceptor, PrismaErrorInterceptor)
export default class AuditController {
  constructor(private service: AuditService) {}

  @Get()
  @ApiOkResponse()
  async getAuditLog(
    @Query() query: AuditLogQueryDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<AuditLogListDto> {
    return await this.service.getAuditLog(query, identity)
  }
}
