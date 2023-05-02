import { Injectable } from '@nestjs/common'
import { CanActivate, ExecutionContext } from '@nestjs/common/interfaces'
import { identityOfRequest } from 'src/app/token/jwt-auth.guard'
import PrismaService from 'src/services/prisma.service'

@Injectable()
export default class StorageTeamAccessGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const storageId = req.params.storageId as string

    if (!storageId) {
      return true
    }

    const identity = identityOfRequest(context)

    const storages = await this.prisma.storage.count({
      where: {
        id: storageId,
        team: {
          users: {
            some: {
              userId: identity.id,
              active: true,
            },
          },
        },
      },
    })

    return storages > 0
  }
}
