import { ProjectTypeEnum } from '.prisma/client'
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { CruxPreconditionFailedException } from 'src/exception/crux-exception'
import PrismaService from 'src/services/prisma.service'

@Injectable()
export default class VersionCreateValidationInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest()
    const projectId = req.params.projectId as string

    const project = await this.prisma.project.findUniqueOrThrow({
      where: {
        id: projectId,
      },
    })

    if (project.type === ProjectTypeEnum.simple) {
      throw new CruxPreconditionFailedException({
        message: 'Can not add version to a simple project.',
        property: 'projectId',
        value: projectId,
      })
    }

    return next.handle()
  }
}
