import { Metadata } from '@grpc/grpc-js'
import { UsePipes, Controller, UseGuards } from '@nestjs/common'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorator'
import { Empty } from 'src/grpc/protobuf/proto/common'
import {
  CreateEntityResponse,
  CreateStorageRequest,
  CruxStorageController,
  CruxStorageControllerMethods,
  IdRequest,
  StorageDetailsResponse,
  StorageListResponse,
  StorageOptionListResponse,
  UpdateEntityResponse,
  UpdateStorageRequest,
} from 'src/grpc/protobuf/proto/crux'
import UseGrpcInterceptors from 'src/decorators/grpc-interceptors.decorator'
import { IdentityAwareServerSurfaceCall } from 'src/shared/user-access.guard'
import StorageTeamAccessGuard from './guards/storage.team-access.guard'
import DeleteStorageValidationPipe from './pipes/storage.delete.pipe'
import UpdateStorageValidationPipe from './pipes/storage.update.pipe'
import StorageService from './storage.service'

@Controller()
@CruxStorageControllerMethods()
@UseGuards(StorageTeamAccessGuard)
@UseGrpcInterceptors()
export default class StorageController implements CruxStorageController {
  constructor(private service: StorageService) {}

  async getStorages(_: Empty, __: Metadata, call: IdentityAwareServerSurfaceCall): Promise<StorageListResponse> {
    return await this.service.getStorages(call.user)
  }

  async createStorage(
    request: CreateStorageRequest,
    __: Metadata,
    call: IdentityAwareServerSurfaceCall,
  ): Promise<CreateEntityResponse> {
    return await this.service.createStorage(request, call.user)
  }

  @UsePipes(DeleteStorageValidationPipe)
  async deleteStorage(request: IdRequest): Promise<void> {
    await this.service.deleteStorage(request)
  }

  @AuditLogLevel('no-data')
  @UsePipes(UpdateStorageValidationPipe)
  async updateStorage(
    request: UpdateStorageRequest,
    __: Metadata,
    call: IdentityAwareServerSurfaceCall,
  ): Promise<UpdateEntityResponse> {
    return this.service.updateStorage(request, call.user)
  }

  async getStorageDetails(request: IdRequest): Promise<StorageDetailsResponse> {
    return this.service.getStorageDetails(request)
  }

  async getStorageOptions(
    _: Empty,
    __: Metadata,
    call: IdentityAwareServerSurfaceCall,
  ): Promise<StorageOptionListResponse> {
    return this.service.getStorageOptions(call.user)
  }
}
