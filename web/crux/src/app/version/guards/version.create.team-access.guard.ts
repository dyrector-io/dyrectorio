import { Injectable } from '@nestjs/common'
import { CreateVersionRequest } from 'src/grpc/protobuf/proto/crux'
import UserAccessGuard from 'src/shared/user-access.guard'
import { Identity } from '@ory/kratos-client'

@Injectable()
export default class VersionCreateTeamAccessGuard extends UserAccessGuard<CreateVersionRequest> {
  async canActivateWithRequest(request: CreateVersionRequest, identity: Identity): Promise<boolean> {
    const products = await this.prisma.product.count({
      where: {
        id: request.productId,
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

    return products > 0
  }
}
