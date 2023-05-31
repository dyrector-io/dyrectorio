import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { CruxPreconditionFailedException } from 'src/exception/crux-exception'
import PrismaService from 'src/services/prisma.service'
import { UpdateProjectDto } from '../project.dto'

@Injectable()
export default class ProjectUpdateValidationInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest()

    const projectId = req.params.projectId as string
    const update = req.body as UpdateProjectDto

    const project = await this.prisma.project.findUniqueOrThrow({
      where: {
        id: projectId,
      },
    })

    if (update.changelog && project.type !== 'simple') {
      throw new CruxPreconditionFailedException({
        message: 'Only simple projects can update their changelog.',
        property: 'changelog',
      })
    }

    return next.handle()
  }
}
