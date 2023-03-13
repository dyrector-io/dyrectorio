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
  Next,
  Put,
} from '@nestjs/common'
import { Response } from 'express'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorator'
import HttpLoggerInterceptor from 'src/interceptors/http.logger.interceptor'
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import HttpExceptionFilter from 'src/filters/http-exception.filter'
import { HttpIdentityInterceptor, IdentityFromRequest } from 'src/interceptors/http.identity.interceptor'
import { Identity } from '@ory/kratos-client'
import IdDto from 'src/shared/dtos/common'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'
import ProductService from './product.service'
import JwtAuthGuard from '../token/jwt-auth.guard'
import { CreateProductDto, ProductListDto, ProductsDto } from './product.dto'

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

  @Post()
  @ApiBody({ type: CreateProductDto })
  @ApiCreatedResponse({ type: ProductsDto })
  @AuditLogLevel('disabled') // TODO(@polaroi8d): Refactor after removing the gRPC
  async createProduct(
    @Body() request: CreateProductDto,
    @IdentityFromRequest() identity: Identity,
    @Res() res: Response,
  ): Promise<ProductsDto> {
    const product = await this.service.createProduct(request, identity)
    res.location(`/products/${product.id}`)
    res.json(product)
    return product
  }

  @Put(':id')
  async updateProduct(
    @Body() request: CreateProductDto,
    @IdentityFromRequest() identity: Identity,
    @Res() res: Response,
  ): Promise<ProductsDto> {
    const product = await this.service.updateProduct(request, identity)
    res.location(`/products/${product.id}`)
    res.json(product)
    return product
  }

  @Delete(':id')
  @ApiBody({ type: IdDto })
  @ApiOkResponse()
  @AuditLogLevel('disabled') // TODO(@polaroi8d): Refactor after removing the gRPC
  async deleteProduct(@Param() idParam: IdDto): Promise<void> {
    return this.service.deleteProduct(idParam)
    // TODO(@polaroi8d): exception if there is no product with the given Id
  }
}
