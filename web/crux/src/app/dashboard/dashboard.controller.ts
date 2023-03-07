import { Metadata } from '@grpc/grpc-js'
import { Controller, UseGuards } from '@nestjs/common'
import { Identity } from '@ory/kratos-client'
import UseGrpcInterceptors from 'src/decorators/grpc-interceptors.decorator'
import { Empty } from 'src/grpc/protobuf/proto/common'
import {
  CruxDashboardController,
  CruxDashboardControllerMethods,
  DashboardResponse,
} from 'src/grpc/protobuf/proto/crux'
import UserAccessGuard, { IdentityFromGrpcCall } from 'src/shared/user-access.guard'
import DashboardService from './dashboard.service'

@Controller()
@CruxDashboardControllerMethods()
@UseGuards(UserAccessGuard)
@UseGrpcInterceptors()
export default class DashboardController implements CruxDashboardController {
  constructor(private service: DashboardService) {}

  async getDashboard(_: Empty, __: Metadata, @IdentityFromGrpcCall() identity: Identity): Promise<DashboardResponse> {
    return await this.service.getDashboard(identity)
  }
}
