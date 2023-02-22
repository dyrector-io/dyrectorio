import { Injectable, Logger } from '@nestjs/common'
import { Observable } from 'rxjs'
import { BaseMessage } from 'src/domain/notification-templates'
import { PreconditionFailedException } from 'src/exception/errors'
import { CloseReason } from 'src/grpc/protobuf/proto/agent'
import { ContainerLogMessage, ContainerStateListMessage, Empty } from 'src/grpc/protobuf/proto/common'
import {
  CreateEntityResponse,
  CreateNodeRequest,
  GenerateScriptRequest,
  IdRequest,
  NodeContainerCommandRequest,
  NodeDeleteContainersRequest,
  NodeDetailsResponse,
  NodeEventMessage,
  NodeInstallResponse,
  NodeListResponse,
  NodeScriptResponse,
  ServiceIdRequest,
  UpdateNodeRequest,
  WatchContainerLogRequest,
  WatchContainerStateRequest,
} from 'src/grpc/protobuf/proto/crux'
import DomainNotificationService from 'src/services/domain.notification.service'
import PrismaService from 'src/services/prisma.service'
import AgentService from '../agent/agent.service'
import TeamRepository from '../team/team.repository'
import NodeMapper from './node.mapper'

@Injectable()
export default class NodeService {
  private readonly logger = new Logger(NodeService.name)

  constructor(
    private teamRepository: TeamRepository,
    private prisma: PrismaService,
    private agentService: AgentService,
    private mapper: NodeMapper,
    private notificationService: DomainNotificationService,
  ) {}

  async getNodes(accessedBy: string): Promise<NodeListResponse> {
    const nodes = await this.prisma.node.findMany({
      where: {
        team: {
          users: {
            some: {
              userId: accessedBy,
              active: true,
            },
          },
        },
      },
    })

    return {
      data: nodes.map(it => this.mapper.listItemToProto(it)),
    }
  }

  async getNodeDetails(req: IdRequest): Promise<NodeDetailsResponse> {
    const node = await this.prisma.node.findUniqueOrThrow({
      where: {
        id: req.id,
      },
    })

    return this.mapper.detailsToProto(node)
  }

  async createNode(req: CreateNodeRequest, accessedBy: string): Promise<CreateEntityResponse> {
    const team = await this.teamRepository.getActiveTeamByUserId(accessedBy)

    const node = await this.prisma.node.create({
      data: {
        name: req.name,
        description: req.description,
        icon: req.icon ?? null,
        teamId: team.teamId,
        createdBy: accessedBy,
      },
    })

    await this.notificationService.sendNotification({
      identityId: accessedBy,
      messageType: 'node',
      message: { subject: node.name } as BaseMessage,
    })

    return CreateEntityResponse.fromJSON(node)
  }

  async deleteNode(req: IdRequest): Promise<void> {
    await this.prisma.node.delete({
      where: {
        id: req.id,
      },
    })

    const agent = this.agentService.getById(req.id)
    if (agent) {
      agent.close(CloseReason.SHUTDOWN)
    }
  }

  async updateNode(req: UpdateNodeRequest, accessedBy: string): Promise<Empty> {
    await this.prisma.node.update({
      where: {
        id: req.id,
      },
      data: {
        name: req.name,
        description: req.description,
        icon: req.icon ?? null,
        updatedBy: accessedBy,
      },
    })

    return Empty
  }

  async generateScript(req: GenerateScriptRequest, accessedBy: string): Promise<NodeInstallResponse> {
    const nodeType = this.mapper.nodeTypeToDb(req.type)

    await this.prisma.node.update({
      where: {
        id: req.id,
      },
      data: {
        type: nodeType,
        updatedBy: accessedBy,
      },
    })

    const installer = await this.agentService.install(
      req.id,
      nodeType,
      req.rootPath ?? null,
      req.scriptType,
      req.dagentTraefik ?? null,
    )

    return this.mapper.installerToProto(installer)
  }

  async getScript(request: ServiceIdRequest): Promise<NodeScriptResponse> {
    const node = await this.prisma.node.findUniqueOrThrow({
      where: {
        id: request.id,
      },
      select: {
        name: true,
        type: true,
      },
    })

    const installer = this.agentService.getInstallerByNodeId(request.id)

    return {
      content: installer.getScript(node.name),
    }
  }

  async discardScript(request: IdRequest): Promise<Empty> {
    await this.agentService.discardInstaller(request.id)
    return Empty
  }

  async revokeToken(request: IdRequest, accessedBy: string): Promise<Empty> {
    await this.prisma.node.update({
      where: {
        id: request.id,
      },
      data: {
        token: null,
        updatedBy: accessedBy,
      },
    })

    this.agentService.kick(request.id)
    return Empty
  }

  async handleSubscribeNodeEventChannel(request: ServiceIdRequest): Promise<Observable<NodeEventMessage>> {
    return await this.agentService.getNodeEventsByTeam(request.id)
  }

  handleWatchContainerStatus(request: WatchContainerStateRequest): Observable<ContainerStateListMessage> {
    this.logger.debug(`Opening container status channel for prefix: ${request.nodeId} - ${request.prefix}`)

    const agent = this.agentService.getByIdOrThrow(request.nodeId)

    const prefix = request.prefix ?? ''
    const watcher = agent.upsertContainerStatusWatcher(prefix)
    return watcher.watch()
  }

  handleContainerLogStream(request: WatchContainerLogRequest): Observable<ContainerLogMessage> {
    this.logger.debug(
      `Opening container log stream for container: ${request.id} - '${
        request.id ?? `${request.prefixName.prefix}-${request.prefixName.name}`
      }'`,
    )

    const agent = this.agentService.getById(request.id)

    if (!agent) {
      throw new PreconditionFailedException({
        message: 'Node is unreachable',
        property: 'nodeId',
        value: request.id,
      })
    }

    const stream = agent.upsertContainerLogStream(request.dockerId, request.prefixName)
    return stream.watch()
  }

  async updateNodeAgent(request: IdRequest): Promise<void> {
    this.agentService.updateAgent(request.id)
  }

  sendContainerCommand(request: NodeContainerCommandRequest): Empty {
    const agent = this.agentService.getByIdOrThrow(request.id)
    agent.sendContainerCommand(request.command)

    return Empty
  }

  deleteContainers(request: NodeDeleteContainersRequest): Observable<Empty> {
    const agent = this.agentService.getByIdOrThrow(request.id)
    return agent.deleteContainers(request.containers)
  }
}
