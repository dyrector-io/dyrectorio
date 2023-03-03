import { Metadata } from '@grpc/grpc-js'
import { Controller } from '@nestjs/common'
import UseGrpcInterceptors from 'src/decorators/grpc-interceptors.decorator'
import { Empty } from 'src/grpc/protobuf/proto/common'
import {
  CruxDashboardController,
  CruxDashboardControllerMethods,
  DashboardResponse,
} from 'src/grpc/protobuf/proto/crux'
import { getIdentity } from 'src/interceptors/grpc.user.interceptor'
import DashboardService from './dashboard.service'

@Controller()
@CruxDashboardControllerMethods()
@UseGrpcInterceptors()
export default class DashboardController implements CruxDashboardController {
  constructor(private service: DashboardService) {}

  async getDashboard(_: Empty, metadata: Metadata): Promise<DashboardResponse> {
    return await this.service.getDashboard(getIdentity(metadata))
  }
}
