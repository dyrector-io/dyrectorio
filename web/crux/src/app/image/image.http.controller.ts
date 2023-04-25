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
import UuidValidationGuard from 'src/guards/uuid-params.validation.guard'
import UuidParams from 'src/decorators/api-params.decorator'
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

const PARAM_IMAGE_ID = 'imageId'
const PARAM_VERSION_ID = 'versionId'
const PARAM_PRODUCT_ID = 'productId'
const ProductId = () => Param(PARAM_PRODUCT_ID)
const VersionId = () => Param(PARAM_VERSION_ID)
const ImageId = () => Param(PARAM_IMAGE_ID)

const ROUTE_IMAGE_ID = ':imageId'

@Controller('/products/:productId/versions/:versionId/images')
@ApiTags('version/images')
@UseGuards(JwtAuthGuard, UuidValidationGuard, ImageTeamAccessGuard)
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
  @HttpCode(200)
  @ApiOkResponse({ type: ImageDto, isArray: true })
  @UuidParams([PARAM_PRODUCT_ID, PARAM_VERSION_ID])
  async getImagesByVersionId(@ProductId() _productId: string, @VersionId() versionId: string): Promise<ImageDto[]> {
    return await this.service.getImagesByVersionId(versionId)
  }

  @Get(ROUTE_IMAGE_ID)
  @HttpCode(200)
  @ApiOkResponse({ type: ImageDto })
  @UuidParams([PARAM_PRODUCT_ID, PARAM_VERSION_ID, PARAM_IMAGE_ID])
  async getImageDetails(
    @ProductId() _productId: string,
    @VersionId() _versionId: string,
    @ImageId() imageId: string,
  ): Promise<ImageDto> {
    return await this.service.getImageDetails(imageId)
  }

  @Post()
  @HttpCode(201)
  @CreatedWithLocation()
  @ApiBody({ type: AddImagesDto, isArray: true })
  @ApiCreatedResponse({ type: ImageDto, isArray: true })
  @UseGuards(ImageAddToVersionTeamAccessGuard)
  @UseInterceptors(ImageAddToVersionValidationInterceptor)
  @UuidParams([PARAM_PRODUCT_ID, PARAM_VERSION_ID])
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
  @ApiNoContentResponse({ description: 'Image patched successfully' })
  @UuidParams([PARAM_PRODUCT_ID, PARAM_VERSION_ID, PARAM_IMAGE_ID])
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
  @ApiNoContentResponse({ description: 'Image deleted successfully' })
  @UseInterceptors(DeleteImageValidationInterceptor)
  @UuidParams([PARAM_PRODUCT_ID, PARAM_VERSION_ID, PARAM_IMAGE_ID])
  async deleteImage(
    @ProductId() _productId: string,
    @VersionId() _versionId: string,
    @ImageId() imageId: string,
  ): Promise<void> {
    return await this.service.deleteImage(imageId)
  }

  @Put('order')
  @HttpCode(204)
  @ApiNoContentResponse({ description: 'Images ordered successfully' })
  @ApiBody({ type: String, isArray: true })
  @UseGuards(ImageOrderImagesTeamAccessGuard)
  @UseInterceptors(OrderImagesValidationInterceptor)
  @UuidParams([PARAM_PRODUCT_ID, PARAM_VERSION_ID])
  async orderImages(
    @ProductId() _productId: string,
    @VersionId() _versionId: string,
    @Body() request: string[],
    @IdentityFromRequest() identity: Identity,
  ): Promise<void> {
    return await this.service.orderImages(request, identity)
  }
}
