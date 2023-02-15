import { Controller, Post, Body, Get, UseGuards, UseInterceptors } from '@nestjs/common'
import { ApiBody } from '@nestjs/swagger'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorators'
import {
  CreateEntityResponse,
  CreateVersionRequest,
  IdRequest,
  IncreaseVersionRequest,
  VersionListResponse,
} from 'src/grpc/protobuf/proto/crux'
import HttpLoggerInterceptor from 'src/interceptors/http.logger.interceptor'
import { CreateVersionRequestDto, IdRequestDto } from 'src/swagger/crux.dto'
import JwtAuthGuard from '../token/jwt-auth.guard'
import VersionIncreaseValidationPipe from './pipes/version.increase.pipe'
import VersionService from './version.service'

@Controller('version')
@UseGuards(JwtAuthGuard)
@UseInterceptors(HttpLoggerInterceptor)
export default class VersionHttpController {
  constructor(private service: VersionService) {}

  @Get()
  @ApiBody({ type: IdRequestDto })
  @AuditLogLevel('disabled')
  async getVersionsByProductId(@Body() request: IdRequest): Promise<VersionListResponse> {
    return await this.service.getVersionsByProductId(request)
  }

  @Post()
  @ApiBody({ type: CreateVersionRequestDto })
  @AuditLogLevel('disabled')
  async createVersion(@Body() request: CreateVersionRequest): Promise<CreateEntityResponse> {
    return await this.service.createVersion(request)
  }

  @Post('increase')
  @ApiBody({ type: CreateVersionRequestDto })
  @AuditLogLevel('disabled')
  async increaseVersion(
    @Body(VersionIncreaseValidationPipe) request: IncreaseVersionRequest,
  ): Promise<CreateEntityResponse> {
    return await this.service.increaseVersion(request)
  }
}
