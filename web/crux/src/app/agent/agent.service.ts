import { Injectable, Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { DeploymentEventTypeEnum, DeploymentStatusEnum, NodeTypeEnum } from '@prisma/client'
import { concatAll, finalize, from, map, Observable, Subject, takeUntil } from 'rxjs'
import { PrismaService } from 'src/services/prisma.service'
import { Agent, AgentToken } from 'src/domain/agent'
import { AgentInstaller } from 'src/domain/agent-installer'
import { DeploymentProgressEvent } from 'src/domain/deployment'
import { collectChildVersionIds, collectParentVersionIds } from 'src/domain/utils'
import { AlreadyExistsException, NotFoundException, UnauthenticatedException } from 'src/exception/errors'
import { AgentCommand, AgentInfo } from 'src/grpc/protobuf/proto/agent'
import {
  ContainerStateListMessage,
  DeploymentStatusMessage,
  Empty,
  NodeConnectionStatus,
  NodeEventMessage,
} from 'src/grpc/protobuf/proto/crux'
import { GrpcNodeConnection } from 'src/shared/grpc-node-connection'

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name)

  private installers: Map<string, AgentInstaller> = new Map()
  private agents: Map<string, Agent> = new Map()
  private eventChannelByTeamId: Map<string, Subject<NodeEventMessage>> = new Map()

  private static SCRIPT_EXPIRATION = 10 * 60 * 1000 // millis

  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

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
    const team = await this.prisma.team.findUnique({
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

  async install(nodeId: string, nodeType: NodeTypeEnum): Promise<AgentInstaller> {
    let installer = this.getInstallerByNodeId(nodeId)
    if (!installer) {
      const now = new Date().getTime()

      const token: AgentToken = {
        iat: now,
        iss: undefined,
        sub: nodeId,
      }

      installer = new AgentInstaller(
        nodeId,
        this.jwtService.sign(token),
        now + AgentService.SCRIPT_EXPIRATION,
        nodeType,
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
    const agent = this.getByIdOrThrow(nodeId)
    agent.kick()
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
      return
    }

    return request.pipe(
      map(it => {
        this.logger.verbose(`Deployment update - ${deploymentId}`)

        const events = deployment.onUpdate(it)
        this.createDeploymentEvents(deployment.id, events)
        return Empty
      }),
      finalize(() => {
        agent.onDeploymentFinished(deployment)
        this.updateDeploymentStatuses(agent.id, deployment.id)

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

  private onAgentConnectionStatusChange(agent: Agent, status: NodeConnectionStatus) {
    if (status === NodeConnectionStatus.UNREACHABLE) {
      this.logger.log(`left: ${agent.id}`)
      this.agents.delete(agent.id)
    } else if (status === NodeConnectionStatus.CONNECTED) {
      agent.onConnected()
    }
  }

  private async onAgentConnected(
    connection: GrpcNodeConnection,
    request: AgentInfo,
  ): Promise<Observable<AgentCommand>> {
    if (this.agents.has(request.id)) {
      throw new AlreadyExistsException({
        message: 'Agent is already connected.',
        property: 'id',
      })
    }

    let agent: Agent
    await this.prisma.$transaction(async prisma => {
      const node = await prisma.node.findUnique({
        where: {
          id: connection.nodeId,
        },
      })

      const now = new Date()
      const eventChannel = await this.getNodeEventsByTeam(node.teamId)
      const installer = this.installers.get(node.id)
      if (installer) {
        if (installer.token !== connection.jwt) {
          throw new UnauthenticatedException({
            message: 'Invalid token',
          })
        }

        agent = installer.complete(connection, eventChannel, request?.version)
        this.installers.delete(node.id)

        await this.prisma.node.update({
          where: { id: node.id },
          data: {
            token: installer.token,
            address: connection.address,
            connectedAt: now,
          },
        })
      } else {
        if (!node.token || node.token !== connection.jwt) {
          throw new UnauthenticatedException({
            message: 'Invalid token',
          })
        }
        agent = new Agent(connection, eventChannel as Subject<NodeEventMessage>, request?.version)

        await prisma.node.update({
          where: { id: node.id },
          data: {
            address: connection.address,
            connectedAt: now,
          },
        })
      }
    })

    this.agents.set(agent.id, agent)
    connection.status().subscribe(it => this.onAgentConnectionStatusChange(agent, it))

    this.logger.log(`joined: ${request.id}`)
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
      data: events.map(it => {
        return {
          ...it,
          deploymentId: id,
        }
      }),
    })
  }

  private async updateDeploymentStatuses(nodeId: string, deploymentId: string) {
    const deployment = await this.prisma.deployment.findUnique({
      select: {
        status: true,
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

    if (deployment.status !== 'successful') {
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
        nodeId: nodeId,
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
        nodeId: nodeId,
      },
    })
  }

  private logServiceInfo(): void {
    this.logger.debug(`agents: ${this.agents.size}`)
    this.agents.forEach(it => it.debugInfo(this.logger))
  }
}
