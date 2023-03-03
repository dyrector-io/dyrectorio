import { Logger } from '@app/logger'
import {
  Container,
  ContainerCommand,
  ContainerIdentifier,
  ContainerListMessage,
  ContainerLogMessage,
  CreateDyoNode,
  DeleteContainers,
  DyoNode,
  DyoNodeDetails,
  DyoNodeInstall,
  DyoNodeScript,
  NodeStatusMessage,
  UpdateDyoNode,
} from '@app/models'
import {
  ContainerIdentifier as ProtoContainerIdentifier,
  ContainerLogMessage as GrpcContainerLogMessage,
  ContainerStateListMessage,
  Empty,
} from '@app/models/grpc/protobuf/proto/common'
import {
  CreateEntityResponse,
  CreateNodeRequest,
  CruxNodeClient,
  DagentTraefikOptions,
  GenerateScriptRequest,
  IdRequest,
  NodeContainerCommandRequest,
  NodeDeleteContainersRequest,
  NodeDetailsResponse,
  NodeEventMessage,
  NodeInstallResponse,
  NodeListResponse,
  NodeScriptResponse,
  NodeScriptType as ProtoNodeScriptType,
  NodeType as ProtoNodeType,
  ServiceIdRequest,
  UpdateNodeRequest,
  WatchContainerLogRequest,
  WatchContainerStateRequest,
} from '@app/models/grpc/protobuf/proto/crux'
import { timestampToUTC } from '@app/utils'
import { GrpcConnection, protomisify, ProtoSubscriptionOptions } from './grpc-connection'
import {
  containerIdentifierToProto,
  containerOperationToProto,
  containerStateToDto,
  nodeStatusToDto,
  nodeTypeGrpcToUi,
} from './mappers/node-mappers'

class DyoNodeService {
  private logger = new Logger(DyoNodeService.name)

  constructor(private client: CruxNodeClient, private cookie: string) {}

  async getAll(): Promise<DyoNode[]> {
    const nodes = await protomisify<Empty, NodeListResponse>(this.client, this.client.getNodes, this.cookie)(Empty, {})

    return nodes.data.map(it => ({
      ...it,
      connectedAt: timestampToUTC(it.connectedAt),
      status: nodeStatusToDto(it.status),
      type: nodeTypeGrpcToUi(it.type),
    }))
  }

  async create(dto: CreateDyoNode): Promise<DyoNode> {
    const req: CreateNodeRequest = {
      ...dto,
    }

    const res = await protomisify<CreateNodeRequest, CreateEntityResponse>(
      this.client,
      this.client.createNode,
      this.cookie,
    )(CreateNodeRequest, req)

    return {
      ...dto,
      id: res.id,
      connectedAt: timestampToUTC(res.createdAt),
      status: 'unreachable',
      type: 'docker',
      updating: false,
    }
  }

  async update(id: string, dto: UpdateDyoNode): Promise<void> {
    const req: UpdateNodeRequest = {
      ...dto,
      id,
    }

    await protomisify<UpdateNodeRequest, Empty>(
      this.client,
      this.client.updateNode,
      this.cookie,
    )(UpdateNodeRequest, req)
  }

  async delete(id: string): Promise<void> {
    const req: IdRequest = {
      id,
    }

    await protomisify<IdRequest, Empty>(this.client, this.client.deleteNode, this.cookie)(IdRequest, req)
  }

  async getNodeDetails(id: string): Promise<DyoNodeDetails> {
    const req: IdRequest = {
      id,
    }

    const res = await protomisify<IdRequest, NodeDetailsResponse>(
      this.client,
      this.client.getNodeDetails,
      this.cookie,
    )(IdRequest, req)

    return {
      ...res,
      connectedAt: timestampToUTC(res.connectedAt),
      status: nodeStatusToDto(res.status),
      type: nodeTypeGrpcToUi(res.type),
      install: !res.install
        ? null
        : {
            command: res.install.command,
            expireAt: timestampToUTC(res.install.expireAt),
            script: res.script.content,
          },
    }
  }

  async generateScript(
    id: string,
    nodeType: ProtoNodeType,
    scriptType: ProtoNodeScriptType,
    rootPath?: string,
    dagentTraefik?: DagentTraefikOptions,
  ): Promise<DyoNodeInstall> {
    const req: GenerateScriptRequest = {
      id,
      type: nodeType,
      rootPath: rootPath ? rootPath.trim() : undefined,
      scriptType,
      dagentTraefik,
    }

    const res = await protomisify<GenerateScriptRequest, NodeInstallResponse>(
      this.client,
      this.client.generateScript,
      this.cookie,
    )(GenerateScriptRequest, req)

    const script = await this.getScript(id)

    return {
      command: res.command,
      expireAt: timestampToUTC(res.expireAt),
      script: script.content,
    }
  }

  // downloads the script
  async getScript(id: string): Promise<DyoNodeScript> {
    const req: ServiceIdRequest = {
      id,
    }

    const res = await protomisify<ServiceIdRequest, NodeScriptResponse>(
      this.client,
      this.client.getScript,
      this.cookie,
    )(IdRequest, req)

    return {
      content: res.content,
    }
  }

  async discardScript(id: string): Promise<Empty> {
    const req: IdRequest = { id }
    return await protomisify<IdRequest, Empty>(this.client, this.client.discardScript, this.cookie)(IdRequest, req)
  }

  async revokeToken(id: string): Promise<Empty> {
    const req: IdRequest = { id }
    return await protomisify<IdRequest, Empty>(this.client, this.client.revokeToken, this.cookie)(IdRequest, req)
  }

  async updateNodeAgent(id: string): Promise<void> {
    const req: IdRequest = {
      id,
    }

    await protomisify<IdRequest, Empty>(this.client, this.client.updateNodeAgent, this.cookie)(IdRequest, req)
  }

  async sendContainerCommand(id: string, command: ContainerCommand) {
    const req: NodeContainerCommandRequest = {
      id,
      command: {
        container: containerIdentifierToProto(command.container),
        operation: containerOperationToProto(command.operation),
      },
    }

    await protomisify<NodeContainerCommandRequest, Empty>(
      this.client,
      this.client.sendContainerCommand,
      this.cookie,
    )(NodeContainerCommandRequest, req)
  }

  async deleteContainer(id: string, containers: DeleteContainers) {
    let container: ProtoContainerIdentifier = null
    let prefix: string = null

    if (containers.prefix) {
      prefix = containers.prefix
    } else {
      container = containerIdentifierToProto(containers.id)
    }

    const req: NodeDeleteContainersRequest = {
      id,
      containers: {
        container,
        prefix,
      },
    }

    await protomisify<NodeDeleteContainersRequest, Empty>(
      this.client,
      this.client.deleteContainers,
      this.cookie,
    )(NodeDeleteContainersRequest, req)
  }

  subscribeToNodeEvents(
    teamId: string,
    options: ProtoSubscriptionOptions<NodeStatusMessage>,
  ): GrpcConnection<NodeEventMessage, NodeStatusMessage> {
    const req: ServiceIdRequest = {
      id: teamId,
    }

    const transform = (data: NodeEventMessage) =>
      ({
        nodeId: data.id,
        status: nodeStatusToDto(data.status),
        address: data.address,
        version: data.version,
        connectedAt: timestampToUTC(data.connectedAt),
        error: data.error,
        updating: data.updating,
      } as NodeStatusMessage)

    const stream = () => this.client.subscribeNodeEventChannel(ServiceIdRequest.fromJSON(req))
    return new GrpcConnection(this.logger.descend('events'), stream, transform, options)
  }

  watchContainerState(
    nodeId: string,
    prefix: string | undefined,
    options: ProtoSubscriptionOptions<ContainerListMessage>,
  ): GrpcConnection<ContainerStateListMessage, ContainerListMessage> {
    const req: WatchContainerStateRequest = {
      nodeId,
      prefix,
    }

    const transform = (data: ContainerStateListMessage) =>
      data.data.map(
        it =>
          ({
            id: it.id,
            date: timestampToUTC(it.createdAt),
            state: containerStateToDto(it.state),
            ports: it.ports,
            imageName: it.imageName,
            imageTag: it.imageTag,
          } as Container),
      ) as ContainerListMessage

    const stream = () => this.client.watchContainerState(WatchContainerStateRequest.fromJSON(req))
    return new GrpcConnection(this.logger.descend('container-status'), stream, transform, options)
  }

  watchContainerLog(
    nodeId: string,
    container: ContainerIdentifier,
    options: ProtoSubscriptionOptions<ContainerLogMessage>,
  ): GrpcConnection<GrpcContainerLogMessage, ContainerLogMessage> {
    const req: WatchContainerLogRequest = {
      nodeId,
      container: containerIdentifierToProto(container),
    }

    const transform = (data: GrpcContainerLogMessage) =>
      ({
        log: data.log,
      } as ContainerLogMessage)

    const stream = () => this.client.subscribeContainerLogChannel(WatchContainerLogRequest.fromJSON(req))
    return new GrpcConnection(this.logger.descend('container-log'), stream, transform, options)
  }
}

export default DyoNodeService
