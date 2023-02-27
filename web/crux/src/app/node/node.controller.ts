import { Metadata } from '@grpc/grpc-js'
import { UsePipes, Controller, UseGuards, UseInterceptors } from '@nestjs/common'
import { concatAll, from, Observable } from 'rxjs'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorators'
import { ContainerLogMessage, ContainerStateListMessage, Empty } from 'src/grpc/protobuf/proto/common'
import {
  CreateEntityResponse,
  CreateNodeRequest,
  CruxNodeController,
  CruxNodeControllerMethods,
  GenerateScriptRequest,
  IdRequest,
  NodeContainerCommandRequest,
  NodeDeleteContainersRequest,
  NodeDetailsResponse,
  NodeEventMessage,
  NodeInstallResponse,
  NodeListResponse,
  NodeScriptResponse,
  ServiceIdRequest,
  UpdateNodeRequest,
  WatchContainerLogRequest,
  WatchContainerStateRequest,
} from 'src/grpc/protobuf/proto/crux'
import GrpcErrorInterceptor from 'src/interceptors/grpc.error.interceptor'
import GrpcLoggerInterceptor from 'src/interceptors/grpc.logger.interceptor'
import GrpcUserInterceptor, { DisableIdentity, getIdentity } from 'src/interceptors/grpc.user.interceptor'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'
import { DisableAccessCheck } from 'src/shared/user-access.guard'
import NodeTeamAccessGuard from './guards/node.team-access.guard'
import NodeService from './node.service'
import NodeGenerateScriptValidationPipe from './pipes/node.generate-script.pipe'
import NodeGetScriptValidationPipe from './pipes/node.get-script.pipe'

@Controller()
@CruxNodeControllerMethods()
@UseGuards(NodeTeamAccessGuard)
@UseInterceptors(GrpcLoggerInterceptor, GrpcUserInterceptor, GrpcErrorInterceptor, PrismaErrorInterceptor)
export default class NodeController implements CruxNodeController {
  constructor(private service: NodeService) {}

  async getNodes(_: Empty, metadata: Metadata): Promise<NodeListResponse> {
    return await this.service.getNodes(getIdentity(metadata))
  }

  async createNode(request: CreateNodeRequest, metadata: Metadata): Promise<CreateEntityResponse> {
    return await this.service.createNode(request, getIdentity(metadata))
  }

  async deleteNode(request: IdRequest): Promise<void> {
    await this.service.deleteNode(request)
  }

  async updateNode(request: UpdateNodeRequest, metadata: Metadata): Promise<Empty> {
    return await this.service.updateNode(request, getIdentity(metadata))
  }

  async getNodeDetails(request: IdRequest): Promise<NodeDetailsResponse> {
    return await this.service.getNodeDetails(request)
  }

  // TODO(m8vago):  fix errors related to this - interceptor halts
  @AuditLogLevel('disabled')
  @UsePipes(NodeGenerateScriptValidationPipe)
  async generateScript(request: GenerateScriptRequest, metadata: Metadata): Promise<NodeInstallResponse> {
    return await this.service.generateScript(request, getIdentity(metadata))
  }

  @DisableAccessCheck()
  @DisableIdentity()
  @AuditLogLevel('disabled')
  @UsePipes(NodeGetScriptValidationPipe)
  async getScript(request: ServiceIdRequest): Promise<NodeScriptResponse> {
    return await this.service.getScript(request)
  }

  async discardScript(request: IdRequest): Promise<Empty> {
    return await this.service.discardScript(request)
  }

  async revokeToken(request: IdRequest, metadata: Metadata): Promise<Empty> {
    return await this.service.revokeToken(request, getIdentity(metadata))
  }

  @AuditLogLevel('disabled')
  @DisableAccessCheck()
  @DisableIdentity()
  subscribeNodeEventChannel(request: ServiceIdRequest): Observable<NodeEventMessage> {
    return from(this.service.handleSubscribeNodeEventChannel(request)).pipe(concatAll())
  }

  @AuditLogLevel('disabled')
  @DisableAccessCheck()
  @DisableIdentity()
  watchContainerState(request: WatchContainerStateRequest): Observable<ContainerStateListMessage> {
    return this.service.handleWatchContainerStatus(request)
  }

  async updateNodeAgent(request: IdRequest): Promise<Empty> {
    this.service.updateNodeAgent(request)

    return {}
  }

  sendContainerCommand(request: NodeContainerCommandRequest): Empty {
    return this.service.sendContainerCommand(request)
  }

  deleteContainers(request: NodeDeleteContainersRequest): Observable<Empty> {
    return this.service.deleteContainers(request)
  }

  @AuditLogLevel('disabled')
  @DisableAccessCheck()
  @DisableIdentity()
  subscribeContainerLogChannel(request: WatchContainerLogRequest): Observable<ContainerLogMessage> {
    return this.service.handleContainerLogStream(request)
  }
}
