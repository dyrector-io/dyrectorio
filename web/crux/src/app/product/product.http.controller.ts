import { Controller, Post, Body, Get, UseGuards, UseInterceptors } from '@nestjs/common'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorators'
import {
  AccessRequest,
  CreateEntityResponse,
  CreateProductRequest,
  ProductListResponse,
} from 'src/grpc/protobuf/proto/crux'
import HttpLoggerInterceptor from 'src/interceptors/http.logger.interceptor'
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiResponse } from '@nestjs/swagger'
import {
  AccessRequestDto,
  CreateEntityResponseDto,
  CreateProductRequestDto,
  ProductListResponseDto,
} from 'src/swagger/crux.dto'
import ProductService from './product.service'
import JwtAuthGuard from '../token/jwt-auth.guard'

@Controller('product')
@UseGuards(JwtAuthGuard)
@UseInterceptors(HttpLoggerInterceptor)
export default class ProductHttpController {
  constructor(private service: ProductService) {}

  @Post()
  @ApiBody({ type: CreateProductRequestDto })
  @ApiCreatedResponse({ type: CreateEntityResponseDto })
  @AuditLogLevel('disabled')
  async createProduct(@Body() request: CreateProductRequest): Promise<CreateEntityResponse> {
    return this.service.createProduct(request)
  }

  @Get()
  @ApiBody({ type: AccessRequestDto })
  @ApiOkResponse({ type: ProductListResponseDto })
  @AuditLogLevel('disabled')
  async getProducts(@Body() request: AccessRequest): Promise<ProductListResponse> {
    return this.service.getProducts(request)
  }
}
