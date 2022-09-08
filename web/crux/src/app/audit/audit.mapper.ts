import { Injectable } from '@nestjs/common'
import { Identity } from '@ory/kratos-client'
import { AuditLog } from '@prisma/client'
import { toTimestamp } from 'src/domain/utils'
import { AuditLogResponse } from 'src/grpc/protobuf/proto/crux'
import { emailOfIdentity, nameOfIdentity } from 'src/shared/model'

@Injectable()
export default class AuditMapper {
  toGrpc(log: AuditLog, identities: Map<string, Identity>): AuditLogResponse {
    const identity = identities.get(log.userId)

    return {
      ...log,
      identityEmail: emailOfIdentity(identity),
      createdAt: toTimestamp(log.createdAt),
      data: JSON.stringify(log.data),
    }
  }
}
