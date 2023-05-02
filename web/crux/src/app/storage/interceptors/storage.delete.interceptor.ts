import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { CruxPreconditionFailedException } from 'src/exception/crux-exception'
import PrismaService from 'src/services/prisma.service'

@Injectable()
export default class StorageDeleteValidationInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest()

    const storageId = req.params.storageId as string

    const usedContainerConfig = await this.prisma.containerConfig.count({
      where: {
        storageId,
      },
      take: 1,
    })
    if (usedContainerConfig > 0) {
      throw new CruxPreconditionFailedException({
        property: 'id',
        value: storageId,
        message: 'Storage is already in use.',
      })
    }

    const usedInstanceContainerConfig = await this.prisma.instanceContainerConfig.count({
      where: {
        storageId,
      },
      take: 1,
    })
    if (usedInstanceContainerConfig > 0) {
      throw new CruxPreconditionFailedException({
        property: 'id',
        value: storageId,
        message: 'Storage is already in use.',
      })
    }

    return next.handle()
  }
}
