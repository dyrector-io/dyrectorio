import { Controller, Post, Body, Get, UseGuards, UseInterceptors, Version } from '@nestjs/common'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorators'
import {
  CreateEntityResponse,
  CreateVersionRequest,
  IdRequest,
  IncreaseVersionRequest,
  VersionListResponse,
} from 'src/grpc/protobuf/proto/crux'
import HttpLoggerInterceptor from 'src/interceptors/http.logger.interceptor'
import JwtAuthGuard from '../token/jwt-auth.guard'
import VersionIncreaseValidationPipe from './pipes/version.increase.pipe'
import VersionService from './version.service'

@Controller('version')
export default class VersionHttpController {
  constructor(private service: VersionService) {}

  @Get()
  @Version('1')
  @AuditLogLevel('disabled')
  async getVersionsByProductId(@Body() request: IdRequest): Promise<VersionListResponse> {
    return await this.service.getVersionsByProductId(request)
  }

  @Post()
  @Version('1')
  @AuditLogLevel('disabled')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(HttpLoggerInterceptor)
  async createVersion(@Body() request: CreateVersionRequest): Promise<CreateEntityResponse> {
    return await this.service.createVersion(request)
  }

  @Post('increase')
  @Version('1')
  @AuditLogLevel('disabled')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(HttpLoggerInterceptor)
  async increaseVersion(
    @Body(VersionIncreaseValidationPipe) request: IncreaseVersionRequest,
  ): Promise<CreateEntityResponse> {
    return await this.service.increaseVersion(request)
  }
}
