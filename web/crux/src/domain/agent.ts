import { Logger } from '@nestjs/common'
import { catchError, finalize, Observable, of, Subject, throwError, timeout, TimeoutError } from 'rxjs'
import { AlreadyExistsException, InternalException, PreconditionFailedException } from 'src/exception/errors'
import { AgentCommand, AgentInfo, CloseReason } from 'src/grpc/protobuf/proto/agent'
import {
  ContainerCommandRequest,
  ContainerIdentifier,
  DeleteContainersRequest,
  DeploymentStatus,
  Empty,
  ListSecretsResponse,
} from 'src/grpc/protobuf/proto/common'
import { DeploymentProgressMessage, NodeConnectionStatus, NodeEventMessage } from 'src/grpc/protobuf/proto/crux'
import { CONTAINER_DELETE_TIMEOUT, DEFAULT_CONTAINER_LOG_TAIL } from 'src/shared/const'
import GrpcNodeConnection from 'src/shared/grpc-node-connection'
import ContainerLogStream, { ContainerLogStreamCompleter } from './container-log-stream'
import ContainerStatusWatcher, { ContainerStatusStreamCompleter } from './container-status-watcher'
import Deployment from './deployment'
import { toTimestamp } from './utils'

export class Agent {
  private static AGENT_UPDATE_TIMEOUT = 60 * 5 * 1000 // seconds

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

  constructor(
    private connection: GrpcNodeConnection,
    info: AgentInfo,
    private readonly eventChannel: Subject<NodeEventMessage>,
  ) {
    this.id = connection.nodeId
    this.address = connection.address
    this.version = info.version
    this.publicKey = info.publicKey
  }

  getConnectionStatus(): NodeConnectionStatus {
    return !this.commandChannel.closed ? NodeConnectionStatus.CONNECTED : NodeConnectionStatus.UNREACHABLE
  }

  getDeployment(id: string): Deployment {
    return this.deployments.get(id)
  }

  get updating() {
    if (!this.updateStartedAt) {
      return false
    }

    const now = new Date().getTime()
    if (now - this.updateStartedAt < Agent.AGENT_UPDATE_TIMEOUT) {
      return true
    }

    this.updateStartedAt = null
    return false
  }

  deploy(deployment: Deployment): Observable<DeploymentProgressMessage> {
    this.throwWhenUpdating()

    if (this.deployments.has(deployment.id)) {
      throw new AlreadyExistsException({
        message: 'Deployment is already running',
        property: 'id',
      })
    }

    this.deployments.set(deployment.id, deployment)

    return deployment.start(this.commandChannel)
  }

  upsertContainerStatusWatcher(prefix: string): ContainerStatusWatcher {
    this.throwWhenUpdating()

    let watcher = this.statusWatchers.get(prefix)
    if (!watcher) {
      watcher = new ContainerStatusWatcher(prefix)
      this.statusWatchers.set(prefix, watcher)
      watcher.start(this.commandChannel)
    }

    return watcher
  }

  upsertContainerLogStream(id?: string, prefixName?: ContainerIdentifier): ContainerLogStream {
    this.throwWhenUpdating()

    const key = id ?? `${prefixName.prefix}-${prefixName.name}`
    let stream = this.logStreams.get(key)
    if (!stream) {
      stream = new ContainerLogStream(id, prefixName, DEFAULT_CONTAINER_LOG_TAIL)
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
    this.throwWhenUpdating()

    this.commandChannel.next({
      containerCommand: command,
    } as AgentCommand)
  }

  deleteContainers(request: DeleteContainersRequest): Observable<Empty> {
    this.throwWhenUpdating()

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
      status: NodeConnectionStatus.CONNECTED,
      version: this.version,
      connectedAt: toTimestamp(this.connection.connectedAt),
      updating: false,
    })

    return this.commandChannel.asObservable()
  }

  onDisconnected(): Deployment[] {
    this.deployments.forEach(it => it.onDisconnected())
    this.statusWatchers.forEach(it => it.stop())
    this.secretsWatchers.forEach(it => it.complete())
    this.logStreams.forEach(it => it.stop())
    this.commandChannel.complete()

    this.eventChannel.next({
      id: this.id,
      status: NodeConnectionStatus.UNREACHABLE,
    })

    return Array.from(this.deployments.values())
  }

  onDeploymentFinished(deployment: Deployment): DeploymentStatus {
    this.deployments.delete(deployment.id)
    return deployment.getStatus()
  }

  onContainerStatusStreamStarted(prefix: string): [ContainerStatusWatcher, ContainerStatusStreamCompleter] {
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

  onContainerLogStreamStarted(
    dockerId?: string,
    pod?: ContainerIdentifier,
  ): [ContainerLogStream, ContainerLogStreamCompleter] {
    const key = dockerId ?? `${pod.prefix}-${pod.name}`
    const stream = this.logStreams.get(key)
    if (!stream) {
      return [null, null]
    }

    return [stream, stream.onNodeStreamStarted()]
  }

  onContainerLogStreamFinished(dockerId?: string, pod?: ContainerIdentifier) {
    const key = dockerId ?? `${pod.prefix}-${pod.name}`
    const watcher = this.logStreams.get(key)
    if (!watcher) {
      return
    }

    this.logStreams.delete(key)
    watcher.onNodeStreamFinished()
  }

  getContainerSecrets(prefix: string, name: string): Observable<ListSecretsResponse> {
    this.throwWhenUpdating()

    const key = `${prefix}-${name}`

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
        each: 5000,
        with: () => {
          this.secretsWatchers.delete(key)

          return throwError(
            () =>
              new InternalException({
                message: 'Agent container secrets timed out.',
              }),
          )
        },
      }),
    )
  }

  onContainerSecrets(res: ListSecretsResponse) {
    const key = `${res.prefix}-${res.name}`

    const watcher = this.secretsWatchers.get(key)
    if (!watcher) {
      return
    }

    watcher.next(res)
    watcher.complete()

    this.secretsWatchers.delete(key)
  }

  update(imageTag: string) {
    this.throwWhenUpdating()

    this.updateStartedAt = new Date().getTime()

    this.commandChannel.next({
      update: {
        tag: imageTag,
        timeoutSeconds: Agent.AGENT_UPDATE_TIMEOUT,
      },
    } as AgentCommand)
  }

  onUpdateAborted(error?: string) {
    this.updateStartedAt = null

    this.eventChannel.next({
      id: this.id,
      status: NodeConnectionStatus.CONNECTED,
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

  private throwWhenUpdating() {
    if (this.updating) {
      throw new PreconditionFailedException({
        message: 'Node is updating',
        property: 'id',
        value: this.id,
      })
    }
  }

  private static containerDeleteRequestToRequestId(request: DeleteContainersRequest): string {
    if (request.containerId) {
      return request.containerId
    }

    if (request.prefixName) {
      return `${request.prefixName.prefix}-${request.prefixName.name}`
    }

    return request.prefix
  }
}

export type AgentToken = {
  sub: string
  iss: string
  iat: number
}
