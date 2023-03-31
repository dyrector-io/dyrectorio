import { Metadata } from '@grpc/grpc-js'
import { ServerSurfaceCall } from '@grpc/grpc-js/build/src/server-call'
import { CanActivate, createParamDecorator, ExecutionContext, Injectable } from '@nestjs/common'
import { UnauthorizedException } from '@nestjs/common/exceptions'
import { Reflector } from '@nestjs/core'
import { Identity } from '@ory/kratos-client'
import { DISABLE_AUTH } from 'src/app/token/jwt-auth.guard'
import KratosService from 'src/services/kratos.service'
import PrismaService from 'src/services/prisma.service'

@Injectable()
export default class UserAccessGuard<Req> implements CanActivate {
  constructor(
    protected readonly reflector: Reflector,
    protected readonly prisma: PrismaService,
    protected readonly kratos: KratosService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const disableAuth = this.reflector.get<boolean>(DISABLE_AUTH, context.getHandler())
    if (disableAuth) {
      return true
    }

    const metadata = context.getArgByIndex<Metadata>(1)
    const cookie = metadata.getMap().cookie as string
    if (!cookie) {
      throw new UnauthorizedException()
    }

    try {
      const session = await this.kratos.getSessionByCookie(cookie)

      const request = context.getArgByIndex<Req>(0)
      const serviceCall = context.getArgByIndex<IdentityAwareServerSurfaceCall>(2)
      serviceCall.user = session.identity

      return await this.canActivateWithRequest(request, session.identity, context)
    } catch {
      return false
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async canActivateWithRequest(request: Req, identity: Identity, context: ExecutionContext): Promise<boolean> {
    return true
  }
}

export const IdentityFromGrpcCall = createParamDecorator((_: unknown, context: ExecutionContext): Identity => {
  const call = context.getArgByIndex(2) as IdentityAwareServerSurfaceCall
  return call.user
})

export type IdentityAwareServerSurfaceCall = ServerSurfaceCall & {
  user: Identity
}
