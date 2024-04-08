import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthorizedHttpRequest, authStrategyOfContext, identityOfRequest } from 'src/app/token/jwt-auth.guard'
import { DeploymentTokenPayload } from 'src/domain/token'
import PrismaService from 'src/services/prisma.service'

@Injectable()
export default class DeployTeamAccessGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest() as AuthorizedHttpRequest
    const teamSlug = req.params.teamSlug as string
    const deploymentId = req.params.deploymentId as string
    const instanceId = req.params.instanceId as string

    if (!deploymentId) {
      return true
    }

    const strategy = authStrategyOfContext(context, this.reflector)
    const identity = identityOfRequest(context)

    if (!identity && strategy === 'deploy-token') {
      const token = req.user as DeploymentTokenPayload
      return await this.checkAccessWithDeployToken(token, teamSlug, deploymentId, instanceId)
    }

    return await this.checkAccess(teamSlug, deploymentId, instanceId)
  }

  async checkAccess(teamSlug: string, deploymentId: string, instanceId: string | null): Promise<boolean> {
    const deployments = await this.prisma.deployment.count({
      where: {
        id: deploymentId,
        version: {
          project: {
            team: {
              slug: teamSlug,
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
    teamSlug: string,
    deploymentId: string,
    instanceId: string,
  ): Promise<boolean> {
    if (token.deploymentId !== deploymentId) {
      return false
    }

    return await this.checkAccess(teamSlug, deploymentId, instanceId)
  }
}
