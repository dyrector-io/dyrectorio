import { Controller, UseGuards } from '@nestjs/common'
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
import { RegistryAccessValidationGuard } from './guards/registry.auth.validation.guard'
import { RegistryTeamAccessGuard } from './guards/registry.team-access.guart'
import { RegistryService } from './registry.service'

@Controller()
@CruxRegistryControllerMethods()
@UseGuards(RegistryTeamAccessGuard)
export class RegistryController implements CruxRegistryController {
  constructor(private service: RegistryService) {}

  async getRegistries(request: AccessRequest): Promise<RegistryListResponse> {
    return await this.service.getRegistries(request)
  }

  @UseGuards(RegistryAccessValidationGuard)
  async createRegistry(request: CreateRegistryRequest): Promise<CreateEntityResponse> {
    return await this.service.createRegistry(request)
  }

  async deleteRegistry(request: IdRequest): Promise<void> {
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
