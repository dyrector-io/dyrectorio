import { CallHandler, ExecutionContext, Injectable, NestInterceptor, PreconditionFailedException } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import { Observable } from 'rxjs'
import { UpdateStorageDto } from '../storage.dto'

type Blacklist = Array<keyof Storage>
const blacklistedFields: Blacklist = ['name', 'url', 'accessKey', 'secretKey']

@Injectable()
export default class StorageUpdateValidationInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest()

    const storageId = req.params.storageId as string
    const update = req.body as UpdateStorageDto

    const usedContainerConfig = await this.prisma.containerConfig.count({
      where: {
        storageId,
      },
      take: 1,
    })
    const usedInstanceContainerConfig = await this.prisma.instanceContainerConfig.count({
      where: {
        storageId,
      },
      take: 1,
    })

    if (usedContainerConfig === 0 && usedInstanceContainerConfig === 0) {
      return next.handle()
    }

    const storage = await this.prisma.storage.findUniqueOrThrow({
      where: {
        id: storageId,
      },
    })

    blacklistedFields.forEach(it => {
      if (update[it] !== storage[it]) {
        throw new PreconditionFailedException({
          property: 'id',
          value: storageId,
          message: 'Storage is already in use.',
        })
      }
    })

    return next.handle()
  }
}
