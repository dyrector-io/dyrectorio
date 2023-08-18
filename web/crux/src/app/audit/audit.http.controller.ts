import { Controller, Get, HttpCode, HttpStatus, Param, Query } from '@nestjs/common'
import { ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuditLogListDto, AuditLogQueryDto } from './audit.dto'
import AuditService from './audit.service'

const ROUTE_TEAM_SLUG = ':teamSlug'
const PARAM_TEAM_SLUG = 'teamSlug'
const TeamSlug = () => Param(PARAM_TEAM_SLUG)

@Controller(`${ROUTE_TEAM_SLUG}/audit-log`)
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
  @ApiOkResponse({ type: AuditLogListDto, description: 'Paginated list of the audit log.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for audit logs.' })
  async getAuditLog(@TeamSlug() teamSlug: string, @Query() query: AuditLogQueryDto): Promise<AuditLogListDto> {
    return await this.service.getAuditLog(teamSlug, query)
  }
}
