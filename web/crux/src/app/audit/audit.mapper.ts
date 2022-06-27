import { Injectable } from '@nestjs/common'
import { Identity } from '@ory/kratos-client'
import { AuditLog } from '@prisma/client'
import { toTimestamp } from 'src/domain/utils'
import { AuditLogResponse } from 'src/proto/proto/crux'
import { nameOfIdentity } from 'src/shared/model'

@Injectable()
export class AuditMapper {
  toGrpc(log: AuditLog, identities: Identity[]): AuditLogResponse {
    const identity = identities.find(it => it.id === log.userId)

    return {
      ...log,
      identityName: nameOfIdentity(identity),
      createdAt: toTimestamp(log.createdAt),
      data: JSON.stringify(log.data),
    }
  }
}
