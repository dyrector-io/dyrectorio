import { Body, Controller, UseGuards, UseInterceptors } from '@nestjs/common'
import { AuditLoggerInterceptor } from 'src/interceptors/audit-logger.interceptor'
import { GrpcContextLogger } from 'src/interceptors/grpc-context-logger.interceptor'
import { PrismaErrorInterceptor } from 'src/interceptors/prisma-error-interceptor'
import {
  AddImagesToVersionRequest,
  CruxImageController,
  CruxImageControllerMethods,
  Empty,
  IdRequest,
  ImageListResponse,
  ImageResponse,
  OrderVersionImagesRequest,
  PatchImageRequest,
} from 'src/proto/proto/crux'
import { ImageAddToVersionTeamAccessGuard } from './guards/image.add-to-version.team-access.guard'
import { ImageOrderImagesTeamAccessGuard } from './guards/image.order-images.team-access.guard'
import { ImageTeamAccessGuard } from './guards/image.team-access.guard'
import { ImageService } from './image.service'
import { ImageAddToVersionValidationPipe } from './pipes/image.add-to-version.pipe'
import { DeleteImageValidationPipe } from './pipes/image.delete.pipe'
import { OrderImagesValidationPipe } from './pipes/image.order.pipe'
import { ImagePatchValidationPipe } from './pipes/image.patch.pipe'

@Controller()
@CruxImageControllerMethods()
@UseGuards(ImageTeamAccessGuard)
@UseInterceptors(PrismaErrorInterceptor, GrpcContextLogger, AuditLoggerInterceptor)
export class ImageController implements CruxImageController {
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
