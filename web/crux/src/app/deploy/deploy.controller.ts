import { Metadata } from '@grpc/grpc-js'
import { Controller, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common'
import { concatAll, from, Observable } from 'rxjs'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorators'
import { ListSecretsResponse, Empty } from 'src/grpc/protobuf/proto/common'
import {
  CreateDeploymentRequest,
  CreateEntityResponse,
  CruxDeploymentController,
  CruxDeploymentControllerMethods,
  DeploymentDetailsResponse,
  DeploymentEditEventMessage,
  DeploymentEventListResponse,
  DeploymentListByVersionResponse,
  DeploymentListResponse,
  DeploymentListSecretsRequest,
  DeploymentProgressMessage,
  IdRequest,
  PatchDeploymentRequest,
  ServiceIdRequest,
  UpdateDeploymentRequest,
  UpdateEntityResponse,
} from 'src/grpc/protobuf/proto/crux'
import GrpcErrorInterceptor from 'src/interceptors/grpc.error.interceptor'
import GrpcLoggerInterceptor from 'src/interceptors/grpc.logger.interceptor'
import GrpcUserInterceptor, { DisableIdentity, getIdentity } from 'src/interceptors/grpc.user.interceptor'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'
import { DisableTeamAccessCheck } from 'src/shared/user-access.guard'
import DeployService from './deploy.service'
import DeployCreateTeamAccessGuard from './guards/deploy.create.team-access.guard'
import DeployGetByVersionTeamAccessGuard from './guards/deploy.get-by-version.team-access.guard'
import DeployTeamAccessGuard from './guards/deploy.team-access.guard'
import DeployCopyValidationPipe from './pipes/deploy.copy.pipe'
import DeployCreateValidationPipe from './pipes/deploy.create.pipe'
import DeleteDeploymentValidationPipe from './pipes/deploy.delete.pipe'
import DeployPatchValidationPipe from './pipes/deploy.patch.pipe'
import DeployStartValidationPipe from './pipes/deploy.start.pipe'
import DeployUpdateValidationPipe from './pipes/deploy.update.pipe'

@Controller()
@CruxDeploymentControllerMethods()
@UseGuards(DeployTeamAccessGuard)
@UseInterceptors(GrpcLoggerInterceptor, GrpcUserInterceptor, GrpcErrorInterceptor, PrismaErrorInterceptor)
export default class DeployController implements CruxDeploymentController {
  constructor(private service: DeployService) {}

  @DisableTeamAccessCheck()
  @UseGuards(DeployGetByVersionTeamAccessGuard)
  async getDeploymentsByVersionId(request: IdRequest): Promise<DeploymentListByVersionResponse> {
    return await this.service.getDeploymentsByVersionId(request)
  }

  async getDeploymentDetails(request: IdRequest): Promise<DeploymentDetailsResponse> {
    return await this.service.getDeploymentDetails(request)
  }

  async getDeploymentEvents(request: IdRequest): Promise<DeploymentEventListResponse> {
    return await this.service.getDeploymentEvents(request)
  }

  @UseGuards(DeployCreateTeamAccessGuard)
  @UsePipes(DeployCreateValidationPipe)
  async createDeployment(request: CreateDeploymentRequest, metadata: Metadata): Promise<CreateEntityResponse> {
    return await this.service.createDeployment(request, getIdentity(metadata))
  }

  @UsePipes(DeployUpdateValidationPipe)
  async updateDeployment(request: UpdateDeploymentRequest, metadata: Metadata): Promise<UpdateEntityResponse> {
    return await this.service.updateDeployment(request, getIdentity(metadata))
  }

  async getDeploymentSecrets(request: DeploymentListSecretsRequest): Promise<ListSecretsResponse> {
    return await this.service.getDeploymentSecrets(request)
  }

  @AuditLogLevel('no-data')
  @UsePipes(DeployPatchValidationPipe)
  async patchDeployment(request: PatchDeploymentRequest, metadata: Metadata): Promise<UpdateEntityResponse> {
    return await this.service.patchDeployment(request, getIdentity(metadata))
  }

  @UsePipes(DeleteDeploymentValidationPipe)
  async deleteDeployment(request: IdRequest): Promise<Empty> {
    return await this.service.deleteDeployment(request)
  }

  @UsePipes(DeployStartValidationPipe)
  async startDeployment(request: IdRequest, metadata: Metadata): Promise<Empty> {
    return await this.service.startDeployment(request, getIdentity(metadata))
  }

  @DisableTeamAccessCheck()
  @DisableIdentity()
  subscribeToDeploymentEvents(request: IdRequest): Observable<DeploymentProgressMessage> {
    return from(this.service.subscribeToDeploymentEvents(request)).pipe(concatAll())
  }

  @DisableTeamAccessCheck()
  @DisableIdentity()
  @AuditLogLevel('disabled')
  subscribeToDeploymentEditEvents(request: ServiceIdRequest): Observable<DeploymentEditEventMessage> {
    return this.service.subscribeToDeploymentEditEvents(request)
  }

  async getDeploymentList(_: Empty, metadata: Metadata): Promise<DeploymentListResponse> {
    return await this.service.getDeploymentList(getIdentity(metadata))
  }

  @UsePipes(DeployCopyValidationPipe)
  async copyDeploymentSafe(request: IdRequest, metadata: Metadata): Promise<CreateEntityResponse> {
    return this.service.copyDeployment(request, getIdentity(metadata))
  }

  async copyDeploymentUnsafe(request: IdRequest, metadata: Metadata): Promise<CreateEntityResponse> {
    return this.service.copyDeployment(request, getIdentity(metadata))
  }
}
