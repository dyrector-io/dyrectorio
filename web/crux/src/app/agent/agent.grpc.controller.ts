import { Metadata } from '@grpc/grpc-js'
import { Controller, UseGuards, UseInterceptors } from '@nestjs/common'
import { Observable } from 'rxjs'
import {
  AgentAbortUpdate,
  AgentCommand,
  AgentController as GrpcAgentController,
  AgentControllerMethods,
  AgentInfo,
} from 'src/grpc/protobuf/proto/agent'
import {
  ContainerLogMessage,
  ContainerStateListMessage,
  DeleteContainersRequest,
  DeploymentStatusMessage,
  Empty,
  ListSecretsResponse,
} from 'src/grpc/protobuf/proto/common'
import GrpcErrorInterceptor from 'src/interceptors/grpc.error.interceptor'
import GrpcLoggerInterceptor from 'src/interceptors/grpc.logger.interceptor'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'
import { NodeGrpcCall } from 'src/shared/grpc-node-connection'
import AgentService from './agent.service'
import AgentAuthGuard from './guards/agent.auth.guard'

@Controller()
@AgentControllerMethods()
@UseGuards(AgentAuthGuard)
@UseInterceptors(GrpcLoggerInterceptor, GrpcErrorInterceptor, PrismaErrorInterceptor)
export default class AgentController implements GrpcAgentController {
  constructor(private service: AgentService) {}

  connect(request: AgentInfo, _: Metadata, call: NodeGrpcCall): Observable<AgentCommand> {
    return this.service.handleConnect(call.connection, request)
  }

  deploymentStatus(request: Observable<DeploymentStatusMessage>, _: Metadata, call: NodeGrpcCall): Observable<Empty> {
    return this.service.handleDeploymentStatus(call.connection, request)
  }

  containerState(request: Observable<ContainerStateListMessage>, _: Metadata, call): Observable<Empty> {
    return this.service.handleContainerState(call.connection, request)
  }

  secretList(request: ListSecretsResponse, _: Metadata, call: NodeGrpcCall): Observable<Empty> {
    return this.service.handleSecretList(call.connection, request)
  }

  abortUpdate(request: AgentAbortUpdate, _: Metadata, call: NodeGrpcCall): Empty {
    return this.service.updateAborted(call.connection, request)
  }

  deleteContainers(request: DeleteContainersRequest, _: Metadata, call: NodeGrpcCall): Empty {
    return this.service.containersDeleted(call.connection, request)
  }

  containerLog(request: Observable<ContainerLogMessage>, _: Metadata, call: NodeGrpcCall): Observable<Empty> {
    return this.service.handleContainerLog(call.connection, request)
  }
}
