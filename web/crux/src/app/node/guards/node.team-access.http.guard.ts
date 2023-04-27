import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { DISABLE_AUTH, identityOfRequest } from 'src/app/token/jwt-auth.guard'
import NodeService from '../node.service'

@Injectable()
export default class NodeTeamAccessGuard implements CanActivate {
  constructor(private readonly service: NodeService, private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const nodeId = req.params.nodeId as string

    if (!nodeId) {
      return true
    }

    const authDisabled = this.reflector.get<boolean>(DISABLE_AUTH, context.getHandler())
    if (authDisabled) {
      return true
    }

    const identity = identityOfRequest(context)

    return await this.service.checkNodeIsInTheActiveTeam(nodeId, identity)
  }
}
