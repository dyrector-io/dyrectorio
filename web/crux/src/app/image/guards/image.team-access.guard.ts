import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { identityOfRequest } from 'src/app/token/jwt-auth.guard'
import PrismaService from 'src/services/prisma.service'

@Injectable()
export default class ImageTeamAccessGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const productId = req.params.productId as string
    const versionId = req.params.versionId as string
    const imageId = req.params.imageId as string

    const identity = identityOfRequest(context)

    const versions = await this.prisma.version.count({
      where: {
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
        images: !imageId
          ? undefined
          : {
              some: {
                id: imageId,
              },
            },
      },
    })

    return versions > 0
  }
}
