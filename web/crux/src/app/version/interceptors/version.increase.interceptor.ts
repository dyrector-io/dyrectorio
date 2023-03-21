import { ProductTypeEnum, VersionTypeEnum } from '.prisma/client'
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { AlreadyExistsException, PreconditionFailedException } from 'src/exception/errors'
import PrismaService from 'src/services/prisma.service'

@Injectable()
export default class VersionIncreaseValidationPipe implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest()
    const versionId = req.params.versionId as string

    const version = await this.prisma.version.findUniqueOrThrow({
      where: {
        id: versionId,
      },
      include: {
        product: {
          select: {
            id: true,
            type: true,
          },
        },
        deployments: {
          select: {
            status: true,
          },
        },
        _count: {
          select: {
            children: true,
          },
        },
      },
    })

    if (version.type === VersionTypeEnum.rolling) {
      throw new PreconditionFailedException({
        message: 'Can not increase a rolling version.',
        property: 'id',
        value: versionId,
      })
    }

    if (version.product.type === ProductTypeEnum.simple) {
      throw new PreconditionFailedException({
        message: 'Can not increase version of a simple product.',
        property: 'id',
        value: versionId,
      })
    }

    if (version._count.children > 0) {
      throw new AlreadyExistsException({
        message: 'This version already has a child version',
        property: 'id',
        value: versionId,
      })
    }

    return next.handle()
  }
}
