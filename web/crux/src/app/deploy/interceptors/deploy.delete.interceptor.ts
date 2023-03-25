import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { checkDeploymentDeletability } from 'src/domain/deployment'
import { PreconditionFailedException } from 'src/exception/errors'
import PrismaService from 'src/services/prisma.service'

@Injectable()
export default class DeleteDeploymentValidationInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest()
    const deploymentId = req.params.deploymentId as string

    const deployment = await this.prisma.deployment.findUniqueOrThrow({
      where: {
        id: deploymentId,
      },
    })

    if (!checkDeploymentDeletability(deployment.status)) {
      throw new PreconditionFailedException({
        message: 'Invalid deployment status.',
        property: 'status',
        value: deployment.status,
      })
    }

    return next.handle()
  }
}
