import { Metadata } from '@grpc/grpc-js'
import { Controller, UseGuards, UseInterceptors } from '@nestjs/common'
import UseGrpcInterceptors from 'src/decorators/grpc-interceptors.decorator'
import {
  AuditLogListCountResponse,
  AuditLogListRequest,
  AuditLogListResponse,
  CruxAuditController,
  CruxAuditControllerMethods,
} from 'src/grpc/protobuf/proto/crux'
import GrpcLoggerInterceptor from 'src/interceptors/grpc.logger.interceptor'
import UserAccessGuard, { IdentityAwareServerSurfaceCall } from 'src/shared/user-access.guard'
import AuditService from './audit.service'

@Controller()
@CruxAuditControllerMethods()
@UseGuards(UserAccessGuard)
@UseGrpcInterceptors()
export default class AuditGrpcController implements CruxAuditController {
  constructor(private service: AuditService) {}

  async getAuditLog(
    request: AuditLogListRequest,
    _: Metadata,
    call: IdentityAwareServerSurfaceCall,
  ): Promise<AuditLogListResponse> {
    return await this.service.getAuditLog(request, call.user)
  }

  async getAuditLogListCount(
    request: AuditLogListRequest,
    _: Metadata,
    call: IdentityAwareServerSurfaceCall,
  ): Promise<AuditLogListCountResponse> {
    return await this.service.getAuditLogListCount(request, call.user)
  }
}
