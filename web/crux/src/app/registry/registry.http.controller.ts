import { Controller, Get, UseGuards, UseInterceptors, UseFilters } from '@nestjs/common'
import { ApiBody, ApiOkResponse } from '@nestjs/swagger'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorators'
import HttpExceptionFilter from 'src/filters/http-exception.filter'
import { RegistryListResponse } from 'src/grpc/protobuf/proto/crux'
import HttpLoggerInterceptor from 'src/interceptors/http.logger.interceptor'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'
import { AccessRequestDto, RegistryListResponseDto } from 'src/swagger/crux.dto'
import { HttpIdentityInterceptor, IdentityFromRequest } from 'src/interceptors/http.identity.interceptor'
import { Identity } from '@ory/kratos-client'
import HttpResponseTransformInterceptor, {
  TransformResponse,
} from 'src/interceptors/http.response.transform.interceptor'
import JwtAuthGuard from '../token/jwt-auth.guard'
import RegistryService from './registry.service'
import RegistryGetHTTPPipe from './pipes/registry.get.http.pipe'

@Controller('registry')
@UseGuards(JwtAuthGuard)
@UseInterceptors(
  HttpLoggerInterceptor,
  PrismaErrorInterceptor,
  HttpIdentityInterceptor,
  HttpResponseTransformInterceptor,
)
@UseFilters(HttpExceptionFilter)
export default class RegistryHttpController {
  constructor(private service: RegistryService) {}

  @Get()
  @ApiBody({ type: AccessRequestDto })
  @ApiOkResponse({ type: RegistryListResponseDto })
  @AuditLogLevel('disabled')
  @TransformResponse(RegistryGetHTTPPipe)
  async getRegistries(@IdentityFromRequest() identity: Identity): Promise<RegistryListResponse> {
    return await this.service.getRegistries(identity)
  }
}
