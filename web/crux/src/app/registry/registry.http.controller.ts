import { Controller, Get, UseGuards, UseInterceptors, UseFilters } from '@nestjs/common'
import { ApiBody, ApiOkResponse } from '@nestjs/swagger'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorator'
import HttpExceptionFilter from 'src/filters/http-exception.filter'
import { RegistryListResponse } from 'src/grpc/protobuf/proto/crux'
import HttpLoggerInterceptor from 'src/interceptors/http.logger.interceptor'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'
import { AccessRequestDto, RegistryListResponseDto } from 'src/swagger/crux.dto'
import { Identity } from '@ory/kratos-client'
import JwtAuthGuard, { IdentityFromRequest } from '../token/jwt-auth.guard'
import RegistryService from './registry.service'

@Controller('registry')
@UseGuards(JwtAuthGuard)
@UseInterceptors(HttpLoggerInterceptor, PrismaErrorInterceptor)
@UseFilters(HttpExceptionFilter)
export default class RegistryHttpController {
  constructor(private service: RegistryService) {}

  @Get()
  @ApiBody({ type: AccessRequestDto })
  @ApiOkResponse({ type: RegistryListResponseDto })
  @AuditLogLevel('disabled')
  async getRegistries(@IdentityFromRequest() identity: Identity): Promise<RegistryListResponse> {
    return await this.service.getRegistries(identity)
  }
}
