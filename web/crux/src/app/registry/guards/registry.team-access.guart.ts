import { Injectable } from '@nestjs/common'
import { IdRequest } from 'src/grpc/protobuf/proto/crux'
import { TeamAccessGuard } from 'src/shared/team-access.guard'

@Injectable()
export class RegistryTeamAccessGuard extends TeamAccessGuard {
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
