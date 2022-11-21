import { Injectable, Logger } from '@nestjs/common'
import { Observable } from 'rxjs'
import {
  AccessRequest,
  CreateEntityResponse,
  CreateNodeRequest,
  GenerateScriptRequest,
  IdRequest,
  NodeDetailsResponse,
  NodeEventMessage,
  NodeInstallResponse,
  NodeListResponse,
  NodeScriptResponse,
  ServiceIdRequest,
  UpdateNodeRequest,
  WatchContainerStateRequest,
} from 'src/grpc/protobuf/proto/crux'
import { ContainerStateListMessage, Empty } from 'src/grpc/protobuf/proto/common'
import PrismaService from 'src/services/prisma.service'
import DomainNotificationService from 'src/services/domain.notification.service'
import { BaseMessage } from 'src/domain/notification-templates'
import { PreconditionFailedException } from 'src/exception/errors'
import { Status } from '@grpc/grpc-js/build/src/constants'
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

  async getNodes(req: AccessRequest): Promise<NodeListResponse> {
    const nodes = await this.prisma.node.findMany({
      where: {
        team: {
          users: {
            some: {
              userId: req.accessedBy,
              active: true,
            },
          },
        },
      },
    })

    return {
      data: nodes.map(it => this.mapper.toGrpc(it)),
    }
  }

  async getNodeDetails(req: IdRequest): Promise<NodeDetailsResponse> {
    const node = await this.prisma.node.findUniqueOrThrow({
      where: {
        id: req.id,
      },
    })

    return this.mapper.detailsToGrpc(node)
  }

  async createNode(req: CreateNodeRequest): Promise<CreateEntityResponse> {
    const team = await this.teamRepository.getActiveTeamByUserId(req.accessedBy)

    const node = await this.prisma.node.create({
      data: {
        name: req.name,
        description: req.description,
        icon: req.icon ?? null,
        teamId: team.teamId,
        createdBy: req.accessedBy,
      },
    })

    await this.notificationService.sendNotification({
      identityId: req.accessedBy,
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
  }

  async updateNode(req: UpdateNodeRequest): Promise<Empty> {
    await this.prisma.node.update({
      where: {
        id: req.id,
      },
      data: {
        name: req.name,
        description: req.description,
        icon: req.icon ?? null,
        updatedBy: req.accessedBy,
      },
    })

    return Empty
  }

  async generateScript(req: GenerateScriptRequest): Promise<NodeInstallResponse> {
    const nodeType = this.mapper.nodeTypeGrpcToPrisma(req.type)

    await this.prisma.node.update({
      where: {
        id: req.id,
      },
      data: {
        type: nodeType,
        updatedBy: req.accessedBy,
      },
    })

    const installer = await this.agentService.install(req.id, nodeType, req.rootPath ?? null)

    return this.mapper.installerToGrpc(installer)
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

  async revokeToken(request: IdRequest): Promise<Empty> {
    await this.prisma.node.update({
      where: {
        id: request.id,
      },
      data: {
        token: null,
        updatedBy: request.accessedBy,
      },
    })

    try {
      this.agentService.kick(request.id)
    } catch (err) {
      if (err.error.code !== Status.NOT_FOUND) {
        throw err
      }
    }
    return Empty
  }

  async handleSubscribeNodeEventChannel(request: ServiceIdRequest): Promise<Observable<NodeEventMessage>> {
    return await this.agentService.getNodeEventsByTeam(request.id)
  }

  handleWatchContainerStatus(request: WatchContainerStateRequest): Observable<ContainerStateListMessage> {
    this.logger.debug(`Opening container status channel for prefix: ${request.nodeId} - ${request.prefix}`)

    const agent = this.agentService.getById(request.nodeId)

    if (!agent) {
      throw new PreconditionFailedException({
        message: 'Node is unreachable',
        property: 'nodeId',
        value: request.nodeId,
      })
    }

    const prefix = request.prefix ?? ''
    const watcher = agent.upsertContainerStatusWatcher(prefix)
    return watcher.watch()
  }
}
