import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import { CreatePackageDeploymentDto } from '../package.dto'

@Injectable()
export default class PackageVersionAccessGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const teamSlug = req.params.teamSlug as string
    const packageId = req.params.packageId as string

    const body = req.body as CreatePackageDeploymentDto

    const versions = await this.prisma.version.count({
      where: {
        project: {
          team: {
            slug: teamSlug,
          },
        },
        id: body.versionId,
        OR: [
          {
            packages: {
              some: {
                packageId,
              },
            },
          },
          {
            parent: {
              chain: {
                packages: {
                  some: {
                    packageId,
                  },
                },
              },
            },
          },
        ],
      },
    })

    return versions > 0
  }
}
