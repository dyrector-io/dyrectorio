import { Controller, Get, HttpCode, PipeTransform, Type, UseGuards, UseInterceptors } from '@nestjs/common'
import { Delete, Post, Put } from '@nestjs/common/decorators/http/request-mapping.decorator'
import { Body, Param } from '@nestjs/common/decorators/http/route-params.decorator'
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
  @ApiOperation({
    description:
      'Lists every registries available in the active team. Response is an array including the `name`, `id`, `type`, `description`, and `icon` of the registry.</br></br>Registries are 3rd party registries where the container images are stored.',
    summary: 'Fetch data of registries.',
  })
  @ApiOkResponse({ type: RegistryDto, isArray: true, description: 'Data of all registries within a team listed.' })
  async getRegistries(@IdentityFromRequest() identity: Identity): Promise<RegistryDto[]> {
    return await this.service.getRegistries(identity)
  }

  @Get(ROUTE_REGISTRY_ID)
  @HttpCode(200)
  @ApiOperation({
    description:
      "Lists the details of a registry. `registryId` refers to the registry's ID. Response is an array including the `name`, `id`, `type`, `description`, `imageNamePrefix`, `inUse`, `icon`, and audit log info of the registry.",
    summary: 'Fetch data of a registry.',
  })
  @ApiOkResponse({ type: RegistryDetailsDto, description: 'Data of a registry listed.' })
  @UuidParams(PARAM_REGISTRY_ID)
  async getRegistry(@RegistryId() id: string): Promise<RegistryDetailsDto> {
    return await this.service.getRegistryDetails(id)
  }

  @Post()
  @HttpCode(201)
  @CreatedWithLocation()
  @ApiOperation({
    description:
      'To add a new registry, include the `name`, `type`, `description`, `details`, and `icon`. `Type`, `details`, and `name` are required. Response is an array including the `name`, `id`, `type`, `description`, `imageNamePrefix`, `inUse`, `icon`, and audit log info of the registry.',
    summary: 'Create a new registry.',
  })
  @ApiBody({ type: CreateRegistryDto })
  @ApiCreatedResponse({
    type: RegistryDetailsDto,
    headers: API_CREATED_LOCATION_HEADERS,
    description: 'New registry created.',
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
  @ApiOperation({
    description:
      "Modify the `name`, `type`, `description`, `details`, and `icon`. `registryId` refers to the registry's ID. `registryId`, `type`, `details`, and `name` are required.",
    summary: 'Modify the details of a registry.',
  })
  @UseInterceptors(UpdateRegistryInterceptor)
  @UseGuards(RegistryAccessValidationGuard)
  @ApiBody({ type: UpdateRegistryDto })
  @ApiNoContentResponse({ description: 'Registry modified.' })
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
  @ApiOperation({
    description: 'Deletes a registry with the specified `registryId`',
    summary: 'Delete a registry from dyrectorio.',
  })
  @ApiNoContentResponse({ description: 'Registry deleted.' })
  @UuidParams(PARAM_REGISTRY_ID)
  async deleteRegistry(@RegistryId(DeleteRegistryValidationPipe) id: string): Promise<void> {
    await this.service.deleteRegistry(id)
  }
}
