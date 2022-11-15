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
import AuditService from './audit.service'

@Controller()
@CruxAuditControllerMethods()
@UseInterceptors(GrpcLoggerInterceptor, GrpcErrorInterceptor)
export default class AuditController implements CruxAuditController {
  constructor(private service: AuditService) {}

  async getAuditLog(request: AuditLogListRequest): Promise<AuditLogListResponse> {
    return await this.service.getAuditLog(request)
  }

  async getAuditLogListCount(request: AuditLogListRequest): Promise<AuditLogListCountResponse> {
    return await this.service.getAuditLogListCount(request)
  }
}
