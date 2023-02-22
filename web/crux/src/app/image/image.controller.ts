import { Metadata } from '@grpc/grpc-js'
import { UsePipes, Controller, UseGuards, UseInterceptors } from '@nestjs/common'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorators'
import { Empty } from 'src/grpc/protobuf/proto/common'
import {
  AddImagesToVersionRequest,
  CruxImageController,
  CruxImageControllerMethods,
  IdRequest,
  ImageListResponse,
  ImageResponse,
  OrderVersionImagesRequest,
  PatchImageRequest,
} from 'src/grpc/protobuf/proto/crux'
import GrpcErrorInterceptor from 'src/interceptors/grpc.error.interceptor'
import GrpcLoggerInterceptor from 'src/interceptors/grpc.logger.interceptor'
import GrpcUserInterceptor, { getAccessedBy } from 'src/interceptors/grpc.user.interceptor'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'
import ImageAddToVersionTeamAccessGuard from './guards/image.add-to-version.team-access.guard'
import ImageOrderImagesTeamAccessGuard from './guards/image.order-images.team-access.guard'
import ImageTeamAccessGuard from './guards/image.team-access.guard'
import ImageService from './image.service'
import ImageAddToVersionValidationPipe from './pipes/image.add-to-version.pipe'
import DeleteImageValidationPipe from './pipes/image.delete.pipe'
import OrderImagesValidationPipe from './pipes/image.order.pipe'
import ImagePatchValidationPipe from './pipes/image.patch.pipe'

@Controller()
@CruxImageControllerMethods()
@UseGuards(ImageTeamAccessGuard)
@UseInterceptors(GrpcLoggerInterceptor, GrpcUserInterceptor, GrpcErrorInterceptor, PrismaErrorInterceptor)
export default class ImageController implements CruxImageController {
  constructor(private service: ImageService) {}

  async getImagesByVersionId(request: IdRequest): Promise<ImageListResponse> {
    return await this.service.getImagesByVersionId(request)
  }

  @UseGuards(ImageAddToVersionTeamAccessGuard)
  @UsePipes(ImageAddToVersionValidationPipe)
  async addImagesToVersion(request: AddImagesToVersionRequest, metadata: Metadata): Promise<ImageListResponse> {
    return await this.service.addImagesToVersion(request, getAccessedBy(metadata))
  }

  @UseGuards(ImageOrderImagesTeamAccessGuard)
  @UsePipes(OrderImagesValidationPipe)
  async orderImages(request: OrderVersionImagesRequest, metadata: Metadata): Promise<Empty> {
    return await this.service.orderImages(request, getAccessedBy(metadata))
  }

  @AuditLogLevel('no-data')
  @UsePipes(ImagePatchValidationPipe)
  async patchImage(request: PatchImageRequest, metadata: Metadata): Promise<Empty> {
    return await this.service.patchImage(request, getAccessedBy(metadata))
  }

  @UsePipes(DeleteImageValidationPipe)
  async deleteImage(request: IdRequest): Promise<Empty> {
    return await this.service.deleteImage(request)
  }

  async getImageDetails(request: IdRequest): Promise<ImageResponse> {
    return await this.service.getImageDetails(request)
  }
}
