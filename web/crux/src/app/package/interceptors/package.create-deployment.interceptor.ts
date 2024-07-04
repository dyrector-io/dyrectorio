import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { CruxConflictException } from 'src/exception/crux-exception'
import PrismaService from 'src/services/prisma.service'
import { CreatePackageDeploymentDto } from '../package.dto'

@Injectable()
export default class PackageCreateDeploymentInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest()
    const environmentId = req.params.environmentId as string

    const body = req.body as CreatePackageDeploymentDto

    const env = await this.prisma.packageEnvironment.findUniqueOrThrow({
      where: {
        id: environmentId,
      },
    })

    const deployment = await this.prisma.deployment.findFirst({
      where: {
        nodeId: env.nodeId,
        prefix: env.prefix,
        versionId: body.versionId,
      },
      select: {
        id: true,
      },
    })

    if (deployment) {
      throw new CruxConflictException({
        message: 'Deployment already exists with the same prefix and node for the version.',
        property: 'deploymentId',
        value: deployment.id,
      })
    }

    return next.handle()
  }
}
