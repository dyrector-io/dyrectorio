import { Body, Controller, UseGuards, UseInterceptors } from '@nestjs/common'
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
import GrpcErrorInterceptor from 'src/interceptors/grpc.error.interceptor'
import GrpcLoggerInterceptor from 'src/interceptors/grpc.logger.interceptor'
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
@UseInterceptors(GrpcLoggerInterceptor, GrpcErrorInterceptor)
export default class VersionController implements CruxProductVersionController {
  constructor(private service: VersionService) {}

  async increaseVersion(
    @Body(VersionIncreaseValidationPipe) request: IncreaseVersionRequest,
  ): Promise<CreateEntityResponse> {
    return await this.service.increaseVersion(request)
  }

  async getVersionsByProductId(productId: IdRequest): Promise<VersionListResponse> {
    return await this.service.getVersionsByProductId(productId)
  }

  async getVersionDetails(versionId: IdRequest): Promise<VersionDetailsResponse> {
    return await this.service.getVersionDetails(versionId)
  }

  @UseGuards(VersionCreateTeamAccessGuard)
  async createVersion(@Body(VersionCreateValidationPipe) request: CreateVersionRequest): Promise<CreateEntityResponse> {
    return await this.service.createVersion(request)
  }

  async updateVersion(@Body(VersionUpdateValidationPipe) request: UpdateVersionRequest): Promise<UpdateEntityResponse> {
    return await this.service.updateVersion(request)
  }

  async setDefaultVersion(request: IdRequest): Promise<Empty> {
    return await this.service.setDefaultVersion(request)
  }

  async deleteVersion(@Body(VersionDeleteValidationPipe) request: IdRequest): Promise<Empty> {
    return await this.service.deleteVersion(request)
  }
}
