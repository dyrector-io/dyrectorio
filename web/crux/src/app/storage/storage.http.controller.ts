import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UseGuards, UseInterceptors } from '@nestjs/common'
import { ApiBody, ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { Identity } from '@ory/kratos-client'
import HttpLoggerInterceptor from 'src/interceptors/http.logger.interceptor'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'
import { CreatedResponse, CreatedWithLocation } from '../shared/created-with-location.decorator'
import JwtAuthGuard, { IdentityFromRequest } from '../token/jwt-auth.guard'
import CreatedWithLocationInterceptor from '../shared/created-with-location.interceptor'
import { CreateStorageDto, StorageDetailsDto, StorageDto, StorageOptionDto, UpdateStorageDto } from './storage.dto'
import StorageService from './storage.service'
import StorageTeamAccessGuard from './guards/storage.team-access.guard'
import StorageUpdateValidationInterceptor from './interceptors/storage.update.interceptor'
import StorageDeleteValidationInterceptor from './interceptors/storage.delete.interceptor'

const ROUTE_STORAGES = 'storages'
const ROUTE_STORAGE_ID = ':storageId'
const StorageId = () => Param('storageId')

@Controller(ROUTE_STORAGES)
@ApiTags(ROUTE_STORAGES)
@UseGuards(JwtAuthGuard, StorageTeamAccessGuard)
@UseInterceptors(HttpLoggerInterceptor, PrismaErrorInterceptor, CreatedWithLocationInterceptor)
export default class StorageHttpController {
  constructor(private service: StorageService) {}

  @Get()
  @ApiOkResponse({
    type: StorageDto,
    isArray: true,
  })
  async getStorages(@IdentityFromRequest() identity: Identity): Promise<StorageDto[]> {
    return this.service.getStorages(identity)
  }

  @Get('options')
  @ApiOkResponse({
    type: StorageOptionDto,
    isArray: true,
  })
  async getStorageOptions(@IdentityFromRequest() identity: Identity): Promise<StorageOptionDto[]> {
    return this.service.getStorageOptions(identity)
  }

  @Get(ROUTE_STORAGE_ID)
  @ApiOkResponse({ type: StorageDetailsDto })
  async getProductDetails(@StorageId() id: string): Promise<StorageDetailsDto> {
    return this.service.getStorageDetails(id)
  }

  @Post()
  @CreatedWithLocation()
  @ApiBody({ type: CreateStorageDto })
  @ApiCreatedResponse({ type: StorageDetailsDto })
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
  @ApiNoContentResponse()
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
  async deleteProduct(@StorageId() id: string): Promise<void> {
    return this.service.deleteStorage(id)
  }
}
