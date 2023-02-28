import { Injectable } from '@nestjs/common'
import { IdRequest } from 'src/grpc/protobuf/proto/crux'
import UserAccessGuard from 'src/shared/user-access.guard'
import { Identity } from '@ory/kratos-client'

@Injectable()
export default class DeployGetByVersionTeamAccessGuard extends UserAccessGuard<IdRequest> {
  async canActivateWithRequest(request: IdRequest, identity: Identity): Promise<boolean> {
    if (!request.id) {
      return true
    }

    const version = await this.prisma.version.count({
      where: {
        id: request.id,
        product: {
          team: {
            users: {
              some: {
                userId: identity.id,
                active: true,
              },
            },
          },
        },
      },
    })

    return version > 0
  }
}
