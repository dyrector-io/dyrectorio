import { Metadata } from '@grpc/grpc-js'
import { Controller, UseGuards, UsePipes } from '@nestjs/common'
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
import { getIdentity } from 'src/interceptors/grpc.user.interceptor'
import ProductTeamAccessGuard from './guards/product.team-access.guard'
import ProductUpdateValidationPipe from './pipes/product.update.pipe'
import ProductService from './product.service'

@Controller()
@CruxProductControllerMethods()
@UseGuards(ProductTeamAccessGuard)
@UseGrpcInterceptors()
export default class ProductController implements CruxProductController {
  constructor(private service: ProductService) {}

  async getProducts(_: Empty, metadata: Metadata): Promise<ProductListResponse> {
    return this.service.getProducts(getIdentity(metadata))
  }

  async createProduct(request: CreateProductRequest, metadata: Metadata): Promise<CreateEntityResponse> {
    return this.service.createProduct(request, getIdentity(metadata))
  }

  async deleteProduct(request: IdRequest): Promise<Empty> {
    return this.service.deleteProduct(request)
  }

  @UsePipes(ProductUpdateValidationPipe)
  async updateProduct(request: UpdateProductRequest, metadata: Metadata): Promise<UpdateEntityResponse> {
    return this.service.updateProduct(request, getIdentity(metadata))
  }

  async getProductDetails(request: IdRequest): Promise<ProductDetailsReponse> {
    return this.service.getProductDetails(request)
  }
}
