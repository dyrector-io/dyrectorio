import { CanActivate, ExecutionContext, Injectable, SetMetadata } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import PrismaService from 'src/services/prisma.service'
import { Metadata } from '@grpc/grpc-js'
import KratosService from 'src/services/kratos.service'
import { UnauthorizedException } from '@nestjs/common/exceptions'
import { Identity } from '@ory/kratos-client'
import { setIdentityFromCookie } from 'src/interceptors/grpc.user.interceptor'

const DISABLE_ACCESS_CHECK = 'disable-team-access-check'

export const DisableAccessCheck = () => SetMetadata(DISABLE_ACCESS_CHECK, true)

@Injectable()
export default abstract class UserAccessGuard<Req> implements CanActivate {
  constructor(
    protected readonly reflector: Reflector,
    protected readonly prisma: PrismaService,
    protected readonly kratos: KratosService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const disabled = this.reflector.get<boolean>(DISABLE_ACCESS_CHECK, context.getHandler())
    if (disabled) {
      return true
    }

    const metadata = context.getArgByIndex<Metadata>(1)
    const cookie = metadata.getMap().cookie as string
    if (!cookie) {
      throw new UnauthorizedException()
    }

    const identity = await setIdentityFromCookie(metadata, this.kratos)

    const request = context.getArgByIndex<Req>(0)
    return this.canActivateWithRequest(request, identity, context)
  }

  abstract canActivateWithRequest(request: Req, identity: Identity, context: ExecutionContext): Promise<boolean>
}
