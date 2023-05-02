import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { identityOfRequest } from 'src/app/token/jwt-auth.guard'
import PrismaService from 'src/services/prisma.service'

@Injectable()
export default class ImageOrderImagesTeamAccessGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const productId = req.params.productId as string
    const versionId = req.params.versionId as string
    const body = req.body as string[]

    const identity = identityOfRequest(context)

    // check the sent imageIds and versionId against the user's team
    const images = await this.prisma.image.count({
      where: {
        id: {
          in: body,
        },
        version: {
          id: versionId,
          product: {
            id: productId,
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
    return images === body.length
  }
}
