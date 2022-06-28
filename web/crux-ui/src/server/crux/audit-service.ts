import { AuditLog } from '@app/models'
import { AccessRequest, AuditLogListResponse, CruxAuditClient } from '@app/models/grpc/protobuf/proto/crux'
import { timestampToUTC } from '@app/utils'
import { Identity } from '@ory/kratos-client'
import { protomisify } from './grpc-connection'

class DyoAuditService {
  constructor(private client: CruxAuditClient, private identity: Identity) {}

  async getAuditLog(): Promise<AuditLog[]> {
    const req: AccessRequest = {
      accessedBy: this.identity.id,
    }

    const auditLog = await protomisify<AccessRequest, AuditLogListResponse>(this.client, this.client.getAuditLog)(
      AccessRequest,
      req,
    )

    return auditLog.data.map(it => {
      return {
        identityName: it.identityName,
        date: timestampToUTC(it.createdAt),
        event: it.serviceCall,
        info: it.data,
      }
    })
  }
}

export default DyoAuditService
