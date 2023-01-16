import { Controller, Post, Body } from '@nestjs/common'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorators'
import { CreateEntityResponse, CreateVersionRequest } from 'src/grpc/protobuf/proto/crux'
import VersionService from './version.service'

@Controller('version')
export default class VersionHttpController {
  constructor(private service: VersionService) {}

  @Post()
  @AuditLogLevel('disabled')
  async createProduct(@Body() request: CreateVersionRequest): Promise<CreateEntityResponse> {
    return this.service.createVersion(request)
  }
}
