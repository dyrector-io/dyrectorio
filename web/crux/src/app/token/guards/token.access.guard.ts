import { Metadata } from '@grpc/grpc-js'
import { Injectable } from '@nestjs/common'
import { IdRequest } from 'src/grpc/protobuf/proto/crux'
import { getAccessedBy } from 'src/interceptors/grpc.user.interceptor'
import UserAccessGuard from 'src/shared/user-access.guard'

@Injectable()
export default class TokenAccessGuard extends UserAccessGuard {
  async canActivateWithIdRequest(request: IdRequest, metadata: Metadata): Promise<boolean> {
    const accessedBy = getAccessedBy(metadata)
    const token = await this.prisma.token.findFirst({
      select: {
        userId: true,
      },
      where: {
        id: request.id,
      },
    })

    return token?.userId === accessedBy
  }
}
