import { ProjectTypeEnum } from '.prisma/client'
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { checkVersionMutability } from 'src/domain/version'
import { CruxPreconditionFailedException } from 'src/exception/crux-exception'
import PrismaService from 'src/services/prisma.service'

@Injectable()
export default class VersionUpdateValidationInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest()
    const versionId = req.params.versionId as string

    const version = await this.prisma.version.findUniqueOrThrow({
      include: {
        project: {
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

    if (version.project.type === ProjectTypeEnum.versionless) {
      throw new CruxPreconditionFailedException({
        message: 'Can not update the version of a versionless project.',
        property: 'id',
        value: versionId,
      })
    }

    return next.handle()
  }
}
