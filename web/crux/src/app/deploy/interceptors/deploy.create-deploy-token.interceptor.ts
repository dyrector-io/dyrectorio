import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { CruxConflictException, CruxPreconditionFailedException } from 'src/exception/crux-exception'
import PrismaService from 'src/services/prisma.service'
import { CreateDeploymentTokenDto } from '../deploy.dto'

@Injectable()
export default class DeployCreateDeployTokenValidationInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest()

    const deploymentId = req.params.deploymentId as string
    const body = req.body as CreateDeploymentTokenDto

    const deployment = await this.prisma.deployment.findUniqueOrThrow({
      where: {
        id: deploymentId,
      },
      select: {
        version: {
          select: {
            type: true,
            project: {
              select: {
                teamId: true,
              },
            },
          },
        },
      },
    })

    if (deployment.version.type !== 'rolling') {
      throw new CruxPreconditionFailedException({
        message: 'Only rolling version deployments can have deployment tokens',
        property: 'versionType',
        value: deployment.version.type,
      })
    }

    const { teamId } = deployment.version.project

    const tokens = await this.prisma.deploymentToken.count({
      where: {
        deployment: {
          version: {
            project: {
              teamId,
            },
          },
        },
        name: body.name,
      },
    })

    if (tokens > 0) {
      throw new CruxConflictException({
        message: 'Name taken',
        property: 'name',
        value: body.name,
      })
    }

    return next.handle()
  }
}
