import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { DISABLE_AUTH, identityOfRequest } from 'src/app/token/jwt-auth.guard'
import PrismaService from 'src/services/prisma.service'
import NodeService from '../node.service'

// TODO(@robot9706): Remove http from name when Node gRPC is removed
@Injectable()
export default class NodeTeamAccessHttpGuard implements CanActivate {
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

    return await this.service.checkNodeIsInActiveTeam(nodeId, identity)
  }
}
