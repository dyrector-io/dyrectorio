import { finalize, Observable, Subject } from 'rxjs'
import { PreconditionFailedException } from 'src/exception/errors'
import { AgentCommand } from 'src/grpc/protobuf/proto/agent'
import { ContainerStateListMessage } from 'src/grpc/protobuf/proto/crux'
import GrpcNodeConnection from 'src/shared/grpc-node-connection'

export type ContainerStatusStreamCompleter = Subject<unknown>

export default class ContainerStatusWatcher {
  private stream = new Subject<ContainerStateListMessage>()

  private started = false

  private completer: ContainerStatusStreamCompleter = null

  constructor(private prefix: string) {}

  start(commandChannel: Subject<AgentCommand>) {
    if (this.started) {
      return
    }

    commandChannel.next({
      containerState: {
        prefix: this.prefix,
      },
    } as AgentCommand)
    this.started = true
  }

  update(status: ContainerStateListMessage) {
    this.stream.next(status)
  }

  stop() {
    if (!this.started) {
      return
    }

    this.started = false
    this.stream.complete()
    this.completer?.next(undefined)
    this.completer = null
  }

  watch(): Observable<ContainerStateListMessage> {
    return this.stream.pipe(finalize(() => this.onWatcherDisconnected()))
  }

  onNodeStreamStarted(): ContainerStatusStreamCompleter {
    if (this.completer) {
      throw new PreconditionFailedException({
        message: `There is already a container status stream connection for prefix: ${this.prefix}`,
        property: GrpcNodeConnection.META_FILTER_PREFIX,
      })
    }

    this.completer = new Subject<unknown>()
    return this.completer
  }

  onNodeStreamFinished() {
    if (!this.started) {
      return
    }

    this.stream.complete()
  }

  private onWatcherDisconnected() {
    if (!this.stream.observed) {
      this.stop()
    }
  }
}
