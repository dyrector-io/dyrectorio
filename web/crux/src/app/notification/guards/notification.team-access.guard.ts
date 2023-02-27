import { Injectable } from '@nestjs/common'
import { Identity } from '@ory/kratos-client'
import { IdRequest } from 'src/grpc/protobuf/proto/crux'
import UserAccessGuard from 'src/shared/user-access.guard'

Injectable()
export default class NotificationTeamAccessGuard extends UserAccessGuard {
  async canActivateWithIdRequest(request: IdRequest, identity: Identity): Promise<boolean> {
    const notifications = await this.prisma.notification.count({
      where: {
        id: request.id,
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

    return notifications > 0
  }
}
