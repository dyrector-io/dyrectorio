import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { CruxPreconditionFailedException } from 'src/exception/crux-exception'
import PrismaService from 'src/services/prisma.service'
import { UpdateRegistryDto } from '../registry.dto'
import RegistryMapper from '../registry.mapper'

@Injectable()
export default class UpdateRegistryInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService, private mapper: RegistryMapper) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest()

    const body = request.body as UpdateRegistryDto
    const { id } = request.params

    const used = await this.prisma.image.count({
      where: {
        registryId: id,
      },
      take: 1,
    })

    if (used < 1) {
      return next.handle()
    }

    const registry = await this.prisma.registry.findUniqueOrThrow({
      where: {
        id,
      },
    })

    const details = this.mapper.detailsToDb(body)

    const blackList = ['url', 'user', 'type', 'namespace', 'imageNamePrefix', 'apiUrl']

    blackList.forEach(it => {
      if (details[it] !== registry[it]) {
        throw new CruxPreconditionFailedException({
          property: 'id',
          value: id,
          message: 'Registry is already in use.',
        })
      }
    })

    return next.handle()
  }
}
