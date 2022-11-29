import { Body, Controller, UseGuards, UseInterceptors } from '@nestjs/common'
import { Empty } from 'src/grpc/protobuf/proto/common'
import {
  AccessRequest,
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
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'
import ProductTeamAccessGuard from './guards/product.team-access.guard'
import ProductUpdateValidationPipe from './pipes/product.update.pipe'
import ProductService from './product.service'

@Controller()
@CruxProductControllerMethods()
@UseGuards(ProductTeamAccessGuard)
@UseInterceptors(GrpcLoggerInterceptor, GrpcErrorInterceptor, PrismaErrorInterceptor)
export default class ProductController implements CruxProductController {
  constructor(private service: ProductService) {}

  async getProducts(request: AccessRequest): Promise<ProductListResponse> {
    return this.service.getProducts(request)
  }

  async createProduct(request: CreateProductRequest): Promise<CreateEntityResponse> {
    return this.service.createProduct(request)
  }

  async deleteProduct(request: IdRequest): Promise<Empty> {
    return this.service.deleteProduct(request)
  }

  async updateProduct(@Body(ProductUpdateValidationPipe) request: UpdateProductRequest): Promise<UpdateEntityResponse> {
    return this.service.updateProduct(request)
  }

  async getProductDetails(request: IdRequest): Promise<ProductDetailsReponse> {
    return this.service.getProductDetails(request)
  }
}
