import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { identityOfRequest } from 'src/app/token/jwt-auth.guard'
import PrismaService from 'src/services/prisma.service'
import { CreateDeploymentDto } from '../deploy.dto'

@Injectable()
export default class DeployCreateTeamAccessGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const body = req.body as CreateDeploymentDto

    const identity = identityOfRequest(context)

    const version = await this.prisma.version.count({
      where: {
        id: body.versionId,
        product: {
          team: {
            users: {
              some: {
                userId: identity.id,
                active: true,
              },
            },
            nodes: {
              some: {
                id: body.nodeId,
              },
            },
          },
        },
      },
    })

    return version > 0
  }
}
