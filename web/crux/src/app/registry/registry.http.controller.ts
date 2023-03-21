import {
  Controller,
  Get,
  HttpCode,
  PipeTransform,
  Type,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import { Delete, Post, Put } from '@nestjs/common/decorators/http/request-mapping.decorator'
import { Body, Param } from '@nestjs/common/decorators/http/route-params.decorator'
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { Identity } from '@ory/kratos-client'
import HttpLoggerInterceptor from 'src/interceptors/http.logger.interceptor'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'
import { API_CREATED_LOCATION_HEADERS } from 'src/shared/const'
import { CreatedResponse, CreatedWithLocation } from '../shared/created-with-location.decorator'
import CreatedWithLocationInterceptor from '../shared/created-with-location.interceptor'
import JwtAuthGuard, { IdentityFromRequest } from '../token/jwt-auth.guard'
import RegistryAccessValidationGuard from './guards/registry.auth.validation.guard'
import RegistryTeamAccessGuard from './guards/registry.team-access.guard'
import UpdateRegistryInterceptor from './interceptors/registry.update.interceptor'
import DeleteRegistryValidationPipe from './pipes/registry.delete.pipe'
import { CreateRegistryDto, RegistryDetailsDto, RegistryDto, UpdateRegistryDto } from './registry.dto'
import RegistryService from './registry.service'

const RegistryId = (...pipes: (Type<PipeTransform> | PipeTransform)[]) => Param('registryId', ...pipes)

const ROUTE_REGISTRIES = 'registries'
const ROUTE_REGISTRY_ID = ':registryId'

@Controller(ROUTE_REGISTRIES)
@ApiTags(ROUTE_REGISTRIES)
@UsePipes(
  new ValidationPipe({
    // TODO(@robot9706): Move to global pipes after removing gRPC
    transform: true,
  }),
)
@UseInterceptors(HttpLoggerInterceptor, PrismaErrorInterceptor, CreatedWithLocationInterceptor)
@UseGuards(JwtAuthGuard, RegistryTeamAccessGuard)
export default class RegistryHttpController {
  constructor(private service: RegistryService) {}

  @Get()
  @ApiOkResponse({ type: RegistryDto, isArray: true })
  async getRegistries(@IdentityFromRequest() identity: Identity): Promise<RegistryDto[]> {
    return await this.service.getRegistries(identity)
  }

  @Get(ROUTE_REGISTRY_ID)
  @ApiOkResponse({ type: RegistryDetailsDto })
  async getRegistry(@RegistryId() id: string): Promise<RegistryDetailsDto> {
    return await this.service.getRegistryDetails(id)
  }

  @Post()
  @CreatedWithLocation()
  @ApiBody({ type: CreateRegistryDto })
  @ApiCreatedResponse({
    type: RegistryDetailsDto,
    headers: API_CREATED_LOCATION_HEADERS,
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
  async updateRegistry(
    @RegistryId() id: string,
    @Body() request: UpdateRegistryDto,
    @IdentityFromRequest() identity: Identity,
  ): Promise<void> {
    await this.service.updateRegistry(id, request, identity)
  }

  @Delete(ROUTE_REGISTRY_ID)
  @HttpCode(204)
  async deleteRegistry(@RegistryId(DeleteRegistryValidationPipe) id: string): Promise<void> {
    await this.service.deleteRegistry(id)
  }
}
