import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { checkDeploymentMutability } from 'src/domain/deployment'
import { CruxPreconditionFailedException } from 'src/exception/crux-exception'
import PrismaService from 'src/services/prisma.service'

@Injectable()
export default class DeployPatchValidationInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest()
    const deploymentId = req.params.deploymentId as string
    const deployment = await this.prisma.deployment.findUniqueOrThrow({
      where: {
        id: deploymentId,
      },
      include: {
        version: true,
      },
    })

    if (!checkDeploymentMutability(deployment.status, deployment.version.type)) {
      throw new CruxPreconditionFailedException({
        message: 'Invalid deployment status.',
        property: 'status',
        value: deployment.status,
      })
    }

    return next.handle()
  }
}
