import { Metadata } from '@grpc/grpc-js'
import { Controller, UseInterceptors } from '@nestjs/common'
import {
  AuditLogListRequest,
  AuditLogListResponse,
  AuditLogListCountResponse,
  CruxAuditController,
  CruxAuditControllerMethods,
} from 'src/grpc/protobuf/proto/crux'
import GrpcErrorInterceptor from 'src/interceptors/grpc.error.interceptor'
import GrpcLoggerInterceptor from 'src/interceptors/grpc.logger.interceptor'
import GrpcUserInterceptor, { getAccessedBy } from 'src/interceptors/grpc.user.interceptor'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'
import AuditService from './audit.service'

@Controller()
@CruxAuditControllerMethods()
@UseInterceptors(GrpcLoggerInterceptor, GrpcUserInterceptor, GrpcErrorInterceptor, PrismaErrorInterceptor)
export default class AuditController implements CruxAuditController {
  constructor(private service: AuditService) {}

  async getAuditLog(request: AuditLogListRequest, metadata: Metadata): Promise<AuditLogListResponse> {
    return await this.service.getAuditLog(request, getAccessedBy(metadata))
  }

  async getAuditLogListCount(request: AuditLogListRequest, metadata: Metadata): Promise<AuditLogListCountResponse> {
    return await this.service.getAuditLogListCount(request, getAccessedBy(metadata))
  }
}
