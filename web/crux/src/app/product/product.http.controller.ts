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
import JWTUser from 'src/decorators/jwt-user.decorator'
import ProductService from './product.service'
import JwtAuthGuard from '../token/jwt-auth.guard'

@Controller('product')
@UseGuards(JwtAuthGuard)
@UseInterceptors(HttpLoggerInterceptor)
@UseFilters(HttpExceptionFilter)
export default class ProductHttpController {
  constructor(private service: ProductService) {}

  @Post()
  @ApiBody({ type: CreateProductRequestDto })
  @ApiCreatedResponse({ type: CreateEntityResponseDto })
  @AuditLogLevel('disabled')
  async createProduct(
    @Body() request: CreateProductRequest,
    @JWTUser() accessedBy: string,
  ): Promise<CreateEntityResponse> {
    return this.service.createProduct(request, accessedBy)
  }

  @Get()
  @ApiBody({ type: AccessRequestDto })
  @ApiOkResponse({ type: ProductListResponseDto })
  @AuditLogLevel('disabled')
  async getProducts(@JWTUser() accessedBy: string): Promise<ProductListResponse> {
    return this.service.getProducts(accessedBy)
  }
}
