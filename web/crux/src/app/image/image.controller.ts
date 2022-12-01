import { Body, Controller, UseGuards, UseInterceptors } from '@nestjs/common'
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
@UseInterceptors(GrpcLoggerInterceptor, GrpcErrorInterceptor, PrismaErrorInterceptor)
export default class ImageController implements CruxImageController {
  constructor(private service: ImageService) {}

  async getImagesByVersionId(request: IdRequest): Promise<ImageListResponse> {
    return await this.service.getImagesByVersionId(request)
  }

  @UseGuards(ImageAddToVersionTeamAccessGuard)
  async addImagesToVersion(
    @Body(ImageAddToVersionValidationPipe) request: AddImagesToVersionRequest,
  ): Promise<ImageListResponse> {
    return await this.service.addImagesToVersion(request)
  }

  @UseGuards(ImageOrderImagesTeamAccessGuard)
  async orderImages(@Body(OrderImagesValidationPipe) request: OrderVersionImagesRequest): Promise<Empty> {
    return await this.service.orderImages(request)
  }

  @AuditLogLevel('no-data')
  async patchImage(@Body(ImagePatchValidationPipe) request: PatchImageRequest): Promise<Empty> {
    return await this.service.patchImage(request)
  }

  async deleteImage(@Body(DeleteImageValidationPipe) request: IdRequest): Promise<Empty> {
    return await this.service.deleteImage(request)
  }

  async getImageDetails(request: IdRequest): Promise<ImageResponse> {
    return await this.service.getImageDetails(request)
  }
}
