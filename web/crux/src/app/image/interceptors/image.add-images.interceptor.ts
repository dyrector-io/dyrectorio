import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { checkVersionMutability } from 'src/domain/version'
import PrismaService from 'src/services/prisma.service'

@Injectable()
export default class ImageAddToVersionValidationInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest()
    const versionId = req.params.versionId as string

    const version = await this.prisma.version.findUniqueOrThrow({
      select: {
        id: true,
        type: true,
        deployments: {
          distinct: ['status'],
        },
        children: {
          select: {
            versionId: true,
          },
        },
      },
      where: {
        id: versionId,
      },
    })

    checkVersionMutability(version)

    return next.handle()
  }
}
