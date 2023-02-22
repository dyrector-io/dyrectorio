import { Metadata } from '@grpc/grpc-js'
import { UsePipes, Controller, UseGuards, UseInterceptors } from '@nestjs/common'
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
import GrpcErrorInterceptor from 'src/interceptors/grpc.error.interceptor'
import GrpcLoggerInterceptor from 'src/interceptors/grpc.logger.interceptor'
import GrpcUserInterceptor, { getAccessedBy } from 'src/interceptors/grpc.user.interceptor'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'
import ProductTeamAccessGuard from './guards/product.team-access.guard'
import ProductUpdateValidationPipe from './pipes/product.update.pipe'
import ProductService from './product.service'

@Controller()
@CruxProductControllerMethods()
@UseGuards(ProductTeamAccessGuard)
@UseInterceptors(GrpcLoggerInterceptor, GrpcUserInterceptor, GrpcErrorInterceptor, PrismaErrorInterceptor)
export default class ProductController implements CruxProductController {
  constructor(private service: ProductService) {}

  async getProducts(_: Empty, metadata: Metadata): Promise<ProductListResponse> {
    return this.service.getProducts(getAccessedBy(metadata))
  }

  async createProduct(request: CreateProductRequest, metadata: Metadata): Promise<CreateEntityResponse> {
    return this.service.createProduct(request, getAccessedBy(metadata))
  }

  async deleteProduct(request: IdRequest): Promise<Empty> {
    return this.service.deleteProduct(request)
  }

  @UsePipes(ProductUpdateValidationPipe)
  async updateProduct(request: UpdateProductRequest, metadata: Metadata): Promise<UpdateEntityResponse> {
    return this.service.updateProduct(request, getAccessedBy(metadata))
  }

  async getProductDetails(request: IdRequest): Promise<ProductDetailsReponse> {
    return this.service.getProductDetails(request)
  }
}
