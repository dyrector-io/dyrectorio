import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import { identityOfContext } from '../jwt-auth.guard'

@Injectable()
export default class TokenAccessGuard implements CanActivate {
  constructor(protected readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const tokenId = req.params.tokenId as string

    if (!tokenId) {
      return true
    }

    const identity = identityOfContext(context)

    const token = await this.prisma.token.findUnique({
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
