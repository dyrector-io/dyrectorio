import {
  CruxDashboardController,
  CruxDashboardControllerMethods,
  DashboardResponse,
} from 'src/grpc/protobuf/proto/crux'
import { Controller, UseInterceptors } from '@nestjs/common'
import GrpcErrorInterceptor from 'src/interceptors/grpc.error.interceptor'
import GrpcLoggerInterceptor from 'src/interceptors/grpc.logger.interceptor'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'
import GrpcUserInterceptor, { getAccessedBy } from 'src/interceptors/grpc.user.interceptor'
import { Metadata } from '@grpc/grpc-js'
import { Empty } from 'src/grpc/protobuf/proto/common'
import DashboardService from './dashboard.service'

@Controller()
@CruxDashboardControllerMethods()
@UseInterceptors(GrpcLoggerInterceptor, GrpcUserInterceptor, GrpcErrorInterceptor, PrismaErrorInterceptor)
export default class DashboardController implements CruxDashboardController {
  constructor(private service: DashboardService) {}

  async getDashboard(_: Empty, metadata: Metadata): Promise<DashboardResponse> {
    return await this.service.getDashboard(getAccessedBy(metadata))
  }
}
