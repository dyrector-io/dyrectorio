import { Body, Controller, UseGuards, UseInterceptors } from '@nestjs/common'
import { AuditLoggerInterceptor } from 'src/interceptors/audit-logger.interceptor'
import { GrpcContextLogger } from 'src/interceptors/grpc-context-logger.interceptor'
import { PrismaErrorInterceptor } from 'src/interceptors/prisma-error-interceptor'
import {
  AccessRequest,
  CreateEntityResponse,
  CreateProductRequest,
  CruxProductController,
  CruxProductControllerMethods,
  Empty,
  IdRequest,
  ProductDetailsReponse,
  ProductListResponse,
  UpdateEntityResponse,
  UpdateProductRequest,
} from 'src/grpc/protobuf/proto/crux'
import { ProductTeamAccessGuard } from './guards/product.team-access.guard'
import { ProductUpdateValidationPipe } from './pipes/product.update.pipe'
import { ProductService } from './product.service'

@Controller()
@CruxProductControllerMethods()
@UseGuards(ProductTeamAccessGuard)
@UseInterceptors(PrismaErrorInterceptor, GrpcContextLogger, AuditLoggerInterceptor)
export class ProductController implements CruxProductController {
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
