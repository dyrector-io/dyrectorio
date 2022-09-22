import { Logger } from '@nestjs/common'
import { finalize, Observable, Subject, throwError, timeout } from 'rxjs'
import { AlreadyExistsException, InternalException } from 'src/exception/errors'
import { AgentCommand } from 'src/grpc/protobuf/proto/agent'
import { ListSecretsResponse } from 'src/grpc/protobuf/proto/common'
import { DeploymentProgressMessage, NodeConnectionStatus, NodeEventMessage } from 'src/grpc/protobuf/proto/crux'
import GrpcNodeConnection from 'src/shared/grpc-node-connection'
import ContainerStatusWatcher, { ContainerStatusStreamCompleter } from './container-status-watcher'
import Deployment from './deployment'

export class Agent {
  private commandChannel = new Subject<AgentCommand>()

  private deployments: Map<string, Deployment> = new Map()

  private statusWatchers: Map<string, ContainerStatusWatcher> = new Map()

  private secretsWatchers: Map<String, Subject<ListSecretsResponse>> = new Map()

  readonly id: string

  readonly address: string

  readonly version: string

  readonly publicKey: string

  constructor(
    connection: GrpcNodeConnection,
    private readonly eventChannel: Subject<NodeEventMessage>,
    version?: string,
    publicKey?: string,
  ) {
    this.id = connection.nodeId
    this.address = connection.address
    this.version = version
    this.publicKey = publicKey
  }

  getConnectionStatus(): NodeConnectionStatus {
    return !this.commandChannel.closed ? NodeConnectionStatus.CONNECTED : NodeConnectionStatus.UNREACHABLE
  }

  getDeployment(id: string): Deployment {
    return this.deployments.get(id)
  }

  deploy(deployment: Deployment): Observable<DeploymentProgressMessage> {
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
    let watcher = this.statusWatchers.get(prefix)
    if (!watcher) {
      watcher = new ContainerStatusWatcher(prefix)
      this.statusWatchers.set(prefix, watcher)
      watcher.start(this.commandChannel)
    }

    return watcher
  }

  kick() {
    this.commandChannel.complete()
  }

  onConnected(): Observable<AgentCommand> {
    this.eventChannel.next({
      id: this.id,
      address: this.address,
      status: NodeConnectionStatus.CONNECTED,
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
      address: this.address,
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

  getContainerSecrets(prefix: string): Observable<ListSecretsResponse> {
    let watcher = this.secretsWatchers.get(prefix)
    if (!watcher) {
      watcher = new Subject<ListSecretsResponse>()
      this.secretsWatchers.set(prefix, watcher)

      this.commandChannel.next({
        listSecrets: {
          prefix
        }
      } as AgentCommand)
    }

    return watcher.pipe(finalize(() => {
      this.secretsWatchers.delete(prefix)
    }),
    timeout({
      each: 5000,
      with: () => {
        this.secretsWatchers.delete(prefix)

        return throwError(() => new InternalException({
          message: "Agent container secrets timed out."
        }))
      }
    }))
  }

  onContainerSecrets(res: ListSecretsResponse) {
    const watcher = this.secretsWatchers.get(res.prefix)
    if (!watcher) {
      return
    }

    watcher.next(res)
    watcher.complete()

    this.secretsWatchers.delete(res.prefix)
  }

  debugInfo(logger: Logger) {
    logger.debug(`Agent id: ${this.id}, open: ${!this.commandChannel.closed}`)
    logger.debug(`Deployments: ${this.deployments.size}`)
    logger.debug(`Watchers: ${this.statusWatchers.size}`)
    this.deployments.forEach(it => it.debugInfo(logger))
  }
}

export type AgentToken = {
  sub: string
  iss: string
  iat: number
}
