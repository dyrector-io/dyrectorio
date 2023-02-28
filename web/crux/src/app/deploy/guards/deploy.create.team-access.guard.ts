import { Injectable } from '@nestjs/common'
import { CreateDeploymentRequest } from 'src/grpc/protobuf/proto/crux'
import UserAccessGuard from 'src/shared/user-access.guard'
import { Identity } from '@ory/kratos-client'

@Injectable()
export default class DeployCreateTeamAccessGuard extends UserAccessGuard<CreateDeploymentRequest> {
  async canActivateWithRequest(request: CreateDeploymentRequest, identity: Identity): Promise<boolean> {
    const version = await this.prisma.version.count({
      where: {
        id: request.versionId,
        product: {
          team: {
            users: {
              some: {
                userId: identity.id,
                active: true,
              },
            },
            nodes: {
              some: {
                id: request.nodeId,
              },
            },
          },
        },
      },
    })

    return version > 0
  }
}
