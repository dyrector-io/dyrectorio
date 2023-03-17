import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  UseInterceptors,
  UseFilters,
  Delete,
  Param,
  Res,
  Put,
  HttpCode,
} from '@nestjs/common'
import { Response } from 'express'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorator'
import HttpLoggerInterceptor from 'src/interceptors/http.logger.interceptor'
import { ApiBody, ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import HttpExceptionFilter from 'src/filters/http-exception.filter'
import { HttpIdentityInterceptor, IdentityFromRequest } from 'src/interceptors/http.identity.interceptor'
import { Identity } from '@ory/kratos-client'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'
import ProductService from './product.service'
import JwtAuthGuard from '../token/jwt-auth.guard'
import { BasicProductDto, CreateProductDto, ProductDetailsDto, ProductListDto, UpdateProductDto } from './product.dto'

@Controller('products')
@ApiTags('products')
@UseGuards(JwtAuthGuard)
@UseInterceptors(HttpLoggerInterceptor, HttpIdentityInterceptor, PrismaErrorInterceptor)
@UseFilters(HttpExceptionFilter)
export default class ProductHttpController {
  constructor(private service: ProductService) {}

  @Get()
  @ApiOkResponse({ type: ProductListDto })
  @AuditLogLevel('disabled') // TODO(@polaroi8d): Refactor after removing the gRPC
  async getProducts(@IdentityFromRequest() identity: Identity): Promise<ProductListDto> {
    return this.service.getProducts(identity)
  }

  @Get(':id')
  @ApiOkResponse({ type: ProductDetailsDto })
  @AuditLogLevel('disabled') // TODO(@polaroi8d): Refactor after removing the gRPC
  async getProductDetails(@Param('id') id: string): Promise<ProductDetailsDto> {
    return this.service.getProductDetails(id)
  }

  @Post()
  @ApiBody({ type: CreateProductDto })
  @ApiCreatedResponse({ type: BasicProductDto })
  @AuditLogLevel('disabled') // TODO(@polaroi8d): Refactor after removing the gRPC
  @HttpCode(201)
  async createProduct(
    @Body() request: CreateProductDto,
    @IdentityFromRequest() identity: Identity,
    @Res() res: Response,
  ): Promise<void> {
    const product = await this.service.createProduct(request, identity)
    res.location(`/products/${product.id}`).json(product)
  }

  @Put(':id')
  @HttpCode(204)
  @ApiNoContentResponse({ type: BasicProductDto })
  async updateProduct(
    @Param('id') id: string,
    @Body() request: UpdateProductDto,
    @IdentityFromRequest() identity: Identity,
    @Res() res: Response,
  ): Promise<void> {
    await this.service.updateProduct(id, request, identity)
    res.end()
  }

  @Delete(':id')
  @AuditLogLevel('disabled') // TODO(@polaroi8d): Refactor after removing the gRPC
  @HttpCode(204)
  async deleteProduct(@Param('id') id: string): Promise<void> {
    return this.service.deleteProduct(id)
    // TODO(@polaroi8d): exception if there is no product with the given Id
  }
}
