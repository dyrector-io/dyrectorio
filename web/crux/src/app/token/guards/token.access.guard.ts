import { Injectable } from '@nestjs/common'
import { Identity } from '@ory/kratos-client'
import { IdRequest } from 'src/grpc/protobuf/proto/crux'
import UserAccessGuard from 'src/shared/user-access.guard'

@Injectable()
export default class TokenAccessGuard extends UserAccessGuard<IdRequest> {
  async canActivateWithRequest(request: IdRequest, identity: Identity): Promise<boolean> {
    if (!request.id) {
      return true
    }

    const token = await this.prisma.token.findFirst({
      select: {
        userId: true,
      },
      where: {
        id: request.id,
      },
    })

    return token?.userId === identity.id
  }
}
