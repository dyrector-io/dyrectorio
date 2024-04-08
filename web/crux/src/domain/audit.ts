import { AuditLogActorTypeEnum } from '@prisma/client'
import { CruxUnauthorizedException } from 'src/exception/crux-exception'
import { RequestAuthenticationData } from './identity'
import { DeploymentTokenPayload } from './token'

export type AuditLogActor = {
  type: AuditLogActorTypeEnum
  userId: string | null
  deploymentId: string | null
}

export const auditActorOfRequest = (authData: RequestAuthenticationData): AuditLogActor => {
  if (authData.identity) {
    return {
      type: 'user',
      userId: authData.identity.id,
      deploymentId: null,
    }
  }

  if (authData.user) {
    const payload = authData.user as DeploymentTokenPayload
    const deploymentId = payload?.deploymentId

    if (deploymentId) {
      return {
        type: 'deploymentToken',
        deploymentId,
        userId: null,
      }
    }
  }

  throw new CruxUnauthorizedException()
}
