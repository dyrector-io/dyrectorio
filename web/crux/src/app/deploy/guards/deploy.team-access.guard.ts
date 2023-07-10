import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Identity } from '@ory/kratos-client'
import { AUTH_STRATEGY, AuthStrategyType, AuthorizedHttpRequest, identityOfRequest } from 'src/app/token/jwt-auth.guard'
import { DeploymentTokenPayload } from 'src/domain/deployment-token'
import PrismaService from 'src/services/prisma.service'

@Injectable()
export default class DeployTeamAccessGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService, private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const strategy = this.reflector.get<AuthStrategyType>(AUTH_STRATEGY, context.getHandler()) ?? 'user-token'

    const req = context.switchToHttp().getRequest() as AuthorizedHttpRequest
    const deploymentId = req.params.deploymentId as string
    const instanceId = req.params.instanceId as string

    if (!deploymentId) {
      return true
    }

    const identity = identityOfRequest(context)

    if (!identity && strategy === 'deploy-token') {
      const token = req.user.data as DeploymentTokenPayload
      return await this.checkAccessWithDeployToken(token, deploymentId, instanceId)
    }

    return await this.checkAccess(identity, deploymentId, instanceId)
  }

  async checkAccess(identity: Identity | null, deploymentId: string, instanceId: string | null): Promise<boolean> {
    const deployments = await this.prisma.deployment.count({
      where: {
        id: deploymentId,
        version: {
          project: {
            team: {
              users: {
                some: {
                  userId: identity.id,
                  active: true,
                },
              },
            },
          },
        },
        instances: !instanceId
          ? undefined
          : {
              some: {
                id: instanceId,
              },
            },
      },
    })

    return deployments > 0
  }

  async checkAccessWithDeployToken(
    token: DeploymentTokenPayload,
    deploymentId: string,
    instanceId: string,
  ): Promise<boolean> {
    if (token.deploymentId !== deploymentId) {
      return false
    }

    const deployments = await this.prisma.deployment.count({
      where: {
        id: deploymentId,
        instances: !instanceId
          ? undefined
          : {
              some: {
                id: instanceId,
              },
            },
      },
    })

    return deployments > 0
  }
}
