import { Metadata } from '@grpc/grpc-js'
import { Controller, UseGuards } from '@nestjs/common'
import { Identity } from '@ory/kratos-client'
import UseGrpcInterceptors from 'src/decorators/grpc-interceptors.decorator'
import {
  AuditLogListCountResponse,
  AuditLogListRequest,
  AuditLogListResponse,
  CruxAuditController,
  CruxAuditControllerMethods,
} from 'src/grpc/protobuf/proto/crux'
import UserAccessGuard, { IdentityFromGrpcCall } from 'src/shared/user-access.guard'
import AuditService from './audit.service'

@Controller()
@CruxAuditControllerMethods()
@UseGuards(UserAccessGuard)
@UseGrpcInterceptors()
export default class AuditController implements CruxAuditController {
  constructor(private service: AuditService) {}

  async getAuditLog(
    request: AuditLogListRequest,
    _: Metadata,
    @IdentityFromGrpcCall() identity: Identity,
  ): Promise<AuditLogListResponse> {
    return await this.service.getAuditLog(request, identity)
  }

  async getAuditLogListCount(
    request: AuditLogListRequest,
    _: Metadata,
    @IdentityFromGrpcCall() identity: Identity,
  ): Promise<AuditLogListCountResponse> {
    return await this.service.getAuditLogListCount(request, identity)
  }
}
