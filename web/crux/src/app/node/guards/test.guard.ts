import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import PrismaService from 'src/services/prisma.service'

// TODO(@robot9706): Remove http from name when Node gRPC is removed
@Injectable()
export default class NodeWsGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService, private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('Guard test ws', context.getType())
    return true
  }
}
