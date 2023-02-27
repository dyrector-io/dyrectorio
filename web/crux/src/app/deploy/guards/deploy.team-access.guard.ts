import { Injectable } from '@nestjs/common'
import { Identity } from '@ory/kratos-client'
import { IdRequest } from 'src/grpc/protobuf/proto/crux'
import UserAccessGuard from 'src/shared/user-access.guard'

@Injectable()
export default class DeployTeamAccessGuard extends UserAccessGuard {
  async canActivateWithIdRequest(request: IdRequest, identity: Identity): Promise<boolean> {
    const deployments = await this.prisma.deployment.count({
      where: {
        id: request.id,
        version: {
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
      },
    })

    return deployments > 0
  }
}
