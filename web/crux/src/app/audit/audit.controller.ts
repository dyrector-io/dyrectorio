import { Metadata } from '@grpc/grpc-js'
import { Controller, UseGuards } from '@nestjs/common'
import UseGrpcInterceptors from 'src/decorators/grpc-interceptors.decorator'
import {
  AuditLogListCountResponse,
  AuditLogListRequest,
  AuditLogListResponse,
  CruxAuditController,
  CruxAuditControllerMethods,
} from 'src/grpc/protobuf/proto/crux'
import UserAccessGuard, { IdentityAwareServerSurfaceCall } from 'src/shared/user-access.guard'
import AuditService from './audit.service'

@Controller()
@CruxAuditControllerMethods()
<<<<<<< HEAD
@UseGuards(UserAccessGuard)
@UseGrpcInterceptors()
export default class AuditController implements CruxAuditController {
=======
@UseInterceptors(GrpcLoggerInterceptor, GrpcUserInterceptor, GrpcErrorInterceptor, PrismaErrorInterceptor)
export default class AuditGrpcController implements CruxAuditController {
>>>>>>> 1095b230 (DRAFT: Initial auditlog and dashboard http API with session based authguard)
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
