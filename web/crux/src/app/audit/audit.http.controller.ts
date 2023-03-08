import { Body, Controller, Post, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common'
import { ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { Identity } from '@ory/kratos-client'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorator'
import { HttpIdentityInterceptor, IdentityFromRequest } from 'src/interceptors/http.identity.interceptor'
import HttpLoggerInterceptor from 'src/interceptors/http.logger.interceptor'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'
import JwtAuthGuard from '../token/jwt-auth.guard'
import { AuditLogListCountResponseDto, AuditLogListResponseDto, AuditLogListRequestDto } from './audit.dto'
import AuditService from './audit.service'

@Controller('audit')
@ApiTags('audit')
@UseGuards(JwtAuthGuard)
@UsePipes(ValidationPipe)
@UseInterceptors(HttpLoggerInterceptor, HttpIdentityInterceptor, PrismaErrorInterceptor)
export default class AuditController {
  constructor(private service: AuditService) {}

  @Post()
  @ApiOkResponse()
  @ApiBody({ type: AuditLogListRequestDto })
  @AuditLogLevel('disabled') // TODO(@polaroi8d): Refactor the auditlog after removing gRPC
  async getAuditLog(
    @Body() request: AuditLogListRequestDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<AuditLogListResponseDto> {
    // Convert the Date string to Date object
    if (request.createdFrom) {
      request.createdFrom = new Date(request.createdFrom)
    }
    request.createdTo = new Date(request.createdTo)

    return await this.service.getAuditLog(request, identity)
  }

  @Post('/count')
  @ApiOkResponse()
  @AuditLogLevel('disabled') // TODO(@polaroi8d): Refactor the auditlog after removing gRPC
  async getAuditLogListCount(
    @Body() request: AuditLogListRequestDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<AuditLogListCountResponseDto> {
    return await this.service.getAuditLogListCount(request, identity)
  }
}
