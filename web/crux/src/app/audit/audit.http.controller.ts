import { Controller, Get, HttpCode, Query } from '@nestjs/common'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { Identity } from '@ory/kratos-client'
import { IdentityFromRequest } from '../token/jwt-auth.guard'
import { AuditLogListDto, AuditLogQueryDto } from './audit.dto'
import AuditService from './audit.service'

@Controller('audit-log')
@ApiTags('audit-log')
export default class AuditController {
  constructor(private service: AuditService) {}

  @Get()
  @HttpCode(200)
  @ApiOkResponse({ type: AuditLogListDto, description: 'Fetch audit log.' })
  async getAuditLog(
    @Query() query: AuditLogQueryDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<AuditLogListDto> {
    return await this.service.getAuditLog(query, identity)
  }
}
