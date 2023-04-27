import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UseGuards, UseInterceptors } from '@nestjs/common'
import { ApiBody, ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
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
  @ApiOkResponse({
    type: StorageDto,
    isArray: true,
    description: 'Fetch details of storages.',
  })
  async getStorages(@IdentityFromRequest() identity: Identity): Promise<StorageDto[]> {
    return this.service.getStorages(identity)
  }

  @Get('options')
  @HttpCode(200)
  @ApiOkResponse({
    type: StorageOptionDto,
    isArray: true,
    description: 'Fetch the name and ID of a storage.',
  })
  async getStorageOptions(@IdentityFromRequest() identity: Identity): Promise<StorageOptionDto[]> {
    return this.service.getStorageOptions(identity)
  }

  @Get(ROUTE_STORAGE_ID)
  @HttpCode(200)
  @ApiOkResponse({ type: StorageDetailsDto, description: 'Return name and ID of a storage.' })
  @UuidParams(PARAM_STORAGE_ID)
  async getProductDetails(@StorageId() id: string): Promise<StorageDetailsDto> {
    return this.service.getStorageDetails(id)
  }

  @Post()
  @HttpCode(201)
  @CreatedWithLocation()
  @ApiBody({ type: CreateStorageDto })
  @ApiCreatedResponse({ type: StorageDetailsDto, description: 'Create a new storage.' })
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
  @UseInterceptors(StorageUpdateValidationInterceptor)
  @ApiNoContentResponse({ description: 'Update a storage.' })
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
  @UseInterceptors(StorageDeleteValidationInterceptor)
  @ApiNoContentResponse({ description: 'Delete a storage.' })
  @UuidParams(PARAM_STORAGE_ID)
  async deleteProduct(@StorageId() id: string): Promise<void> {
    return this.service.deleteStorage(id)
  }
}
