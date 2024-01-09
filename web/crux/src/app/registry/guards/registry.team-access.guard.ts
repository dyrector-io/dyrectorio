import { Injectable } from '@nestjs/common'
import { CanActivate, ExecutionContext } from '@nestjs/common/interfaces'
import { Reflector } from '@nestjs/core'
import { authStrategyOfContext, identityOfRequest } from 'src/app/token/jwt-auth.guard'
import { RegistryTokenPayload } from 'src/domain/registry-token'
import PrismaService from 'src/services/prisma.service'

@Injectable()
export default class RegistryTeamAccessGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const teamSlug = req.params.teamSlug as string
    const registryId = req.params.registryId as string

    if (!registryId) {
      return true
    }

    const strategy = authStrategyOfContext(context, this.reflector)
    const identity = identityOfRequest(context)

    if (!identity && strategy === 'registry-hook') {
      const token = req.user.data as RegistryTokenPayload
      return await this.checkAccessWithRegistryToken(token, teamSlug, registryId)
    }

    return await this.checkAccess(teamSlug, registryId)
  }

  async checkAccess(teamSlug: string, registryId: string): Promise<boolean> {
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

  async checkAccessWithRegistryToken(
    token: RegistryTokenPayload,
    teamSlug: string,
    registryId: string,
  ): Promise<boolean> {
    if (token.registryId !== registryId) {
      return false
    }

    return await this.checkAccess(teamSlug, registryId)
  }
}
