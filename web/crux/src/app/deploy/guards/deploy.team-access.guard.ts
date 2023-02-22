import { Metadata } from '@grpc/grpc-js'
import { Injectable } from '@nestjs/common'
import { IdRequest } from 'src/grpc/protobuf/proto/crux'
import { getAccessedBy } from 'src/interceptors/grpc.user.interceptor'
import UserAccessGuard from 'src/shared/user-access.guard'

@Injectable()
export default class DeployTeamAccessGuard extends UserAccessGuard {
  async canActivateWithIdRequest(request: IdRequest, metadata: Metadata): Promise<boolean> {
    const accessedBy = getAccessedBy(metadata)
    const deployments = await this.prisma.deployment.count({
      where: {
        id: request.id,
        version: {
          product: {
            team: {
              users: {
                some: {
                  userId: accessedBy,
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
