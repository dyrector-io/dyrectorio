import { Logger } from '@app/logger'
import {
  Container,
  ContainerCommand,
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
  ContainerIdentifier,
  ContainerLogMessage as GrpcContainerLogMessage,
  ContainerStateListMessage,
  Empty,
} from '@app/models/grpc/protobuf/proto/common'
import {
  AccessRequest,
  CreateEntityResponse,
  CreateNodeRequest,
  CruxNodeClient,
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
import { Identity } from '@ory/kratos-client'
import { GrpcConnection, protomisify, ProtoSubscriptionOptions } from './grpc-connection'
import {
  containerOperationToProto,
  containerStateToDto,
  nodeStatusToDto,
  nodeTypeGrpcToUi,
} from './mappers/node-mappers'

class DyoNodeService {
  private logger = new Logger(DyoNodeService.name)

  constructor(private client: CruxNodeClient, private identity: Identity) {}

  async getAll(): Promise<DyoNode[]> {
    const req: AccessRequest = {
      accessedBy: this.identity.id,
    }

    const nodes = await protomisify<AccessRequest, NodeListResponse>(this.client, this.client.getNodes)(
      AccessRequest,
      req,
    )

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
      accessedBy: this.identity.id,
    }

    const res = await protomisify<CreateNodeRequest, CreateEntityResponse>(this.client, this.client.createNode)(
      CreateNodeRequest,
      req,
    )

    return {
      ...dto,
      id: res.id,
      connectedAt: timestampToUTC(res.createdAt),
      status: 'unreachable',
      type: 'docker',
    }
  }

  async update(id: string, dto: UpdateDyoNode): Promise<void> {
    const req: UpdateNodeRequest = {
      ...dto,
      id,
      accessedBy: this.identity.id,
    }

    await protomisify<UpdateNodeRequest, Empty>(this.client, this.client.updateNode)(UpdateNodeRequest, req)
  }

  async delete(id: string): Promise<void> {
    const req: IdRequest = {
      id,
      accessedBy: this.identity.id,
    }

    await protomisify<IdRequest, Empty>(this.client, this.client.deleteNode)(IdRequest, req)
  }

  async getNodeDetails(id: string): Promise<DyoNodeDetails> {
    const req: IdRequest = {
      id,
      accessedBy: this.identity.id,
    }

    const res = await protomisify<IdRequest, NodeDetailsResponse>(this.client, this.client.getNodeDetails)(
      IdRequest,
      req,
    )

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
  ): Promise<DyoNodeInstall> {
    const req: GenerateScriptRequest = {
      id,
      accessedBy: this.identity.id,
      type: nodeType,
      rootPath: rootPath ? rootPath.trim() : undefined,
      scriptType,
    }

    const res = await protomisify<ServiceIdRequest, NodeInstallResponse>(this.client, this.client.generateScript)(
      GenerateScriptRequest,
      req,
    )

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

    const res = await protomisify<ServiceIdRequest, NodeScriptResponse>(this.client, this.client.getScript)(
      IdRequest,
      req,
    )

    return {
      content: res.content,
    }
  }

  async discardScript(id: string): Promise<Empty> {
    const req: IdRequest = { id, accessedBy: this.identity.id }
    return await protomisify<IdRequest, Empty>(this.client, this.client.discardScript)(IdRequest, req)
  }

  async revokeToken(id: string): Promise<Empty> {
    const req: IdRequest = { id, accessedBy: this.identity.id }
    return await protomisify<IdRequest, Empty>(this.client, this.client.revokeToken)(IdRequest, req)
  }

  async updateNodeAgent(id: string): Promise<void> {
    const req: IdRequest = {
      id,
      accessedBy: this.identity.id,
    }

    await protomisify<IdRequest, Empty>(this.client, this.client.updateNodeAgent)(IdRequest, req)
  }

  async sendContainerCommand(id: string, command: ContainerCommand) {
    const containerId = typeof command.container === 'string' ? command.container : null

    const req: NodeContainerCommandRequest = {
      id,
      accessedBy: this.identity.id,
      command: {
        id: containerId,
        prefixName: containerId ? null : (command.container as ContainerIdentifier),
        operation: containerOperationToProto(command.operation),
      },
    }

    await protomisify<NodeContainerCommandRequest, Empty>(this.client, this.client.sendContainerCommand)(
      NodeContainerCommandRequest,
      req,
    )
  }

  async deleteContainer(id: string, containers: DeleteContainers) {
    let containerId: string = null
    let prefixName: ContainerIdentifier = null
    let prefix: string = null

    if (containers.prefix) {
      prefix = containers.prefix
    } else if (typeof containers.id === 'string') {
      containerId = containers.id
    } else {
      prefixName = containers.id
    }

    const req: NodeDeleteContainersRequest = {
      id,
      accessedBy: this.identity.id,
      containers: {
        containerId,
        prefixName,
        prefix,
      },
    }

    await protomisify<NodeDeleteContainersRequest, Empty>(this.client, this.client.deleteContainers)(
      NodeDeleteContainersRequest,
      req,
    )
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
      accessedBy: this.identity.id,
    }

    const transform = (data: ContainerStateListMessage) =>
      data.data.map(
        it =>
          ({
            id: it.id,
            prefix: it.prefix,
            name: it.name,
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
    prefix: string,
    name: string,
    options: ProtoSubscriptionOptions<ContainerLogMessage>,
  ): GrpcConnection<GrpcContainerLogMessage, ContainerLogMessage> {
    const req: WatchContainerLogRequest = {
      nodeId,
      accessedBy: this.identity.id,
      prefixName: {
        prefix,
        name,
      },
    }

    const transform = (data: GrpcContainerLogMessage) =>
      ({
        prefix: data.prefixName.prefix,
        name: data.prefixName.name,
        log: data.log,
      } as ContainerLogMessage)

    const stream = () => this.client.subscribeContainerLogChannel(WatchContainerLogRequest.fromJSON(req))
    return new GrpcConnection(this.logger.descend('container-log'), stream, transform, options)
  }
}

export default DyoNodeService
