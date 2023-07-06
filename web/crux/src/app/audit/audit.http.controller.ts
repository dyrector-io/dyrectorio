import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Identity } from '@ory/kratos-client'
import { IdentityFromRequest } from '../token/jwt-auth.guard'
import { AuditLogListDto, AuditLogQueryDto } from './audit.dto'
import AuditService from './audit.service'

@Controller('audit-log')
@ApiTags('audit-log')
export default class AuditController {
  constructor(private service: AuditService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description:
      'Request must include `skip`, `take`, and dates of `from` and `to`. Response should include an array of `items`: `createdAt` date, `userId`, `email`, `serviceCall`, and `data`.',
    summary: 'Fetch audit log.',
  })
  @ApiOkResponse({ type: AuditLogListDto, description: 'Paginated list of the Audit log.' })
  async getAuditLog(
    @Query() query: AuditLogQueryDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<AuditLogListDto> {
    return await this.service.getAuditLog(query, identity)
  }
}
