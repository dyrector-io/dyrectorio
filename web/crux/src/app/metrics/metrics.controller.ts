import { Controller, Get, HttpCode, Response } from '@nestjs/common'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { PrometheusController } from '@willsoto/nestjs-prometheus'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorator'
import { DisableAuth } from '../token/jwt-auth.guard'

@Controller()
@ApiTags('metrics')
export default class MetricsController extends PrometheusController {
  @Get()
  @HttpCode(200)
  @AuditLogLevel('disabled')
  @ApiOkResponse({ type: String, description: 'Prometheus metrics' })
  @DisableAuth()
  async index(@Response() response: Response): Promise<string> {
    return await super.index(response)
  }
}
