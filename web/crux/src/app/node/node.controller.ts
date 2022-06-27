import { Body, Controller, UseGuards, UseInterceptors } from '@nestjs/common'
import { concatAll, from, Observable } from 'rxjs'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorators'
import { AuditLoggerInterceptor } from 'src/interceptors/audit-logger.interceptor'
import { GrpcContextLogger } from 'src/interceptors/grpc-context-logger.interceptor'
import { PrismaErrorInterceptor } from 'src/interceptors/prisma-error-interceptor'
import {
  AccessRequest,
  ContainerStatusListMessage,
  CreateEntityResponse,
  CreateNodeRequest,
  CruxNodeController,
  CruxNodeControllerMethods,
  Empty,
  IdRequest,
  NodeDetailsResponse,
  NodeEventMessage,
  NodeInstallResponse,
  NodeListResponse,
  NodeScriptResponse,
  ServiceIdRequest,
  UpdateNodeRequest,
  WatchContainerStatusRequest,
} from 'src/proto/proto/crux'
import { DisableTeamAccessCheck } from 'src/shared/team-access.guard'
import { NodeTeamAccessGuard } from './guards/node.team-access.guard'
import { NodeService } from './node.service'
import { NodeGenerateScriptValidationPipe } from './pipes/node.generate-script.pipe'
import { NodeGetScriptValidationPipe } from './pipes/node.get-script.pipe'

@Controller()
@CruxNodeControllerMethods()
@UseGuards(NodeTeamAccessGuard)
@UseInterceptors(PrismaErrorInterceptor, GrpcContextLogger, AuditLoggerInterceptor)
export class NodeController implements CruxNodeController {
  constructor(private service: NodeService) {}

  async getNodes(request: AccessRequest): Promise<NodeListResponse> {
    return await this.service.getNodes(request)
  }

  async createNode(request: CreateNodeRequest): Promise<CreateEntityResponse> {
    return await this.service.createNode(request)
  }

  async deleteNode(request: IdRequest): Promise<void> {
    await this.service.deleteNode(request)
  }

  async updateNode(request: UpdateNodeRequest): Promise<Empty> {
    return await this.service.updateNode(request)
  }

  async getNodeDetails(request: IdRequest): Promise<NodeDetailsResponse> {
    return await this.service.getNodeDetails(request)
  }

  // todo:  fix errors related to this - interceptor halts
  @AuditLogLevel('disabled')
  async generateScript(@Body(NodeGenerateScriptValidationPipe) request: IdRequest): Promise<NodeInstallResponse> {
    return await this.service.generateScript(request)
  }

  @DisableTeamAccessCheck()
  @AuditLogLevel('disabled')
  async getScript(@Body(NodeGetScriptValidationPipe) request: ServiceIdRequest): Promise<NodeScriptResponse> {
    return await this.service.getScript(request)
  }

  async discardScript(request: IdRequest): Promise<Empty> {
    return await this.service.discardScript(request)
  }

  async revokeToken(request: IdRequest): Promise<Empty> {
    return await this.service.revokeToken(request)
  }

  @AuditLogLevel('disabled')
  @DisableTeamAccessCheck()
  subscribeNodeEventChannel(request: ServiceIdRequest): Observable<NodeEventMessage> {
    return from(this.service.handleSubscribeNodeEventChannel(request)).pipe(concatAll())
  }

  @AuditLogLevel('disabled')
  watchContainerStatus(request: WatchContainerStatusRequest): Observable<ContainerStatusListMessage> {
    return this.service.handleWatchContainerStatus(request)
  }
}
