import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import {
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { Identity } from '@ory/kratos-client'
import UuidParams from 'src/decorators/api-params.decorator'
import { CreatedResponse, CreatedWithLocation } from '../../interceptors/created-with-location.decorator'
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
const PARAM_PROJECT_ID = 'projectId'
const ProjectId = () => Param(PARAM_PROJECT_ID)
const VersionId = () => Param(PARAM_VERSION_ID)
const ImageId = () => Param(PARAM_IMAGE_ID)

const ROUTE_IMAGE_ID = ':imageId'

@Controller('/projects/:projectId/versions/:versionId/images')
@ApiTags('version/images')
@UseGuards(ImageTeamAccessGuard)
export default class ImageHttpController {
  constructor(private service: ImageService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description:
      "Fetch details of images within a version. `ProjectId` refers to the project's ID, `versionId` refers to the version's ID. Both are required variables.</br></br>Details come in an array, including `name`, `id`, `tag`, `order`, and config details of the image.",
    summary: 'Fetch data of all images of a version.',
  })
  @ApiOkResponse({
    type: ImageDto,
    isArray: true,
    description: 'Data of images listed.',
  })
  @UuidParams(PARAM_PROJECT_ID, PARAM_VERSION_ID)
  async getImagesByVersionId(@ProjectId() _projectId: string, @VersionId() versionId: string): Promise<ImageDto[]> {
    return await this.service.getImagesByVersionId(versionId)
  }

  @Get(ROUTE_IMAGE_ID)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description:
      "Fetch details of an image within a version. `projectId` refers to the project's ID, `versionId` refers to the version's ID, `imageId` refers to the image's ID. All are required parameters.</br></br>Image details consists `name`, `id`, `tag`, `order`, and the config of the image.",
    summary: 'Fetch data of an image of a version.',
  })
  @ApiOkResponse({ type: ImageDto, description: 'Data of an image.' })
  @UuidParams(PARAM_PROJECT_ID, PARAM_VERSION_ID, PARAM_IMAGE_ID)
  async getImageDetails(
    @ProjectId() _projectId: string,
    @VersionId() _versionId: string,
    @ImageId() imageId: string,
  ): Promise<ImageDto> {
    return await this.service.getImageDetails(imageId)
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @CreatedWithLocation()
  @ApiOperation({
    description:
      "Add new images to a version. `projectId` refers to the project's ID, `versionId` refers to the version's ID, `registryId` refers to the registry's ID, `images` refers to the name(s) of the images you'd like to add. All are required variables.",
    summary: 'Add images to a version.',
  })
  @ApiBody({ type: AddImagesDto, isArray: true })
  @ApiCreatedResponse({ type: ImageDto, isArray: true, description: 'New image added.' })
  @UseGuards(ImageAddToVersionTeamAccessGuard)
  @UseInterceptors(ImageAddToVersionValidationInterceptor)
  @UuidParams(PARAM_PROJECT_ID, PARAM_VERSION_ID)
  async addImagesToVersion(
    @ProjectId() projectId: string,
    @VersionId() versionId: string,
    @Body() request: AddImagesDto[],
    @IdentityFromRequest() identity: Identity,
  ): Promise<CreatedResponse<ImageDto[]>> {
    const images = await this.service.addImagesToVersion(versionId, request, identity)

    return {
      url: `/projects/${projectId}/versions/${versionId}/images`,
      body: images,
    }
  }

  @Patch(ROUTE_IMAGE_ID)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    description:
      "Modify the configuration variables of an image. `projectId` refers to the project's ID, `versionId` refers to the version's ID, `imageId` refers to the image's ID. All are required variables. `Tag` refers to the version of the image, `config` is an object of configuration variables.",
    summary: 'Configure an image of a version.',
  })
  @ApiBody({ type: PatchImageDto })
  @ApiNoContentResponse({ description: "Image's configure variables updated." })
  @UuidParams(PARAM_PROJECT_ID, PARAM_VERSION_ID, PARAM_IMAGE_ID)
  async patchImage(
    @ProjectId() _projectId: string,
    @VersionId() _versionId: string,
    @ImageId() imageId: string,
    @Body() request: PatchImageDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<void> {
    return await this.service.patchImage(imageId, request, identity)
  }

  @Delete(ROUTE_IMAGE_ID)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    description:
      "Delete an image. `projectId` refers to the project's ID, `versionId` refers to the version's ID, `imageId` refers to the image's ID. All are required variables.",
    summary: 'Delete an image from a version.',
  })
  @ApiNoContentResponse({ description: 'Delete an image from a version.' })
  @UseInterceptors(DeleteImageValidationInterceptor)
  @UuidParams(PARAM_PROJECT_ID, PARAM_VERSION_ID, PARAM_IMAGE_ID)
  async deleteImage(
    @ProjectId() _projectId: string,
    @VersionId() _versionId: string,
    @ImageId() imageId: string,
  ): Promise<void> {
    return await this.service.deleteImage(imageId)
  }

  @Put('order')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    description:
      "Edit image deployment order of a version. `projectId` refers to the project's ID, `versionId` refers to the version's ID. Both are required variables. Request should include the IDs of the images in an array.",
    summary: 'Edit image deployment order of a version.',
  })
  @ApiNoContentResponse({ description: 'Image order modified.' })
  @ApiBody({ type: String, isArray: true })
  @UseGuards(ImageOrderImagesTeamAccessGuard)
  @UseInterceptors(OrderImagesValidationInterceptor)
  @UuidParams(PARAM_PROJECT_ID, PARAM_VERSION_ID)
  async orderImages(
    @ProjectId() _projectId: string,
    @VersionId() _versionId: string,
    @Body() request: string[],
    @IdentityFromRequest() identity: Identity,
  ): Promise<void> {
    return await this.service.orderImages(request, identity)
  }
}
