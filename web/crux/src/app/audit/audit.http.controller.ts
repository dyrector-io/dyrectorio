import { Controller, Get, HttpCode, Query } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Identity } from '@ory/kratos-client'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorator'
import { IdentityFromRequest } from '../token/jwt-auth.guard'
import { AuditLogListDto, AuditLogQueryDto } from './audit.dto'
import AuditService from './audit.service'

@Controller('audit-log')
@ApiTags('audit-log')
export default class AuditController {
  constructor(private service: AuditService) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({
    description:
      'Request must include `skip`, `take`, and dates of `from` and `to`. Response should include an array of `items`: `createdAt` date, `userId`, `email`, `serviceCall`, and `data`.',
    summary: 'Fetch audit log.',
  })
  @ApiOkResponse({ type: AuditLogListDto, description: 'Paginated list of the Audit log.' })
  @AuditLogLevel('all')
  async getAuditLog(
    @Query() query: AuditLogQueryDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<AuditLogListDto> {
    return await this.service.getAuditLog(query, identity)
  }
}
