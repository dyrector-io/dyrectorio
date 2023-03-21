import { Injectable } from '@nestjs/common'
import { UnauthorizedException } from '@nestjs/common/exceptions'
import { CanActivate, ExecutionContext } from '@nestjs/common/interfaces'
import PrismaService from 'src/services/prisma.service'

@Injectable()
export default class RegistryTeamAccessGuard implements CanActivate {
  constructor(protected readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const { params, body } = request
    const { registryId } = params

    if (!registryId) {
      return true
    }

    const { identity } = body
    if (!identity) {
      throw new UnauthorizedException()
    }

    const registries = await this.prisma.registry.count({
      where: {
        id: request.id,
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
