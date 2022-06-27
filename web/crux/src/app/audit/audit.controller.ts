import { Controller, UseInterceptors } from '@nestjs/common'
import { AuditLoggerInterceptor } from 'src/interceptors/audit-logger.interceptor'
import { GrpcContextLogger } from 'src/interceptors/grpc-context-logger.interceptor'
import { PrismaErrorInterceptor } from 'src/interceptors/prisma-error-interceptor'
import {
  AccessRequest,
  AuditLogListResponse,
  CruxAuditController,
  CruxAuditControllerMethods,
} from 'src/proto/proto/crux'
import { AuditService } from './audit.service'

@Controller()
@CruxAuditControllerMethods()
@UseInterceptors(PrismaErrorInterceptor, GrpcContextLogger, AuditLoggerInterceptor)
export class AuditController implements CruxAuditController {
  constructor(private service: AuditService) {}

  async getAuditLog(request: AccessRequest): Promise<AuditLogListResponse> {
    return await this.service.getAuditLog(request)
  }
}
