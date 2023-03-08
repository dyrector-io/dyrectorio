import { Metadata } from '@grpc/grpc-js'
import { Controller, UseGuards, UsePipes } from '@nestjs/common'
import { concatAll, from, Observable } from 'rxjs'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorator'
import asdasda from 'src/decorators/grpc-interceptors.decorator'
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
import { DisableAccessCheck, DisableIdentity, IdentityAwareServerSurfaceCall } from 'src/shared/user-access.guard'
import NodeTeamAccessGuard from './guards/node.team-access.guard'
import NodeService from './node.service'
import NodeGenerateScriptValidationPipe from './pipes/node.generate-script.pipe'
import NodeGetScriptValidationPipe from './pipes/node.get-script.pipe'

@Controller()
@CruxNodeControllerMethods()
@UseGuards(NodeTeamAccessGuard)
@asdasda()
export default class NodeController implements CruxNodeController {
  constructor(private service: NodeService) {}

  async getNodes(_: Empty, __: Metadata, call: IdentityAwareServerSurfaceCall): Promise<NodeListResponse> {
    return await this.service.getNodes(call.user)
  }

  async createNode(
    request: CreateNodeRequest,
    _: Metadata,
    call: IdentityAwareServerSurfaceCall,
  ): Promise<CreateEntityResponse> {
    return await this.service.createNode(request, call.user)
  }

  async deleteNode(request: IdRequest): Promise<void> {
    await this.service.deleteNode(request)
  }

  async updateNode(request: UpdateNodeRequest, _: Metadata, call: IdentityAwareServerSurfaceCall): Promise<Empty> {
    return await this.service.updateNode(request, call.user)
  }

  async getNodeDetails(request: IdRequest): Promise<NodeDetailsResponse> {
    return await this.service.getNodeDetails(request)
  }

  // TODO(m8vago):  fix errors related to this - interceptor halts
  @AuditLogLevel('disabled')
  @UsePipes(NodeGenerateScriptValidationPipe)
  async generateScript(
    request: GenerateScriptRequest,
    _: Metadata,
    call: IdentityAwareServerSurfaceCall,
  ): Promise<NodeInstallResponse> {
    return await this.service.generateScript(request, call.user)
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

  async revokeToken(request: IdRequest, _: Metadata, call: IdentityAwareServerSurfaceCall): Promise<Empty> {
    return await this.service.revokeToken(request, call.user)
  }

  @DisableAccessCheck()
  @DisableIdentity()
  @AuditLogLevel('disabled')
  subscribeNodeEventChannel(request: ServiceIdRequest): Observable<NodeEventMessage> {
    return from(this.service.handleSubscribeNodeEventChannel(request)).pipe(concatAll())
  }

  @DisableAccessCheck()
  @DisableIdentity()
  @AuditLogLevel('disabled')
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

  @DisableAccessCheck()
  @DisableIdentity()
  @AuditLogLevel('disabled')
  subscribeContainerLogChannel(request: WatchContainerLogRequest): Observable<ContainerLogMessage> {
    return this.service.handleContainerLogStream(request)
  }
}
