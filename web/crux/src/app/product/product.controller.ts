// import { Metadata } from '@grpc/grpc-js'
// import { Controller, UseGuards, UsePipes } from '@nestjs/common'
// import UseGrpcInterceptors from 'src/decorators/grpc-interceptors.decorator'
// import { Empty } from 'src/grpc/protobuf/proto/common'
// import {
//   CreateEntityResponse,
//   CreateProductRequest,
//   CruxProductController,
//   CruxProductControllerMethods,
//   IdRequest,
//   ProductDetailsReponse,
//   ProductListResponse,
//   UpdateEntityResponse,
//   UpdateProductRequest,
// } from 'src/grpc/protobuf/proto/crux'
// import { IdentityAwareServerSurfaceCall } from 'src/shared/user-access.guard'
// import ProductTeamAccessGuard from './guards/product.team-access.guard'
// import ProductUpdateValidationPipe from './pipes/product.update.pipe'
// import ProductService from './product.service'

// @Controller()
// @CruxProductControllerMethods()
// @UseGuards(ProductTeamAccessGuard)
// @UseGrpcInterceptors()
// export default class ProductController implements CruxProductController {
//   constructor(private service: ProductService) {}

//   async getProducts(_: Empty, __: Metadata, call: IdentityAwareServerSurfaceCall): Promise<ProductListResponse> {
//     return this.service.getProducts(call.user)
//   }

//   async createProduct(
//     request: CreateProductRequest,
//     _: Metadata,
//     call: IdentityAwareServerSurfaceCall,
//   ): Promise<CreateEntityResponse> {
//     return this.service.createProduct(request, call.user)
//   }

//   async deleteProduct(request: IdRequest): Promise<Empty> {
//     return this.service.deleteProduct(request)
//   }

//   @UsePipes(ProductUpdateValidationPipe)
//   async updateProduct(
//     request: UpdateProductRequest,
//     _: Metadata,
//     call: IdentityAwareServerSurfaceCall,
//   ): Promise<UpdateEntityResponse> {
//     return this.service.updateProduct(request, call.user)
//   }

//   async getProductDetails(request: IdRequest): Promise<ProductDetailsReponse> {
//     return this.service.getProductDetails(request)
//   }
// }
