import { Injectable } from '@nestjs/common'
import { Identity } from '@ory/kratos-client'
import { AuditLog, AuditLogActorTypeEnum, DeploymentToken } from '@prisma/client'
import { emailOfIdentity, nameOfIdentity } from 'src/domain/identity'
import { AuditDto, AuditLogActorTypeDto, AuditLogDto, AuditLogUserDto } from './audit.dto'

@Injectable()
export default class AuditMapper {
  toDto(it: Audit): AuditDto {
    return {
      createdAt: it.createdAt,
      createdBy: it.createdBy,
      updatedAt: it.updatedAt,
      updatedBy: it.updatedBy ? it.updatedBy : it.createdBy,
    }
  }

  actorTypeToDto(it: AuditLogActorTypeEnum): AuditLogActorTypeDto {
    switch (it) {
      case 'deploymentToken':
        return 'deployment-token'
      default:
        return it
    }
  }

  toDetailsDto(it: AuditLogWithDeploymentToken, identities: Map<string, Identity>): AuditLogDto {
    const base: Omit<AuditLogDto, 'user' | 'name'> = {
      actorType: this.actorTypeToDto(it.actorType),
      context: it.context,
      createdAt: it.createdAt,
      event: it.event,
      method: it.method,
      data: it.data as object,
    }

    if (it.actorType === 'user') {
      const identity = identities.get(it.userId)
      if (!identity) {
        return {
          ...base,
          name: AuditMapper.UNKNOWN_USER_NAME,
          user: AuditMapper.UNKNOWN_USER,
        }
      }

      return {
        ...base,
        name: nameOfIdentity(identity),
        user: {
          id: identity.id,
          email: emailOfIdentity(identity),
        },
      }
    }

    return {
      ...base,
      name: it.deploymentToken.name,
    }
  }

  private static readonly UNKNOWN_USER_NAME = 'Unknown User'

  private static readonly UNKNOWN_USER: AuditLogUserDto = {
    email: '',
    id: '',
  }
}

type Audit = {
  createdAt: Date
  createdBy: string
  updatedAt: Date
  updatedBy: string
}

export type AuditLogWithDeploymentToken = AuditLog & {
  deploymentToken: Pick<DeploymentToken, 'name'>
}
