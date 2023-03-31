import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { DISABLE_AUTH, identityOfContext } from 'src/app/token/jwt-auth.guard'
import PrismaService from 'src/services/prisma.service'

// TODO(@robot9706): Remove http from name when Node gRPC is removed
@Injectable()
export default class NodeTeamAccessHttpGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService, private readonly reflector: Reflector) {}

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

    const identity = identityOfContext(context)

    const nodes = await this.prisma.node.count({
      where: {
        id: nodeId,
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

    return nodes > 0
  }
}
