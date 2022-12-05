import DomainNotificationService from 'src/services/domain.notification.service'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { DeploymentEventTypeEnum, DeploymentStatusEnum, NodeTypeEnum } from '@prisma/client'
import { InjectMetric } from '@willsoto/nestjs-prometheus'
import {
  catchError,
  concatAll,
  concatMap,
  EMPTY,
  finalize,
  from,
  map,
  Observable,
  of,
  startWith,
  Subject,
  takeUntil,
} from 'rxjs'
import { Gauge } from 'prom-client'
import { Agent, AgentToken } from 'src/domain/agent'
import AgentInstaller from 'src/domain/agent-installer'
import { DeploymentProgressEvent } from 'src/domain/deployment'
import { DeployMessage, NotificationMessageType } from 'src/domain/notification-templates'
import { collectChildVersionIds, collectParentVersionIds } from 'src/domain/utils'
import { AlreadyExistsException, NotFoundException, UnauthenticatedException } from 'src/exception/errors'
import { AgentAbortUpdate, AgentCommand, AgentInfo, CloseReason } from 'src/grpc/protobuf/proto/agent'
import {
  ContainerStateListMessage,
  DeleteContainersRequest,
  DeploymentStatus,
  DeploymentStatusMessage,
  Empty,
  ListSecretsResponse,
} from 'src/grpc/protobuf/proto/common'
import { NodeConnectionStatus, NodeEventMessage } from 'src/grpc/protobuf/proto/crux'
import PrismaService from 'src/services/prisma.service'
import GrpcNodeConnection from 'src/shared/grpc-node-connection'

@Injectable()
export default class AgentService {
  private readonly logger = new Logger(AgentService.name)

  private installers: Map<string, AgentInstaller> = new Map()

  private agents: Map<string, Agent> = new Map()

  private eventChannelByTeamId: Map<string, Subject<NodeEventMessage>> = new Map()

  private static SCRIPT_EXPIRATION = 10 * 60 * 1000 // millis

  constructor(
    @InjectMetric('agent_online_count') private agentCount: Gauge<string>,
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private notificationService: DomainNotificationService,
  ) {}

  getById(id: string): Agent {
    return this.agents.get(id)
  }

  getByIdOrThrow(id: string): Agent {
    const agent = this.getById(id)
    if (!agent) {
      throw new NotFoundException({
        message: 'Agent not found',
        property: 'agent',
      })
    }

    return agent
  }

  getInstallerByNodeId(nodeId: string): AgentInstaller {
    const installer = this.installers.get(nodeId)

    if (installer?.expired) {
      this.installers.delete(nodeId)
      return null
    }

    return installer
  }

  async getNodeEventsByTeam(teamId: string): Promise<Subject<NodeEventMessage>> {
    const team = await this.prisma.team.findUniqueOrThrow({
      where: {
        id: teamId,
      },
      select: {
        id: true,
      },
    })

    let channel = this.eventChannelByTeamId.get(team.id)
    if (!channel) {
      channel = new Subject()
      this.eventChannelByTeamId.set(teamId, channel)
    }

    return channel
  }

  async sendNodeEventToTeam(teamId: string, event: NodeEventMessage) {
    const channel = await this.getNodeEventsByTeam(teamId)
    channel.next(event)
  }

  async install(nodeId: string, nodeType: NodeTypeEnum, rootPath: string | null): Promise<AgentInstaller> {
    let installer = this.getInstallerByNodeId(nodeId)
    if (!installer || installer.nodeType !== nodeType) {
      const now = new Date().getTime()

      const token: AgentToken = {
        iat: Math.floor(now / 1000),
        iss: undefined,
        sub: nodeId,
      }

      installer = new AgentInstaller(
        this.configService,
        nodeId,
        this.jwtService.sign(token),
        new Date(now + AgentService.SCRIPT_EXPIRATION),
        nodeType,
        rootPath,
      )
      this.installers.set(nodeId, installer)
    }

    try {
      installer.verify()
    } catch (err) {
      this.installers.delete(nodeId)
      throw err
    }

    return installer
  }

  async discardInstaller(nodeId: string): Promise<Empty> {
    if (!this.installers.has(nodeId)) {
      throw new NotFoundException({
        message: 'Installer not found',
        property: 'installer',
        value: nodeId,
      })
    }

    this.installers.delete(nodeId)

    return Empty
  }

  kick(nodeId: string) {
    const agent = this.getById(nodeId)
    agent?.close()
  }

  handleConnect(connection: GrpcNodeConnection, request: AgentInfo): Observable<AgentCommand> {
    return from(this.onAgentConnected(connection, request)).pipe(concatAll())
  }

  handleDeploymentStatus(
    connection: GrpcNodeConnection,
    request: Observable<DeploymentStatusMessage>,
  ): Observable<Empty> {
    const agent = this.getByIdOrThrow(connection.nodeId)

    const deploymentId = connection.getMetaData(GrpcNodeConnection.META_DEPLOYMENT_ID)
    this.logger.debug(`Opening deployment status channel: ${deploymentId}`)

    const deployment = agent.getDeployment(deploymentId)
    if (!deployment) {
      return of(Empty)
    }

    return request.pipe(
      concatMap(it => {
        this.logger.verbose(`Deployment update - ${deploymentId}`)

        const events = deployment.onUpdate(it)
        return from(this.createDeploymentEvents(deployment.id, events)).pipe(map(() => Empty))
      }),
      catchError(async (err: Error) => {
        this.logger.error(`Error during deployment: ${err.message}`, err.stack)
        return EMPTY
      }),
      finalize(async () => {
        const status = agent.onDeploymentFinished(deployment)
        this.updateDeploymentStatuses(agent.id, deployment.id, status)

        const messageType: NotificationMessageType =
          deployment.getStatus() === DeploymentStatus.SUCCESSFUL ? 'successfulDeploy' : 'failedDeploy'
        await this.notificationService.sendNotification({
          identityId: deployment.notification.accessedBy,
          messageType,
          message: {
            subject: deployment.notification.productName,
            version: deployment.notification.versionName,
            node: deployment.notification.nodeName,
          } as DeployMessage,
        })

        this.logger.debug(`Deployment finished: ${deployment.id}`)
      }),
    )
  }

  handleContainerStatus(
    connection: GrpcNodeConnection,
    request: Observable<ContainerStateListMessage>,
  ): Observable<Empty> {
    const agent = this.getByIdOrThrow(connection.nodeId)
    const prefix = connection.getMetaData(GrpcNodeConnection.META_FILTER_PREFIX)

    const [watcher, completer] = agent.onContainerStatusStreamStarted(prefix)
    if (!watcher) {
      this.logger.warn(`${agent.id} - There was no watcher for ${prefix}`)

      completer.next(undefined)
      return completer
    }

    return request.pipe(
      // necessary, because of: https://github.com/nestjs/nest/issues/8111
      startWith({
        prefix,
        data: [],
      }),
      map(it => {
        this.logger.verbose(`${agent.id} - Container status update - ${prefix}`)

        watcher.update(it)
        return Empty
      }),
      finalize(() => {
        agent.onContainerStatusStreamFinished(prefix)
        this.logger.debug(`${agent.id} - Container status listening finished: ${prefix}`)
      }),
      takeUntil(completer),
    )
  }

  handleSecretList(connection: GrpcNodeConnection, request: ListSecretsResponse): Observable<Empty> {
    const agent = this.getByIdOrThrow(connection.nodeId)

    agent.onContainerSecrets(request)

    return of(Empty)
  }

  updateAgent(id: string) {
    const agent = this.getByIdOrThrow(id)

    agent.update(this.configService.get<string>('CRUX_AGENT_IMAGE') ?? 'stable')
  }

  updateAborted(connection: GrpcNodeConnection, request: AgentAbortUpdate): Empty {
    this.logger.warn(`Agent updated aborted for '${connection.nodeId}' with error: '${request.error}'`)

    const agent = this.getByIdOrThrow(connection.nodeId)

    agent.onUpdateAborted(request.error)

    return Empty
  }

  containersDeleted(connection: GrpcNodeConnection, request: DeleteContainersRequest): Empty {
    this.logger.log(`Containers deleted on '${connection.nodeId}'`)

    const agent = this.getByIdOrThrow(connection.nodeId)
    agent.onContainerDeleted(request)

    return Empty
  }

  private onAgentConnectionStatusChange(agent: Agent, status: NodeConnectionStatus) {
    if (status === NodeConnectionStatus.UNREACHABLE) {
      this.logger.log(`Left: ${agent.id}`)
      this.agents.delete(agent.id)
      this.agentCount.dec()
      agent.onDisconnected()
    } else if (status === NodeConnectionStatus.CONNECTED) {
      agent.onConnected()
    }
  }

  private async onAgentConnected(
    connection: GrpcNodeConnection,
    request: AgentInfo,
  ): Promise<Observable<AgentCommand>> {
    if (this.agents.has(request.id)) {
      const agent = this.agents.get(request.id)
      if (!agent.checkAgentUpdating()) {
        throw new AlreadyExistsException({
          message: 'Agent is already connected.',
          property: 'id',
        })
      }

      this.logger.verbose(`Updated agent connected for '${request.id}'`)

      agent.close(CloseReason.SELF_DESTRUCT)
      this.agents.delete(request.id)
    }

    let agent: Agent
    await this.prisma.$transaction(async prisma => {
      const node = await prisma.node.findUniqueOrThrow({
        where: {
          id: connection.nodeId,
        },
      })

      const { connectedAt } = connection
      const eventChannel = await this.getNodeEventsByTeam(node.teamId)
      const installer = this.installers.get(node.id)
      if (installer) {
        if (installer.token !== connection.jwt) {
          throw new UnauthenticatedException({
            message: 'Invalid token',
          })
        }

        agent = installer.complete(connection, request, eventChannel)
        this.installers.delete(node.id)

        await this.prisma.node.update({
          where: { id: node.id },
          data: {
            token: installer.token,
            address: connection.address,
            connectedAt,
          },
        })
      } else {
        if (!node.token || node.token !== connection.jwt) {
          throw new UnauthenticatedException({
            message: 'Invalid token',
          })
        }
        agent = new Agent(connection, request, eventChannel as Subject<NodeEventMessage>)

        await prisma.node.update({
          where: { id: node.id },
          data: {
            address: connection.address,
            connectedAt,
          },
        })
      }
    })

    this.logger.debug(`Agent key: ${request.publicKey}`)

    this.agents.set(agent.id, agent)
    connection.status().subscribe(it => this.onAgentConnectionStatusChange(agent, it))

    this.logger.log(`Agent joined with id: ${request.id}, key: ${!!agent.publicKey}`)
    this.agentCount.inc()
    this.logServiceInfo()

    return agent.onConnected()
  }

  private async createDeploymentEvents(id: string, events: DeploymentProgressEvent[]) {
    const statusChanges = events.filter(it => it.type === DeploymentEventTypeEnum.deploymentStatus)
    if (statusChanges.length > 0) {
      const last = statusChanges[statusChanges.length - 1]
      await this.prisma.deployment.update({
        data: {
          status: last.value as DeploymentStatusEnum,
        },
        where: {
          id,
        },
      })
    }

    await this.prisma.deploymentEvent.createMany({
      data: events.map(it => ({
        ...it,
        deploymentId: id,
      })),
    })
  }

  private async updateDeploymentStatuses(nodeId: string, deploymentId: string, status: DeploymentStatus) {
    const deployment = await this.prisma.deployment.findUniqueOrThrow({
      select: {
        status: true,
        prefix: true,
        version: {
          select: {
            id: true,
            deployments: {
              select: {
                id: true,
              },
              where: {
                nodeId,
              },
            },
          },
        },
      },
      where: {
        id: deploymentId,
      },
    })

    const finalStatus: DeploymentStatusEnum = status === DeploymentStatus.SUCCESSFUL ? 'successful' : 'failed'

    if (deployment.status !== finalStatus) {
      await this.prisma.deployment.update({
        where: {
          id: deploymentId,
        },
        data: {
          status: finalStatus,
        },
      })

      deployment.status = finalStatus
    }

    if (finalStatus !== 'successful') {
      return
    }

    await this.prisma.deployment.updateMany({
      data: {
        status: DeploymentStatusEnum.obsolate,
      },
      where: {
        id: {
          not: deploymentId,
        },
        versionId: deployment.version.id,
        nodeId,
        prefix: deployment.prefix,
        status: {
          not: DeploymentStatusEnum.preparing,
        },
      },
    })

    const parentVersionIds = await collectParentVersionIds(this.prisma, deployment.version.id)
    await this.prisma.deployment.updateMany({
      data: {
        status: DeploymentStatusEnum.obsolate,
      },
      where: {
        versionId: {
          in: parentVersionIds,
        },
        nodeId,
        prefix: deployment.prefix,
        status: {
          not: DeploymentStatusEnum.preparing,
        },
      },
    })

    const childVersionIds = await collectChildVersionIds(this.prisma, deployment.version.id)
    await this.prisma.deployment.updateMany({
      data: {
        status: DeploymentStatusEnum.downgraded,
      },
      where: {
        versionId: {
          in: childVersionIds,
        },
        nodeId,
        prefix: deployment.prefix,
      },
    })
  }

  private logServiceInfo(): void {
    this.logger.debug(`Agents: ${this.agents.size}`)
    this.agents.forEach(it => it.debugInfo(this.logger))
  }
}
