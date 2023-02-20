import { CanActivate, ExecutionContext, Injectable, SetMetadata } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import PrismaService from 'src/services/prisma.service'
import { InvalidArgumentException } from 'src/exception/errors'
import { IdRequest } from 'src/grpc/protobuf/proto/crux'

const DISABLE_TEAM_ACCESS_CHECK = 'disable-team-access-check'

export const DisableTeamAccessCheck = () => SetMetadata(DISABLE_TEAM_ACCESS_CHECK, true)

@Injectable()
export default abstract class UserAccessGuard implements CanActivate {
  constructor(protected readonly reflector: Reflector, protected readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const disabled = this.reflector.get<boolean>(DISABLE_TEAM_ACCESS_CHECK, context.getHandler())

    if (disabled) {
      return true
    }

    const request = context.getArgByIndex<IdRequest>(0)
    if (!request.accessedBy) {
      throw new InvalidArgumentException({
        message: 'Missing property',
        property: 'accessedBy',
      })
    }

    if (!request.id) {
      return true
    }

    return this.canActivateWithIdRequest(request)
  }

  abstract canActivateWithIdRequest(request: IdRequest): Promise<boolean>
}
