import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { ApiBody, ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { Identity } from '@ory/kratos-client'
import HttpExceptionFilter from 'src/filters/http-exception.filter'
import HttpLoggerInterceptor from 'src/interceptors/http.logger.interceptor'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'
import ProductService from './product.service'

import { CreatedResponse, CreatedWithLocation } from '../shared/created-with-location.decorator'
import JwtAuthGuard, { IdentityFromRequest } from '../token/jwt-auth.guard'
import { CreateProductDto, ProductDetailsDto, ProductDto, UpdateProductDto } from './product.dto'
import ProductUpdateValidationInterceptor from './interceptors/product.update.interceptor'
import ProductTeamAccessGuard from './guards/product.team-access.guard'
import CreatedWithLocationInterceptor from '../shared/created-with-location.interceptor'

const ProductId = () => Param('productId')

@Controller('products')
@ApiTags('products')
@UseGuards(JwtAuthGuard)
@UseInterceptors(HttpLoggerInterceptor, PrismaErrorInterceptor, CreatedWithLocationInterceptor)
@UseFilters(HttpExceptionFilter)
export default class ProductHttpController {
  constructor(private service: ProductService) {}

  @Get()
  @ApiOkResponse({
    type: ProductDto,
    isArray: true,
  })
  @UseGuards(ProductTeamAccessGuard)
  async getProducts(@IdentityFromRequest() identity: Identity): Promise<ProductDto[]> {
    return this.service.getProducts(identity)
  }

  @Get(':productId')
  @ApiOkResponse({ type: ProductDetailsDto })
  @UseGuards(ProductTeamAccessGuard)
  async getProductDetails(@ProductId() id: string): Promise<ProductDetailsDto> {
    return this.service.getProductDetails(id)
  }

  @Post()
  @CreatedWithLocation()
  @ApiBody({ type: CreateProductDto })
  @ApiCreatedResponse({ type: ProductDto })
  async createProduct(
    @Body() request: CreateProductDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<CreatedResponse<ProductDto>> {
    const product = await this.service.createProduct(request, identity)

    return {
      url: `/products/${product.id}`,
      body: product,
    }
  }

  @Put(':productId')
  @HttpCode(204)
  @UseInterceptors(ProductUpdateValidationInterceptor)
  @ApiNoContentResponse({ type: ProductDto })
  @UseGuards(ProductTeamAccessGuard)
  async updateProduct(
    @ProductId() id: string,
    @Body() request: UpdateProductDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<void> {
    await this.service.updateProduct(id, request, identity)
  }

  @Delete(':productId')
  @HttpCode(204)
  @UseGuards(ProductTeamAccessGuard)
  async deleteProduct(@ProductId() id: string): Promise<void> {
    return this.service.deleteProduct(id)
    // TODO(@polaroi8d): exception if there is no product with the given Id
  }
}
