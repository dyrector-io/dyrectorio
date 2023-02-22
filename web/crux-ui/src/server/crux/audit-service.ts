import { AuditLog, AuditLogListRequest } from '@app/models'
import {
  AuditLogListCountResponse,
  AuditLogListRequest as ProtoAuditLogRequest,
  AuditLogListResponse,
  CruxAuditClient,
} from '@app/models/grpc/protobuf/proto/crux'
import { timestampToUTC, toTimestamp } from '@app/utils'
import { protomisify } from './grpc-connection'

class DyoAuditService {
  constructor(private client: CruxAuditClient, private cookie: string) {}

  async getAuditLog(request: AuditLogListRequest): Promise<AuditLog[]> {
    const req: ProtoAuditLogRequest = DyoAuditService.getListRequest(request)

    const auditLog = await protomisify<ProtoAuditLogRequest, AuditLogListResponse>(
      this.client,
      this.client.getAuditLog,
      this.cookie,
    )(ProtoAuditLogRequest, req)

    return auditLog.data.map(it => ({
      identityEmail: it.identityEmail,
      date: timestampToUTC(it.createdAt),
      event: it.serviceCall,
      info: it.data,
    }))
  }

  async getAuditLogListCount(request: AuditLogListRequest): Promise<number> {
    const req: ProtoAuditLogRequest = DyoAuditService.getListRequest(request)

    const response = await protomisify<ProtoAuditLogRequest, AuditLogListCountResponse>(
      this.client,
      this.client.getAuditLogListCount,
      this.cookie,
    )(ProtoAuditLogRequest, req)

    return response.count
  }

  private static getListRequest(request: AuditLogListRequest): ProtoAuditLogRequest {
    return {
      ...request,
      createdFrom: request.createdFrom ? toTimestamp(new Date(request.createdFrom)) : null,
      createdTo: toTimestamp(new Date(request.createdTo)),
    }
  }
}

export default DyoAuditService
