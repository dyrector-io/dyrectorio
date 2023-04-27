import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { checkVersionMutability } from 'src/domain/version'
import { CruxBadRequestException, CruxConflictException } from 'src/exception/crux-exception'
import PrismaService from 'src/services/prisma.service'

@Injectable()
export default class OrderImagesValidationInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest()
    const versionId = req.params.versionId as string
    const body = req.body as string[]

    const version = await this.prisma.version.findUniqueOrThrow({
      include: {
        images: true,
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

    const { images } = version

    if (images.length !== body.length) {
      throw new CruxBadRequestException({
        message: 'Image count mismatch',
        property: 'body',
      })
    }

    const mismatchingImages = images.filter(it => !body.includes(it.id))
    if (mismatchingImages.length > 0) {
      throw new CruxBadRequestException({
        message: 'Missing image ids',
        property: 'imageIds',
        value: mismatchingImages.map(it => it.id),
      })
    }

    const imageIds = new Set(body)
    if (imageIds.size !== body.length) {
      throw new CruxConflictException({
        message: 'Duplicated image id(s)',
        property: 'body',
      })
    }

    return next.handle()
  }
}
