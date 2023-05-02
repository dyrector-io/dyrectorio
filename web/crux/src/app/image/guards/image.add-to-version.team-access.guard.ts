import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { identityOfRequest } from 'src/app/token/jwt-auth.guard'
import PrismaService from 'src/services/prisma.service'
import { AddImagesDto } from '../image.dto'

@Injectable()
export default class ImageAddToVersionTeamAccessGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const productId = req.params.productId as string
    const versionId = req.params.versionId as string
    const body = req.body as AddImagesDto[]

    const identity = identityOfRequest(context)

    const regIds = body.map(it => it.registryId)
    const registries = await this.prisma.registry.count({
      where: {
        id: {
          in: regIds,
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
              id: productId,
              versions: {
                some: {
                  id: versionId,
                },
              },
            },
          },
        },
      },
    })

    return registries === regIds.length
  }
}
