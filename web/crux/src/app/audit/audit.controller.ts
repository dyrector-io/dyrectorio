import { Controller } from '@nestjs/common'
import {
  AccessRequest,
  AuditLogListResponse,
  CruxAuditController,
  CruxAuditControllerMethods,
} from 'src/grpc/protobuf/proto/crux'
import AuditService from './audit.service'

@Controller()
@CruxAuditControllerMethods()
export default class AuditController implements CruxAuditController {
  constructor(private service: AuditService) {}

  async getAuditLog(request: AccessRequest): Promise<AuditLogListResponse> {
    return await this.service.getAuditLog(request)
  }
}
