import { Injectable } from '@nestjs/common'
import { IdRequest } from 'src/grpc/protobuf/proto/crux'
import UserAccessGuard from 'src/shared/user-access.guard'

@Injectable()
export default class VersionTeamAccessGuard extends UserAccessGuard {
  async canActivateWithIdRequest(request: IdRequest): Promise<boolean> {
    const versions = await this.prisma.version.count({
      where: {
        id: request.id,
        product: {
          team: {
            users: {
              some: {
                userId: request.accessedBy,
                active: true,
              },
            },
          },
        },
      },
    })

    return versions > 0
  }
}
