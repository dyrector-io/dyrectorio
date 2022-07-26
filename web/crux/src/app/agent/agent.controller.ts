import { Metadata } from '@grpc/grpc-js'
import { Controller, UseGuards } from '@nestjs/common'
import { Observable } from 'rxjs'
import {
  AgentCommand,
  AgentController as GrpcAgentController,
  AgentControllerMethods,
  AgentInfo,
  Empty,
} from 'src/grpc/protobuf/proto/agent'
import { ContainerStatusListMessage, DeploymentStatusMessage } from 'src/grpc/protobuf/proto/crux'
import { NodeUnaryCall } from 'src/shared/grpc-node-connection'
import { AgentService } from './agent.service'
import { AgentAuthGuard } from './guards/agent.auth.guard'

@Controller()
@AgentControllerMethods()
@UseGuards(AgentAuthGuard)
export class AgentController implements GrpcAgentController {
  constructor(private service: AgentService) {}

  connect(request: AgentInfo, _: Metadata, call: NodeUnaryCall): Observable<AgentCommand> {
    return this.service.handleConnect(call.connection, request)
  }

  deploymentStatus(request: Observable<DeploymentStatusMessage>, _: Metadata, call: NodeUnaryCall): Observable<Empty> {
    return this.service.handleDeploymentStatus(call.connection, request)
  }

  containerStatus(
    request: Observable<ContainerStatusListMessage>,
    _: Metadata,
    call: NodeUnaryCall,
  ): Observable<Empty> {
    return this.service.handleContainerStatus(call.connection, request)
  }
}
