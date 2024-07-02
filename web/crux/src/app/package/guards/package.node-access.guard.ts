import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import { CreatePackageEnvironmentDto, UpdatePackageEnvironmentDto } from '../package.dto'

@Injectable()
export default class PackageNodeAccessGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const teamSlug = req.params.teamSlug as string

    const body = req.body as CreatePackageEnvironmentDto | UpdatePackageEnvironmentDto

    const nodes = await this.prisma.node.count({
      where: {
        team: {
          slug: teamSlug,
        },
        id: body.nodeId,
      },
    })

    return nodes > 0
  }
}
