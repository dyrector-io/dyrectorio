import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'

@Injectable()
export default class PackageTeamAccessGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const teamSlug = req.params.teamSlug as string
    const packageId = req.params.packageId as string

    if (!packageId) {
      return true
    }

    const packages = await this.prisma.package.count({
      where: {
        id: packageId,
        team: {
          slug: teamSlug,
        },
      },
    })

    return packages > 0
  }
}
