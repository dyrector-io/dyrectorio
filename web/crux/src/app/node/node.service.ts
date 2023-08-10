import { Injectable, Logger } from '@nestjs/common'
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
  CreateNodeDto,
  NodeAuditLogListDto,
  NodeAuditLogQueryDto,
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
import { ConfigService } from '@nestjs/config'

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
    })

    const deploymentExists = await this.prisma.deployment.findFirst({
      where: {
        nodeId: id,
      },
    })

    return this.mapper.detailsToDto(node, !!deploymentExists)
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

    this.agentService.kick(id, 'delete-node', identity.id)
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
    )

    return this.mapper.installerToDto(installer)
  }

  async getScript(id: string): Promise<string> {
    const installer = this.agentService.getInstallerByNodeId(id)

    return installer.getScript(this.configService)
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

    this.agentService.kick(id, 'revoke-token', identity.id)
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

  async deleteAllContainers(nodeId: string, prefix: string): Promise<Observable<void>> {
    const agent = this.agentService.getByIdOrThrow(nodeId)
    const cmd: DeleteContainersRequest = {
      prefix,
    }

    await this.agentService.createAgentAudit(nodeId, 'containerCommand', {
      operation: 'deleteContainers',
      ...cmd,
    })

    return agent.deleteContainers(cmd).pipe(map(() => undefined))
  }

  async deleteContainer(nodeId: string, prefix: string, name: string): Promise<Observable<void>> {
    const agent = this.agentService.getByIdOrThrow(nodeId)
    const cmd: DeleteContainersRequest = {
      container: {
        prefix: prefix ?? '',
        name,
      },
    }

    await this.agentService.createAgentAudit(nodeId, 'containerCommand', {
      operation: 'deleteContainer',
      ...cmd,
    })

    return agent.deleteContainers(cmd).pipe(map(() => undefined))
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
    this.logger.debug(`Opening container state stream for prefix: ${nodeId} - ${prefix}`)

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

  private static snakeCaseToCamelCase(snake: string): string {
    return snake.toLocaleLowerCase().replace(/([-_][a-z])/g, it => it.replace('_', '').toLocaleUpperCase())
  }
}
