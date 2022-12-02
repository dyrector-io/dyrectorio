import { Body, Controller, UseGuards, UseInterceptors } from '@nestjs/common'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorators'
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
} from 'src/grpc/protobuf/proto/crux'
import GrpcErrorInterceptor from 'src/interceptors/grpc.error.interceptor'
import GrpcLoggerInterceptor from 'src/interceptors/grpc.logger.interceptor'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'
import RegistryAccessValidationGuard from './guards/registry.auth.validation.guard'
import RegistryTeamAccessGuard from './guards/registry.team-access.guard'
import DeleteRegistryValidationPipe from './pipes/registry.delete.pipe'
import RegistryService from './registry.service'

@Controller()
@CruxRegistryControllerMethods()
@UseGuards(RegistryTeamAccessGuard)
@UseInterceptors(GrpcLoggerInterceptor, GrpcErrorInterceptor, PrismaErrorInterceptor)
export default class RegistryController implements CruxRegistryController {
  constructor(private service: RegistryService) {}

  async getRegistries(request: AccessRequest): Promise<RegistryListResponse> {
    return await this.service.getRegistries(request)
  }

  @UseGuards(RegistryAccessValidationGuard)
  async createRegistry(request: CreateRegistryRequest): Promise<CreateEntityResponse> {
    return await this.service.createRegistry(request)
  }

  async deleteRegistry(@Body(DeleteRegistryValidationPipe) request: IdRequest): Promise<void> {
    await this.service.deleteRegistry(request)
  }

  @UseGuards(RegistryAccessValidationGuard)
  @AuditLogLevel('no-data')
  async updateRegistry(request: UpdateRegistryRequest): Promise<UpdateEntityResponse> {
    return this.service.updateRegistry(request)
  }

  async getRegistryDetails(request: IdRequest): Promise<RegistryDetailsResponse> {
    return this.service.getRegistryDetails(request)
  }
}
