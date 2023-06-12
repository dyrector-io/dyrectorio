import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { checkDeploymentCopiability, checkPrefixAvailability } from 'src/domain/deployment'
import { CruxConflictException, CruxPreconditionFailedException } from 'src/exception/crux-exception'
import PrismaService from 'src/services/prisma.service'
import { CopyDeploymentDto } from '../deploy.dto'

@Injectable()
export default class DeployCopyValidationInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest()
    const deploymentId = req.params.deploymentId as string
    const dto = req.body as CopyDeploymentDto

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
            deployments: {
              where: {
                nodeId: dto.nodeId,
                prefix: dto.prefix,
              },
              select: {
                id: true,
                nodeId: true,
                prefix: true,
                status: true,
              },
            },
          },
        },
      },
    })

    if (!checkDeploymentCopiability(deployment.status)) {
      throw new CruxPreconditionFailedException({
        message: 'Invalid deployment status.',
        property: 'status',
        value: deployment.status,
      })
    }

    if (!checkPrefixAvailability(deployment.version, dto.nodeId, dto.prefix)) {
      throw new CruxConflictException({
        message: 'There is already a deployment with the same prefix on the selected node.',
        property: 'deploymentId',
        value: deployment.version.deployments[0].id,
      })
    }

    return next.handle()
  }
}
