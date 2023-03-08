import { Metadata } from '@grpc/grpc-js'
import { Controller, UseGuards, UsePipes } from '@nestjs/common'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorator'
import asdasda from 'src/decorators/grpc-interceptors.decorator'
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
import { IdentityAwareServerSurfaceCall } from 'src/shared/user-access.guard'
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
@asdasda()
export default class ImageController implements CruxImageController {
  constructor(private service: ImageService) {}

  async getImagesByVersionId(request: IdRequest): Promise<ImageListResponse> {
    return await this.service.getImagesByVersionId(request)
  }

  @UseGuards(ImageAddToVersionTeamAccessGuard)
  @UsePipes(ImageAddToVersionValidationPipe)
  async addImagesToVersion(
    request: AddImagesToVersionRequest,
    _: Metadata,
    call: IdentityAwareServerSurfaceCall,
  ): Promise<ImageListResponse> {
    return await this.service.addImagesToVersion(request, call.user)
  }

  @UseGuards(ImageOrderImagesTeamAccessGuard)
  @UsePipes(OrderImagesValidationPipe)
  async orderImages(
    request: OrderVersionImagesRequest,
    _: Metadata,
    call: IdentityAwareServerSurfaceCall,
  ): Promise<Empty> {
    return await this.service.orderImages(request, call.user)
  }

  @AuditLogLevel('no-data')
  @UsePipes(ImagePatchValidationPipe)
  async patchImage(request: PatchImageRequest, _: Metadata, call: IdentityAwareServerSurfaceCall): Promise<Empty> {
    return await this.service.patchImage(request, call.user)
  }

  @UsePipes(DeleteImageValidationPipe)
  async deleteImage(request: IdRequest): Promise<Empty> {
    return await this.service.deleteImage(request)
  }

  async getImageDetails(request: IdRequest): Promise<ImageResponse> {
    return await this.service.getImageDetails(request)
  }
}
