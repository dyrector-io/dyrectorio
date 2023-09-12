import { Injectable } from '@nestjs/common'
import { CanActivate, ExecutionContext } from '@nestjs/common/interfaces'
import PrismaService from 'src/services/prisma.service'

@Injectable()
export default class ConfigBundleTeamAccessGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const teamSlug = req.params.teamSlug as string
    const configBundleId = req.params.configBundleId as string

    if (!configBundleId) {
      return true
    }

    const configBundle = await this.prisma.configBundle.count({
      where: {
        id: configBundleId,
        team: {
          slug: teamSlug,
        },
      },
    })

    return configBundle > 0
  }
}
