import { Controller, Post, Body, Get, UseGuards, UseInterceptors } from '@nestjs/common'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorators'
import {
  AccessRequest,
  CreateEntityResponse,
  CreateProductRequest,
  ProductListResponse,
} from 'src/grpc/protobuf/proto/crux'
import HttpLoggerInterceptor from 'src/interceptors/http.logger.interceptor'
import ProductService from './product.service'
import JwtAuthGuard from '../token/jwt-auth.guard'

@Controller('product')
@UseGuards(JwtAuthGuard)
@UseInterceptors(HttpLoggerInterceptor)
export default class ProductHttpController {
  constructor(private service: ProductService) {}

  @Post()
  @AuditLogLevel('disabled')
  async createProduct(@Body() request: CreateProductRequest): Promise<CreateEntityResponse> {
    return this.service.createProduct(request)
  }

  @Get()
  @AuditLogLevel('disabled')
  async getProducts(@Body() request: AccessRequest): Promise<ProductListResponse> {
    return this.service.getProducts(request)
  }
}
