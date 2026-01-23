import { Metadata } from '@grpc/grpc-js'
import { Controller, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common'
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices'
import { Observable } from 'rxjs'
import GrpcExceptionFilter from 'src/filters/grpc.exception-filter'
import {
  AgentAbortUpdate,
  AgentCommand,
  AgentCommandError,
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

const AGENT_SERVICE = 'Agent'

@Controller()
@UseFilters(GrpcExceptionFilter)
@UseGuards(AgentAuthGuard)
@UseInterceptors(PrismaErrorInterceptor)
export default class AgentController implements GrpcAgentController {
  constructor(private service: AgentService) {}

  @GrpcMethod(AGENT_SERVICE)
  connect(request: AgentInfo, _: Metadata, call: NodeGrpcCall): Observable<AgentCommand> {
    return this.service.handleConnect(call.connection, request)
  }

  @GrpcStreamMethod(AGENT_SERVICE)
  deploymentStatus(request: Observable<DeploymentStatusMessage>, _: Metadata, call: NodeGrpcCall): Observable<Empty> {
    return this.service.handleDeploymentStatus(call.connection, request)
  }

  @GrpcStreamMethod(AGENT_SERVICE)
  containerState(request: Observable<ContainerStateListMessage>, _: Metadata, call: NodeGrpcCall): Observable<Empty> {
    return this.service.handleContainerState(call.connection, request)
  }

  @GrpcMethod(AGENT_SERVICE)
  secretList(request: ListSecretsResponse, _: Metadata, call: NodeGrpcCall): Observable<Empty> {
    return this.service.handleSecretList(call.connection, request)
  }

  @GrpcMethod(AGENT_SERVICE)
  abortUpdate(request: AgentAbortUpdate, _: Metadata, call: NodeGrpcCall): Empty {
    return this.service.updateAborted(call.connection, request)
  }

  @GrpcMethod(AGENT_SERVICE)
  deleteContainers(_: Empty, __: Metadata, call: NodeGrpcCall): Empty {
    return this.service.handleDeleteContainers(call.connection)
  }

  @GrpcStreamMethod(AGENT_SERVICE)
  containerLogStream(request: Observable<ContainerLogMessage>, _: Metadata, call: NodeGrpcCall): Observable<Empty> {
    return this.service.handleContainerLogStream(call.connection, request)
  }

  @GrpcMethod(AGENT_SERVICE)
  containerLog(request: ContainerLogListResponse, _: Metadata, call: NodeGrpcCall): Empty {
    return this.service.handleContainerLog(call.connection, request)
  }

  @GrpcMethod(AGENT_SERVICE)
  containerInspect(request: ContainerInspectResponse, _: Metadata, call: NodeGrpcCall): Empty {
    return this.service.handleContainerInspect(call.connection, request)
  }

  @GrpcMethod(AGENT_SERVICE)
  commandError(request: AgentCommandError, _: Metadata, call: NodeGrpcCall): Empty {
    return this.service.handleCommandError(call.connection, request)
  }

  @GrpcMethod(AGENT_SERVICE)
  async tokenReplaced(_: Empty, __: Metadata, call: NodeGrpcCall): Promise<Empty> {
    return await this.service.tokenReplaced(call.connection)
  }
}
