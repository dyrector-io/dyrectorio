import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { identityOfRequest } from 'src/app/token/jwt-auth.guard'
import VersionService from '../version.service'

@Injectable()
export default class VersionTeamAccessGuard implements CanActivate {
  constructor(private readonly service: VersionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const productId = req.params.productId as string
    const versionId = req.params.versionId as string

    const identity = identityOfRequest(context)

    return await this.service.checkProductOrVersionIsInTheActiveTeam(productId, versionId, identity)
  }
}
