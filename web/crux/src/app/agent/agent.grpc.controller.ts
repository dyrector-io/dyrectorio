import { Metadata } from '@grpc/grpc-js'
import { Controller, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common'
import { Observable } from 'rxjs'
import GrpcExceptionFilter from 'src/filters/grpc.exception-filter'
import {
  AgentAbortUpdate,
  AgentCommand,
  AgentCommandError,
  AgentControllerMethods,
  AgentInfo,
  AgentController as GrpcAgentController,
} from 'src/grpc/protobuf/proto/agent'
import {
  ContainerInspectResponse,
  ContainerLogListResponse,
  ContainerLogMessage,
  ContainerStateListMessage,
  DeploymentStatusMessage,
  Empty,
  ListSecretsResponse,
} from 'src/grpc/protobuf/proto/common'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'
import { NodeGrpcCall } from 'src/shared/grpc-node-connection'
import AgentService from './agent.service'
import AgentAuthGuard from './guards/agent.auth.guard'

@Controller()
@AgentControllerMethods()
@UseFilters(GrpcExceptionFilter)
@UseGuards(AgentAuthGuard)
@UseInterceptors(PrismaErrorInterceptor)
export default class AgentController implements GrpcAgentController {
  constructor(private service: AgentService) {}

  connect(request: AgentInfo, _: Metadata, call: NodeGrpcCall): Observable<AgentCommand> {
    return this.service.handleConnect(call.connection, request)
  }

  deploymentStatus(request: Observable<DeploymentStatusMessage>, _: Metadata, call: NodeGrpcCall): Observable<Empty> {
    return this.service.handleDeploymentStatus(call.connection, request)
  }

  containerState(request: Observable<ContainerStateListMessage>, _: Metadata, call: NodeGrpcCall): Observable<Empty> {
    return this.service.handleContainerState(call.connection, request)
  }

  secretList(request: ListSecretsResponse, _: Metadata, call: NodeGrpcCall): Observable<Empty> {
    return this.service.handleSecretList(call.connection, request)
  }

  abortUpdate(request: AgentAbortUpdate, _: Metadata, call: NodeGrpcCall): Empty {
    return this.service.updateAborted(call.connection, request)
  }

  deleteContainers(_: Empty, __: Metadata, call: NodeGrpcCall): Empty {
    return this.service.handleDeleteContainers(call.connection)
  }

  containerLogStream(request: Observable<ContainerLogMessage>, _: Metadata, call: NodeGrpcCall): Observable<Empty> {
    return this.service.handleContainerLogStream(call.connection, request)
  }

  containerLog(request: ContainerLogListResponse, _: Metadata, call: NodeGrpcCall): Empty {
    return this.service.handleContainerLog(call.connection, request)
  }

  containerInspect(request: ContainerInspectResponse, _: Metadata, call: NodeGrpcCall): Empty {
    return this.service.handleContainerInspect(call.connection, request)
  }

  commandError(request: AgentCommandError, _: Metadata, call: NodeGrpcCall): Empty {
    return this.service.handleCommandError(call.connection, request)
  }

  async tokenReplaced(_: Empty, __: Metadata, call: NodeGrpcCall): Promise<Empty> {
    return await this.service.tokenReplaced(call.connection)
  }
}
