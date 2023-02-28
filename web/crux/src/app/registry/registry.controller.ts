import { Metadata } from '@grpc/grpc-js'
import { UsePipes, Controller, UseGuards, UseInterceptors } from '@nestjs/common'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorators'
import { Empty } from 'src/grpc/protobuf/proto/common'
import {
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
import GrpcUserInterceptor, { getIdentity } from 'src/interceptors/grpc.user.interceptor'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'
import RegistryAccessValidationGuard from './guards/registry.auth.validation.guard'
import RegistryTeamAccessGuard from './guards/registry.team-access.guard'
import DeleteRegistryValidationPipe from './pipes/registry.delete.pipe'
import UpdateRegistryValidationPipe from './pipes/registry.update.pipe'
import RegistryService from './registry.service'

@Controller()
@CruxRegistryControllerMethods()
@UseGuards(RegistryTeamAccessGuard)
@UseInterceptors(GrpcLoggerInterceptor, GrpcUserInterceptor, GrpcErrorInterceptor, PrismaErrorInterceptor)
export default class RegistryController implements CruxRegistryController {
  constructor(private service: RegistryService) {}

  async getRegistries(_: Empty, metadata: Metadata): Promise<RegistryListResponse> {
    return await this.service.getRegistries(getIdentity(metadata))
  }

  @UseGuards(RegistryAccessValidationGuard)
  async createRegistry(request: CreateRegistryRequest, metadata: Metadata): Promise<CreateEntityResponse> {
    return await this.service.createRegistry(request, getIdentity(metadata))
  }

  @UsePipes(DeleteRegistryValidationPipe)
  async deleteRegistry(request: IdRequest): Promise<void> {
    await this.service.deleteRegistry(request)
  }

  @UseGuards(RegistryAccessValidationGuard)
  @AuditLogLevel('no-data')
  @UsePipes(UpdateRegistryValidationPipe)
  async updateRegistry(request: UpdateRegistryRequest, metadata: Metadata): Promise<UpdateEntityResponse> {
    return this.service.updateRegistry(request, getIdentity(metadata))
  }

  async getRegistryDetails(request: IdRequest): Promise<RegistryDetailsResponse> {
    return this.service.getRegistryDetails(request)
  }
}
