import { Controller, Get, HttpCode, Response, UseInterceptors } from '@nestjs/common'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { PrometheusController } from '@willsoto/nestjs-prometheus'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorator'
import HttpLoggerInterceptor from 'src/interceptors/http.logger.interceptor'

@Controller()
@ApiTags('metrics')
@UseInterceptors(HttpLoggerInterceptor)
export default class MetricsController extends PrometheusController {
  @Get()
  @HttpCode(200)
  @AuditLogLevel('disabled')
  @ApiOkResponse({ type: String, description: 'Prometheus metrics' })
  async index(@Response() response: Response): Promise<string> {
    return await super.index(response)
  }
}
