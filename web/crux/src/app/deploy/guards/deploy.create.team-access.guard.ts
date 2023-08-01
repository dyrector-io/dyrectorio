import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import { CreateDeploymentDto } from '../deploy.dto'

@Injectable()
export default class DeployCreateTeamAccessGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const teamSlug = req.params.teamSlug as string
    const body = req.body as CreateDeploymentDto

    const version = await this.prisma.version.count({
      where: {
        id: body.versionId,
        project: {
          team: {
            slug: teamSlug,
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
