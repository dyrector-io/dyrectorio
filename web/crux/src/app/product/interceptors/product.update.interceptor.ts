import { CallHandler, ExecutionContext, Injectable, NestInterceptor, PreconditionFailedException } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import { Observable } from 'rxjs'
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
      throw new PreconditionFailedException({
        message: 'Only simple products can update their changelog.',
        property: 'changelog',
      })
    }

    return next.handle()
  }
}
