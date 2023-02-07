import { Controller, UseInterceptors } from '@nestjs/common'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorators'
import { CruxHealthController, CruxHealthControllerMethods, HealthResponse } from 'src/grpc/protobuf/proto/crux'
import CommonGrpcErrorInterceptor from 'src/interceptors/grpc.error.interceptor'
import GrpcLoggerInterceptor from 'src/interceptors/grpc.logger.interceptor'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'
import {
  HealthCheckRequest,
  HealthCheckResponse,
  HealthController as ProtoHealthController,
  HealthControllerMethods,
} from 'src/grpc/protobuf/proto/health'
import { Observable } from 'rxjs'
import { NotFoundException, NotImplementedException } from 'src/exception/errors'
import HealthService from './health.service'
import HealthMapper from './health.mapper'

@Controller()
@CruxHealthControllerMethods()
@HealthControllerMethods()
@UseInterceptors(GrpcLoggerInterceptor, CommonGrpcErrorInterceptor, PrismaErrorInterceptor)
export default class HealthController implements CruxHealthController, ProtoHealthController {
  constructor(private readonly service: HealthService, private mapper: HealthMapper) {}

  @AuditLogLevel('disabled')
  async getHealth(): Promise<HealthResponse> {
    return this.service.getHealth()
  }

  @AuditLogLevel('disabled')
  async check(request: HealthCheckRequest): Promise<HealthCheckResponse> {
    const status = await this.service.getServiceStatus(request.service)
    if (status) {
      return {
        status: this.mapper.serviceStatusToProto(status),
      }
    }

    throw new NotFoundException({
      property: 'service',
      value: request.service,
      message: 'Service not found',
    })
  }

  @AuditLogLevel('disabled')
  watch(): Observable<HealthCheckResponse> {
    throw new NotImplementedException({
      message: 'gRPC watch is not implemented',
      method: 'watch',
    })
  }
}
