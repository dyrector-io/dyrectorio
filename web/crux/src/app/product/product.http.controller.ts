import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { Identity } from '@ory/kratos-client'
import HttpLoggerInterceptor from 'src/interceptors/http.logger.interceptor'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'
import UuidValidationGuard from 'src/guards/uuid-params.validation.guard'
import UuidParams from 'src/decorators/api-params.decorator'
import ProductService from './product.service'
import { CreatedResponse, CreatedWithLocation } from '../shared/created-with-location.decorator'
import CreatedWithLocationInterceptor from '../shared/created-with-location.interceptor'
import JwtAuthGuard, { IdentityFromRequest } from '../token/jwt-auth.guard'
import ProductTeamAccessGuard from './guards/product.team-access.guard'
import ProductUpdateValidationInterceptor from './interceptors/product.update.interceptor'
import { CreateProductDto, ProductDetailsDto, ProductListItemDto, UpdateProductDto } from './product.dto'

const PARAM_PRODUCT_ID = 'productId'
const ProductId = () => Param(PARAM_PRODUCT_ID)

const ROUTE_PRODUCTS = 'products'
const ROUTE_PRODUCT_ID = ':productId'

@Controller(ROUTE_PRODUCTS)
@ApiTags(ROUTE_PRODUCTS)
@UseGuards(JwtAuthGuard, UuidValidationGuard, ProductTeamAccessGuard)
@UsePipes(
  new ValidationPipe({
    // TODO(@robot9706): Move to global pipes after removing gRPC
    transform: true,
  }),
)
@UseInterceptors(HttpLoggerInterceptor, PrismaErrorInterceptor, CreatedWithLocationInterceptor)
export default class ProductHttpController {
  constructor(private service: ProductService) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({
    description:
      'Returns a list of transactions that have contributed to the Stripe account balance (e.g., charges, transfers, and so forth). The transactions are returned in sorted order, with the most recent transactions appearing first.',
    summary: 'List all balance transactions',
  })
  @ApiOkResponse({
    type: ProductListItemDto,
    isArray: true,
    description:
      'A dictionary with a data property that contains an array of up to limit transactions, starting after transaction starting_after. Each entry in the array is a separate transaction history object. If no more transactions are available, the resulting array will be empty.',
  })
  @ApiNoContentResponse()
  @ApiBadRequestResponse({
    description: 'Provided bad parmaters',
  })
  async getProducts(@IdentityFromRequest() identity: Identity): Promise<ProductListItemDto[]> {
    return this.service.getProducts(identity)
  }

  @Get(ROUTE_PRODUCT_ID)
  @HttpCode(200)
  @ApiOkResponse({ type: ProductDetailsDto, description: 'Return data of a product.' })
  @UuidParams(PARAM_PRODUCT_ID)
  async getProductDetails(@ProductId() id: string): Promise<ProductDetailsDto> {
    return this.service.getProductDetails(id)
  }

  @Post()
  @HttpCode(201)
  @CreatedWithLocation()
  @ApiBody({ type: CreateProductDto })
  @ApiCreatedResponse({ type: ProductListItemDto, description: 'Create new product.' })
  async createProduct(
    @Body() request: CreateProductDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<CreatedResponse<ProductListItemDto>> {
    const product = await this.service.createProduct(request, identity)

    return {
      url: `/products/${product.id}`,
      body: product,
    }
  }

  @Put(ROUTE_PRODUCT_ID)
  @HttpCode(204)
  @ApiNoContentResponse({ description: 'Update product details.' })
  @UuidParams(PARAM_PRODUCT_ID)
  @UseInterceptors(ProductUpdateValidationInterceptor)
  async updateProduct(
    @ProductId() id: string,
    @Body() request: UpdateProductDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<void> {
    await this.service.updateProduct(id, request, identity)
  }

  @Delete(ROUTE_PRODUCT_ID)
  @HttpCode(204)
  @ApiNoContentResponse({ description: 'Delete product.' })
  @UuidParams(PARAM_PRODUCT_ID)
  async deleteProduct(@ProductId() id: string): Promise<void> {
    return this.service.deleteProduct(id)
    // TODO(@polaroi8d): exception if there is no product with the given Id
  }
}
