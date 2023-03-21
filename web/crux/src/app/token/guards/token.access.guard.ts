import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'

@Injectable()
export default class TokenAccessGuard implements CanActivate {
  constructor(protected readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const {
      params: { tokenId },
      body: { identity },
    } = context.switchToHttp().getRequest()

    if (!tokenId) {
      return true
    }

    const token = await this.prisma.token.findFirst({
      select: {
        userId: true,
      },
      where: {
        id: tokenId,
      },
    })

    return token?.userId === identity.id
  }
}
