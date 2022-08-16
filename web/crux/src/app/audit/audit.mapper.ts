import { Injectable } from '@nestjs/common'
import { Identity } from '@ory/kratos-client'
import { AuditLog } from '@prisma/client'
import { toTimestamp } from 'src/domain/utils'
import { AuditLogResponse } from 'src/grpc/protobuf/proto/crux'
import { nameOfIdentity } from 'src/shared/model'

@Injectable()
export class AuditMapper {
  toGrpc(log: AuditLog, identities: Map<string, Identity>): AuditLogResponse {
    const identity = identities.get(log.userId)

    return {
      ...log,
      identityName: nameOfIdentity(identity),
      createdAt: toTimestamp(log.createdAt),
      data: JSON.stringify(log.data),
    }
  }
}
