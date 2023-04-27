import { Controller, Get, HttpCode, Query, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
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
  @HttpCode(200)
  @ApiOperation({
    description:
      'Request must include `skip`, `take`, and dates of `from` and `to`. Response should include an array of `items`: `createdAt` date, `userId`, `email`, `serviceCall`, and `data`.',
    summary: 'Fetch audit log.',
  })
  @ApiOkResponse({ type: AuditLogListDto, description: 'Audit log details listed.' })
  async getAuditLog(
    @Query() query: AuditLogQueryDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<AuditLogListDto> {
    return await this.service.getAuditLog(query, identity)
  }
}
