import {
  Controller,
  Get,
  HttpCode,
  Response,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { Response as Res } from 'express'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorator'
import HttpLoggerInterceptor from 'src/interceptors/http.logger.interceptor'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'
import { Delete, Post, Put } from '@nestjs/common/decorators/http/request-mapping.decorator'
import { Body, Param } from '@nestjs/common/decorators/http/route-params.decorator'
import { Identity } from '@ory/kratos-client'
import JwtAuthGuard, { IdentityFromRequest } from '../token/jwt-auth.guard'
import RegistryAccessValidationGuard from './guards/registry.auth.validation.guard'
import RegistryTeamAccessGuard from './guards/registry.team-access.guard'
import UpdateRegistryInterceptor from './interceptors/registry.update.interceptor'
import DeleteRegistryValidationPipe from './pipes/registry.delete.pipe'
import { CreateRegistry, RegistryDetails, RegistryList, TestRegistry, UpdateRegistry } from './registry.dto'
import RegistryService from './registry.service'

@Controller('registries')
@ApiTags('registries')
@UsePipes(
  new ValidationPipe({
    // TODO(@robot9706): Move to global pipes after removing gRPC
    transform: true,
  }),
)
@UseInterceptors(HttpLoggerInterceptor, PrismaErrorInterceptor)
@UseGuards(JwtAuthGuard, RegistryTeamAccessGuard)
export default class RegistryHttpController {
  constructor(private service: RegistryService) {}

  @Get()
  @AuditLogLevel('disabled') // TODO(@robot9706): Refactor the auditlog after removing gRPC
  @ApiOkResponse({ type: RegistryList })
  async getRegistries(@IdentityFromRequest() identity: Identity): Promise<RegistryList> {
    return await this.service.getRegistries(identity)
  }

  @Get('/test/:id')
  @AuditLogLevel('disabled') // TODO(@robot9706): Refactor the auditlog after removing gRPC
  @ApiOkResponse({ type: TestRegistry })
  async getTestRegistries(): Promise<RegistryList> {
    return null
  }

  @Get(':id')
  // TODO(@robot9706): Refactor the auditlog after removing gRPC
  // TODO(@robot9706): Access check?
  @AuditLogLevel('disabled')
  @ApiOkResponse({ type: RegistryDetails })
  async getRegistry(@Param('id') id: string): Promise<RegistryDetails> {
    return await this.service.getRegistryDetails(id)
  }

  @Post()
  @UseGuards(RegistryAccessValidationGuard)
  @AuditLogLevel('disabled')
  @ApiBody({ type: CreateRegistry })
  @ApiCreatedResponse({
    type: RegistryDetails,
    headers: {
      Location: {
        description: 'URL of the created object.',
        schema: {
          type: 'URL',
        },
      },
    },
  })
  @HttpCode(201)
  async createRegistry(
    @Body() request: CreateRegistry,
    @IdentityFromRequest() identity: Identity,
    @Response() res: Res,
  ): Promise<void> {
    const registry = await this.service.createRegistry(request, identity)

    res.location(`/registries/${registry.id}`).json(registry)
  }

  @Put(':id')
  @AuditLogLevel('disabled')
  @UseInterceptors(UpdateRegistryInterceptor)
  @UseGuards(RegistryAccessValidationGuard)
  @ApiBody({ type: UpdateRegistry })
  @HttpCode(204)
  async updateRegistry(
    @Param('id') id: string,
    @Body() request: UpdateRegistry,
    @IdentityFromRequest() identity: Identity,
    @Response() res: Res,
  ): Promise<void> {
    await this.service.updateRegistry(id, request, identity)

    res.end()
  }

  @Delete(':id')
  @AuditLogLevel('disabled')
  @HttpCode(204)
  async deleteRegistry(@Param('id', DeleteRegistryValidationPipe) id: string, @Response() res: Res): Promise<void> {
    await this.service.deleteRegistry(id)
    res.end()
  }
}
