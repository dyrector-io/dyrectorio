import { Metadata } from '@grpc/grpc-js'
import { Controller, UseGuards, UsePipes } from '@nestjs/common'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorator'
import UseGrpcInterceptors from 'src/decorators/grpc-interceptors.decorator'
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
import { IdentityAwareServerSurfaceCall } from 'src/shared/user-access.guard'
import RegistryAccessValidationGuard from './guards/registry.auth.validation.guard'
import RegistryTeamAccessGuard from './guards/registry.team-access.guard'
import DeleteRegistryValidationPipe from './pipes/registry.delete.pipe'
import UpdateRegistryValidationPipe from './pipes/registry.update.pipe'
import RegistryService from './registry.service'

@Controller()
@CruxRegistryControllerMethods()
@UseGuards(RegistryTeamAccessGuard)
@UseGrpcInterceptors()
export default class RegistryController implements CruxRegistryController {
  constructor(private service: RegistryService) {}

  async getRegistries(_: Empty, __: Metadata, call: IdentityAwareServerSurfaceCall): Promise<RegistryListResponse> {
    return await this.service.getRegistries(call.user)
  }

  @UseGuards(RegistryAccessValidationGuard)
  async createRegistry(
    request: CreateRegistryRequest,
    _: Metadata,
    call: IdentityAwareServerSurfaceCall,
  ): Promise<CreateEntityResponse> {
    return await this.service.createRegistry(request, call.user)
  }

  @UsePipes(DeleteRegistryValidationPipe)
  async deleteRegistry(request: IdRequest): Promise<void> {
    await this.service.deleteRegistry(request)
  }

  @UseGuards(RegistryAccessValidationGuard)
  @AuditLogLevel('no-data')
  @UsePipes(UpdateRegistryValidationPipe)
  async updateRegistry(
    request: UpdateRegistryRequest,
    _: Metadata,
    call: IdentityAwareServerSurfaceCall,
  ): Promise<UpdateEntityResponse> {
    return this.service.updateRegistry(request, call.user)
  }

  async getRegistryDetails(request: IdRequest): Promise<RegistryDetailsResponse> {
    return this.service.getRegistryDetails(request)
  }
}
