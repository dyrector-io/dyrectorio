import { Metadata } from '@grpc/grpc-js'
import { Controller, UseGuards, UsePipes } from '@nestjs/common'
import { Identity } from '@ory/kratos-client'
import { concatAll, from, Observable } from 'rxjs'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorator'
import UseGrpcInterceptors from 'src/decorators/grpc-interceptors.decorator'
import { Empty, ListSecretsResponse } from 'src/grpc/protobuf/proto/common'
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
import { DisableAccessCheck, DisableIdentity, IdentityFromGrpcCall } from 'src/shared/user-access.guard'
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
@UseGrpcInterceptors()
export default class DeployController implements CruxDeploymentController {
  constructor(private service: DeployService) {}

  @DisableAccessCheck()
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
  async createDeployment(
    request: CreateDeploymentRequest,
    _: Metadata,
    @IdentityFromGrpcCall() identity: Identity,
  ): Promise<CreateEntityResponse> {
    return await this.service.createDeployment(request, identity)
  }

  @UsePipes(DeployUpdateValidationPipe)
  async updateDeployment(
    request: UpdateDeploymentRequest,
    _: Metadata,
    @IdentityFromGrpcCall() identity: Identity,
  ): Promise<UpdateEntityResponse> {
    return await this.service.updateDeployment(request, identity)
  }

  async getDeploymentSecrets(request: DeploymentListSecretsRequest): Promise<ListSecretsResponse> {
    return await this.service.getDeploymentSecrets(request)
  }

  @AuditLogLevel('no-data')
  @UsePipes(DeployPatchValidationPipe)
  async patchDeployment(
    request: PatchDeploymentRequest,
    _: Metadata,
    @IdentityFromGrpcCall() identity: Identity,
  ): Promise<UpdateEntityResponse> {
    return await this.service.patchDeployment(request, identity)
  }

  @UsePipes(DeleteDeploymentValidationPipe)
  async deleteDeployment(request: IdRequest): Promise<Empty> {
    return await this.service.deleteDeployment(request)
  }

  @UsePipes(DeployStartValidationPipe)
  async startDeployment(request: IdRequest, _: Metadata, @IdentityFromGrpcCall() identity: Identity): Promise<Empty> {
    return await this.service.startDeployment(request, identity)
  }

  @DisableAccessCheck()
  @DisableIdentity()
  @AuditLogLevel('disabled')
  subscribeToDeploymentEvents(request: IdRequest): Observable<DeploymentProgressMessage> {
    return from(this.service.subscribeToDeploymentEvents(request)).pipe(concatAll())
  }

  @DisableAccessCheck()
  @DisableIdentity()
  @AuditLogLevel('disabled')
  subscribeToDeploymentEditEvents(request: ServiceIdRequest): Observable<DeploymentEditEventMessage> {
    return this.service.subscribeToDeploymentEditEvents(request)
  }

  async getDeploymentList(
    _: Empty,
    __: Metadata,
    @IdentityFromGrpcCall() identity: Identity,
  ): Promise<DeploymentListResponse> {
    return await this.service.getDeploymentList(identity)
  }

  @UsePipes(DeployCopyValidationPipe)
  async copyDeploymentSafe(
    request: IdRequest,
    _: Metadata,
    @IdentityFromGrpcCall() identity: Identity,
  ): Promise<CreateEntityResponse> {
    return this.service.copyDeployment(request, identity)
  }

  async copyDeploymentUnsafe(
    request: IdRequest,
    _: Metadata,
    @IdentityFromGrpcCall() identity: Identity,
  ): Promise<CreateEntityResponse> {
    return this.service.copyDeployment(request, identity)
  }
}
