import { Metadata } from '@grpc/grpc-js'
import { UsePipes, Controller, UseGuards, UseInterceptors } from '@nestjs/common'
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
import GrpcUserInterceptor, { getAccessedBy } from 'src/interceptors/grpc.user.interceptor'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'
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
@UseInterceptors(GrpcLoggerInterceptor, GrpcUserInterceptor, GrpcErrorInterceptor, PrismaErrorInterceptor)
export default class VersionController implements CruxProductVersionController {
  constructor(private service: VersionService) {}

  @UsePipes(VersionIncreaseValidationPipe)
  async increaseVersion(request: IncreaseVersionRequest, metadata: Metadata): Promise<CreateEntityResponse> {
    return await this.service.increaseVersion(request, getAccessedBy(metadata))
  }

  async getVersionsByProductId(productId: IdRequest, metadata: Metadata): Promise<VersionListResponse> {
    return await this.service.getVersionsByProductId(productId, getAccessedBy(metadata))
  }

  async getVersionDetails(versionId: IdRequest): Promise<VersionDetailsResponse> {
    return await this.service.getVersionDetails(versionId)
  }

  @UseGuards(VersionCreateTeamAccessGuard)
  @UsePipes(VersionCreateValidationPipe)
  async createVersion(request: CreateVersionRequest, metadata: Metadata): Promise<CreateEntityResponse> {
    return await this.service.createVersion(request, getAccessedBy(metadata))
  }

  @UsePipes(VersionUpdateValidationPipe)
  async updateVersion(request: UpdateVersionRequest, metadata: Metadata): Promise<UpdateEntityResponse> {
    return await this.service.updateVersion(request, getAccessedBy(metadata))
  }

  async setDefaultVersion(request: IdRequest): Promise<Empty> {
    return await this.service.setDefaultVersion(request)
  }

  @UsePipes(VersionDeleteValidationPipe)
  async deleteVersion(request: IdRequest): Promise<Empty> {
    return await this.service.deleteVersion(request)
  }
}
