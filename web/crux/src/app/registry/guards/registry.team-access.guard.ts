import { Injectable } from '@nestjs/common'
import { CanActivate, ExecutionContext } from '@nestjs/common/interfaces'
import { identityOfRequest } from 'src/app/token/jwt-auth.guard'
import PrismaService from 'src/services/prisma.service'

@Injectable()
export default class RegistryTeamAccessGuard implements CanActivate {
  constructor(protected readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const registryId = req.params.registryId as string

    if (!registryId) {
      return true
    }

    const identity = identityOfRequest(context)

    const registries = await this.prisma.registry.count({
      where: {
        id: req.id,
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

    return registries > 0
  }
}
