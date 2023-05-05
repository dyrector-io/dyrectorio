import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UseGuards, UseInterceptors } from '@nestjs/common'
import {
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { Identity } from '@ory/kratos-client'
import UuidParams from 'src/decorators/api-params.decorator'
import { CreatedResponse, CreatedWithLocation } from '../shared/created-with-location.decorator'
import { IdentityFromRequest } from '../token/jwt-auth.guard'
import ProductTeamAccessGuard from './guards/product.team-access.guard'
import ProductUpdateValidationInterceptor from './interceptors/product.update.interceptor'
import { CreateProductDto, ProductDetailsDto, ProductListItemDto, UpdateProductDto } from './product.dto'
import ProductService from './product.service'

const PARAM_PRODUCT_ID = 'productId'
const ProductId = () => Param(PARAM_PRODUCT_ID)

const ROUTE_PRODUCTS = 'products'
const ROUTE_PRODUCT_ID = ':productId'

@Controller(ROUTE_PRODUCTS)
@ApiTags(ROUTE_PRODUCTS)
@UseGuards(ProductTeamAccessGuard)
export default class ProductHttpController {
  constructor(private service: ProductService) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({
    description: "Returns a list of a team's products and their details.",
    summary: 'Fetch the products list.',
  })
  @ApiOkResponse({
    type: ProductListItemDto,
    isArray: true,
    description: 'List of products',
  })
  @ApiNoContentResponse()
  async getProducts(@IdentityFromRequest() identity: Identity): Promise<ProductListItemDto[]> {
    return this.service.getProducts(identity)
  }

  @Get(ROUTE_PRODUCT_ID)
  @HttpCode(200)
  @ApiOperation({
    description:
      "Returns a product's details. The response should contain an array, consisting of the product's `name`, `id`, `type`, `description`, `deletability`, versions and version related data, including version `name` and `id`, `changelog`, increasibility.",
    summary: 'Fetch details of a product.',
  })
  @ApiOkResponse({ type: ProductDetailsDto, description: 'Details of a product.' })
  @UuidParams(PARAM_PRODUCT_ID)
  async getProductDetails(@ProductId() id: string): Promise<ProductDetailsDto> {
    return this.service.getProductDetails(id)
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({
    description:
      'Create a new product for a team. Newly created team has a `type` and a `name` as required variables, and optionally a `description` and a `changelog`.',
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
      'Updates a product. `productId` is a required variable to identify which product is modified, `name`, `description` and `changelog` can be adjusted with this call.',
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
    description: 'Deletes a product with the specified `productId`',
    summary: 'Delete a product.',
  })
  @ApiNoContentResponse({ description: 'Product deleted.' })
  @UuidParams(PARAM_PRODUCT_ID)
  async deleteProduct(@ProductId() id: string): Promise<void> {
    return this.service.deleteProduct(id)
  }
}
