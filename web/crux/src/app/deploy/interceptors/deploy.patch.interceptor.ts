import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { VersionTypeEnum } from '@prisma/client'
import { Observable } from 'rxjs'
import { checkDeploymentMutability } from 'src/domain/deployment'
import { CruxConflictException, CruxPreconditionFailedException } from 'src/exception/crux-exception'
import PrismaService from 'src/services/prisma.service'
import { PatchDeploymentDto } from '../deploy.dto'

@Injectable()
export default class DeployPatchValidationInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest()
    const body = req.body as PatchDeploymentDto

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

    const existingDeployment = await this.prisma.deployment.findFirst({
      where: {
        id: {
          not: deploymentId,
        },

        nodeId: deployment.nodeId,
        versionId: deployment.versionId,
        prefix: body.prefix,

        // Rolling versions can only have one deployment for a node with the same prefix
        status: deployment.version.type === VersionTypeEnum.rolling ? undefined : 'preparing',
      },
      select: {
        id: true,
      },
    })

    if (existingDeployment) {
      throw new CruxConflictException({
        message:
          deployment.version.type === VersionTypeEnum.rolling
            ? 'Rolling versions can only have one deployment for the same node with the same prefix!'
            : 'You already have one preparing deployment with the same prefix!',
        error:
          deployment.version.type === VersionTypeEnum.rolling ? 'rollingVersionDeployment' : 'alreadyHavePreparing',
        property: 'deploymentId',
        value: existingDeployment.id,
      })
    }

    if (body.protected) {
      const otherProtected = await this.prisma.deployment.findFirst({
        where: {
          protected: true,
          nodeId: deployment.nodeId,
          prefix: deployment.prefix,
          versionId:
            deployment.version.type === 'incremental'
              ? {
                  not: deployment.versionId,
                }
              : undefined,
        },
      })

      if (otherProtected != null) {
        throw new CruxPreconditionFailedException({
          message:
            deployment.version.type === 'incremental'
              ? "There's a protected deployment with the same node and prefix in a different version"
              : "There's a protected deployment with the same node and prefix",
          property: 'deploymentId',
          value: otherProtected.id,
        })
      }
    }

    return next.handle()
  }
}
