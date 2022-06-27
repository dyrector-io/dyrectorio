import { Controller, UseGuards, UseInterceptors } from '@nestjs/common'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorators'
import { AuditLoggerInterceptor } from 'src/interceptors/audit-logger.interceptor'
import { GrpcContextLogger } from 'src/interceptors/grpc-context-logger.interceptor'
import { PrismaErrorInterceptor } from 'src/interceptors/prisma-error-interceptor'
import {
  AccessRequest,
  CreateEntityResponse,
  CreateRegistryRequest,
  CruxRegistryController,
  CruxRegistryControllerMethods,
  IdRequest,
  RegistryDetailsResponse,
  RegistryListResponse,
  UpdateEntityResponse,
  UpdateRegistryRequest,
} from 'src/proto/proto/crux'
import { RegistryAuthValidationGuard } from './guards/registry.auth.validation.guard'
import { RegistryTeamAccessGuard } from './guards/registry.team-access.guart'
import { RegistryService } from './registry.service'

@Controller()
@CruxRegistryControllerMethods()
@UseGuards(RegistryTeamAccessGuard)
@UseInterceptors(PrismaErrorInterceptor, GrpcContextLogger, AuditLoggerInterceptor)
export class RegistryController implements CruxRegistryController {
  constructor(private service: RegistryService) {}

  async getRegistries(request: AccessRequest): Promise<RegistryListResponse> {
    return await this.service.getRegistries(request)
  }

  @UseGuards(RegistryAuthValidationGuard)
  async createRegistry(request: CreateRegistryRequest): Promise<CreateEntityResponse> {
    return await this.service.createRegistry(request)
  }

  async deleteRegistry(request: IdRequest): Promise<void> {
    await this.service.deleteRegistry(request)
  }

  @UseGuards(RegistryAuthValidationGuard)
  @AuditLogLevel('no-data')
  async updateRegistry(request: UpdateRegistryRequest): Promise<UpdateEntityResponse> {
    return this.service.updateRegistry(request)
  }

  async getRegistryDetails(request: IdRequest): Promise<RegistryDetailsResponse> {
    return this.service.getRegistryDetails(request)
  }
}
