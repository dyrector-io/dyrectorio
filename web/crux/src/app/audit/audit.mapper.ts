import { Injectable } from '@nestjs/common'
import { Identity } from '@ory/kratos-client'
import { AuditLog } from '@prisma/client'
import { toTimestamp } from 'src/domain/utils'
import { AuditLogResponse } from 'src/grpc/protobuf/proto/crux'
import { emailOfIdentity } from 'src/shared/models'

@Injectable()
export default class AuditMapper {
  toProto(log: AuditLog, identities: Map<string, Identity>): AuditLogResponse {
    const identity = identities.get(log.userId)

    return {
      ...log,
      identityEmail: emailOfIdentity(identity),
      createdAt: toTimestamp(log.createdAt),
      data: JSON.stringify(log.data),
    }
  }
}
