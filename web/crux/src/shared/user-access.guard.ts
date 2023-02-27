import { CanActivate, ExecutionContext, Injectable, SetMetadata } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import PrismaService from 'src/services/prisma.service'
import { IdRequest } from 'src/grpc/protobuf/proto/crux'
import { Metadata } from '@grpc/grpc-js'
import KratosService from 'src/services/kratos.service'
import { UnauthorizedException } from '@nestjs/common/exceptions'
import { Identity } from '@ory/kratos-client'
import { setIdentityFromCookie } from 'src/interceptors/grpc.user.interceptor'

const DISABLE_TEAM_ACCESS_CHECK = 'disable-team-access-check'

export const DisableTeamAccessCheck = () => SetMetadata(DISABLE_TEAM_ACCESS_CHECK, true)

@Injectable()
export default abstract class UserAccessGuard implements CanActivate {
  constructor(
    protected readonly reflector: Reflector,
    protected readonly prisma: PrismaService,
    private readonly kratos: KratosService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const disabled = this.reflector.get<boolean>(DISABLE_TEAM_ACCESS_CHECK, context.getHandler())

    if (disabled) {
      return true
    }

    const request = context.getArgByIndex<IdRequest>(0)
    if (!request.id) {
      return true
    }

    const metadata = context.getArgByIndex<Metadata>(1)
    const cookie = metadata.getMap().cookie as string
    if (!cookie) {
      throw new UnauthorizedException()
    }

    const identity = await setIdentityFromCookie(metadata, this.kratos)

    return this.canActivateWithIdRequest(request, identity)
  }

  abstract canActivateWithIdRequest(request: IdRequest, identity: Identity): Promise<boolean>
}
