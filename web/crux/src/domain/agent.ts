import { Logger } from '@nestjs/common'
import { DeploymentStatusEnum } from '@prisma/client'
import { Observable, Subject, Subscription } from 'rxjs'
import { NodeConnectionStatus } from 'src/app/node/node.dto'
import {
  CruxConflictException,
  CruxInternalServerErrorException,
  CruxPreconditionFailedException,
} from 'src/exception/crux-exception'
import {
  AgentCommand,
  AgentError,
  AgentInfo,
  CloseReason,
  ContainerInspectRequest,
  ContainerLogRequest,
  ListSecretsRequest,
} from 'src/grpc/protobuf/proto/agent'
import {
  ContainerCommandRequest,
  ContainerIdentifier,
  ContainerInspectResponse,
  ContainerLogListResponse,
  DeleteContainersRequest,
  DeploymentStatusMessage,
  Empty,
  ListSecretsResponse,
} from 'src/grpc/protobuf/proto/common'
import GrpcNodeConnection from 'src/shared/grpc-node-connection'
import AgentCallback, { CallbackCommand, KeyAndCommandProvider } from './agent-callback'
import { AgentToken } from './agent-token'
import AgentUpdate, { AgentUpdateOptions, AgentUpdateResult } from './agent-update'
import ContainerLogStream from './container-log-stream'
import ContainerStatusWatcher, { ContainerStatusStreamCompleter } from './container-status-watcher'
import Deployment from './deployment'
import { BufferedSubject } from './utils'

export type AgentOptions = {
  eventChannel: Subject<AgentConnectionMessage>
  connection: GrpcNodeConnection
  info: AgentInfo
  outdated: boolean
}

export type AgentTokenReplacement = {
  startedBy: string
  token: AgentToken
  signedToken: string
}

export class Agent {
  private readonly connection: GrpcNodeConnection

  private readonly commandChannel = new BufferedSubject<AgentCommand>()

  private readonly eventChannel: Subject<AgentConnectionMessage>

  private readonly deployments: Map<string, Deployment> = new Map()

  private readonly callbacks: Map<keyof CallbackCommand, AgentCallback<any, any>>

  private readonly statusStreams: Map<string, ContainerStatusWatcher> = new Map()

  private readonly logStreams: Map<string, ContainerLogStream> = new Map()

  private update: AgentUpdate | null = null

  private replacementToken: AgentTokenReplacement | null = null

  private statusSubscription: Subscription | null = null

  readonly info: AgentInfo

  readonly outdated: boolean

  private get connected() {
    return !this.commandChannel.closed
  }

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

  get ready(): boolean {
    return this.getConnectionStatus() === 'connected'
  }

  constructor(options: AgentOptions) {
    this.connection = options.connection
    this.info = options.info
    this.eventChannel = options.eventChannel
    this.outdated = options.outdated

    const callbacks: Record<keyof CallbackCommand, KeyAndCommandProvider<any>> = {
      listSecrets: (req: ListSecretsRequest) => [Agent.containerPrefixNameOf(req.container), { listSecrets: req }],
      containerLog: (req: ContainerLogRequest) => [
        Agent.containerPrefixNameOf(req.container),
        {
          containerLog: {
            ...req,
            streaming: false,
          },
        },
      ],
      containerInspect: (req: ContainerInspectRequest) => [
        Agent.containerPrefixNameOf(req.container),
        { containerInspect: req },
      ],
      deleteContainers: (req: DeleteContainersRequest) => [
        Agent.containerPrefixNameOf(
          req?.container ?? {
            prefix: req.prefix,
            name: null,
          },
        ),
        { deleteContainers: req },
      ],
    }

    this.callbacks = new Map(
      Object.entries(callbacks).map(entry => {
        const [type, provider] = entry
        return [type as keyof CallbackCommand, new AgentCallback(this.commandChannel, provider)]
      }),
    )
  }

  getConnectionStatus(): NodeConnectionStatus {
    if (!this.connected) {
      return 'unreachable'
    }

    if (this.updating) {
      return 'updating'
    }

    if (this.outdated) {
      return 'outdated'
    }

    return 'connected'
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

    let watcher = this.statusStreams.get(prefix)
    if (!watcher) {
      watcher = new ContainerStatusWatcher(prefix, oneShot)
      this.statusStreams.set(prefix, watcher)
      watcher.start(this.commandChannel)
    }

    return watcher
  }

  upsertContainerLogStream(container: ContainerIdentifier, tail: number): ContainerLogStream {
    this.throwIfCommandsAreDisabled()

    const key = Agent.containerPrefixNameOf(container)
    let stream = this.logStreams.get(key)
    if (!stream) {
      stream = new ContainerLogStream(this.commandChannel, container, tail, () => {
        this.logStreams.delete(key)
      })

      this.logStreams.set(key, stream)
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

  async listSecrets(req: ListSecretsRequest): Promise<ListSecretsResponse> {
    const callback: AgentCallback<ListSecretsRequest, ListSecretsResponse> = this.getCallback('listSecrets')
    return await callback.fetch(req)
  }

  async deleteContainers(req: DeleteContainersRequest): Promise<Empty> {
    const callback: AgentCallback<DeleteContainersRequest, Empty> = this.getCallback('deleteContainers')
    return await callback.fetch(req)
  }

  async getContainerLog(req: Omit<ContainerLogRequest, 'streaming'>): Promise<ContainerLogListResponse> {
    const callback: AgentCallback<ContainerLogRequest, ContainerLogListResponse> = this.getCallback('containerLog')
    return await callback.fetch({
      ...req,
      streaming: false,
    })
  }

  async inspectContainer(req: ContainerInspectRequest): Promise<ContainerInspectResponse> {
    const callback: AgentCallback<ContainerInspectRequest, ContainerInspectResponse> =
      this.getCallback('containerInspect')
    return await callback.fetch(req)
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

  onConnected(statusListener: (status: NodeConnectionStatus) => void): Observable<AgentCommand> {
    this.statusSubscription = this.connection.status().subscribe(statusListener)

    this.eventChannel.next({
      id: this.id,
      address: this.address,
      status: this.getConnectionStatus(),
      version: this.version,
      connectedAt: this.connection.connectedAt,
    })

    return this.commandChannel.asObservable()
  }

  onDisconnected() {
    this.deployments.forEach(it => it.onDisconnected())
    this.statusStreams.forEach(it => it.stop())
    this.callbacks.forEach(it => it.cancel())
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
    const watcher = this.statusStreams.get(prefix)
    if (!watcher) {
      return [null, null]
    }

    return [watcher, watcher.onNodeStreamStarted()]
  }

  onContainerStatusStreamFinished(prefix: string) {
    const watcher = this.statusStreams.get(prefix)
    if (!watcher) {
      return
    }

    this.statusStreams.delete(prefix)
    watcher.onNodeStreamFinished()
  }

  onContainerLogStreamStarted(id: ContainerIdentifier): ContainerLogStream {
    const key = Agent.containerPrefixNameOf(id)
    return this.logStreams.get(key)
  }

  onCallback<Res>(type: keyof CallbackCommand, key: string, response: Res) {
    const callback = this.callbacks.get(type)
    callback.onResponse(key, response)
  }

  onCallbackError(type: keyof CallbackCommand, key: string, error: AgentError) {
    const callback = this.callbacks.get(type)
    if (!type) {
      return
    }

    callback.onError(key, error)
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
      status: this.getConnectionStatus(),
      error,
    })
  }

  onUpdateCompleted(connection: GrpcNodeConnection): AgentUpdateResult {
    this.deployments.forEach(it => it.onDisconnected())

    const result = this.update.complete(connection)

    try {
      this.statusSubscription.unsubscribe()

      this.close(CloseReason.SELF_DESTRUCT)
    } catch {
      /* empty */
    }

    this.update = null
    this.eventChannel.next({
      id: this.id,
      status: this.getConnectionStatus(),
    })

    return result
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

    this.connection.onTokenReplaced(token, signedToken)

    this.replacementToken = null
    return replacement
  }

  debugInfo(logger: Logger) {
    logger.verbose(`Agent id: ${this.id}, open: ${!this.commandChannel.closed}`)
    logger.verbose(`Deployments: ${this.deployments.size}`)
    logger.verbose(`Watchers: ${this.statusStreams.size}`)
    logger.verbose(`Log streams: ${this.logStreams.size}`)
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

  private getCallback(type: keyof CallbackCommand): AgentCallback<any, any> {
    this.throwIfCommandsAreDisabled()

    const callback = this.callbacks.get(type)
    if (!callback) {
      throw new CruxInternalServerErrorException({
        message: `Missing callback: ${type}`,
      })
    }

    return callback
  }

  public static containerPrefixNameOf = (id: ContainerIdentifier): string =>
    !id.prefix ? id.name : `${id.prefix}-${id.name ?? ''}`
}

export type AgentConnectionMessage = {
  id: string
  status: NodeConnectionStatus
  address?: string
  version?: string
  connectedAt?: Date
  error?: string
}
