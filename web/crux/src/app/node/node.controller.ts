import { Controller, UseGuards } from '@nestjs/common'
import { concatAll, from, Observable } from 'rxjs'
import { AuditLogLevel } from 'src/decorators/audit-logger.decorator'
import UseGrpcInterceptors from 'src/decorators/grpc-interceptors.decorator'
import { ContainerLogMessage, ContainerStateListMessage } from 'src/grpc/protobuf/proto/common'
import {
  CruxNodeController,
  CruxNodeControllerMethods,
  NodeEventMessage,
  ServiceIdRequest,
  WatchContainerLogRequest,
  WatchContainerStateRequest,
} from 'src/grpc/protobuf/proto/crux'
import { DisableAccessCheck, DisableIdentity } from 'src/shared/user-access.guard'
import NodeTeamAccessGuard from './guards/node.team-access.guard'
import NodeService from './node.service'

@Controller()
@CruxNodeControllerMethods()
@UseGuards(NodeTeamAccessGuard)
@UseGrpcInterceptors()
export default class NodeController implements CruxNodeController {
  constructor(private service: NodeService) {}

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

  @DisableAccessCheck()
  @DisableIdentity()
  @AuditLogLevel('disabled')
  subscribeContainerLogChannel(request: WatchContainerLogRequest): Observable<ContainerLogMessage> {
    return this.service.handleContainerLogStream(request)
  }
}
