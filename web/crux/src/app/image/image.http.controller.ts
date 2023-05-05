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
} from '@nestjs/common'
import {
  ApiBody,
  ApiOperation,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger'
import { Identity } from '@ory/kratos-client'
import UuidParams from 'src/decorators/api-params.decorator'
import { CreatedResponse, CreatedWithLocation } from '../shared/created-with-location.decorator'
import { IdentityFromRequest } from '../token/jwt-auth.guard'
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
@UseGuards(ImageTeamAccessGuard)
export default class ImageHttpController {
  constructor(private service: ImageService) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({
    description:
      "Fetch details of images within a version. `ProductId` refers to the product's ID, `versionId` refers to the version's ID. Both are required variables.</br></br>Details come in an array, including `name`, `id`, `tag`, `order`, and config details of the image.",
    summary: 'Fetch data of all images of a version.',
  })
  @ApiOkResponse({
    type: ImageDto,
    isArray: true,
    description: 'Data of images listed.',
  })
  @UuidParams(PARAM_PRODUCT_ID, PARAM_VERSION_ID)
  async getImagesByVersionId(@ProductId() _productId: string, @VersionId() versionId: string): Promise<ImageDto[]> {
    return await this.service.getImagesByVersionId(versionId)
  }

  @Get(ROUTE_IMAGE_ID)
  @HttpCode(200)
  @ApiOperation({
    description:
      "Fetch details of an image within a version. `productId` refers to the product's ID, `versionId` refers to the version's ID, `imageId` refers to the image's ID. All are required parameters.</br></br>Image details consists `name`, `id`, `tag`, `order`, and the config of the image.",
    summary: 'Fetch data of an image of a version.',
  })
  @ApiOkResponse({ type: ImageDto, description: 'Data of an image.' })
  @UuidParams(PARAM_PRODUCT_ID, PARAM_VERSION_ID, PARAM_IMAGE_ID)
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
  @ApiOperation({
    description:
      "Add new images to a version. `productId` refers to the product's ID, `versionId` refers to the version's ID, `registryId` refers to the registry's ID, `images` refers to the name(s) of the images you'd like to add. All are required variables.",
    summary: 'Add images to a version.',
  })
  @ApiBody({ type: AddImagesDto, isArray: true })
  @ApiCreatedResponse({ type: ImageDto, isArray: true, description: 'New image added.' })
  @UseGuards(ImageAddToVersionTeamAccessGuard)
  @UseInterceptors(ImageAddToVersionValidationInterceptor)
  @UuidParams(PARAM_PRODUCT_ID, PARAM_VERSION_ID)
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
  @ApiOperation({
    description:
      "Modify the configuration variables of an image. `productId` refers to the product's ID, `versionId` refers to the version's ID, `imageId` refers to the image's ID. All are required variables. `Tag` refers to the version of the image, `config` is an object of configuration variables.",
    summary: 'Configure an image of a version.',
  })
  @ApiBody({ type: PatchImageDto })
  @ApiNoContentResponse({ description: "Image's configure variables updated." })
  @UuidParams(PARAM_PRODUCT_ID, PARAM_VERSION_ID, PARAM_IMAGE_ID)
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
  @ApiOperation({
    description:
      "Delete an image. `productId` refers to the product's ID, `versionId` refers to the version's ID, `imageId` refers to the image's ID. All are required variables.",
    summary: 'Delete an image from a version.',
  })
  @ApiNoContentResponse({ description: 'Delete an image from a version.' })
  @UseInterceptors(DeleteImageValidationInterceptor)
  @UuidParams(PARAM_PRODUCT_ID, PARAM_VERSION_ID, PARAM_IMAGE_ID)
  async deleteImage(
    @ProductId() _productId: string,
    @VersionId() _versionId: string,
    @ImageId() imageId: string,
  ): Promise<void> {
    return await this.service.deleteImage(imageId)
  }

  @Put('order')
  @HttpCode(204)
  @ApiOperation({
    description:
      "Edit image deployment order of a version. `productId` refers to the product's ID, `versionId` refers to the version's ID. Both are required variables. Request should include the IDs of the images in an array.",
    summary: 'Edit image deployment order of a version.',
  })
  @ApiNoContentResponse({ description: 'Image order modified.' })
  @ApiBody({ type: String, isArray: true })
  @UseGuards(ImageOrderImagesTeamAccessGuard)
  @UseInterceptors(OrderImagesValidationInterceptor)
  @UuidParams(PARAM_PRODUCT_ID, PARAM_VERSION_ID)
  async orderImages(
    @ProductId() _productId: string,
    @VersionId() _versionId: string,
    @Body() request: string[],
    @IdentityFromRequest() identity: Identity,
  ): Promise<void> {
    return await this.service.orderImages(request, identity)
  }
}
