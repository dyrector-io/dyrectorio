import { finalize, Observable, startWith, Subject, tap } from 'rxjs'
import { ContainerLogStartedMessage } from 'src/app/node/node.message'
import { AgentCommand } from 'src/grpc/protobuf/proto/agent'
import { ContainerIdentifier, ContainerLogMessage, Empty } from 'src/grpc/protobuf/proto/common'
import FixedLengthLinkedList from 'src/shared/fixed-length-linked-list'
import AgentTunnel from './agent-tunnel'

export default class ContainerLogStream {
  private readonly cache: FixedLengthLinkedList<ContainerLogMessage> = new FixedLengthLinkedList(this.tail)

  private logStartedStream: Subject<ContainerLogStartedMessage> = new Subject()

  private currentTunel: AgentTunnel<ContainerLogMessage> = null

  constructor(
    private readonly commandChannel: Subject<AgentCommand>,
    private readonly container: ContainerIdentifier,
    private tail: number,
    private readonly onFree: VoidFunction,
  ) {}

  watch(): [Observable<ContainerLogMessage>, Observable<ContainerLogStartedMessage>] {
    if (!this.currentTunel) {
      this.currentTunel = new AgentTunnel()

      this.sendCommand()
    }

    const messages = this.currentTunel.watch().pipe(startWith(...Array.from(this.cache)))
    return [messages, this.logStartedStream.pipe(startWith(this.getStartedMessage()))]
  }

  resize(size: number) {
    if (this.tail === size) {
      return
    }

    this.tail = size
    this.cache.clear()
    this.cache.resize(size)

    if (!this.currentTunel) {
      return
    }

    this.currentTunel.closeAgentStream()
  }

  onAgentStreamStarted(stream: Observable<ContainerLogMessage>): Observable<Empty> {
    this.logStartedStream.next(this.getStartedMessage())

    return this.currentTunel
      .onAgentStreamStarted(stream.pipe(tap(message => this.cache.push(message))))
      .pipe(finalize(() => this.onAgenStreamFinished()))
  }

  private onAgenStreamFinished() {
    if (!this.currentTunel.watched) {
      this.currentTunel = null
      this.onFree()
      return
    }

    // the stream was resized
    this.sendCommand()
  }

  private sendCommand() {
    this.commandChannel.next({
      containerLog: {
        container: this.container,
        streaming: true,
        tail: this.tail,
      },
    } as AgentCommand)
  }

  private getStartedMessage(): ContainerLogStartedMessage {
    return {
      container: this.container,
      take: this.tail,
    }
  }
}
