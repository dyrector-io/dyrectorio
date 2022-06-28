import { Injectable } from '@nestjs/common'
import { IdRequest } from 'src/grpc/protobuf/proto/crux'
import { TeamAccessGuard } from 'src/shared/team-access.guard'

@Injectable()
export class DeployTeamAccessGuard extends TeamAccessGuard {
  async canActivateWithIdRequest(request: IdRequest): Promise<boolean> {
    const deployments = await this.prisma.deployment.count({
      where: {
        id: request.id,
        version: {
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
      },
    })

    return deployments > 0
  }
}
