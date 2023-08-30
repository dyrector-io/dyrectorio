import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { CruxPreconditionFailedException } from 'src/exception/crux-exception'
import PrismaService from 'src/services/prisma.service'

@Injectable()
export default class ConfigBundleDeleteValidationInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest()

    const configBundleId = req.params.configBundleId as string

    const inUseDeployment = await this.prisma.configBundleOnDeployments.findFirst({
      where: {
        configBundleId,
      },
    })
    if (inUseDeployment != null) {
      throw new CruxPreconditionFailedException({
        property: 'id',
        value: configBundleId,
        message: 'Config bundle is already in use.',
      })
    }

    return next.handle()
  }
}
