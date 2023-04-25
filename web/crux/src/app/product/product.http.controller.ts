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
      "Returns a list of a team's products and their details.",
    summary: 'Fetch details of products.',
  })
  @ApiOkResponse({
    type: ProductListItemDto,
    isArray: true,
    description:
      "Everything is OK.",
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
<<<<<<< HEAD
  @ApiOkResponse({ type: ProductDetailsDto, description: 'Return data of a product.' })
  @UuidParams(PARAM_PRODUCT_ID)
=======
  @ApiOperation({
    description:
      "Returns a products' details. The response should contain an array, consisting of the product's `name`, `id`, `type`, `description`, `deletability`, versions and version related data, including version `name` and `id`, `changelog`, increasibility.",
    summary: 'Fetch details of a product.',
  })
  @ApiOkResponse({ type: ProductDetailsDto, description: 'Everything is OK.' })
>>>>>>> 5d447b6a (feat(crux): improve openapi docs)
  async getProductDetails(@ProductId() id: string): Promise<ProductDetailsDto> {
    return this.service.getProductDetails(id)
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({
    description:
      "Create a new product for a team. Newly created team has a `type` and a `name` as required variables, and optionally a `description` and a `changelog`.",
    summary: 'Create a new product for a team.',
  })
  @CreatedWithLocation()
  @ApiBody({ type: CreateProductDto })
  @ApiCreatedResponse({ type: ProductListItemDto, description: 'New product created.' })
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
  @ApiOperation({
    description:
      "Updates a product. `Name` is a required variable to identify which product is modified, `description` and `changelog` can be adjusted with this call.",
    summary: 'Update a product.',
  })
  @ApiNoContentResponse({ description: 'Product details are modified.' })
  @UseInterceptors(ProductUpdateValidationInterceptor)
  @UuidParams(PARAM_PRODUCT_ID)
  async updateProduct(
    @ProductId() id: string,
    @Body() request: UpdateProductDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<void> {
    await this.service.updateProduct(id, request, identity)
  }

  @Delete(ROUTE_PRODUCT_ID)
  @HttpCode(204)
  @ApiOperation({
    description:
      "Deletes a product. Only the `name` is required.",
    summary: 'Delete a product.',
  })
  @ApiNoContentResponse({ description: 'Product deleted.' })
  @UuidParams(PARAM_PRODUCT_ID)
  async deleteProduct(@ProductId() id: string): Promise<void> {
    return this.service.deleteProduct(id)
    // TODO(@polaroi8d): exception if there is no product with the given Id
  }
}
