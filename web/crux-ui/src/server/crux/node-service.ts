import { Logger } from '@app/logger'
import {
  Container,
  ContainerListMessage,
  CreateDyoNode,
  DyoNode,
  DyoNodeDetails,
  DyoNodeInstall,
  DyoNodeScript,
  NodeStatusMessage,
  UpdateDyoNode,
} from '@app/models'
import {
  AccessRequest,
  ContainerStateListMessage,
  CreateEntityResponse,
  CreateNodeRequest,
  CruxNodeClient,
  Empty,
  GenerateScriptRequest,
  IdRequest,
  NodeDetailsResponse,
  NodeEventMessage,
  NodeInstallResponse,
  NodeListResponse,
  NodeScriptResponse,
  NodeType as ProtoNodeType,
  ServiceIdRequest,
  UpdateNodeRequest,
  WatchContainerStateRequest,
} from '@app/models/grpc/protobuf/proto/crux'
import { timestampToUTC } from '@app/utils'
import { Identity } from '@ory/kratos-client'
import { GrpcConnection, protomisify, ProtoSubscriptionOptions } from './grpc-connection'
import { containerStateToDto, nodeStatusToDto, nodeTypeGrpcToUi } from './mappers/node-mappers'

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

  async generateScript(id: string, nodeType: ProtoNodeType, rootPath?: string): Promise<DyoNodeInstall> {
    const req: GenerateScriptRequest = {
      id,
      accessedBy: this.identity.id,
      type: nodeType,
      rootPath: rootPath ? rootPath.trim() : undefined
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
            id: it.containerId,
            name: it.name,
            date: timestampToUTC(it.createdAt),
            state: containerStateToDto(it.state),
          } as Container),
      ) as ContainerListMessage

    const stream = () => this.client.watchContainerState(WatchContainerStateRequest.fromJSON(req))
    return new GrpcConnection(this.logger.descend('container-status'), stream, transform, options)
  }
}

export default DyoNodeService
