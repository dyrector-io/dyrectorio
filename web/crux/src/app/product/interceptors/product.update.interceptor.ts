import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { CruxPreconditionFailedException } from 'src/exception/crux-exception'
import PrismaService from 'src/services/prisma.service'
import { UpdateProductDto } from '../product.dto'

@Injectable()
export default class ProductUpdateValidationInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest()

    const productId = req.params.productId as string
    const update = req.body as UpdateProductDto

    const product = await this.prisma.product.findUniqueOrThrow({
      where: {
        id: productId,
      },
    })

    if (update.changelog && product.type !== 'simple') {
      throw new CruxPreconditionFailedException({
        message: 'Only simple products can update their changelog.',
        property: 'changelog',
      })
    }

    return next.handle()
  }
}
