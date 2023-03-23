import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { checkVersionMutability } from 'src/domain/version'
import PrismaService from 'src/services/prisma.service'

@Injectable()
export default class DeleteImageValidationInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest()
    const imageId = req.params.imageId as string

    const image = await this.prisma.image.findUniqueOrThrow({
      select: {
        version: {
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
        },
      },
      where: {
        id: imageId,
      },
    })

    checkVersionMutability(image.version)

    return next.handle()
  }
}
