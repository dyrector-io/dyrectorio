import { Injectable } from '@nestjs/common'
import { IdRequest } from 'src/grpc/protobuf/proto/crux'
import { TeamAccessGuard } from 'src/shared/team-access.guard'

@Injectable()
export class NodeTeamAccessGuard extends TeamAccessGuard {
  async canActivateWithIdRequest(request: IdRequest): Promise<boolean> {
    const nodes = await this.prisma.node.count({
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

    return nodes > 0
  }
}
