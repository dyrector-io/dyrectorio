import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { AuthorizedHttpRequest, identityOfRequest } from 'src/app/token/jwt-auth.guard'
import ContainerConfigService from '../container-config.service'

@Injectable()
export default class ContainerConfigTeamAccessGuard implements CanActivate {
  constructor(private readonly service: ContainerConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest() as AuthorizedHttpRequest
    const teamSlug = req.params.teamSlug as string
    const configId = req.params.configId as string

    if (!configId) {
      return true
    }

    const identity = identityOfRequest(context)

    return await this.service.checkConfigIsInTeam(teamSlug, configId, identity)
  }
}
