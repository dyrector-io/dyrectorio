import { Metadata } from '@grpc/grpc-js'
import { Controller, UseGuards, UsePipes } from '@nestjs/common'
import UseGrpcInterceptors from 'src/decorators/grpc-interceptors.decorator'
import { Empty } from 'src/grpc/protobuf/proto/common'
import {
  CreateEntityResponse,
  CreateVersionRequest,
  CruxProductVersionController,
  CruxProductVersionControllerMethods,
  IdRequest,
  IncreaseVersionRequest,
  UpdateEntityResponse,
  UpdateVersionRequest,
  VersionDetailsResponse,
  VersionListResponse,
} from 'src/grpc/protobuf/proto/crux'
import { IdentityAwareServerSurfaceCall } from 'src/shared/user-access.guard'
import VersionCreateTeamAccessGuard from './guards/version.create.team-access.guard'
import VersionTeamAccessGuard from './guards/version.team-access.guard'
import VersionCreateValidationPipe from './pipes/version.create.pipe'
import VersionDeleteValidationPipe from './pipes/version.delete.pipe'
import VersionIncreaseValidationPipe from './pipes/version.increase.pipe'
import VersionUpdateValidationPipe from './pipes/version.update.pipe'
import VersionService from './version.service'

@Controller()
@CruxProductVersionControllerMethods()
@UseGuards(VersionTeamAccessGuard)
@UseGrpcInterceptors()
export default class VersionController implements CruxProductVersionController {
  constructor(private service: VersionService) {}

  @UsePipes(VersionIncreaseValidationPipe)
  async increaseVersion(
    request: IncreaseVersionRequest,
    _: Metadata,
    call: IdentityAwareServerSurfaceCall,
  ): Promise<CreateEntityResponse> {
    return await this.service.increaseVersion(request, call.user)
  }

  async getVersionsByProductId(
    productId: IdRequest,
    _: Metadata,
    call: IdentityAwareServerSurfaceCall,
  ): Promise<VersionListResponse> {
    return await this.service.getVersionsByProductId(productId, call.user)
  }

  async getVersionDetails(versionId: IdRequest): Promise<VersionDetailsResponse> {
    return await this.service.getVersionDetails(versionId)
  }

  @UseGuards(VersionCreateTeamAccessGuard)
  @UsePipes(VersionCreateValidationPipe)
  async createVersion(
    request: CreateVersionRequest,
    _: Metadata,
    call: IdentityAwareServerSurfaceCall,
  ): Promise<CreateEntityResponse> {
    return await this.service.createVersion(request, call.user)
  }

  @UsePipes(VersionUpdateValidationPipe)
  async updateVersion(
    request: UpdateVersionRequest,
    _: Metadata,
    call: IdentityAwareServerSurfaceCall,
  ): Promise<UpdateEntityResponse> {
    return await this.service.updateVersion(request, call.user)
  }

  async setDefaultVersion(request: IdRequest): Promise<Empty> {
    return await this.service.setDefaultVersion(request)
  }

  @UsePipes(VersionDeleteValidationPipe)
  async deleteVersion(request: IdRequest): Promise<Empty> {
    return await this.service.deleteVersion(request)
  }
}
