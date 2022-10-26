import { Logger } from '@nestjs/common'
import { finalize, Observable, Subject, throwError, timeout } from 'rxjs'
import { AlreadyExistsException, InternalException, PreconditionFailedException } from 'src/exception/errors'
import { AgentCommand, AgentInfo, CloseReason } from 'src/grpc/protobuf/proto/agent'
import { ListSecretsResponse } from 'src/grpc/protobuf/proto/common'
import { DeploymentProgressMessage, NodeConnectionStatus, NodeEventMessage } from 'src/grpc/protobuf/proto/crux'
import GrpcNodeConnection from 'src/shared/grpc-node-connection'
import ContainerStatusWatcher, { ContainerStatusStreamCompleter } from './container-status-watcher'
import Deployment from './deployment'
import { toTimestamp } from './utils'

export class Agent {
  private static AGENT_UPDATE_TIMEOUT = 60 * 5 // seconds

  private commandChannel = new Subject<AgentCommand>()

  private deployments: Map<string, Deployment> = new Map()

  private statusWatchers: Map<string, ContainerStatusWatcher> = new Map()

  private secretsWatchers: Map<string, Subject<ListSecretsResponse>> = new Map()

  private updateStartedAt: number | undefined

  readonly id: string

  readonly address: string

  readonly version: string

  readonly publicKey: string

  readonly imageDate: Date | undefined

  constructor(
    private connection: GrpcNodeConnection,
    info: AgentInfo,
    private readonly eventChannel: Subject<NodeEventMessage>,
  ) {
    this.id = connection.nodeId
    this.address = connection.address
    this.version = info.version
    this.publicKey = info.publicKey
    this.imageDate = Number.isNaN(Date.parse(info.imageDate)) ? undefined : new Date(info.imageDate)
  }

  getConnectionStatus(): NodeConnectionStatus {
    return !this.commandChannel.closed ? NodeConnectionStatus.CONNECTED : NodeConnectionStatus.UNREACHABLE
  }

  getDeployment(id: string): Deployment {
    return this.deployments.get(id)
  }

  checkAgentUpdating(): boolean {
    if (!this.updateStartedAt) {
      return false
    }

    const now = new Date().getTime()
    if (Math.floor(now / 1000) - this.updateStartedAt < Agent.AGENT_UPDATE_TIMEOUT) {
      return true
    }

    this.updateStartedAt = undefined
    return false
  }

  deploy(deployment: Deployment): Observable<DeploymentProgressMessage> {
    this.checkUpdating()

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
    this.checkUpdating()

    let watcher = this.statusWatchers.get(prefix)
    if (!watcher) {
      watcher = new ContainerStatusWatcher(prefix)
      this.statusWatchers.set(prefix, watcher)
      watcher.start(this.commandChannel)
    }

    return watcher
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

  onConnected(): Observable<AgentCommand> {
    this.eventChannel.next({
      id: this.id,
      address: this.address,
      status: NodeConnectionStatus.CONNECTED,
      version: this.version,
      connectedAt: toTimestamp(this.connection.connectedAt),
    })

    return this.commandChannel.asObservable()
  }

  onDisconnected() {
    this.deployments.forEach(it => it.onDisconnected())
    this.statusWatchers.forEach(it => it.stop())
    this.secretsWatchers.forEach(it => it.complete())
    this.commandChannel.complete()

    this.eventChannel.next({
      id: this.id,
      status: NodeConnectionStatus.UNREACHABLE,
    })
  }

  onDeploymentFinished(deployment: Deployment) {
    this.deployments.delete(deployment.id)
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

  getContainerSecrets(prefix: string, name: string): Observable<ListSecretsResponse> {
    this.checkUpdating()

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
    this.checkUpdating()

    const now = new Date().getTime()
    this.updateStartedAt = Math.floor(now / 1000)

    this.commandChannel.next({
      update: {
        tag: imageTag,
        timeoutSeconds: Agent.AGENT_UPDATE_TIMEOUT,
      },
    } as AgentCommand)
  }

  updateAborted(error?: string) {
    this.updateStartedAt = undefined

    this.eventChannel.next({
      id: this.id,
      status: NodeConnectionStatus.CONNECTED,
      error,
    })
  }

  debugInfo(logger: Logger) {
    logger.debug(`Agent id: ${this.id}, open: ${!this.commandChannel.closed}`)
    logger.debug(`Deployments: ${this.deployments.size}`)
    logger.debug(`Watchers: ${this.statusWatchers.size}`)
    this.deployments.forEach(it => it.debugInfo(logger))
  }

  private checkUpdating() {
    if (this.checkAgentUpdating()) {
      throw new PreconditionFailedException({
        message: 'Node is updating',
        property: 'id',
        value: this.id,
      })
    }
  }
}

export type AgentToken = {
  sub: string
  iss: string
  iat: number
}
