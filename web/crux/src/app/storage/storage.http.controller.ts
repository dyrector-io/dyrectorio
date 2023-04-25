import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UseGuards, UseInterceptors } from '@nestjs/common'
import {
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
  ApiOperation,
} from '@nestjs/swagger'
import { Identity } from '@ory/kratos-client'
import HttpLoggerInterceptor from 'src/interceptors/http.logger.interceptor'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'
import UuidValidationGuard from 'src/guards/uuid-params.validation.guard'
import UuidParams from 'src/decorators/api-params.decorator'
import { CreatedResponse, CreatedWithLocation } from '../shared/created-with-location.decorator'
import JwtAuthGuard, { IdentityFromRequest } from '../token/jwt-auth.guard'
import CreatedWithLocationInterceptor from '../shared/created-with-location.interceptor'
import { CreateStorageDto, StorageDetailsDto, StorageDto, StorageOptionDto, UpdateStorageDto } from './storage.dto'
import StorageService from './storage.service'
import StorageTeamAccessGuard from './guards/storage.team-access.guard'
import StorageUpdateValidationInterceptor from './interceptors/storage.update.interceptor'
import StorageDeleteValidationInterceptor from './interceptors/storage.delete.interceptor'

const PARAM_STORAGE_ID = 'storageId'
const StorageId = () => Param(PARAM_STORAGE_ID)

const ROUTE_STORAGES = 'storages'
const ROUTE_STORAGE_ID = ':storageId'

@Controller(ROUTE_STORAGES)
@ApiTags(ROUTE_STORAGES)
@UseGuards(JwtAuthGuard, UuidValidationGuard, StorageTeamAccessGuard)
@UseInterceptors(HttpLoggerInterceptor, PrismaErrorInterceptor, CreatedWithLocationInterceptor)
export default class StorageHttpController {
  constructor(private service: StorageService) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({
    description: 'Response should include `description`, `icon`, `url`, `id`, and `name`.',
    summary: 'Fetch details of storages.',
  })
  @ApiOkResponse({
    type: StorageDto,
    isArray: true,
    description: 'Details of storages listed.',
  })
  async getStorages(@IdentityFromRequest() identity: Identity): Promise<StorageDto[]> {
    return this.service.getStorages(identity)
  }

  @Get('options')
  @HttpCode(200)
  @ApiOperation({
    description: 'Response should include `id`, and `name`.',
    summary: 'Fetch the name and ID of storages.',
  })
  @ApiOkResponse({
    type: StorageOptionDto,
    isArray: true,
    description: 'Name and ID of storages listed.',
  })
  async getStorageOptions(@IdentityFromRequest() identity: Identity): Promise<StorageOptionDto[]> {
    return this.service.getStorageOptions(identity)
  }

  @Get(ROUTE_STORAGE_ID)
  @HttpCode(200)
  @ApiOperation({
    description:
      'Request must include `storageId`. Response should include description, icon, url, `id`, `name`, `accessKey`, `secretKey`, and `inUse`.',
    summary: 'Return details of a storage.',
  })
  @ApiOkResponse({ type: StorageDetailsDto, description: 'Storage details listed.' })
  @UuidParams(PARAM_STORAGE_ID)
  async getProductDetails(@StorageId() id: string): Promise<StorageDetailsDto> {
    return this.service.getStorageDetails(id)
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({
    description:
      'Request must include `name`, and `url`. Request body may include `description`, `icon`, `accesKey`, and `secretKey`. Response should include `description`, `icon`, `url`, `id`, `name`, `accessKey`, `secretKey`, and `inUse`.',
    summary: 'Add a new storage.',
  })
  @CreatedWithLocation()
  @ApiBody({ type: CreateStorageDto })
  @ApiCreatedResponse({ type: StorageDetailsDto, description: 'New storage added.' })
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
      'Request must include `storageId`, `name`, and `url`. Request body may include `description`, `icon`, `accesKey`, and `secretKey`.',
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
    description: 'Request must include `storageId`.',
    summary: 'Remove a storage from dyrectorio.',
  })
  @UseInterceptors(StorageDeleteValidationInterceptor)
  @ApiNoContentResponse({ description: 'Storage removed.' })
  @UuidParams(PARAM_STORAGE_ID)
  async deleteProduct(@StorageId() id: string): Promise<void> {
    return this.service.deleteStorage(id)
  }
}
