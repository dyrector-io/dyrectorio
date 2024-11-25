import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Identity } from '@ory/kratos-client'
import { Prisma } from '@prisma/client'
import { EmptyError, Observable, filter, firstValueFrom, map, mergeAll, mergeWith, of, timeout } from 'rxjs'
import { Agent, AgentConnectionMessage } from 'src/domain/agent'
import { BaseMessage } from 'src/domain/notification-templates'
import {
  ContainerCommandRequest,
  ContainerIdentifier,
  ContainerOperation,
  ContainerStateListMessage,
  DeleteContainersRequest,
  containerOperationToJSON,
} from 'src/grpc/protobuf/proto/common'
import DomainNotificationService from 'src/services/domain.notification.service'
import PrismaService from 'src/services/prisma.service'
import AgentService from '../agent/agent.service'
import TeamRepository from '../team/team.repository'
import {
  ContainerDto,
  ContainerInspectionDto,
  CreateNodeDto,
  NodeAuditLogListDto,
  NodeAuditLogQueryDto,
  NodeContainerLogQuery,
  NodeDetailsDto,
  NodeDto,
  NodeGenerateScriptDto,
  NodeInstallDto,
  UpdateNodeDto,
} from './node.dto'
import NodeMapper from './node.mapper'
import {
  ContainerLogMessage,
  ContainerLogStartedMessage,
  ContainersStateListMessage,
  SetContainerLogTakeMessage,
  WatchContainerLogMessage,
  WatchContainersStateMessage,
} from './node.message'

@Injectable()
export default class NodeService {
  private readonly logger = new Logger(NodeService.name)

  constructor(
    private readonly teamRepository: TeamRepository,
    private readonly prisma: PrismaService,
    private readonly agentService: AgentService,
    private readonly mapper: NodeMapper,
    private readonly notificationService: DomainNotificationService,
    private readonly configService: ConfigService,
  ) {}

  async checkNodeIsInTheTeam(teamSlug: string, nodeId: string, identity: Identity): Promise<boolean> {
    const nodes = await this.prisma.node.count({
      where: {
        id: nodeId,
        team: {
          slug: teamSlug,
          users: {
            some: {
              userId: identity.id,
            },
          },
        },
      },
    })

    return nodes > 0
  }

  async getNodes(teamSlug: string): Promise<NodeDto[]> {
    const nodes = await this.prisma.node.findMany({
      where: {
        team: {
          slug: teamSlug,
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
      include: {
        token: true,
        _count: {
          select: {
            deployments: true,
          },
        },
      },
    })

    return this.mapper.detailsToDto(node)
  }

  async createNode(teamSlug: string, req: CreateNodeDto, identity: Identity): Promise<NodeDto> {
    const teamId = await this.teamRepository.getTeamIdBySlug(teamSlug)

    const node = await this.prisma.node.create({
      data: {
        name: req.name,
        description: req.description,
        icon: req.icon ?? null,
        teamId,
        createdBy: identity.id,
      },
    })

    await this.notificationService.sendNotification({
      teamId,
      messageType: 'node',
      message: { subject: node.name, owner: identity } as BaseMessage,
    })

    return this.mapper.toDto(node)
  }

  async deleteNode(id: string, identity: Identity): Promise<void> {
    await this.prisma.node.delete({
      where: {
        id,
      },
    })

    await this.agentService.kick(id, 'delete-node', identity.id)
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

  async generateScript(
    teamSlug: string,
    id: string,
    req: NodeGenerateScriptDto,
    identity: Identity,
  ): Promise<NodeInstallDto> {
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
        id: true,
        name: true,
        type: true,
      },
    })

    const installer = await this.agentService.startInstallation(
      teamSlug,
      node,
      req.rootPath ?? null,
      req.scriptType,
      req.dagentTraefik ?? null,
      identity,
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
        updatedBy: identity.id,
        token: {
          delete: true,
        },
      },
    })

    await this.agentService.kick(id, 'revoke-token', identity.id)
  }

  async subscribeToNodeEvents(teamSlug: string): Promise<Observable<AgentConnectionMessage>> {
    const nodes = await this.prisma.node.findMany({
      where: {
        team: {
          slug: teamSlug,
        },
      },
    })

    const currentEvents = nodes.map(it => this.mapper.toConnectionMessage(it))

    const teamId = await this.teamRepository.getTeamIdBySlug(teamSlug)
    const events = await this.agentService.getNodeEventsByTeam(teamId)
    return events.pipe(mergeWith(of(currentEvents).pipe(mergeAll())))
  }

  watchContainersState(nodeId: string, message: WatchContainersStateMessage): Observable<ContainersStateListMessage> {
    const { prefix } = message

    return this.upsertAndWatchStateWatcher(nodeId, prefix, false).pipe(
      map(it => this.mapper.containerStateMessageToContainerMessage(it)),
    )
  }

  setContainerLogTake(nodeId, message: SetContainerLogTakeMessage) {
    const { container, take } = message

    this.logger.debug(
      `Setting container log stream take for container: ${nodeId} - ${Agent.containerPrefixNameOf(container)}}`,
    )

    const agent = this.agentService.getByIdOrThrow(nodeId)

    const stream = agent.getContainerLogStream(container)
    stream.resize(take)
  }

  watchContainerLog(
    nodeId: string,
    message: WatchContainerLogMessage,
  ): [Observable<ContainerLogMessage>, Observable<ContainerLogStartedMessage>] {
    const { container, take } = message

    this.logger.debug(
      `Requesting container log stream for container: ${nodeId} - ${Agent.containerPrefixNameOf(container)}}`,
    )

    const agent = this.agentService.getByIdOrThrow(nodeId)

    const stream = agent.upsertContainerLogStream(container, take)

    return stream.watch()
  }

  async updateAgent(id: string, identity: Identity): Promise<void> {
    await this.agentService.updateAgent(id, identity)
  }

  async startContainer(nodeId: string, prefix: string, name: string): Promise<void> {
    await this.sendContainerOperation(
      nodeId,
      {
        prefix,
        name,
      },
      ContainerOperation.START_CONTAINER,
    )
  }

  async stopContainer(nodeId: string, prefix: string, name: string): Promise<void> {
    await this.sendContainerOperation(
      nodeId,
      {
        prefix,
        name,
      },
      ContainerOperation.STOP_CONTAINER,
    )
  }

  async restartContainer(nodeId: string, prefix: string, name: string): Promise<void> {
    await this.sendContainerOperation(
      nodeId,
      {
        prefix,
        name,
      },
      ContainerOperation.RESTART_CONTAINER,
    )
  }

  async deleteAllContainers(nodeId: string, prefix: string): Promise<void> {
    await this.sendDeleteContainerCommand(nodeId, 'deleteContainers', {
      target: {
        prefix,
      },
    })
  }

  async deleteContainer(nodeId: string, prefix: string, name: string): Promise<void> {
    await this.sendDeleteContainerCommand(nodeId, 'deleteContainer', {
      target: {
        container: {
          prefix: prefix ?? '',
          name,
        },
      },
    })
  }

  async getContainers(nodeId: string, prefix?: string): Promise<ContainerDto[]> {
    try {
      const states = this.upsertAndWatchStateWatcher(nodeId, prefix, true).pipe(
        map(list => list.data?.map(it => this.mapper.containerStateItemToDto(it))),
        filter(it => it && it.length > 0),
        timeout(5000),
      )

      const containers = await firstValueFrom(states)

      return containers ?? []
    } catch (err) {
      // TODO(@m8vago): check if we can remove this workaround after rxjs update
      if (err instanceof EmptyError) {
        return []
      }

      throw err
    }
  }

  private upsertAndWatchStateWatcher(
    nodeId: string,
    prefix: string,
    oneShot: boolean,
  ): Observable<ContainerStateListMessage> {
    this.logger.debug(`Opening container state stream for node - prefix: ${nodeId} - ${prefix}`)

    const agent = this.agentService.getByIdOrThrow(nodeId)
    const watcher = agent.upsertContainerStatusWatcher(prefix ?? '', oneShot)

    return watcher.watch()
  }

  private async sendContainerOperation(
    nodeId: string,
    container: ContainerIdentifier,
    operation: ContainerOperation,
  ): Promise<void> {
    const agent = this.agentService.getByIdOrThrow(nodeId)

    const command: ContainerCommandRequest = {
      container,
      operation,
    }

    agent.sendContainerCommand(command)

    await this.agentService.createAgentAudit(nodeId, 'containerCommand', {
      ...command,
      operation: NodeService.snakeCaseToCamelCase(containerOperationToJSON(command.operation)),
    })
  }

  async getAuditLog(nodeId: string, query: NodeAuditLogQueryDto): Promise<NodeAuditLogListDto> {
    const { skip, take, from, to } = query

    const where: Prisma.NodeEventWhereInput = {
      nodeId,
      AND: {
        createdAt: {
          gte: from,
          lte: to,
        },
        ...(query.filterEventType
          ? {
              AND: {
                event: query.filterEventType,
              },
            }
          : null),
      },
    }

    const [auditLog, total] = await this.prisma.$transaction([
      this.prisma.nodeEvent.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take,
        select: {
          createdAt: true,
          event: true,
          data: true,
        },
      }),
      this.prisma.nodeEvent.count({ where }),
    ])

    return {
      items: auditLog.map(it => ({
        ...it,
        data: it.data as object,
      })),
      total,
    }
  }

  async inspectContainer(nodeId: string, prefix: string, name: string): Promise<ContainerInspectionDto> {
    const agent = this.agentService.getByIdOrThrow(nodeId)

    const res = await agent.inspectContainer({
      container: {
        prefix,
        name,
      },
    })

    return this.mapper.containerInspectToDto(res)
  }

  async getContainerLog(nodeId: string, prefix: string, name: string, query: NodeContainerLogQuery): Promise<string[]> {
    const agent = this.agentService.getByIdOrThrow(nodeId)

    const res = await agent.getContainerLog({
      container: {
        prefix,
        name,
      },
      tail: query.take,
    })

    return res.logs
  }

  async kickNode(id: string, identity: Identity): Promise<void> {
    await this.agentService.kick(id, 'user-kick', identity.id)
  }

  private async sendDeleteContainerCommand(
    nodeId: string,
    operation: 'deleteContainer' | 'deleteContainers',
    command: DeleteContainersRequest,
  ): Promise<void> {
    const agent = this.agentService.getByIdOrThrow(nodeId)
    await agent.deleteContainers(command)

    await this.agentService.createAgentAudit(nodeId, 'containerCommand', {
      operation,
      ...command,
    })
  }

  private static snakeCaseToCamelCase(snake: string): string {
    return snake.toLocaleLowerCase().replace(/([-_][a-z])/g, it => it.replace('_', '').toLocaleUpperCase())
  }
}
