import { Injectable, Logger } from '@nestjs/common'
import { NodeTypeEnum } from '@prisma/client'
import { Observable } from 'rxjs'
import { PrismaService } from 'src/services/prisma.service'
import { PreconditionFailedException } from 'src/exception/errors'
import {
  AccessRequest,
  ContainerStatusListMessage,
  CreateEntityResponse,
  CreateNodeRequest,
  Empty,
  GenerateScriptRequest,
  IdRequest,
  NodeDetailsResponse,
  NodeEventMessage,
  NodeInstallResponse,
  NodeListResponse,
  NodeScriptResponse,
  NodeType,
  ServiceIdRequest,
  UpdateNodeRequest,
  WatchContainerStatusRequest,
} from 'src/grpc/protobuf/proto/crux'
import { AgentService } from '../agent/agent.service'
import { TeamRepository } from '../team/team.repository'
import { NodeMapper } from './node.mapper'

@Injectable()
export class NodeService {
  private readonly logger = new Logger(NodeService.name)

  constructor(
    private teamRepository: TeamRepository,
    private prisma: PrismaService,
    private agentService: AgentService,
    private mapper: NodeMapper,
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
    const node = await this.prisma.node.findUnique({
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
        updatedAt: new Date(),
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
        updatedAt: new Date(),
      },
    })

    const installer = await this.agentService.install(req.id, nodeType)

    return this.mapper.installerToGrpc(installer)
  }

  async getScript(request: ServiceIdRequest): Promise<NodeScriptResponse> {
    const node = await this.prisma.node.findUnique({
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
        updatedAt: new Date(),
        updatedBy: request.accessedBy,
      },
    })

    this.agentService.kick(request.id)
    return Empty
  }

  async handleSubscribeNodeEventChannel(request: ServiceIdRequest): Promise<Observable<NodeEventMessage>> {
    return await this.agentService.getNodeEventsByTeam(request.id)
  }

  handleWatchContainerStatus(request: WatchContainerStatusRequest): Observable<ContainerStatusListMessage> {
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
