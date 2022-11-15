import { Controller, UseInterceptors } from '@nestjs/common'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorators'
import { CruxHealthController, CruxHealthControllerMethods, HealthResponse } from 'src/grpc/protobuf/proto/crux'
import CommonGrpcErrorInterceptor from 'src/interceptors/grpc.error.interceptor'
import GrpcLoggerInterceptor from 'src/interceptors/grpc.logger.interceptor'
import HealthService from './health.service'

@Controller()
@CruxHealthControllerMethods()
@UseInterceptors(GrpcLoggerInterceptor, CommonGrpcErrorInterceptor)
export default class HealthController implements CruxHealthController {
  constructor(private readonly service: HealthService) {}

  @AuditLogLevel('disabled')
  async getHealth(): Promise<HealthResponse> {
    return this.service.getHealth()
  }
}
