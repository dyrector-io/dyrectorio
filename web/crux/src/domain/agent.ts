import { Logger } from '@nestjs/common'
import { DeploymentStatusEnum } from '@prisma/client'
import {
  catchError,
  finalize,
  Observable,
  of,
  ReplaySubject,
  Subject,
  Subscription,
  throwError,
  timeout,
  TimeoutError,
} from 'rxjs'
import { NodeConnectionStatus } from 'src/app/node/node.dto'
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
import { AgentToken } from './agent-token'
import AgentUpdate, { AgentUpdateOptions, AgentUpdateResult } from './agent-update'
import ContainerLogStream, { ContainerLogStreamCompleter } from './container-log-stream'
import ContainerStatusWatcher, { ContainerStatusStreamCompleter } from './container-status-watcher'
import Deployment from './deployment'

export type AgentOptions = {
  eventChannel: Subject<AgentConnectionMessage>
  connection: GrpcNodeConnection
  info: AgentInfo
  outdated: boolean
}

type AgentTokenReplacement = {
  startedBy: string
  token: AgentToken
  signedToken: string
}

export class Agent {
  public static SECRET_TIMEOUT = 5000

  private readonly commandChannel = new ReplaySubject<AgentCommand>()

  private deployments: Map<string, Deployment> = new Map()

  private statusWatchers: Map<string, ContainerStatusWatcher> = new Map()

  private secretsWatchers: Map<string, Subject<ListSecretsResponse>> = new Map()

  private deleteContainersRequests: Map<string, Subject<Empty>> = new Map()

  private logStreams: Map<string, ContainerLogStream> = new Map()

  private update: AgentUpdate | null = null

  private replacementToken: AgentTokenReplacement | null = null

  private statusSubscriber: Subscription

  private readonly eventChannel: Subject<AgentConnectionMessage>

  private readonly connection: GrpcNodeConnection

  readonly info: AgentInfo

  readonly outdated: boolean

  get id(): string {
    return this.connection.nodeId
  }

  get address(): string {
    return this.connection.address
  }

  get version(): string {
    return this.info.version
  }

  get publicKey(): string {
    return this.info.publicKey
  }

  get connected() {
    return this.getConnectionStatus() === 'connected'
  }

  constructor(options: AgentOptions) {
    this.connection = options.connection
    this.info = options.info
    this.eventChannel = options.eventChannel
    this.outdated = options.outdated
  }

  getConnectionStatus(): NodeConnectionStatus {
    return !this.commandChannel.closed ? 'connected' : 'unreachable'
  }

  getDeployment(id: string): Deployment {
    return this.deployments.get(id)
  }

  get updating() {
    if (!this.update) {
      return false
    }
    if (!this.update.expired) {
      return true
    }

    this.update = null
    return false
  }

  deploy(deployment: Deployment): Observable<DeploymentStatusMessage> {
    this.throwIfCommandsAreDisabled()

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
    this.throwIfCommandsAreDisabled()

    let watcher = this.statusWatchers.get(prefix)
    if (!watcher) {
      watcher = new ContainerStatusWatcher(prefix, oneShot)
      this.statusWatchers.set(prefix, watcher)
      watcher.start(this.commandChannel)
    }

    return watcher
  }

  upsertContainerLogStream(container: ContainerIdentifier): ContainerLogStream {
    this.throwIfCommandsAreDisabled()

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
      })
    }

    this.commandChannel.complete()
  }

  sendContainerCommand(command: ContainerCommandRequest) {
    this.throwIfCommandsAreDisabled()

    this.commandChannel.next({
      containerCommand: command,
    } as AgentCommand)
  }

  replaceToken(replacement: AgentTokenReplacement) {
    if (this.replacementToken) {
      throw new CruxConflictException({
        message: 'Token replacement is already in progress',
        property: 'token',
      })
    }

    this.replacementToken = replacement

    this.commandChannel.next({
      replaceToken: {
        token: replacement.signedToken,
      },
    })
  }

  deleteContainers(request: DeleteContainersRequest): Observable<Empty> {
    this.throwIfCommandsAreDisabled()

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

  onConnected(statusListener: (status: NodeConnectionStatus) => void): Observable<AgentCommand> {
    this.statusSubscriber = this.connection.status().subscribe(statusListener)

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
      updating: false,
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
    this.throwIfCommandsAreDisabled()

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

  startUpdate(tag: string, options: AgentUpdateOptions) {
    if (this.deployments.size > 0) {
      throw new CruxPreconditionFailedException({
        message: 'Can not update an agent, while you have an in progress deployments',
        property: 'deployments',
      })
    }

    if (this.updating) {
      throw new CruxPreconditionFailedException({
        message: 'Node is already updating',
        property: 'id',
        value: this.id,
      })
    }

    this.update = new AgentUpdate(options)
    this.replacementToken = options
    this.update.start(this.commandChannel, tag)
  }

  onUpdateAborted(error?: string) {
    this.update = null
    this.replacementToken = null

    this.eventChannel.next({
      id: this.id,
      status: this.outdated ? 'outdated' : 'connected',
      error,
      updating: false,
    })
  }

  onUpdateCompleted(connection: GrpcNodeConnection): AgentUpdateResult {
    this.deployments.forEach(it => it.onDisconnected())

    const result = this.update.complete(connection)

    try {
      this.statusSubscriber.unsubscribe()

      this.close(CloseReason.SELF_DESTRUCT)
    } catch {
      /* empty */
    }

    return result
  }

  onContainerDeleted(request: DeleteContainersRequest) {
    const reqId = Agent.containerDeleteRequestToRequestId(request)
    const result = this.deleteContainersRequests.get(reqId)
    if (result) {
      this.deleteContainersRequests.delete(reqId)
      result.complete()
    }
  }

  /**
   * returns with the new token
   */
  onTokenReplaced(): AgentTokenReplacement {
    if (!this.replacementToken) {
      throw new CruxPreconditionFailedException({
        message: 'Replacement was not requested',
      })
    }

    const replacement = this.replacementToken
    const { token, signedToken } = replacement

    this.connection.replaceToken(token, signedToken)

    this.replacementToken = null
    return replacement
  }

  debugInfo(logger: Logger) {
    logger.debug(`Agent id: ${this.id}, open: ${!this.commandChannel.closed}`)
    logger.debug(`Deployments: ${this.deployments.size}`)
    logger.debug(`Watchers: ${this.statusWatchers.size}`)
    logger.debug(`Log streams: ${this.logStreams.size}`)
    this.deployments.forEach(it => it.debugInfo(logger))
  }

  private throwIfCommandsAreDisabled() {
    if (this.updating) {
      throw new CruxPreconditionFailedException({
        message: 'Node is updating',
        property: 'id',
        value: this.id,
      })
    }

    if (this.replacementToken) {
      throw new CruxPreconditionFailedException({
        message: 'Node is replacing connection token',
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

export type AgentConnectionMessage = {
  id: string
  status: NodeConnectionStatus
  address?: string
  version?: string
  connectedAt?: Date
  error?: string
  updating?: boolean
}
