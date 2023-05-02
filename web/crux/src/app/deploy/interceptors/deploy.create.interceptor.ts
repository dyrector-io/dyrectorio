import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
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

    const existingDeployment = await this.prisma.deployment.findFirst({
      where: {
        nodeId: body.nodeId,
        versionId: body.versionId,
        prefix: body.prefix,
        status: 'preparing',
      },
      select: {
        id: true,
      },
    })

    if (existingDeployment) {
      throw new CruxConflictException({
        message: 'There is already a deployment with preparing status for the version on that node',
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

    return next.handle()
  }
}
