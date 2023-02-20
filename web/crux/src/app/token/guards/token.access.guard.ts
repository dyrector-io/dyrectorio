import { Injectable } from '@nestjs/common'
import { IdRequest } from 'src/grpc/protobuf/proto/crux'
import UserAccessGuard from 'src/shared/user-access.guard'

@Injectable()
export default class TokenAccessGuard extends UserAccessGuard {
  async canActivateWithIdRequest(request: IdRequest): Promise<boolean> {
    const token = await this.prisma.token.findFirst({
      select: {
        userId: true,
      },
      where: {
        id: request.id,
      },
    })

    return token?.userId === request.accessedBy
  }
}
