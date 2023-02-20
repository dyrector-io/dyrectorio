import { Injectable } from '@nestjs/common'
import { IdRequest } from 'src/grpc/protobuf/proto/crux'
import UserAccessGuard from 'src/shared/user-access.guard'

@Injectable()
export default class RegistryTeamAccessGuard extends UserAccessGuard {
  async canActivateWithIdRequest(request: IdRequest): Promise<boolean> {
    const registries = await this.prisma.registry.count({
      where: {
        id: request.id,
        team: {
          users: {
            some: {
              userId: request.accessedBy,
              active: true,
            },
          },
        },
      },
    })

    return registries > 0
  }
}
