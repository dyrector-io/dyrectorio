import { Controller, Get, Body } from '@nestjs/common'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorators'
import { AccessRequest, RegistryListResponse } from 'src/grpc/protobuf/proto/crux'
import RegistryService from './registry.service'

@Controller('registry')
export default class RegistryHttpController {
  constructor(private service: RegistryService) {}

  @Get()
  @AuditLogLevel('disabled')
  async getRegistries(@Body() request: AccessRequest): Promise<RegistryListResponse> {
    return await this.service.getRegistries(request)
  }
}
