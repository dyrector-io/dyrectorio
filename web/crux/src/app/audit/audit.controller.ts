import { Metadata } from '@grpc/grpc-js'
import { Controller } from '@nestjs/common'
import UseGrpcInterceptors from 'src/decorators/grpc-interceptors.decorator'
import {
  AuditLogListCountResponse,
  AuditLogListRequest,
  AuditLogListResponse,
  CruxAuditController,
  CruxAuditControllerMethods,
} from 'src/grpc/protobuf/proto/crux'
import { getIdentity } from 'src/interceptors/grpc.user.interceptor'
import AuditService from './audit.service'

@Controller()
@CruxAuditControllerMethods()
@UseGrpcInterceptors()
export default class AuditController implements CruxAuditController {
  constructor(private service: AuditService) {}

  async getAuditLog(request: AuditLogListRequest, metadata: Metadata): Promise<AuditLogListResponse> {
    return await this.service.getAuditLog(request, getIdentity(metadata))
  }

  async getAuditLogListCount(request: AuditLogListRequest, metadata: Metadata): Promise<AuditLogListCountResponse> {
    return await this.service.getAuditLogListCount(request, getIdentity(metadata))
  }
}
