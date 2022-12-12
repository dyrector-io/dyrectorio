import {
  AccessRequest,
  CruxDashboardController,
  CruxDashboardControllerMethods,
  DashboardResponse,
} from 'src/grpc/protobuf/proto/crux'
import { Controller, UseInterceptors } from '@nestjs/common'
import GrpcErrorInterceptor from 'src/interceptors/grpc.error.interceptor'
import GrpcLoggerInterceptor from 'src/interceptors/grpc.logger.interceptor'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'
import DashboardService from './dashboard.service'

@Controller()
@CruxDashboardControllerMethods()
@UseInterceptors(GrpcLoggerInterceptor, GrpcErrorInterceptor, PrismaErrorInterceptor)
export default class DashboardController implements CruxDashboardController {
  constructor(private service: DashboardService) {}

  async getDashboard(request: AccessRequest): Promise<DashboardResponse> {
    return await this.service.getDashboard(request)
  }
}
