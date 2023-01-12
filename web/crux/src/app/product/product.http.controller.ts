import { Controller, Post, Body } from '@nestjs/common'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorators'
import { CreateEntityResponse, CreateProductRequest } from 'src/grpc/protobuf/proto/crux'
import ProductService from './product.service'

@Controller('product')
export default class ProductHttpController {
  constructor(private service: ProductService) {}

  @Post()
  @AuditLogLevel('disabled')
  async createProduct(@Body() request: CreateProductRequest): Promise<CreateEntityResponse> {
    return this.service.createProduct(request)
  }
}
