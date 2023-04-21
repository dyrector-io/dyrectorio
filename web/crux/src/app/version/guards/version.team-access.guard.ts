import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { identityOfRequest } from 'src/app/token/jwt-auth.guard'
import PrismaService from 'src/services/prisma.service'

@Injectable()
export default class VersionTeamAccessGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const productId = req.params.productId as string
    const versionId = req.params.versionId as string

    const identity = identityOfRequest(context)

    const versions = await this.prisma.product.count({
      where: {
        id: productId,
        team: {
          users: {
            some: {
              userId: identity.id,
              active: true,
            },
          },
        },
        versions: !versionId
          ? undefined
          : {
              some: {
                id: versionId,
              },
            },
      },
    })

    return versions > 0
  }
}
