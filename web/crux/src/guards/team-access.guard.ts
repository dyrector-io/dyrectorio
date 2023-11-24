import { CanActivate, ExecutionContext, Injectable, Logger, SetMetadata } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { authStrategyOfContext, identityOfRequest } from 'src/app/token/jwt-auth.guard'
import PrismaService from 'src/services/prisma.service'

export const TEAM_ACCESS_GUARD_DISABLED = 'team-access-guard-disabled'
export const DisableTeamAccessGuard = () => SetMetadata(TEAM_ACCESS_GUARD_DISABLED, true)

@Injectable()
export default class TeamAccessGuard implements CanActivate {
  private logger = new Logger(TeamAccessGuard.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const disabled =
      this.reflector.get<boolean>(TEAM_ACCESS_GUARD_DISABLED, context.getHandler()) ??
      this.reflector.get<boolean>(TEAM_ACCESS_GUARD_DISABLED, context.getClass()) ??
      false
    if (disabled) {
      return true
    }

    const strategy = authStrategyOfContext(context, this.reflector)
    if (strategy === 'disabled') {
      this.logger.verbose(`Team access granted. Guard was disabled for path.`)
      return true
    }

    const req = context.switchToHttp().getRequest()
    const teamSlug = req.params.teamSlug as string

    const identity = identityOfRequest(context)

    if (!identity && (strategy === 'deploy-token' || strategy === 'pipeline-token')) {
      return true
    }

    const userOnTeams = await this.prisma.usersOnTeams.count({
      where: {
        userId: identity.id,
        team: {
          slug: teamSlug,
        },
      },
    })

    return userOnTeams > 0
  }
}
