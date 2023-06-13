import { Logger } from '@nestjs/common'
import { DeploymentStatusEnum } from '@prisma/client'
import { catchError, finalize, Observable, of, Subject, throwError, timeout, TimeoutError } from 'rxjs'
import {
  CruxConflictException,
  CruxInternalServerErrorException,
  CruxPreconditionFailedException,
} from 'src/exception/crux-exception'
import { AgentCommand, AgentInfo, CloseReason } from 'src/grpc/protobuf/proto/agent'
import {
  ContainerCommandRequest,
  ContainerIdentifier,
  DeleteContainersRequest,
  DeploymentStatusMessage,
  Empty,
  ListSecretsResponse,
} from 'src/grpc/protobuf/proto/common'
import { CONTAINER_DELETE_TIMEOUT, DEFAULT_CONTAINER_LOG_TAIL } from 'src/shared/const'
import GrpcNodeConnection from 'src/shared/grpc-node-connection'
import { NodeConnectionStatus } from 'src/app/node/node.dto'
import ContainerLogStream, { ContainerLogStreamCompleter } from './container-log-stream'
import ContainerStatusWatcher, { ContainerStatusStreamCompleter } from './container-status-watcher'
import Deployment from './deployment'

export class Agent {
  public static SECRET_TIMEOUT = 5000

  public static AGENT_UPDATE_TIMEOUT = 60 * 5

  private commandChannel = new Subject<AgentCommand>()

  private deployments: Map<string, Deployment> = new Map()

  private statusWatchers: Map<string, ContainerStatusWatcher> = new Map()

  private secretsWatchers: Map<string, Subject<ListSecretsResponse>> = new Map()

  private deleteContainersRequests: Map<string, Subject<Empty>> = new Map()

  private logStreams: Map<string, ContainerLogStream> = new Map()

  private updateStartedAt: number | null = null

  readonly id: string

  readonly address: string

  readonly version: string

  readonly publicKey: string

  get connected() {
    return this.getConnectionStatus() === 'connected'
  }

  constructor(
    private connection: GrpcNodeConnection,
    info: AgentInfo,
    private readonly eventChannel: Subject<AgentConnectionMessage>,
    readonly outdated: boolean,
  ) {
    this.id = connection.nodeId
    this.address = connection.address
    this.version = info.version
    this.publicKey = info.publicKey
  }

  getConnectionStatus(): NodeConnectionStatus {
    return !this.commandChannel.closed ? 'connected' : 'unreachable'
  }

  getDeployment(id: string): Deployment {
    return this.deployments.get(id)
  }

  get updating() {
    if (!this.updateStartedAt) {
      return false
    }

    const now = new Date().getTime()
    if (now - this.updateStartedAt < Agent.AGENT_UPDATE_TIMEOUT * 1000) {
      return true
    }

    this.updateStartedAt = null
    return false
  }

  deploy(deployment: Deployment): Observable<DeploymentStatusMessage> {
    this.throwBeforeCommand()

    if (this.deployments.has(deployment.id)) {
      throw new CruxConflictException({
        message: 'Deployment is already running',
        property: 'id',
        value: deployment.id,
      })
    }

    this.deployments.set(deployment.id, deployment)

    return deployment.start(this.commandChannel)
  }

  upsertContainerStatusWatcher(prefix: string, oneShot: boolean): ContainerStatusWatcher {
    this.throwBeforeCommand()

    let watcher = this.statusWatchers.get(prefix)
    if (!watcher) {
      watcher = new ContainerStatusWatcher(prefix, oneShot)
      this.statusWatchers.set(prefix, watcher)
      watcher.start(this.commandChannel)
    }

    return watcher
  }

  upsertContainerLogStream(container: ContainerIdentifier): ContainerLogStream {
    this.throwBeforeCommand()

    const key = Agent.containerPrefixNameOf(container)
    let stream = this.logStreams.get(key)
    if (!stream) {
      stream = new ContainerLogStream(container, DEFAULT_CONTAINER_LOG_TAIL)
      this.logStreams.set(key, stream)
      stream.start(this.commandChannel)
    }

    return stream
  }

  close(reason?: CloseReason) {
    if (reason) {
      this.commandChannel.next({
        close: {
          reason,
        },
      } as AgentCommand)
    }
    this.commandChannel.complete()
  }

  sendContainerCommand(command: ContainerCommandRequest) {
    this.throwBeforeCommand()

    this.commandChannel.next({
      containerCommand: command,
    } as AgentCommand)
  }

  deleteContainers(request: DeleteContainersRequest): Observable<Empty> {
    this.throwBeforeCommand()

    const reqId = Agent.containerDeleteRequestToRequestId(request)
    const result = new Subject<Empty>()
    this.deleteContainersRequests.set(reqId, result)

    this.commandChannel.next({
      deleteContainers: request,
    } as AgentCommand)

    return result.pipe(
      timeout(CONTAINER_DELETE_TIMEOUT),
      catchError(err => {
        if (err instanceof TimeoutError) {
          result.complete()
          this.deleteContainersRequests.delete(reqId)
          return of(Empty)
        }

        throw err
      }),
    )
  }

  onConnected(): Observable<AgentCommand> {
    this.eventChannel.next({
      id: this.id,
      address: this.address,
      status: this.outdated ? 'outdated' : 'connected',
      version: this.version,
      connectedAt: this.connection.connectedAt,
      updating: false,
    })

    return this.commandChannel.asObservable()
  }

  onDisconnected() {
    this.deployments.forEach(it => it.onDisconnected())
    this.statusWatchers.forEach(it => it.stop())
    this.secretsWatchers.forEach(it => it.complete())
    this.logStreams.forEach(it => it.stop())
    this.commandChannel.complete()

    this.eventChannel.next({
      id: this.id,
      status: 'unreachable',
      address: null,
      version: null,
      connectedAt: null,
    })
  }

  onDeploymentFinished(deployment: Deployment): DeploymentStatusEnum {
    this.deployments.delete(deployment.id)
    return deployment.getStatus()
  }

  onContainerStateStreamStarted(prefix: string): [ContainerStatusWatcher, ContainerStatusStreamCompleter] {
    const watcher = this.statusWatchers.get(prefix)
    if (!watcher) {
      return [null, null]
    }

    return [watcher, watcher.onNodeStreamStarted()]
  }

  onContainerStatusStreamFinished(prefix: string) {
    const watcher = this.statusWatchers.get(prefix)
    if (!watcher) {
      return
    }

    this.statusWatchers.delete(prefix)
    watcher.onNodeStreamFinished()
  }

  onContainerLogStreamStarted(id: ContainerIdentifier): [ContainerLogStream, ContainerLogStreamCompleter] {
    const key = Agent.containerPrefixNameOf(id)

    const stream = this.logStreams.get(key)
    if (!stream) {
      return [null, null]
    }

    return [stream, stream.onNodeStreamStarted()]
  }

  onContainerLogStreamFinished(id: ContainerIdentifier) {
    const key = Agent.containerPrefixNameOf(id)
    const watcher = this.logStreams.get(key)
    if (!watcher) {
      return
    }

    this.logStreams.delete(key)
    watcher.onNodeStreamFinished()
  }

  getContainerSecrets(prefix: string, name: string): Observable<ListSecretsResponse> {
    this.throwBeforeCommand()

    const key = Agent.containerPrefixNameOf({
      prefix,
      name,
    })

    let watcher = this.secretsWatchers.get(key)
    if (!watcher) {
      watcher = new Subject<ListSecretsResponse>()
      this.secretsWatchers.set(key, watcher)

      this.commandChannel.next({
        listSecrets: {
          prefix,
          name,
        },
      } as AgentCommand)
    }

    return watcher.pipe(
      finalize(() => {
        this.secretsWatchers.delete(key)
      }),
      timeout({
        each: Agent.SECRET_TIMEOUT,
        with: () => {
          this.secretsWatchers.delete(key)

          return throwError(
            () =>
              new CruxInternalServerErrorException({
                message: 'Agent container secrets timed out.',
              }),
          )
        },
      }),
    )
  }

  onContainerSecrets(res: ListSecretsResponse) {
    const key = Agent.containerPrefixNameOf(res)

    const watcher = this.secretsWatchers.get(key)
    if (!watcher) {
      return
    }

    watcher.next(res)
    watcher.complete()

    this.secretsWatchers.delete(key)
  }

  update(tag: string) {
    if (this.updating) {
      throw new CruxPreconditionFailedException({
        message: 'Node is already updating',
        property: 'id',
        value: this.id,
      })
    }

    this.updateStartedAt = new Date().getTime()

    this.commandChannel.next({
      update: {
        tag,
        timeoutSeconds: Agent.AGENT_UPDATE_TIMEOUT,
      },
    })
  }

  onUpdateAborted(error?: string) {
    this.updateStartedAt = null

    this.eventChannel.next({
      id: this.id,
      status: this.outdated ? 'outdated' : 'connected',
      error,
      updating: false,
    })
  }

  onContainerDeleted(request: DeleteContainersRequest) {
    const reqId = Agent.containerDeleteRequestToRequestId(request)
    const result = this.deleteContainersRequests.get(reqId)
    if (result) {
      this.deleteContainersRequests.delete(reqId)
      result.complete()
    }
  }

  debugInfo(logger: Logger) {
    logger.debug(`Agent id: ${this.id}, open: ${!this.commandChannel.closed}`)
    logger.debug(`Deployments: ${this.deployments.size}`)
    logger.debug(`Watchers: ${this.statusWatchers.size}`)
    logger.debug(`Log streams: ${this.logStreams.size}`)
    this.deployments.forEach(it => it.debugInfo(logger))
  }

  private throwBeforeCommand() {
    if (this.updating) {
      throw new CruxPreconditionFailedException({
        message: 'Node is updating',
        property: 'id',
        value: this.id,
      })
    }

    if (this.outdated) {
      throw new CruxPreconditionFailedException({
        message: 'Node is outdated',
        property: 'id',
        value: this.id,
      })
    }
  }

  private static containerDeleteRequestToRequestId(request: DeleteContainersRequest): string {
    if (request.container) {
      return Agent.containerPrefixNameOf(request.container)
    }

    return request.prefix
  }

  public static containerPrefixNameOf = (id: ContainerIdentifier): string =>
    !id.prefix ? id.name : `${id.prefix}-${id.name}`
}

export type AgentToken = {
  sub: string
  iss: string
  iat: number
}

export type AgentConnectionMessage = {
  id: string
  status: NodeConnectionStatus
  address?: string
  version?: string
  connectedAt?: Date
  error?: string
  updating?: boolean
}
