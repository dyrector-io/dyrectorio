import { Controller, Post, Body, Get, UseGuards, UseInterceptors, UseFilters } from '@nestjs/common'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorators'
import { CreateEntityResponse, CreateProductRequest, ProductListResponse } from 'src/grpc/protobuf/proto/crux'
import HttpLoggerInterceptor from 'src/interceptors/http.logger.interceptor'
import { ApiBody, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger'
import {
  AccessRequestDto,
  CreateEntityResponseDto,
  CreateProductRequestDto,
  ProductListResponseDto,
} from 'src/swagger/crux.dto'
import HttpExceptionFilter from 'src/filters/http-exception.filter'
import { HttpIdentityInterceptor, IdentityFromRequest } from 'src/interceptors/http.identity.interceptor'
import { Identity } from '@ory/kratos-client'
import HttpResponseTransformInterceptor, {
  TransformResponse,
} from 'src/interceptors/http.response.transform.interceptor'
import CreateEntityResponseHTTPPipe from 'src/pipes/create.entity.http.pipe'
import ProductService from './product.service'
import JwtAuthGuard from '../token/jwt-auth.guard'
import ProductCreateHTTPPipe from './pipes/product.create.http.pipe'
import ProductGetHTTPPipe from './pipes/product.get.http.pipe'

@Controller('product')
@UseGuards(JwtAuthGuard)
@UseInterceptors(HttpLoggerInterceptor, HttpIdentityInterceptor, HttpResponseTransformInterceptor)
@UseFilters(HttpExceptionFilter)
export default class ProductHttpController {
  constructor(private service: ProductService) {}

  @Post()
  @ApiBody({ type: CreateProductRequestDto })
  @ApiCreatedResponse({ type: CreateEntityResponseDto })
  @AuditLogLevel('disabled')
  @TransformResponse(CreateEntityResponseHTTPPipe)
  async createProduct(
    @Body(ProductCreateHTTPPipe) request: CreateProductRequest,
    @IdentityFromRequest() identity: Identity,
  ): Promise<CreateEntityResponse> {
    return this.service.createProduct(request, identity)
  }

  @Get()
  @ApiBody({ type: AccessRequestDto })
  @ApiOkResponse({ type: ProductListResponseDto })
  @AuditLogLevel('disabled')
  @TransformResponse(ProductGetHTTPPipe)
  async getProducts(@IdentityFromRequest() identity: Identity): Promise<ProductListResponse> {
    return this.service.getProducts(identity)
  }
}
