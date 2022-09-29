import { Metadata } from '@grpc/grpc-js'
import { Controller, UseGuards } from '@nestjs/common'
import { Observable } from 'rxjs'
import {
  AgentCommand,
  AgentController as GrpcAgentController,
  AgentControllerMethods,
  AgentInfo,
  ContainerStateListMessage,
  Empty,
} from 'src/grpc/protobuf/proto/agent'
import { DeploymentStatusMessage, ListSecretsResponse } from 'src/grpc/protobuf/proto/common'
import { NodeUnaryCall } from 'src/shared/grpc-node-connection'
import AgentService from './agent.service'
import AgentAuthGuard from './guards/agent.auth.guard'

@Controller()
@AgentControllerMethods()
@UseGuards(AgentAuthGuard)
export default class AgentController implements GrpcAgentController {
  constructor(private service: AgentService) {}

  connect(request: AgentInfo, _: Metadata, call: NodeUnaryCall): Observable<AgentCommand> {
    return this.service.handleConnect(call.connection, request)
  }

  deploymentStatus(request: Observable<DeploymentStatusMessage>, _: Metadata, call: NodeUnaryCall): Observable<Empty> {
    return this.service.handleDeploymentStatus(call.connection, request)
  }

  containerState(request: Observable<ContainerStateListMessage>, _: Metadata, call: NodeUnaryCall): Observable<Empty> {
    return this.service.handleContainerStatus(call.connection, request)
  }

  // todo(nandor-magyar): impl
  /* eslint-disable @typescript-eslint/no-unused-vars */
  getSecretList(
    request: ListSecretsResponse,
    metadata: Metadata,
    ...rest: any
  ): Empty | Promise<Empty> | Observable<Empty> {
    return Empty
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */
}
