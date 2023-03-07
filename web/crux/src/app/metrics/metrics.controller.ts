import { Controller, Get, Response, UseInterceptors } from '@nestjs/common'
import { PrometheusController } from '@willsoto/nestjs-prometheus'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorator'
import HttpLoggerInterceptor from 'src/interceptors/http.logger.interceptor'

@Controller()
@UseInterceptors(HttpLoggerInterceptor)
export default class MetricsController extends PrometheusController {
  @Get()
  @AuditLogLevel('disabled')
  async index(@Response() response: Response): Promise<string> {
    return await super.index(response)
  }
}
