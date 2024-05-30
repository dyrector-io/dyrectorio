import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import { CreatePackageDto, UpdatePackageDto } from '../package.dto'

@Injectable()
export default class PackageVersionAccessGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const teamSlug = req.params.teamSlug as string

    const body = req.body as CreatePackageDto | UpdatePackageDto

    const versions = await this.prisma.version.count({
      where: {
        project: {
          team: {
            slug: teamSlug,
          },
        },
        id: {
          in: body.chainIds,
        },
      },
    })

    return versions === body.chainIds.length
  }
}
