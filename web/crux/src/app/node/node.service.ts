import { Injectable, Logger } from '@nestjs/common'
import { Identity } from '@ory/kratos-client'
import { map, Observable } from 'rxjs'
import { Agent } from 'src/domain/agent'
import { BaseMessage } from 'src/domain/notification-templates'
import { PreconditionFailedException } from 'src/exception/errors'
import {
  ContainerCommandRequest,
  ContainerIdentifier,
  ContainerLogMessage,
  ContainerOperation,
  ContainerStateListMessage,
  DeleteContainersRequest,
} from 'src/grpc/protobuf/proto/common'
import {
  NodeEventMessage,
  ServiceIdRequest,
  WatchContainerLogRequest,
  WatchContainerStateRequest,
} from 'src/grpc/protobuf/proto/crux'
import DomainNotificationService from 'src/services/domain.notification.service'
import PrismaService from 'src/services/prisma.service'
import AgentService from '../agent/agent.service'
import TeamRepository from '../team/team.repository'
import {
  CreateNodeDto,
  NodeDetailsDto,
  NodeDto,
  NodeGenerateScriptDto,
  NodeInstallDto,
  UpdateNodeDto,
} from './node.dto'
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

  async getNodes(identity: Identity): Promise<NodeDto[]> {
    const nodes = await this.prisma.node.findMany({
      where: {
        team: {
          users: {
            some: {
              userId: identity.id,
              active: true,
            },
          },
        },
      },
    })

    return nodes.map(it => this.mapper.listItemToDto(it))
  }

  async getNodeDetails(id: string): Promise<NodeDetailsDto> {
    const node = await this.prisma.node.findUniqueOrThrow({
      where: {
        id,
      },
    })

    return this.mapper.detailsToDto(node)
  }

  async createNode(req: CreateNodeDto, identity: Identity): Promise<NodeDto> {
    const team = await this.teamRepository.getActiveTeamByUserId(identity.id)

    const node = await this.prisma.node.create({
      data: {
        name: req.name,
        description: req.description,
        icon: req.icon ?? null,
        teamId: team.teamId,
        createdBy: identity.id,
      },
    })

    await this.notificationService.sendNotification({
      identityId: identity.id,
      messageType: 'node',
      message: { subject: node.name } as BaseMessage,
    })

    return this.mapper.listItemToDto(node)
  }

  async deleteNode(id: string): Promise<void> {
    await this.prisma.node.delete({
      where: {
        id,
      },
    })

    this.agentService.kick(id)
  }

  async updateNode(id: string, req: UpdateNodeDto, identity: Identity): Promise<void> {
    await this.prisma.node.update({
      where: {
        id,
      },
      data: {
        name: req.name,
        description: req.description,
        icon: req.icon ?? null,
        updatedBy: identity.id,
      },
    })
  }

  async generateScript(id: string, req: NodeGenerateScriptDto, identity: Identity): Promise<NodeInstallDto> {
    const nodeType = this.mapper.nodeTypeToDb(req.type)

    const node = await this.prisma.node.update({
      where: {
        id,
      },
      data: {
        type: nodeType,
        updatedBy: identity.id,
      },
      select: {
        name: true,
      },
    })

    const installer = await this.agentService.install(
      id,
      node.name,
      nodeType,
      req.rootPath ?? null,
      req.scriptType,
      req.dagentTraefik ?? null,
    )

    return this.mapper.installerToDto(installer)
  }

  async getScript(id: string): Promise<string> {
    const installer = this.agentService.getInstallerByNodeId(id)

    return installer.getScript()
  }

  async discardScript(id: string): Promise<void> {
    await this.agentService.discardInstaller(id)
  }

  async revokeToken(id: string, identity: Identity): Promise<void> {
    await this.prisma.node.update({
      where: {
        id,
      },
      data: {
        token: null,
        updatedBy: identity.id,
      },
    })

    this.agentService.kick(id)
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
      `Opening container log stream for container: ${request.nodeId} - ${Agent.containerPrefixNameOf(
        request.container,
      )}}`,
    )

    const agent = this.agentService.getById(request.nodeId)

    if (!agent) {
      throw new PreconditionFailedException({
        message: 'Node is unreachable',
        property: 'nodeId',
        value: request.nodeId,
      })
    }

    const stream = agent.upsertContainerLogStream(request.container)
    return stream.watch()
  }

  async updateNodeAgent(id: string): Promise<void> {
    this.agentService.updateAgent(id)
  }

  startContainer(nodeId: string, prefix: string, name: string) {
    this.sendContainerOperation(
      nodeId,
      {
        prefix,
        name,
      },
      ContainerOperation.START_CONTAINER,
    )
  }

  stopContainer(nodeId: string, prefix: string, name: string) {
    this.sendContainerOperation(
      nodeId,
      {
        prefix,
        name,
      },
      ContainerOperation.STOP_CONTAINER,
    )
  }

  restartContainer(nodeId: string, prefix: string, name: string) {
    this.sendContainerOperation(
      nodeId,
      {
        prefix,
        name,
      },
      ContainerOperation.RESTART_CONTAINER,
    )
  }

  deleteAllContainers(nodeId: string, prefix: string): Observable<void> {
    const agent = this.agentService.getByIdOrThrow(nodeId)
    const cmd: DeleteContainersRequest = {
      prefix,
    }

    return agent.deleteContainers(cmd).pipe(map(() => undefined))
  }

  deleteContainer(nodeId: string, prefix: string, name: string): Observable<void> {
    const agent = this.agentService.getByIdOrThrow(nodeId)
    const cmd: DeleteContainersRequest = {
      container: {
        prefix: prefix ?? '',
        name,
      },
    }

    return agent.deleteContainers(cmd).pipe(map(() => undefined))
  }

  private sendContainerOperation(nodeId: string, container: ContainerIdentifier, operation: ContainerOperation) {
    const agent = this.agentService.getByIdOrThrow(nodeId)

    const command: ContainerCommandRequest = {
      container,
      operation,
    }

    agent.sendContainerCommand(command)
  }
}
