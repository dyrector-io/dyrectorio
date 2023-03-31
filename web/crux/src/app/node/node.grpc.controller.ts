import { Controller } from '@nestjs/common'
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
import { DisableAuth } from '../token/jwt-auth.guard'
import NodeService from './node.service'

@Controller()
@CruxNodeControllerMethods()
@UseGrpcInterceptors()
export default class NodeGrcpController implements CruxNodeController {
  constructor(private service: NodeService) {}

  @DisableAuth()
  @AuditLogLevel('disabled')
  subscribeNodeEventChannel(request: ServiceIdRequest): Observable<NodeEventMessage> {
    return from(this.service.handleSubscribeNodeEventChannel(request)).pipe(concatAll())
  }

  @DisableAuth()
  @AuditLogLevel('disabled')
  watchContainerState(request: WatchContainerStateRequest): Observable<ContainerStateListMessage> {
    return this.service.handleWatchContainerStatus(request)
  }

  @DisableAuth()
  @AuditLogLevel('disabled')
  subscribeContainerLogChannel(request: WatchContainerLogRequest): Observable<ContainerLogMessage> {
    return this.service.handleContainerLogStream(request)
  }
}
