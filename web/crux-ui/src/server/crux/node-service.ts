import { Logger } from '@app/logger'
import {
  Container,
  ContainerListMessage,
  ContainerStatus,
  CreateDyoNode,
  DyoNode,
  DyoNodeDetails,
  DyoNodeInstall,
  DyoNodeScript,
  NodeStatus,
  NodeStatusMessage,
  UiNodeType,
  UpdateDyoNode,
} from '@app/models'
import {
  AccessRequest,
  ContainerStatus as ProtoContainerStatus,
  ContainerStatusListMessage,
  containerStatusToJSON,
  CreateEntityResponse,
  CreateNodeRequest,
  CruxNodeClient,
  Empty,
  GenerateScriptRequest,
  IdRequest,
  NodeConnectionStatus,
  NodeDetailsResponse,
  NodeEventMessage,
  NodeInstallResponse,
  NodeListResponse,
  NodeScriptResponse,
  NodeType,
  ServiceIdRequest,
  UpdateNodeRequest,
  WatchContainerStatusRequest,
} from '@app/models/grpc/protobuf/proto/crux'
import { timestampToUTC } from '@app/utils'
import { Identity } from '@ory/kratos-client'
import { protomisify } from '@server/crux/grpc-connection'
import { GrpcConnection, ProtoSubscriptionOptions } from './grpc-connection'

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

    return nodes.data.map(it => {
      return {
        ...it,
        connectedAt: timestampToUTC(it.connectedAt),
        status: this.statusToDto(it.status),
        type: it.type == NodeType.DOCKER_NODE ? 'docker' : 'k8s',
      }
    })
  }

  async create(dto: CreateDyoNode): Promise<DyoNode> {
    const req: CreateNodeRequest = {
      ...dto,
      accessedBy: this.identity.id,
      type: dto.type == 'docker' ? NodeType.DOCKER_NODE : NodeType.K8S_NODE,
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
    }
  }

  async update(id: string, dto: UpdateDyoNode): Promise<void> {
    const req: UpdateNodeRequest = {
      ...dto,
      id,
      accessedBy: this.identity.id,
      type: dto.type == 'docker' ? NodeType.DOCKER_NODE : NodeType.K8S_NODE,
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
      status: this.statusToDto(res.status),
      type: res.type === NodeType.DOCKER_NODE ? 'docker' : 'k8s',
      install: !res.install
        ? null
        : {
            command: res.install.command,
            expireAt: timestampToUTC(res.install.expireAt),
            script: res.script.content,
          },
    }
  }

  async generateScript(id: string, nodeType: UiNodeType): Promise<DyoNodeInstall> {
    const req: GenerateScriptRequest = {
      id,
      accessedBy: this.identity.id,
      type: nodeType === 'docker' ? NodeType.DOCKER_NODE : NodeType.K8S_NODE,
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

    const transform = (data: NodeEventMessage) => {
      return {
        nodeId: data.id,
        status: this.statusToDto(data.status),
        address: data.address,
      } as NodeStatusMessage
    }

    const stream = () => this.client.subscribeNodeEventChannel(ServiceIdRequest.fromJSON(req))
    return new GrpcConnection(this.logger.descend('events'), stream, transform, options)
  }

  watchContainerStatus(
    nodeId: string,
    prefix: string | undefined,
    options: ProtoSubscriptionOptions<ContainerListMessage>,
  ): GrpcConnection<ContainerStatusListMessage, ContainerListMessage> {
    const req: WatchContainerStatusRequest = {
      nodeId,
      prefix,
      accessedBy: this.identity.id,
    }

    const transform = (data: ContainerStatusListMessage) => {
      return data.data.map(it => {
        return {
          id: it.containerId,
          name: it.name,
          date: timestampToUTC(it.createdAt),
          status: containerStatusToDto(it.status),
        } as Container
      }) as ContainerListMessage
    }

    const stream = () => this.client.watchContainerStatus(WatchContainerStatusRequest.fromJSON(req))
    return new GrpcConnection(this.logger.descend('container-status'), stream, transform, options)
  }

  statusToDto(status: NodeConnectionStatus): NodeStatus {
    switch (status) {
      case NodeConnectionStatus.CONNECTED:
        return 'running'
      case NodeConnectionStatus.UNREACHABLE:
        return 'unreachable'
      default:
        return 'unreachable'
    }
  }
}

export default DyoNodeService

export const containerStatusToDto = (status: ProtoContainerStatus): ContainerStatus =>
  containerStatusToJSON(status).toLocaleLowerCase() as ContainerStatus
