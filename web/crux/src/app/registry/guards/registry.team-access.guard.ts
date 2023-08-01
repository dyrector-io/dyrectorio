import { Injectable } from '@nestjs/common'
import { CanActivate, ExecutionContext } from '@nestjs/common/interfaces'
import PrismaService from 'src/services/prisma.service'

@Injectable()
export default class RegistryTeamAccessGuard implements CanActivate {
  constructor(protected readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const teamSlug = req.params.teamSlug as string
    const registryId = req.params.registryId as string

    if (!registryId) {
      return true
    }

    const registries = await this.prisma.registry.count({
      where: {
        id: registryId,
        team: {
          slug: teamSlug,
        },
      },
    })

    return registries > 0
  }
}
