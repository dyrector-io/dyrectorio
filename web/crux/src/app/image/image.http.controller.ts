import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import { ApiBody, ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { Identity } from '@ory/kratos-client'
import HttpLoggerInterceptor from 'src/interceptors/http.logger.interceptor'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'
import { CreatedResponse, CreatedWithLocation } from '../shared/created-with-location.decorator'
import CreatedWithLocationInterceptor from '../shared/created-with-location.interceptor'
import JwtAuthGuard, { IdentityFromRequest } from '../token/jwt-auth.guard'
import ImageAddToVersionTeamAccessGuard from './guards/image.add-to-version.team-access.guard'
import ImageOrderImagesTeamAccessGuard from './guards/image.order-images.team-access.guard'
import ImageTeamAccessGuard from './guards/image.team-access.guard'
import { AddImagesDto, ImageDto, PatchImageDto } from './image.dto'
import ImageService from './image.service'
import ImageAddToVersionValidationInterceptor from './interceptors/image.add-images.interceptor'
import DeleteImageValidationInterceptor from './interceptors/image.delete.interceptor'
import OrderImagesValidationInterceptor from './interceptors/image.order.interceptor'

const ProductId = () => Param('productId')
const VersionId = () => Param('versionId')
const ImageId = () => Param('imageId')

const ROUTE_IMAGE_ID = ':imageId'

@Controller('/products/:productId/versions/:versionId/images')
@ApiTags('version-images')
@UseGuards(JwtAuthGuard, ImageTeamAccessGuard)
@UsePipes(
  new ValidationPipe({
    // TODO(@robot9706): Move to global pipes after removing gRPC
    transform: true,
  }),
)
@UseInterceptors(HttpLoggerInterceptor, PrismaErrorInterceptor, CreatedWithLocationInterceptor)
export default class ImageHttpController {
  constructor(private service: ImageService) {}

  @Get()
  @ApiOkResponse({ type: ImageDto, isArray: true })
  async getImagesByVersionId(@ProductId() _productId: string, @VersionId() versionId: string): Promise<ImageDto[]> {
    return await this.service.getImagesByVersionId(versionId)
  }

  @Get(ROUTE_IMAGE_ID)
  @ApiOkResponse({ type: ImageDto })
  async getImageDetails(
    @ProductId() _productId: string,
    @VersionId() _versionId: string,
    @ImageId() imageId: string,
  ): Promise<ImageDto> {
    return await this.service.getImageDetails(imageId)
  }

  @Post()
  @CreatedWithLocation()
  @ApiBody({ type: AddImagesDto, isArray: true })
  @ApiCreatedResponse({ type: ImageDto, isArray: true })
  @UseGuards(ImageAddToVersionTeamAccessGuard)
  @UseInterceptors(ImageAddToVersionValidationInterceptor)
  async addImagesToVersion(
    @ProductId() productId: string,
    @VersionId() versionId: string,
    @Body() request: AddImagesDto[],
    @IdentityFromRequest() identity: Identity,
  ): Promise<CreatedResponse<ImageDto[]>> {
    const images = await this.service.addImagesToVersion(versionId, request, identity)

    return {
      url: `/products/${productId}/versions/${versionId}/images`,
      body: images,
    }
  }

  @Patch(ROUTE_IMAGE_ID)
  @HttpCode(204)
  @ApiBody({ type: PatchImageDto })
  @ApiNoContentResponse()
  async patchImage(
    @ProductId() _productId: string,
    @VersionId() _versionId: string,
    @ImageId() imageId: string,
    @Body() request: PatchImageDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<void> {
    return await this.service.patchImage(imageId, request, identity)
  }

  @Delete(ROUTE_IMAGE_ID)
  @HttpCode(204)
  @ApiNoContentResponse()
  @UseInterceptors(DeleteImageValidationInterceptor)
  async deleteImage(
    @ProductId() _productId: string,
    @VersionId() _versionId: string,
    @ImageId() imageId: string,
  ): Promise<void> {
    return await this.service.deleteImage(imageId)
  }

  @Put('order')
  @HttpCode(204)
  @ApiBody({ type: String, isArray: true })
  @UseGuards(ImageOrderImagesTeamAccessGuard)
  @UseInterceptors(OrderImagesValidationInterceptor)
  async orderImages(
    @ProductId() _productId: string,
    @VersionId() _versionId: string,
    @Body() request: string[],
    @IdentityFromRequest() identity: Identity,
  ): Promise<void> {
    return await this.service.orderImages(request, identity)
  }
}
