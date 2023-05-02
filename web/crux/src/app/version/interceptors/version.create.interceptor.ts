import { ProductTypeEnum } from '.prisma/client'
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { CruxPreconditionFailedException } from 'src/exception/crux-exception'
import PrismaService from 'src/services/prisma.service'

@Injectable()
export default class VersionCreateValidationInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest()
    const productId = req.params.productId as string

    const product = await this.prisma.product.findUniqueOrThrow({
      where: {
        id: productId,
      },
    })

    if (product.type === ProductTypeEnum.simple) {
      throw new CruxPreconditionFailedException({
        message: 'Can not add version to a simple product.',
        property: 'productId',
        value: productId,
      })
    }

    return next.handle()
  }
}
