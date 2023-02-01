import { Controller, Get, Post, Body } from '@nestjs/common'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorators'
import {
  CreateEntityResponse,
  CreateVersionRequest,
  IdRequest,
  IncreaseVersionRequest,
  VersionListResponse,
} from 'src/grpc/protobuf/proto/crux'
import VersionIncreaseValidationPipe from './pipes/version.increase.pipe'
import VersionService from './version.service'

@Controller('version')
export default class VersionHttpController {
  constructor(private service: VersionService) {}

  @Get()
  @AuditLogLevel('disabled')
  async getVersionsByProductId(@Body() request: IdRequest): Promise<VersionListResponse> {
    return await this.service.getVersionsByProductId(request)
  }

  @Post()
  @AuditLogLevel('disabled')
  async createVersion(@Body() request: CreateVersionRequest): Promise<CreateEntityResponse> {
    return await this.service.createVersion(request)
  }

  @Post('increase')
  @AuditLogLevel('disabled')
  async increaseVersion(
    @Body(VersionIncreaseValidationPipe) request: IncreaseVersionRequest,
  ): Promise<CreateEntityResponse> {
    return await this.service.increaseVersion(request)
  }
}
