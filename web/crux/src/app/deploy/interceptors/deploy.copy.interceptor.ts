import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { checkDeploymentCopiability } from 'src/domain/deployment'
import { CruxPreconditionFailedException } from 'src/exception/crux-exception'
import PrismaService from 'src/services/prisma.service'

@Injectable()
export default class DeployCopyValidationInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest()
    const deploymentId = req.params.deploymentId as string
    const force = req.query.force === 'true'

    const deployment = await this.prisma.deployment.findFirstOrThrow({
      where: {
        id: deploymentId,
      },
      select: {
        nodeId: true,
        versionId: true,
        status: true,
        prefix: true,
        version: {
          select: {
            type: true,
          },
        },
      },
    })

    if (!checkDeploymentCopiability(deployment.status, deployment.version.type)) {
      throw new CruxPreconditionFailedException({
        message: 'Invalid deployment status.',
        property: 'status',
        value: deployment.status,
      })
    }

    if (force) {
      return next.handle()
    }

    const preparingDeployment = await this.prisma.deployment.findFirst({
      where: {
        nodeId: deployment.nodeId,
        versionId: deployment.versionId,
        prefix: deployment.prefix,
        status: 'preparing',
      },
      select: {
        id: true,
      },
    })

    if (preparingDeployment) {
      throw new CruxPreconditionFailedException({
        message: 'The node already has a preparing deployment with this prefix and version.',
        property: 'deploymentId',
        value: preparingDeployment.id,
      })
    }

    return next.handle()
  }
}
