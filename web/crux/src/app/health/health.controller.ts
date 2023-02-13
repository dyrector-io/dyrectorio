import { Controller, UseInterceptors } from '@nestjs/common'
import { Observable } from 'rxjs'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorators'
import { NotImplementedException } from 'src/exception/errors'
import { CruxHealthController, CruxHealthControllerMethods, HealthResponse } from 'src/grpc/protobuf/proto/crux'
import {
  HealthCheckRequest,
  HealthCheckResponse,
  HealthController as ProtoHealthController,
  HealthControllerMethods,
} from 'src/grpc/protobuf/proto/health'
import CommonGrpcErrorInterceptor from 'src/interceptors/grpc.error.interceptor'
import GrpcLoggerInterceptor from 'src/interceptors/grpc.logger.interceptor'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'
import HealthService from './health.service'

@Controller()
@CruxHealthControllerMethods()
@HealthControllerMethods()
@UseInterceptors(GrpcLoggerInterceptor, CommonGrpcErrorInterceptor, PrismaErrorInterceptor)
export default class HealthController implements CruxHealthController, ProtoHealthController {
  constructor(private readonly service: HealthService) {}

  @AuditLogLevel('disabled')
  async getHealth(): Promise<HealthResponse> {
    return this.service.getCruxHealth()
  }

  @AuditLogLevel('disabled')
  async check(request: HealthCheckRequest): Promise<HealthCheckResponse> {
    return await this.service.getHealthCheck(request)
  }

  @AuditLogLevel('disabled')
  watch(): Observable<HealthCheckResponse> {
    throw new NotImplementedException({
      message: 'gRPC watch is not implemented',
      method: 'watch',
    })
  }
}
