import { Injectable } from '@nestjs/common'
import { AddImagesToVersionRequest } from 'src/grpc/protobuf/proto/crux'
import UserAccessGuard from 'src/shared/user-access.guard'
import { Identity } from '@ory/kratos-client'

@Injectable()
export default class ImageAddToVersionTeamAccessGuard extends UserAccessGuard<AddImagesToVersionRequest> {
  async canActivateWithRequest(request: AddImagesToVersionRequest, identity: Identity): Promise<boolean> {
    const registries = await this.prisma.registry.count({
      where: {
        id: {
          in: request.images.map(it => it.registryId),
        },
        team: {
          users: {
            some: {
              userId: identity.id,
              active: true,
            },
          },
          products: {
            some: {
              versions: {
                some: {
                  id: request.versionId,
                },
              },
            },
          },
        },
      },
    })

    return registries === request.images.length
  }
}
