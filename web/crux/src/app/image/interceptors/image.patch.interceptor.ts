import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { checkVersionMutability } from 'src/domain/version'
import PrismaService from 'src/services/prisma.service'

@Injectable()
export default class ImagePatchValidationInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest()
    const versionId = req.params.versionId as string

    const image = await this.prisma.image.findUniqueOrThrow({
      include: {
        version: {
          include: {
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
        id: versionId,
      },
    })

    checkVersionMutability(image.version)

    // TODO(@m8vago, @polaroi8d) validation?

    return next.handle()
  }
}
