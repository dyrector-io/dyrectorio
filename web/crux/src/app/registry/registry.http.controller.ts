import { Controller, Get, HttpCode, HttpStatus, PipeTransform, Type, UseGuards } from '@nestjs/common'
import { Delete, Post, Put } from '@nestjs/common/decorators/http/request-mapping.decorator'
import { Body, Param } from '@nestjs/common/decorators/http/route-params.decorator'
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
import { API_CREATED_LOCATION_HEADERS } from 'src/shared/const'
import { CreatedResponse, CreatedWithLocation } from '../../interceptors/created-with-location.decorator'
import { IdentityFromRequest } from '../token/jwt-auth.guard'
import RegistryAccessValidationGuard from './guards/registry.auth.validation.guard'
import RegistryTeamAccessGuard from './guards/registry.team-access.guard'
import DeleteRegistryValidationPipe from './pipes/registry.delete.pipe'
import { CreateRegistryDto, RegistryDetailsDto, RegistryDto, UpdateRegistryDto } from './registry.dto'
import RegistryService from './registry.service'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorator'

const PARAM_TEAM_SLUG = 'teamSlug'
const PARAM_REGISTRY_ID = 'registryId'
const RegistryId = (...pipes: (Type<PipeTransform> | PipeTransform)[]) => Param(PARAM_REGISTRY_ID, ...pipes)
const TeamSlug = () => Param(PARAM_TEAM_SLUG)

const ROUTE_TEAM_SLUG = ':teamSlug'
const ROUTE_REGISTRIES = 'registries'
const ROUTE_REGISTRY_ID = ':registryId'

@Controller(`${ROUTE_TEAM_SLUG}/${ROUTE_REGISTRIES}`)
@ApiTags(ROUTE_REGISTRIES)
@UseGuards(RegistryTeamAccessGuard)
export default class RegistryHttpController {
  constructor(private service: RegistryService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description:
      'Lists every registries available in the active team. Response is an array including the `name`, `id`, `type`, `description`, and `icon` of the registry.</br></br>Registries are 3rd party registries where the container images are stored.',
    summary: 'Fetch data of registries.',
  })
  @ApiOkResponse({ type: RegistryDto, isArray: true, description: 'Data of all registries within a team listed.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for registries.' })
  async getRegistries(@TeamSlug() teamSlug: string): Promise<RegistryDto[]> {
    return await this.service.getRegistries(teamSlug)
  }

  @Get(ROUTE_REGISTRY_ID)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description:
      "Lists the details of a registry. `registryId` refers to the registry's ID. Response is an array including the `name`, `id`, `type`, `description`, `imageNamePrefix`, `inUse`, `icon`, and audit log info of the registry.",
    summary: 'Fetch data of a registry.',
  })
  @ApiOkResponse({ type: RegistryDetailsDto, description: 'Data of a registry listed.' })
  @ApiBadRequestResponse({ description: 'Bad request for a registry.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for a registry.' })
  @ApiNotFoundResponse({ description: 'Registry not found.' })
  @UuidParams(PARAM_REGISTRY_ID)
  async getRegistry(@RegistryId() id: string): Promise<RegistryDetailsDto> {
    return await this.service.getRegistryDetails(id)
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
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
  @ApiBadRequestResponse({ description: 'Bad request for registry creation.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for registry creation.' })
  @ApiConflictResponse({ description: 'Registry name taken.' })
  @UseGuards(RegistryAccessValidationGuard)
  @AuditLogLevel('no-data')
  async createRegistry(
    @TeamSlug() teamSlug: string,
    @Body() request: CreateRegistryDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<CreatedResponse<RegistryDetailsDto>> {
    const registry = await this.service.createRegistry(teamSlug, request, identity)

    return {
      url: `${teamSlug}/registries/${registry.id}`,
      body: registry,
    }
  }

  @Put(ROUTE_REGISTRY_ID)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    description:
      "Modify the `name`, `type`, `description`, `details`, and `icon`. `registryId` refers to the registry's ID. `registryId`, `type`, `details`, and `name` are required.",
    summary: 'Modify the details of a registry.',
  })
  @UseGuards(RegistryAccessValidationGuard)
  @ApiBody({ type: UpdateRegistryDto })
  @ApiNoContentResponse({ description: 'Registry modified.' })
  @ApiBadRequestResponse({ description: 'Bad request for registry modification.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for registry modification.' })
  @ApiNotFoundResponse({ description: 'Registry not found.' })
  @ApiConflictResponse({ description: 'Registry name taken.' })
  @UuidParams(PARAM_REGISTRY_ID)
  @AuditLogLevel('no-data')
  async updateRegistry(
    @RegistryId() id: string,
    @Body() request: UpdateRegistryDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<void> {
    await this.service.updateRegistry(id, request, identity)
  }

  @Delete(ROUTE_REGISTRY_ID)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    description: 'Deletes a registry with the specified `registryId`',
    summary: 'Delete a registry from dyrector.io.',
  })
  @ApiNoContentResponse({ description: 'Registry deleted.' })
  @ApiForbiddenResponse({ description: 'Unauthorized request for registry delete.' })
  @ApiNotFoundResponse({ description: 'Registry not found.' })
  @UuidParams(PARAM_REGISTRY_ID)
  async deleteRegistry(@RegistryId(DeleteRegistryValidationPipe) id: string): Promise<void> {
    await this.service.deleteRegistry(id)
  }
}
