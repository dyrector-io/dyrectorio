import { Injectable } from '@nestjs/common'
import { OrderVersionImagesRequest } from 'src/grpc/protobuf/proto/crux'
import UserAccessGuard from 'src/shared/user-access.guard'
import { Identity } from '@ory/kratos-client'

@Injectable()
export default class ImageOrderImagesTeamAccessGuard extends UserAccessGuard<OrderVersionImagesRequest> {
  async canActivateWithRequest(request: OrderVersionImagesRequest, identity: Identity): Promise<boolean> {
    // check the sent imageIds and versionId against the user's team
    const images = await this.prisma.image.count({
      where: {
        id: {
          in: request.imageIds,
        },
        version: {
          id: request.versionId,
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

    // when the selected images count doesn't match the number of images according to the request, then
    // the user missing access for some, or teams are mixed up
    return images === request.imageIds.length
  }
}
