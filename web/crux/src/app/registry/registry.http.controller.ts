import { Controller, Get, HttpCode, PipeTransform, Type, UseGuards, UseInterceptors } from '@nestjs/common'
import { Delete, Post, Put } from '@nestjs/common/decorators/http/request-mapping.decorator'
import { Body, Param } from '@nestjs/common/decorators/http/route-params.decorator'
import { ApiBody, ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { Identity } from '@ory/kratos-client'
import UuidParams from 'src/decorators/api-params.decorator'
import { API_CREATED_LOCATION_HEADERS } from 'src/shared/const'
import { CreatedResponse, CreatedWithLocation } from '../shared/created-with-location.decorator'
import { IdentityFromRequest } from '../token/jwt-auth.guard'
import RegistryAccessValidationGuard from './guards/registry.auth.validation.guard'
import RegistryTeamAccessGuard from './guards/registry.team-access.guard'
import UpdateRegistryInterceptor from './interceptors/registry.update.interceptor'
import DeleteRegistryValidationPipe from './pipes/registry.delete.pipe'
import { CreateRegistryDto, RegistryDetailsDto, RegistryDto, UpdateRegistryDto } from './registry.dto'
import RegistryService from './registry.service'

const PARAM_REGISTRY_ID = 'registryId'
const RegistryId = (...pipes: (Type<PipeTransform> | PipeTransform)[]) => Param(PARAM_REGISTRY_ID, ...pipes)

const ROUTE_REGISTRIES = 'registries'
const ROUTE_REGISTRY_ID = ':registryId'

@Controller(ROUTE_REGISTRIES)
@ApiTags(ROUTE_REGISTRIES)
@UseGuards(RegistryTeamAccessGuard)
export default class RegistryHttpController {
  constructor(private service: RegistryService) {}

  @Get()
  @HttpCode(200)
  @ApiOkResponse({ type: RegistryDto, isArray: true, description: 'Read data of registries.' })
  async getRegistries(@IdentityFromRequest() identity: Identity): Promise<RegistryDto[]> {
    return await this.service.getRegistries(identity)
  }

  @Get(ROUTE_REGISTRY_ID)
  @HttpCode(200)
  @ApiOkResponse({ type: RegistryDetailsDto, description: 'Retrieve data of a registry.' })
  @UuidParams(PARAM_REGISTRY_ID)
  async getRegistry(@RegistryId() id: string): Promise<RegistryDetailsDto> {
    return await this.service.getRegistryDetails(id)
  }

  @Post()
  @HttpCode(201)
  @CreatedWithLocation()
  @ApiBody({ type: CreateRegistryDto })
  @ApiCreatedResponse({
    type: RegistryDetailsDto,
    headers: API_CREATED_LOCATION_HEADERS,
    description: 'Add new registry.',
  })
  @UseGuards(RegistryAccessValidationGuard)
  async createRegistry(
    @Body() request: CreateRegistryDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<CreatedResponse<RegistryDetailsDto>> {
    const registry = await this.service.createRegistry(request, identity)

    return {
      url: `/registries/${registry.id}`,
      body: registry,
    }
  }

  @Put(ROUTE_REGISTRY_ID)
  @HttpCode(204)
  @UseInterceptors(UpdateRegistryInterceptor)
  @UseGuards(RegistryAccessValidationGuard)
  @ApiBody({ type: UpdateRegistryDto })
  @ApiNoContentResponse({ description: 'Modify a registry.' })
  @UuidParams(PARAM_REGISTRY_ID)
  async updateRegistry(
    @RegistryId() id: string,
    @Body() request: UpdateRegistryDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<void> {
    await this.service.updateRegistry(id, request, identity)
  }

  @Delete(ROUTE_REGISTRY_ID)
  @HttpCode(204)
  @ApiNoContentResponse({ description: 'Delete a registry.' })
  @UuidParams(PARAM_REGISTRY_ID)
  async deleteRegistry(@RegistryId(DeleteRegistryValidationPipe) id: string): Promise<void> {
    await this.service.deleteRegistry(id)
  }
}
