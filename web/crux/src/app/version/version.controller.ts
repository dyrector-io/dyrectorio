import { Body, Controller, UseGuards, UseInterceptors } from '@nestjs/common'
import { AuditLoggerInterceptor } from 'src/interceptors/audit-logger.interceptor'
import { GrpcContextLogger } from 'src/interceptors/grpc-context-logger.interceptor'
import { PrismaErrorInterceptor } from 'src/interceptors/prisma-error-interceptor'
import { Empty } from 'src/proto/proto/agent'
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
} from 'src/proto/proto/crux'
import { VersionCreateTeamAccessGuard } from './guards/version.create.team-access.guard'
import { VersionTeamAccessGuard } from './guards/version.team-access.guard'
import { VersionCreateValidationPipe } from './pipes/version.create.pipe'
import { VersionDeleteValidationPipe } from './pipes/version.delete.pipe'
import { VersionUpdateValidationPipe } from './pipes/version.update.pipe'
import { VersionService } from './version.service'

@Controller()
@CruxProductVersionControllerMethods()
@UseGuards(VersionTeamAccessGuard)
@UseInterceptors(PrismaErrorInterceptor, GrpcContextLogger, AuditLoggerInterceptor)
export class VersionController implements CruxProductVersionController {
  constructor(private service: VersionService) {}

  async increaseVersion(request: IncreaseVersionRequest): Promise<CreateEntityResponse> {
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

  async deleteVersion(@Body(VersionDeleteValidationPipe) request: IdRequest): Promise<Empty> {
    return await this.service.deleteVersion(request)
  }
}
