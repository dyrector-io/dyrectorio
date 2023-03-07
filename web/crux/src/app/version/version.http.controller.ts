import { Controller, Post, Body, Get, UseGuards, UseInterceptors, UseFilters } from '@nestjs/common'
import { ApiBody, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorator'
import HttpExceptionFilter from 'src/filters/http-exception.filter'
import {
  CreateEntityResponse,
  IdRequest,
  IncreaseVersionRequest,
  VersionListResponse,
} from 'src/grpc/protobuf/proto/crux'
import HttpLoggerInterceptor from 'src/interceptors/http.logger.interceptor'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'
import {
  CreateEntityResponseDto,
  CreateVersionRequestDto,
  IdRequestDto,
  VersionListResponseDto,
} from 'src/swagger/crux.dto'
import { HttpIdentityInterceptor, IdentityFromRequest } from 'src/interceptors/http.identity.interceptor'
import { Identity } from '@ory/kratos-client'
import JwtAuthGuard from '../token/jwt-auth.guard'
import VersionIncreaseValidationPipe from './pipes/version.increase.pipe'
import VersionService from './version.service'

@Controller('version')
@UseGuards(JwtAuthGuard)
@UseInterceptors(HttpLoggerInterceptor, PrismaErrorInterceptor, HttpIdentityInterceptor)
@UseFilters(HttpExceptionFilter)
export default class VersionHttpController {
  constructor(private service: VersionService) {}

  @Get()
  @ApiBody({ type: IdRequestDto })
  @ApiOkResponse({ type: VersionListResponseDto })
  @AuditLogLevel('disabled')
  async getVersionsByProductId(
    @Body() request: IdRequest,
    @IdentityFromRequest() identity: Identity,
  ): Promise<VersionListResponse> {
    return await this.service.getVersionsByProductId(request, identity)
  }

  @Post()
  @ApiBody({ type: CreateVersionRequestDto })
  @ApiCreatedResponse({ type: CreateEntityResponseDto })
  @AuditLogLevel('disabled')
  async createVersion(
    @Body() request: CreateVersionRequestDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<CreateEntityResponse> {
    return await this.service.createVersion(request, identity)
  }

  @Post('increase')
  @ApiBody({ type: CreateVersionRequestDto })
  @ApiCreatedResponse({ type: CreateEntityResponseDto })
  @AuditLogLevel('disabled')
  async increaseVersion(
    @Body(VersionIncreaseValidationPipe) request: IncreaseVersionRequest,
    @IdentityFromRequest() identity: Identity,
  ): Promise<CreateEntityResponse> {
    return await this.service.increaseVersion(request, identity)
  }
}
