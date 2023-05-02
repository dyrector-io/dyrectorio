import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { identityOfRequest } from 'src/app/token/jwt-auth.guard'
import PrismaService from 'src/services/prisma.service'

@Injectable()
export default class DeployTeamAccessGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const deploymentId = req.params.deploymentId as string
    const instanceId = req.params.instanceId as string

    if (!deploymentId) {
      return true
    }

    const identity = identityOfRequest(context)

    const deployments = await this.prisma.deployment.count({
      where: {
        id: deploymentId,
        version: {
          product: {
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
}
