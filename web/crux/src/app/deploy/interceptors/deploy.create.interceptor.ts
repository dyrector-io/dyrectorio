import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { VersionTypeEnum } from '@prisma/client'
import { Observable } from 'rxjs'
import { CruxConflictException, CruxPreconditionFailedException } from 'src/exception/crux-exception'
import PrismaService from 'src/services/prisma.service'
import { CreateDeploymentDto } from '../deploy.dto'

@Injectable()
export default class DeployCreateValidationInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest()
    const body = req.body as CreateDeploymentDto

    const version = await this.prisma.version.findFirst({
      where: {
        id: body.versionId,
      },
      select: {
        type: true,
      },
    })

    const existingDeployment = await this.prisma.deployment.findFirst({
      where: {
        nodeId: body.nodeId,
        versionId: body.versionId,
        prefix: body.prefix,

        // Rolling versions can only have one deployment for a node with the same prefix
        status: version.type === VersionTypeEnum.rolling ? undefined : 'preparing',
      },
      select: {
        id: true,
      },
    })

    if (existingDeployment) {
      throw new CruxConflictException({
        message:
          version.type === VersionTypeEnum.rolling
            ? 'Rolling versions can only have one deployment for the same node with the same prefix!'
            : 'You already have one preparing deployment with the same prefix!',
        error: version.type === VersionTypeEnum.rolling ? 'rollingVersionDeployment' : 'alreadyHavePreparing',
        property: 'deploymentId',
        value: existingDeployment.id,
      })
    }

    const images = await this.prisma.image.count({
      where: {
        versionId: body.versionId,
      },
    })

    if (images <= 0) {
      throw new CruxPreconditionFailedException({
        message: "You can't create a deployment without having atleast one image",
        property: 'versionId',
        value: body.versionId,
      })
    }

    if (body.protected) {
      const otherProtected = await this.prisma.deployment.findFirst({
        where: {
          protected: true,
          nodeId: body.nodeId,
          prefix: body.prefix,
          versionId:
            version.type === 'incremental'
              ? {
                  not: body.versionId,
                }
              : undefined,
        },
      })

      if (otherProtected) {
        throw new CruxPreconditionFailedException({
          message:
            version.type === 'incremental'
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
