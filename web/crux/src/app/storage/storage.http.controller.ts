import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UseGuards, UseInterceptors } from '@nestjs/common'
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
import { CreatedResponse, CreatedWithLocation } from '../shared/created-with-location.decorator'
import { IdentityFromRequest } from '../token/jwt-auth.guard'
import StorageTeamAccessGuard from './guards/storage.team-access.guard'
import StorageDeleteValidationInterceptor from './interceptors/storage.delete.interceptor'
import StorageUpdateValidationInterceptor from './interceptors/storage.update.interceptor'
import { CreateStorageDto, StorageDetailsDto, StorageDto, StorageOptionDto, UpdateStorageDto } from './storage.dto'
import StorageService from './storage.service'

const PARAM_STORAGE_ID = 'storageId'
const StorageId = () => Param(PARAM_STORAGE_ID)

const ROUTE_STORAGES = 'storages'
const ROUTE_STORAGE_ID = ':storageId'

@Controller(ROUTE_STORAGES)
@ApiTags(ROUTE_STORAGES)
@UseGuards(StorageTeamAccessGuard)
export default class StorageHttpController {
  constructor(private service: StorageService) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({
    description: 'Response should include `description`, `icon`, `url`, `id`, and `name`.',
    summary: 'Fetch the list of storages.',
  })
  @ApiOkResponse({
    type: StorageDto,
    isArray: true,
    description: 'List of storages.',
  })
  async getStorages(@IdentityFromRequest() identity: Identity): Promise<StorageDto[]> {
    return this.service.getStorages(identity)
  }

  @Get('options')
  @HttpCode(200)
  @ApiOperation({
    description: 'Response should include `id`, and `name`.',
    summary: 'Fetch the name and ID of available storage options.',
  })
  @ApiOkResponse({
    type: StorageOptionDto,
    isArray: true,
    description: 'Name and ID of storage options listed.',
  })
  async getStorageOptions(@IdentityFromRequest() identity: Identity): Promise<StorageOptionDto[]> {
    return this.service.getStorageOptions(identity)
  }

  @Get(ROUTE_STORAGE_ID)
  @HttpCode(200)
  @ApiOperation({
    description:
      'Get the details of a storage. Request must include `storageId`. Response should include description, icon, url, `id`, `name`, `accessKey`, `secretKey`, and `inUse`.',
    summary: 'Return details of a storage.',
  })
  @ApiOkResponse({ type: StorageDetailsDto, description: 'Storage details.' })
  @UuidParams(PARAM_STORAGE_ID)
  async getProductDetails(@StorageId() id: string): Promise<StorageDetailsDto> {
    return this.service.getStorageDetails(id)
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({
    description:
      'Creates a new storage. Request must include `name`, and `url`. Request body may include `description`, `icon`, `accesKey`, and `secretKey`. Response should include `description`, `icon`, `url`, `id`, `name`, `accessKey`, `secretKey`, and `inUse`.',
    summary: 'Create a new storage.',
  })
  @CreatedWithLocation()
  @ApiBody({ type: CreateStorageDto })
  @ApiCreatedResponse({ type: StorageDetailsDto, description: 'New storage created.' })
  async createProduct(
    @Body() request: CreateStorageDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<CreatedResponse<StorageDetailsDto>> {
    const storage = await this.service.createStorage(request, identity)

    return {
      url: `/storages/${storage.id}`,
      body: storage,
    }
  }

  @Put(ROUTE_STORAGE_ID)
  @HttpCode(204)
  @ApiOperation({
    description:
      'Updates a storage. Request must include `storageId`, `name`, and `url`. Request body may include `description`, `icon`, `accesKey`, and `secretKey`.',
    summary: 'Modify a storage.',
  })
  @UseInterceptors(StorageUpdateValidationInterceptor)
  @ApiNoContentResponse({ description: 'Storage updated.' })
  @UuidParams(PARAM_STORAGE_ID)
  async updateProduct(
    @StorageId() id: string,
    @Body() request: UpdateStorageDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<void> {
    await this.service.updateStorage(id, request, identity)
  }

  @Delete(ROUTE_STORAGE_ID)
  @HttpCode(204)
  @ApiOperation({
    description: 'Deletes a storage Request must include `storageId`.',
    summary: 'Delete a storage from dyrectorio.',
  })
  @UseInterceptors(StorageDeleteValidationInterceptor)
  @ApiNoContentResponse({ description: 'Storage deleted.' })
  @UuidParams(PARAM_STORAGE_ID)
  async deleteProduct(@StorageId() id: string): Promise<void> {
    return this.service.deleteStorage(id)
  }
}
