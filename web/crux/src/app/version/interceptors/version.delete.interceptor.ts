import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { checkVersionMutability, versionIsDeletable } from 'src/domain/version'
import { CruxPreconditionFailedException } from 'src/exception/crux-exception'
import PrismaService from 'src/services/prisma.service'

@Injectable()
export default class VersionDeleteValidationInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest()
    const versionId = req.params.versionId as string

    const version = await this.prisma.version.findUniqueOrThrow({
      where: {
        id: versionId,
      },
      include: {
        deployments: {
          select: {
            status: true,
          },
        },
        product: {
          select: {
            type: true,
          },
        },
        children: {
          select: {
            versionId: true,
          },
        },
      },
    })

    checkVersionMutability(version)

    if (!versionIsDeletable(version)) {
      throw new CruxPreconditionFailedException({
        message: 'Version is not deletable',
        property: 'versionId',
        value: version.id,
      })
    }

    return next.handle()
  }
}
