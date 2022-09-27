import { AuditLog, AuditLogListRequest } from '@app/models'
import {
  AuditLogListCountResponse,
  AuditLogListRequest as ProtoAuditLogRequest,
  AuditLogListResponse,
  CruxAuditClient,
} from '@app/models/grpc/protobuf/proto/crux'
import { timestampToUTC, toTimestamp } from '@app/utils'
import { Identity } from '@ory/kratos-client'
import { protomisify } from './grpc-connection'

class DyoAuditService {
  constructor(private client: CruxAuditClient, private identity: Identity) {}

  async getAuditLog(request: AuditLogListRequest): Promise<AuditLog[]> {
    const req: ProtoAuditLogRequest = this.getListRequest(request)

    const auditLog = await protomisify<ProtoAuditLogRequest, AuditLogListResponse>(
      this.client,
      this.client.getAuditLog,
    )(ProtoAuditLogRequest, req)

    return auditLog.data.map(it => ({
      identityEmail: it.identityEmail,
      date: timestampToUTC(it.createdAt),
      event: it.serviceCall,
      info: it.data,
    }))
  }

  async getAuditLogListCount(request: AuditLogListRequest): Promise<number> {
    const req: ProtoAuditLogRequest = this.getListRequest(request)

    const response = await protomisify<ProtoAuditLogRequest, AuditLogListCountResponse>(
      this.client,
      this.client.getAuditLogListCount,
    )(ProtoAuditLogRequest, req)

    return response.count
  }

  private getListRequest(request: AuditLogListRequest): ProtoAuditLogRequest {
    return {
      ...request,
      createdFrom: request.createdFrom ? toTimestamp(new Date(request.createdFrom)) : null,
      createdTo: toTimestamp(new Date(request.createdTo)),
      accessedBy: this.identity.id,
    }
  }
}

export default DyoAuditService
