import { Controller, Get, HttpCode, HttpStatus, Response } from '@nestjs/common'
import { ApiForbiddenResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { PrometheusController } from '@willsoto/nestjs-prometheus'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorator'
import { DisableAuth } from '../token/jwt-auth.guard'

@Controller()
@ApiTags('metrics')
export default class MetricsController extends PrometheusController {
  @Get()
  @HttpCode(HttpStatus.OK)
  @AuditLogLevel('disabled')
  @ApiOkResponse({ type: String, description: 'Prometheus metrics.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for Prometheus.' })
  @DisableAuth()
  async index(@Response() response: Response): Promise<string> {
    return await super.index(response)
  }
}
