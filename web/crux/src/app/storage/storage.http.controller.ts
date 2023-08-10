import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { Identity } from '@ory/kratos-client'
import UuidParams from 'src/decorators/api-params.decorator'
import { CreatedResponse, CreatedWithLocation } from '../../interceptors/created-with-location.decorator'
import { IdentityFromRequest } from '../token/jwt-auth.guard'
import StorageTeamAccessGuard from './guards/storage.team-access.guard'
import StorageDeleteValidationInterceptor from './interceptors/storage.delete.interceptor'
import { CreateStorageDto, StorageDetailsDto, StorageDto, StorageOptionDto, UpdateStorageDto } from './storage.dto'
import StorageService from './storage.service'

const PARAM_TEAM_SLUG = 'teamSlug'
const PARAM_STORAGE_ID = 'storageId'
const TeamSlug = () => Param(PARAM_TEAM_SLUG)
const StorageId = () => Param(PARAM_STORAGE_ID)

const ROUTE_TEAM_SLUG = ':teamSlug'
const ROUTE_STORAGES = 'storages'
const ROUTE_STORAGE_ID = ':storageId'

@Controller(`${ROUTE_TEAM_SLUG}/${ROUTE_STORAGES}`)
@ApiTags(ROUTE_STORAGES)
@UseGuards(StorageTeamAccessGuard)
export default class StorageHttpController {
  constructor(private service: StorageService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description: 'Response should include `description`, `icon`, `url`, `id`, and `name`.',
    summary: 'Fetch the list of storages.',
  })
  @ApiOkResponse({
    type: StorageDto,
    isArray: true,
    description: 'List of storages.',
  })
  @ApiForbiddenResponse({ description: 'Unauthorized request for storages.' })
  async getStorages(@TeamSlug() teamSlug: string): Promise<StorageDto[]> {
    return this.service.getStorages(teamSlug)
  }

  @Get('options')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description: 'Response should include `id`, and `name`.',
    summary: 'Fetch the name and ID of available storage options.',
  })
  @ApiOkResponse({
    type: StorageOptionDto,
    isArray: true,
    description: 'Name and ID of storage options listed.',
  })
  @ApiBadRequestResponse({ description: 'Bad request for storage options.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for storage options.' })
  @ApiNotFoundResponse({ description: 'Storage options not found.' })
  async getStorageOptions(@TeamSlug() teamSlug: string): Promise<StorageOptionDto[]> {
    return this.service.getStorageOptions(teamSlug)
  }

  @Get(ROUTE_STORAGE_ID)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description:
      'Get the details of a storage. Request must include `storageId`. Response should include description, icon, url, `id`, `name`, `accessKey`, `secretKey`, and `inUse`.',
    summary: 'Return details of a storage.',
  })
  @ApiOkResponse({ type: StorageDetailsDto, description: 'Storage details.' })
  @ApiBadRequestResponse({ description: 'Bad request for storage details.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for storage details.' })
  @ApiNotFoundResponse({ description: 'Storage not found.' })
  @UuidParams(PARAM_STORAGE_ID)
  async getStorageDetails(@TeamSlug() _: string, @StorageId() id: string): Promise<StorageDetailsDto> {
    return this.service.getStorageDetails(id)
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    description:
      'Creates a new storage. Request must include `name`, and `url`. Request body may include `description`, `icon`, `accesKey`, and `secretKey`. Response should include `description`, `icon`, `url`, `id`, `name`, `accessKey`, `secretKey`, and `inUse`.',
    summary: 'Create a new storage.',
  })
  @CreatedWithLocation()
  @ApiBody({ type: CreateStorageDto })
  @ApiCreatedResponse({ type: StorageDetailsDto, description: 'New storage created.' })
  @ApiBadRequestResponse({ description: 'Bad request for storage creation.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for storage creation.' })
  @ApiConflictResponse({ description: 'Storage name taken.' })
  async createStorage(
    @TeamSlug() teamSlug: string,
    @Body() request: CreateStorageDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<CreatedResponse<StorageDetailsDto>> {
    const storage = await this.service.createStorage(teamSlug, request, identity)

    return {
      url: `${ROUTE_TEAM_SLUG}/storages/${storage.id}`,
      body: storage,
    }
  }

  @Put(ROUTE_STORAGE_ID)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    description:
      'Updates a storage. Request must include `storageId`, `name`, and `url`. Request body may include `description`, `icon`, `accesKey`, and `secretKey`.',
    summary: 'Modify a storage.',
  })
  @ApiNoContentResponse({ description: 'Storage updated.' })
  @ApiBadRequestResponse({ description: 'Bad request for storage update.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for storage update.' })
  @ApiNotFoundResponse({ description: 'Storage not found.' })
  @ApiConflictResponse({ description: 'Storage name taken.' })
  @UuidParams(PARAM_STORAGE_ID)
  async updateStorage(
    @TeamSlug() _: string,
    @StorageId() id: string,
    @Body() request: UpdateStorageDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<void> {
    await this.service.updateStorage(id, request, identity)
  }

  @Delete(ROUTE_STORAGE_ID)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    description: 'Deletes a storage Request must include `storageId`.',
    summary: 'Delete a storage from dyrector.io.',
  })
  @UseInterceptors(StorageDeleteValidationInterceptor)
  @ApiNoContentResponse({ description: 'Storage deleted.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for storage delete.' })
  @ApiNotFoundResponse({ description: 'Storage not found.' })
  @UuidParams(PARAM_STORAGE_ID)
  async deleteStorage(@TeamSlug() _: string, @StorageId() id: string): Promise<void> {
    return this.service.deleteStorage(id)
  }
}
