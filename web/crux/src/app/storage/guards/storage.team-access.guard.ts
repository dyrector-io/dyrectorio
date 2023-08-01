import { Injectable } from '@nestjs/common'
import { CanActivate, ExecutionContext } from '@nestjs/common/interfaces'
import PrismaService from 'src/services/prisma.service'

@Injectable()
export default class StorageTeamAccessGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const teamSlug = req.params.teamSlug as string
    const storageId = req.params.storageId as string

    if (!storageId) {
      return true
    }

    const storages = await this.prisma.storage.count({
      where: {
        id: storageId,
        team: {
          slug: teamSlug,
        },
      },
    })

    return storages > 0
  }
}
