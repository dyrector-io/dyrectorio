import { Controller } from '@nestjs/common'
import {
  AuditLogListRequest,
  AuditLogListResponse,
  AuditLogListCountResponse,
  CruxAuditController,
  CruxAuditControllerMethods,
} from 'src/grpc/protobuf/proto/crux'
import AuditService from './audit.service'

@Controller()
@CruxAuditControllerMethods()
export default class AuditController implements CruxAuditController {
  constructor(private service: AuditService) {}

  async getAuditLog(request: AuditLogListRequest): Promise<AuditLogListResponse> {
    return await this.service.getAuditLog(request)
  }

  async getAuditLogListCount(request: AuditLogListRequest): Promise<AuditLogListCountResponse> {
    return await this.service.getAuditLogListCount(request)
  }
}
