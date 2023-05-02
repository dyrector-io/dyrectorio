import { finalize, Observable, startWith, Subject } from 'rxjs'
import { CruxPreconditionFailedException } from 'src/exception/crux-exception'
import { AgentCommand } from 'src/grpc/protobuf/proto/agent'
import { ContainerStateListMessage } from 'src/grpc/protobuf/proto/common'
import GrpcNodeConnection from 'src/shared/grpc-node-connection'

export type ContainerStatusStreamCompleter = Subject<unknown>

export default class ContainerStatusWatcher {
  private stream = new Subject<ContainerStateListMessage>()

  private started = false

  private completer: ContainerStatusStreamCompleter = null

  constructor(private prefix: string, private oneShot: boolean) {}

  start(commandChannel: Subject<AgentCommand>) {
    if (this.started) {
      return
    }

    commandChannel.next({
      containerState: {
        prefix: this.prefix,
        oneShot: this.oneShot,
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
    this.stream.next({
      prefix: this.prefix,
      data: [],
    })

    return this.stream.pipe(
      // necessary, because of: https://github.com/nestjs/nest/issues/8111
      startWith({
        prefix: this.prefix,
        data: [],
      }),
      finalize(() => this.onWatcherDisconnected()),
    )
  }

  onNodeStreamStarted(): ContainerStatusStreamCompleter {
    if (this.completer) {
      throw new CruxPreconditionFailedException({
        message: `There is already a container status stream connection for prefix`,
        property: GrpcNodeConnection.META_FILTER_PREFIX,
        value: this.prefix,
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
