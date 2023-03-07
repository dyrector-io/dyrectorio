import { Metadata } from '@grpc/grpc-js'
import { Controller, UseGuards, UsePipes } from '@nestjs/common'
import { Identity } from '@ory/kratos-client'
import UseGrpcInterceptors from 'src/decorators/grpc-interceptors.decorator'
import { Empty } from 'src/grpc/protobuf/proto/common'
import {
  CreateEntityResponse,
  CreateProductRequest,
  CruxProductController,
  CruxProductControllerMethods,
  IdRequest,
  ProductDetailsReponse,
  ProductListResponse,
  UpdateEntityResponse,
  UpdateProductRequest,
} from 'src/grpc/protobuf/proto/crux'
import { IdentityFromGrpcCall } from 'src/shared/user-access.guard'
import ProductTeamAccessGuard from './guards/product.team-access.guard'
import ProductUpdateValidationPipe from './pipes/product.update.pipe'
import ProductService from './product.service'

@Controller()
@CruxProductControllerMethods()
@UseGuards(ProductTeamAccessGuard)
@UseGrpcInterceptors()
export default class ProductController implements CruxProductController {
  constructor(private service: ProductService) {}

  async getProducts(_: Empty, __: Metadata, @IdentityFromGrpcCall() identity: Identity): Promise<ProductListResponse> {
    return this.service.getProducts(identity)
  }

  async createProduct(
    request: CreateProductRequest,
    _: Metadata,
    @IdentityFromGrpcCall() identity: Identity,
  ): Promise<CreateEntityResponse> {
    return this.service.createProduct(request, identity)
  }

  async deleteProduct(request: IdRequest): Promise<Empty> {
    return this.service.deleteProduct(request)
  }

  @UsePipes(ProductUpdateValidationPipe)
  async updateProduct(
    request: UpdateProductRequest,
    _: Metadata,
    @IdentityFromGrpcCall() identity: Identity,
  ): Promise<UpdateEntityResponse> {
    return this.service.updateProduct(request, identity)
  }

  async getProductDetails(request: IdRequest): Promise<ProductDetailsReponse> {
    return this.service.getProductDetails(request)
  }
}
