import { Injectable, Logger } from '@nestjs/common'
import { Identity } from '@ory/kratos-client'
import { Observable, filter, firstValueFrom, map, mergeAll, mergeWith, of, timeout } from 'rxjs'
import { Agent, AgentEvent } from 'src/domain/agent'
import { BaseMessage } from 'src/domain/notification-templates'
import {
  ContainerCommandRequest,
  ContainerIdentifier,
  ContainerOperation,
  ContainerStateListMessage,
  DeleteContainersRequest,
} from 'src/grpc/protobuf/proto/common'
import DomainNotificationService from 'src/services/domain.notification.service'
import PrismaService from 'src/services/prisma.service'
import AgentService from '../agent/agent.service'
import TeamRepository from '../team/team.repository'
import {
  ContainerDto,
  CreateNodeDto,
  NodeDetailsDto,
  NodeDto,
  NodeGenerateScriptDto,
  NodeInstallDto,
  UpdateNodeDto,
} from './node.dto'
import NodeMapper from './node.mapper'
import {
  ContainerLogMessage,
  ContainersStateListMessage,
  WatchContainerLogMessage,
  WatchContainersStateMessage,
} from './node.message'

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

  async checkNodeIsInTheActiveTeam(nodeId: string, identity: Identity): Promise<boolean> {
    const nodes = await this.prisma.node.count({
      where: {
        id: nodeId,
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

    return nodes > 0
  }

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

    return nodes.map(it => this.mapper.toDto(it))
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

    return this.mapper.toDto(node)
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

  async subscribeToNodeEvents(teamId: string): Promise<Observable<AgentEvent>> {
    const nodes = await this.prisma.node.findMany({
      where: {
        team: {
          id: teamId,
        },
      },
    })

    const currentEvents = nodes.map(it => this.mapper.toAgentEvent(it))

    const events = await this.agentService.getNodeEventsByTeam(teamId)
    return events.pipe(mergeWith(of(currentEvents).pipe(mergeAll())))
  }

  watchContainersState(nodeId: string, message: WatchContainersStateMessage): Observable<ContainersStateListMessage> {
    const { prefix } = message

    return this.upsertAndWatchStateWatcher(nodeId, prefix, false).pipe(
      map(it => this.mapper.containerStateMessageToContainerMessage(it)),
    )
  }

  watchContainerLog(nodeId: string, message: WatchContainerLogMessage): Observable<ContainerLogMessage> {
    const { container } = message

    this.logger.debug(
      `Opening container log stream for container: ${nodeId} - ${Agent.containerPrefixNameOf(container)}}`,
    )

    const agent = this.agentService.getByIdOrThrow(nodeId)

    const stream = agent.upsertContainerLogStream(container)

    return stream.watch()
  }

  updateAgent(id: string) {
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

  async getContainers(nodeId: string, prefix?: string): Promise<ContainerDto[]> {
    const states = this.upsertAndWatchStateWatcher(nodeId, prefix, true).pipe(
      map(list => list.data?.map(it => this.mapper.containerStateItemToDto(it))),
      filter(it => it && it.length > 0),
      timeout(5000),
    )
    const containers = await firstValueFrom(states)
    return containers ?? []
  }

  private upsertAndWatchStateWatcher(
    nodeId: string,
    prefix: string,
    oneShot: boolean,
  ): Observable<ContainerStateListMessage> {
    this.logger.debug(`Opening container state stream for prefix: ${nodeId} - ${prefix}`)

    const agent = this.agentService.getByIdOrThrow(nodeId)
    const watcher = agent.upsertContainerStatusWatcher(prefix ?? '', oneShot)

    return watcher.watch()
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
