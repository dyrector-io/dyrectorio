import { Metadata } from '@grpc/grpc-js'
import { Injectable } from '@nestjs/common'
import { IdRequest } from 'src/grpc/protobuf/proto/crux'
import { getAccessedBy } from 'src/interceptors/grpc.user.interceptor'
import UserAccessGuard from 'src/shared/user-access.guard'

Injectable()
export default class NotificationTeamAccessGuard extends UserAccessGuard {
  async canActivateWithIdRequest(request: IdRequest, metadata: Metadata): Promise<boolean> {
    const accessedBy = getAccessedBy(metadata)
    const notifications = await this.prisma.notification.count({
      where: {
        id: request.id,
        team: {
          users: {
            some: {
              userId: accessedBy,
              active: true,
            },
          },
        },
      },
    })

    return notifications > 0
  }
}
