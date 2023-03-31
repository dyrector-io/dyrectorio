import { finalize, Observable, startWith, Subject } from 'rxjs'
import { PreconditionFailedException } from 'src/exception/errors'
import { AgentCommand } from 'src/grpc/protobuf/proto/agent'
import { ContainerIdentifier, ContainerLogMessage } from 'src/grpc/protobuf/proto/common'
import GrpcNodeConnection from 'src/shared/grpc-node-connection'

export type ContainerLogStreamCompleter = Subject<unknown>

export default class ContainerLogStream {
  private stream = new Subject<ContainerLogMessage>()

  private started = false

  private completer: ContainerLogStreamCompleter = null

  constructor(private container: ContainerIdentifier, private tail: number) {}

  start(commandChannel: Subject<AgentCommand>) {
    if (this.started) {
      return
    }

    commandChannel.next({
      containerLog: {
        container: this.container,
        streaming: true,
        tail: this.tail,
      },
    } as AgentCommand)
    this.started = true
  }

  update(log: ContainerLogMessage) {
    this.stream.next(log)
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

  watch(): Observable<ContainerLogMessage> {
    return this.stream.pipe(
      // necessary, because of: https://github.com/nestjs/nest/issues/8111
      startWith({
        log: '',
      } as ContainerLogMessage),
      finalize(() => this.onWatcherDisconnected()),
    )
  }

  onNodeStreamStarted(): ContainerLogStreamCompleter {
    if (this.completer) {
      throw new PreconditionFailedException({
        message: `There is already a container status stream connection for container: ${this.container.prefix ?? ''}-${
          this.container.name
        }`,
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
    this.completer?.next(undefined)
    this.completer = null
  }

  private onWatcherDisconnected() {
    if (!this.stream.observed) {
      this.stop()
    }
  }
}
